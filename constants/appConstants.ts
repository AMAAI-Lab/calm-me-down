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

export const LYRICS_PROVIDERS = ["CLAUDE", "GROK", "OPEN_AI", "PERPLEXITY"];
export type LyricsProviderType = typeof LYRICS_PROVIDERS[number];
export const CURRENT_LYRICS_PROVIDER: "PERPLEXITY" | "CLAUDE" | "GROK" | "OPEN_AI" = "CLAUDE";
export const CURRENT_SONG_PROVIDER: "SUNO_ORG" | "SUNO" | "REPLICATE" | "MOCK" =
  "SUNO_ORG";

// Tunable constants for arousal estimation
export const AROUSAL_DEFAULT_RESTING_HR = 70; // bpm — personalize per user over time
export const AROUSAL_ASSUMED_AGE = 30; // used in max HR formula (220 - age)
export const AROUSAL_STEPS_ACTIVITY_CEILING = 200; // steps in window considered "moderate walking"
export const AROUSAL_HRV_LOW_THRESHOLD = 20; // ms — below this = high stress
export const AROUSAL_HRV_HIGH_THRESHOLD = 60; // ms — above this = relaxed
export const AROUSAL_HR_BLEND_WEIGHT = 0.6; // weight for HR-based arousal when HRV present
export const AROUSAL_HRV_BLEND_WEIGHT = 0.4; // weight for HRV-based stress factor

// Tunable constants for VA trajectory computation
export const LIVE_VA_TRAJECTORY_WEIGHT = 0.4; // weight for planned arousal trajectory
export const LIVE_VA_BIOMETRIC_WEIGHT = 0.6; // weight for live biometric arousal signal

// --- Tunable constants for buildEmotionPath / buildVAPath ---
export const PATH_DEFAULT_STEPS = 5; // number of interpolation steps between start and end emotion

export const BIO_DEFAULT_WEIGHT = 0.6; // how much live biometric arousal influences final arousal (0–1)
export const BIO_AROUSAL_SCALE = 10; // VA path arousal is stored on a 1–10 scale; biometric is 0–1
export const BIO_AROUSAL_CLAMP_MIN = 1; // minimum clamped arousal value (on 1–10 scale)
export const BIO_AROUSAL_CLAMP_MAX = 10; // maximum clamped arousal value (on 1–10 scale)

export const ADAPTATION_ON_TRACK_THRESHOLD = 0.15; // deviation below this = "on track"
export const ADAPTATION_SLOW_DOWN_THRESHOLD = 0.15; // bio arousal this much above planned = "slow_down"
export const ADAPTATION_INTENSIFY_THRESHOLD = 0.15; // bio arousal this much below planned = "intensify"

// Fallback VA coordinate when start/end emotion cannot be resolved
export const PATH_FALLBACK_VA = { valence: 0, arousal: 0.5 };
