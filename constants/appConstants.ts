export type EmotionPoint = {
  emotion: string;
  valence: number; // 1–10
  arousal: number; // 1–10
};

export type UserInput = {
  name: string;
  age: string;
  currentMood: string;
  desiredMood: string;
  favoriteGenre: string;
  favoriteBand: string;
  activity: string;
};

export type HealthProvider = "Apple Health" | "Fitbit" | "Garmin";

export const DEBUG_MODE = false;
export const LISTEN_BEFORE_GENERATE_MS = 10000;

export const EMOTION_MAP: EmotionPoint[] = [
  // Q1 – High Valence, High Arousal
  { emotion: "Thrilling", valence: 9, arousal: 9 },
  { emotion: "Excited", valence: 9, arousal: 8.5 },
  { emotion: "Energetic", valence: 8.5, arousal: 8.5 },
  { emotion: "Joyful", valence: 9, arousal: 7.5 },
  { emotion: "Uplifting", valence: 9.5, arousal: 6.5 },
  { emotion: "Cheerful", valence: 8.5, arousal: 6.5 },
  { emotion: "Hopeful", valence: 7, arousal: 5.5 },

  // Q2 – Low Valence, High Arousal
  { emotion: "Fearful", valence: 1.5, arousal: 9.5 },
  { emotion: "Angry", valence: 2, arousal: 8.5 },
  { emotion: "Anxious", valence: 2, arousal: 8 },
  { emotion: "Tense", valence: 2.5, arousal: 7.5 },
  { emotion: "Intense", valence: 4, arousal: 9 },
  { emotion: "Mysterious", valence: 5, arousal: 6 },

  // Q3 – Low Valence, Low Arousal
  { emotion: "Depressed", valence: 1, arousal: 1 },
  { emotion: "Gloomy", valence: 2.5, arousal: 2 },
  { emotion: "Lonely", valence: 2, arousal: 2.5 },
  { emotion: "Sad", valence: 3, arousal: 4 },
  { emotion: "Melancholic", valence: 3.5, arousal: 3.5 },
  { emotion: "Sorrowful", valence: 2, arousal: 3 },

  // Q4 – High Valence, Low Arousal
  { emotion: "Peaceful", valence: 9, arousal: 1 },
  { emotion: "Relaxed", valence: 8.5, arousal: 1.5 },
  { emotion: "Comforting", valence: 8, arousal: 2 },
  { emotion: "Calm", valence: 7.5, arousal: 2.5 },
  { emotion: "Gentle", valence: 7, arousal: 3 },
  { emotion: "Nostalgic", valence: 6.5, arousal: 4.5 },
  { emotion: "Dreamy", valence: 6, arousal: 3.5 },
];

export const EMOTION_OPTIONS = EMOTION_MAP.map((e) => e.emotion).sort();
