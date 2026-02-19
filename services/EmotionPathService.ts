import { EMOTION_MAP, EmotionPoint } from "@/constants/appConstants";

const getEmotionPoint = (emotion: string) =>
  EMOTION_MAP.find((e) => e.emotion.toLowerCase() === emotion.toLowerCase());

export const buildEmotionPath = (
  startEmotion: string,
  endEmotion: string,
  steps = 5,
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
  return trajectory
    .map((point) => {
      const closest = EMOTION_MAP.reduce((prev, curr) => {
        const prevDist =
          Math.abs(prev.valence - point.valence) +
          Math.abs(prev.arousal - point.arousal);
        const currDist =
          Math.abs(curr.valence - point.valence) +
          Math.abs(curr.arousal - point.arousal);
        return currDist < prevDist ? curr : prev;
      });
      return closest.emotion;
    })
    .filter((v, i, arr) => arr.indexOf(v) === i);
};
