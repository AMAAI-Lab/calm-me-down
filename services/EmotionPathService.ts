import { EMOTION_MAP, EmotionPoint } from "@/constants/appConstants";

const getEmotionPoint = (emotion: string) =>
  EMOTION_MAP.find((e) => e.emotion.toLowerCase() === emotion.toLowerCase());

/**
 * Find the closest named emotion to a given VA coordinate.
 */
const findClosestEmotion = (
  valence: number,
  arousal: number
): EmotionPoint => {
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
  steps = 5
): string[] => {
  const start = getEmotionPoint(startEmotion);
  const end = getEmotionPoint(endEmotion);

  if (!start || !end) {
    return [startEmotion, endEmotion];
  }

  const trajectory: { valence: number; arousal: number }[] = [];

  for (let i = 0; i <= steps + 1; i++) {
    const t = i / (steps + 1);
    trajectory.push({
      valence: start.valence + t * (end.valence - start.valence),
      arousal: start.arousal + t * (end.arousal - start.arousal),
    });
  }

  return trajectory
    .map((point) => findClosestEmotion(point.valence, point.arousal).emotion)
    .filter((v, i, arr) => arr.indexOf(v) === i);
};

/**
 * Build a VA (valence-arousal) trajectory as numeric coordinates.
 * Returns the raw VA points for each step, useful for biometric fusion.
 */
export const buildVAPath = (
  startEmotion: string,
  endEmotion: string,
  steps = 5
): { valence: number; arousal: number }[] => {
  const start = getEmotionPoint(startEmotion);
  const end = getEmotionPoint(endEmotion);

  if (!start || !end) {
    return [
      { valence: 0, arousal: 0.5 },
      { valence: 0, arousal: 0.5 },
    ];
  }

  const trajectory: { valence: number; arousal: number }[] = [];

  for (let i = 0; i <= steps + 1; i++) {
    const t = i / (steps + 1);
    trajectory.push({
      valence:
        Math.round(
          (start.valence + t * (end.valence - start.valence)) * 100
        ) / 100,
      arousal:
        Math.round(
          (start.arousal + t * (end.arousal - start.arousal)) * 100
        ) / 100,
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
 * @param bioWeight     - How much to weight biometric signal vs planned (0-1, default 0.6)
 * @returns { valence, arousal, emotion, deviation }
 */
export const getBiometricAdjustedEmotion = (
  vaPath: { valence: number; arousal: number }[],
  songIndex: number,
  bioArousal: number | null,
  bioWeight: number = 0.6
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
    const plannedNormalized = planned.arousal/10;

    const blended = (1- bioWeight) * plannedNormalized + bioWeight * bioArousal;
    deviation = Math.round(Math.abs(plannedNormalized - bioArousal) *100)/100;

    //Scale back to 1-10 for emotion matching
    finalArousal = blended * 10;
  } else {
    finalArousal = planned.arousal;
    deviation = 0;
  }

  finalArousal = Math.round(Math.min(10, Math.max(1, finalArousal)) * 100) / 100;

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
  bioArousal: number | null
): "on_track" | "slow_down" | "intensify" | "hold_steady" => {
  if (bioArousal === null || deviation < 0.15) return "on_track";

  const plannedNorm = plannedArousal / 10;

  // Bio arousal is higher than planned — person isn't calming down
  if (bioArousal > plannedNorm + 0.15) return "slow_down";

  // Bio arousal is lower than planned — person is calmer than expected
  if (bioArousal < plannedNorm - 0.15) return "intensify";

  return "hold_steady";
};
