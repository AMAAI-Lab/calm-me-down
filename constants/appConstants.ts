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

export type HeartRateSample = {
  value: number;
  timestamp: string;
};

export type UserProfile = {
  name: string;
  age: string;
  email: string;
  favoriteGenre: string;
  favoriteBand: string;
};

export const DEBUG_MODE = false;
export const LISTEN_BEFORE_GENERATE_MS = 10000;
export const CONTINUOUS_PLAYBACK_MS = 5000;

export const EMOTION_MAP: EmotionPoint[] = [
  // Q1 – High Valence, High Arousal
  { emotion: "Thrilling", valence: 9.52, arousal: 9.14 },
  { emotion: "Excited", valence: 9.17, arousal: 9.38 },
  { emotion: "Energetic", valence: 8.62, arousal: 8.81 },
  { emotion: "Joyful", valence: 9.96, arousal: 6.58 },
  { emotion: "Uplifting", valence: 7.94, arousal: 5.93 },
  { emotion: "Cheerful", valence: 9.96, arousal: 6.53 },
  { emotion: "Hopeful", valence: 9.52, arousal: 4.21 },

  // Q2 – Low Valence, High Arousal
  { emotion: "Fearful", valence: 1.75, arousal: 5.34 },
  { emotion: "Angry", valence: 2.1, arousal: 8.47 },
  { emotion: "Anxious", valence: 3.53, arousal: 8.88 },
  { emotion: "Tense", valence: 4.56, arousal: 4.95 },
  { emotion: "Intense", valence: 6.33, arousal: 7.97 },
  { emotion: "Mysterious", valence: 5.03, arousal: 7.29 },

  // Q3 – Low Valence, Low Arousal
  { emotion: "Depressed", valence: 1.22, arousal: 5.0 },
  { emotion: "Gloomy", valence: 1.96, arousal: 4.69 },
  { emotion: "Lonely", valence: 3.25, arousal: 3.03 },
  { emotion: "Sad", valence: 3.02, arousal: 4.0 },
  { emotion: "Melancholic", valence: 2.63, arousal: 3.75 },
  { emotion: "Sorrowful", valence: 1.44, arousal: 4.8 },

  // Q4 – High Valence, Low Arousal
  { emotion: "Peaceful", valence: 8.8, arousal: 1.49 },
  { emotion: "Relaxed", valence: 8.79, arousal: 1.4 },
  { emotion: "Comforting", valence: 9.15, arousal: 4.03 },
  { emotion: "Calm", valence: 8.88, arousal: 1.45 },
  { emotion: "Gentle", valence: 8.62, arousal: 4.18 },
  { emotion: "Nostalgic", valence: 5.12, arousal: 4.16 },
  { emotion: "Dreamy", valence: 8.53, arousal: 4.15 },

  // Additional
  { emotion: "Passionate", valence: 9.96, arousal: 7.52 },
  { emotion: "Humorous", valence: 9.15, arousal: 6.54 },
  { emotion: "Solemn", valence: 7.37, arousal: 4.33 },
  { emotion: "Warm", valence: 7.84, arousal: 3.81 },
  { emotion: "Cold", valence: 4.19, arousal: 5.84 },
  { emotion: "Profound", valence: 7.79, arousal: 5.91 },
  { emotion: "Upbeat", valence: 8.9, arousal: 5.78 },
  { emotion: "Contemplative", valence: 7.56, arousal: 3.77 },
];

export const EMOTION_OPTIONS = EMOTION_MAP.map((e) => e.emotion).sort();
export const MAX_LOG_FILE_SIZE = 500_000; // 500KB
export const HRV_APP_VERSION = true;
export const HRV_DURATION_MINS = 1440; //24 hours
