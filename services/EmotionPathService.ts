import {
  EMOTION_MAP,
  EmotionPoint,
  PATH_DEFAULT_STEPS,
  PATH_FALLBACK_VA,
  BIO_DEFAULT_WEIGHT,
  BIO_AROUSAL_SCALE,
  BIO_AROUSAL_CLAMP_MAX,
  BIO_AROUSAL_CLAMP_MIN,
  ADAPTATION_ON_TRACK_THRESHOLD,
  ADAPTATION_INTENSIFY_THRESHOLD,
  ADAPTATION_SLOW_DOWN_THRESHOLD,
} from "@/constants/appConstants";

const getEmotionPoint = (emotion: string) =>
  EMOTION_MAP.find((e) => e.emotion.toLowerCase() === emotion.toLowerCase());

/**
 * Find the closest named emotion to a given VA coordinate.
 */
const findClosestEmotion = (valence: number, arousal: number): EmotionPoint => {
  return EMOTION_MAP.reduce((prev, curr) => {
    const prevDist =
      Math.abs(prev.valence - valence) + Math.abs(prev.arousal - arousal);
    const currDist =
      Math.abs(curr.valence - valence) + Math.abs(curr.arousal - arousal);
    return currDist < prevDist ? curr : prev;
  });
};

/**
 * Build a static emotion trajectory from start to end emotion.
 * This is the "planned" path before any biometric adjustments.
 */
export const buildEmotionPath = (
  startEmotion: string,
  endEmotion: string,
  steps = PATH_DEFAULT_STEPS,
  filterUnique = true,
): string[] => {
  const start = getEmotionPoint(startEmotion);
  const end = getEmotionPoint(endEmotion);

  if (!start || !end) {
    return [startEmotion, endEmotion];
  }

  const trajectory: EmotionPoint[] = [];

  for (let i = 0; i <= steps + 1; i++) {
    const t = i / (steps + 1);

    trajectory.push({
      emotion: "",
      valence: start.valence + t * (end.valence - start.valence),
      arousal: start.arousal + t * (end.arousal - start.arousal),
    });
  }

  // Match interpolated points to closest known emotions
  const finalPath = trajectory.map(
    (point) => findClosestEmotion(point.valence, point.arousal).emotion,
  );

  if (!filterUnique) {
    return finalPath;
  }

  return finalPath.filter((v, i, arr) => arr.indexOf(v) === i);
};

export const buildUniqueEmotionPath = (
  startEmotion: string,
  endEmotion: string,
  steps = PATH_DEFAULT_STEPS,
): string[] => {
  const start = getEmotionPoint(startEmotion);
  const end = getEmotionPoint(endEmotion);
  if (!start || !end) {
    return [startEmotion, endEmotion];
  }

  // Oversample by a factor to increase chance of hitting `steps` unique emotions
  const OVERSAMPLE = 10;
  const totalSamples = steps * OVERSAMPLE;

  const seen = new Set<string>();
  const unique: string[] = [];

  for (let i = 0; i <= totalSamples; i++) {
    const t = i / totalSamples;
    const valence = start.valence + t * (end.valence - start.valence);
    const arousal = start.arousal + t * (end.arousal - start.arousal);
    const emotion = findClosestEmotion(valence, arousal).emotion;

    if (!seen.has(emotion)) {
      seen.add(emotion);
      unique.push(emotion);
    }
  }

  // If oversampling gave us enough, pick `steps` evenly-spaced items
  if (unique.length >= steps) {
    const indices = Array.from({ length: steps }, (_, i) =>
      Math.round((i / (steps - 1)) * (unique.length - 1)),
    );
    return indices.map((idx) => unique[idx]);
  }

  // Fallback: path is too short (start/end are very close) — pad with endpoint
  // Find unused emotions closest to the VA midpoint of the path
  const midValence = (start.valence + end.valence) / 2;
  const midArousal = (start.arousal + end.arousal) / 2;

  const fillers = EMOTION_MAP.filter((e) => !seen.has(e.emotion))
    .sort((a, b) => {
      const distA =
        Math.abs(a.valence - midValence) + Math.abs(a.arousal - midArousal);
      const distB =
        Math.abs(b.valence - midValence) + Math.abs(b.arousal - midArousal);
      return distA - distB;
    })
    .map((e) => e.emotion);

  const needed = steps - unique.length;
  const padded = [...unique, ...fillers.slice(0, needed)];

  // Re-sort padded emotions by their VA proximity to the path
  // so fillers slot in naturally rather than all bunching at the end
  padded.sort((a, b) => {
    const pa = getEmotionPoint(a)!;
    const pb = getEmotionPoint(b)!;
    // Project each point onto the start→end vector (0..1)
    const dx = end.valence - start.valence;
    const dy = end.arousal - start.arousal;
    const lenSq = dx * dx + dy * dy || 1;
    const tA =
      ((pa.valence - start.valence) * dx + (pa.arousal - start.arousal) * dy) /
      lenSq;
    const tB =
      ((pb.valence - start.valence) * dx + (pb.arousal - start.arousal) * dy) /
      lenSq;
    return tA - tB;
  });

  // Enforce start/end regardless of sort outcome
  const result = padded.slice(0, steps);
  result[0] = startEmotion;
  result[result.length - 1] = endEmotion;

  return result;
};

/**
 * Build a VA (valence-arousal) trajectory as numeric coordinates.
 * Returns the raw VA points for each step, useful for biometric fusion.
 */
export const buildVAPath = (
  startEmotion: string,
  endEmotion: string,
  steps = PATH_DEFAULT_STEPS,
): { valence: number; arousal: number }[] => {
  const start = getEmotionPoint(startEmotion);
  const end = getEmotionPoint(endEmotion);

  if (!start || !end) {
    return [PATH_FALLBACK_VA, PATH_FALLBACK_VA];
  }

  const trajectory: { valence: number; arousal: number }[] = [];

  for (let i = 0; i <= steps + 1; i++) {
    const t = i / (steps + 1);
    trajectory.push({
      valence:
        Math.round((start.valence + t * (end.valence - start.valence)) * 100) /
        100,
      arousal:
        Math.round((start.arousal + t * (end.arousal - start.arousal)) * 100) /
        100,
    });
  }

  return trajectory;
};

/**
 * Get the biometric-adjusted VA and emotion label for a given song index.
 *
 * Fuses the planned trajectory with live biometric arousal:
 * - Valence follows the planned path (user-reported emotions)
 * - Arousal blends planned path with live biometric signal
 *
 * @param vaPath        - The planned VA trajectory from buildVAPath()
 * @param songIndex     - Current song index in the playlist
 * @param bioArousal    - Live arousal from HealthService.estimateArousal() (0-1, or null)
 * @param bioWeight     - How much to weight biometric signal vs planned (0-1, default BIO_DEFAULT_WEIGHT)
 * @returns { valence, arousal, emotion, deviation }
 */
export const getBiometricAdjustedEmotion = (
  vaPath: { valence: number; arousal: number }[],
  songIndex: number,
  bioArousal: number | null,
  bioWeight: number = BIO_DEFAULT_WEIGHT,
): {
  valence: number;
  arousal: number;
  emotion: string;
  deviation: number;
} => {
  // Clamp index to path bounds
  const idx = Math.min(songIndex, vaPath.length - 1);
  const planned = vaPath[idx];

  let finalArousal: number;
  let deviation: number;

  if (bioArousal !== null) {
    // Blend: bioWeight of live signal, (1 - bioWeight) of planned trajectory
    //Normalize from scores of 1-10 to 0-1
    const plannedNormalized = planned.arousal / BIO_AROUSAL_SCALE;

    const blended =
      (1 - bioWeight) * plannedNormalized + bioWeight * bioArousal;
    deviation =
      Math.round(Math.abs(plannedNormalized - bioArousal) * 100) / 100;

    // Scale back to 1–10 for emotion matching
    finalArousal = blended * BIO_AROUSAL_SCALE;
  } else {
    finalArousal = planned.arousal;
    deviation = 0;
  }

  finalArousal =
    Math.round(
      Math.min(
        BIO_AROUSAL_CLAMP_MAX,
        Math.max(BIO_AROUSAL_CLAMP_MIN, finalArousal),
      ) * 100,
    ) / 100;

  const closestEmotion = findClosestEmotion(planned.valence, finalArousal);

  return {
    valence: planned.valence,
    arousal: finalArousal,
    emotion: closestEmotion.emotion,
    deviation,
  };
};

/**
 * Suggest a trajectory adjustment strategy based on biometric deviation.
 *
 * If the person isn't responding as expected (e.g., not calming down),
 * this suggests how to adapt the music.
 */
export const getAdaptationStrategy = (
  deviation: number,
  plannedArousal: number,
  bioArousal: number | null,
): "on_track" | "slow_down" | "intensify" | "hold_steady" => {
  if (bioArousal === null || deviation < ADAPTATION_ON_TRACK_THRESHOLD)
    return "on_track";

  const plannedNorm = plannedArousal / BIO_AROUSAL_SCALE;

  // Bio arousal is higher than planned — person isn't calming down
  if (bioArousal > plannedNorm + ADAPTATION_SLOW_DOWN_THRESHOLD)
    return "slow_down";

  // Bio arousal is lower than planned — person is calmer than expected
  if (bioArousal < plannedNorm - ADAPTATION_INTENSIFY_THRESHOLD)
    return "intensify";

  return "hold_steady";
};
