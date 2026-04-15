export type EmotionPoint = {
  emotion: string;
  valence: number; // 1–10
  arousal: number; // 1–10
};

export type UserInput = {
  currentMood: string;
  desiredMood: string;
  activity: string;
};

export type HealthProvider =
  | "Apple Health"
  | "Fitbit"
  | "Garmin"
  | "Health Connect";

export type HeartRateSample = {
  value: number;
  timestamp: string;
};

export type UserProfile = {
  name: string;
  nickName?: string;
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
  { emotion: "Disgusted", valence: 1.47, arousal: 6.53 },
  { emotion: "Frustrated", valence: 2.09, arousal: 7.84 },
  { emotion: "Ashamed", valence: 2.06, arousal: 5.03 },
  { emotion: "Bitter", valence: 1.75, arousal: 5.31 },
  { emotion: "Helpless", valence: 1.84, arousal: 5.07 },

  // Q3 – Low Valence, Low Arousal
  { emotion: "Depressed", valence: 1.22, arousal: 5.0 },
  { emotion: "Gloomy", valence: 1.96, arousal: 4.69 },
  { emotion: "Lonely", valence: 3.25, arousal: 3.03 },
  { emotion: "Sad", valence: 3.02, arousal: 4.0 },
  { emotion: "Melancholic", valence: 2.63, arousal: 3.75 },
  { emotion: "Sorrowful", valence: 1.44, arousal: 4.8 },
  { emotion: "Tired", valence: 3.38, arousal: 3.02 },
  { emotion: "Bored", valence: 3.34, arousal: 2.8 },

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
export const HRV_APP_VERSION = false;
export const HRV_DURATION_MINS = 1440; //24 hours

export const LYRICS_PROVIDERS = ["CLAUDE", "GROK", "OPEN_AI", "PERPLEXITY"];
export type LyricsProviderType = (typeof LYRICS_PROVIDERS)[number];
export const CURRENT_LYRICS_PROVIDER:
  | "PERPLEXITY"
  | "CLAUDE"
  | "GROK"
  | "OPEN_AI" = "CLAUDE";
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

//SUNO ORG payload
export const SUNO_ORG_PAYLOAD = {
  customMode: true,
  instrumental: false,
  model: "V4_5ALL",
  // personaId: "persona_123",
  // negativeTags: "Heavy Metal, Upbeat Drums",
  negativeTags: "Screaming, Abrupt Ending, Explicit, Noise, Static, Distortion",
  vocalGender: "m",
  styleWeight: 0.65,
  // weirdnessConstraint: 0.65,
  weirdnessConstraint: 0.4,
  audioWeight: 0.65,
};

export const GENRES = [
  "Pop",
  "Rock",
  "Indie",
  "EDM / Electronic",
  "Hip-Hop / Rap",
  "R&B / Soul",
  "Jazz",
  "Classical",
  "Country",
  "Metal",
  "Punk",
  "Reggae",
  "Latin",
  "K-Pop",
  "Folk / Acoustic",
  "Blues",
  "Alternative",
];
export const ARTISTS_BY_GENRE: Record<string, string[]> = {
  Pop: [
    "Taylor Swift",
    "Ed Sheeran",
    "Ariana Grande",
    "Harry Styles",
    "Billie Eilish",
    "Dua Lipa",
    "The Weeknd",
    "Bruno Mars",
    "Justin Bieber",
    "Katy Perry",
    "Lady Gaga",
    "Selena Gomez",
    "Charlie Puth",
    "Olivia Rodrigo",
    "Sam Smith",
  ],
  Rock: [
    "Coldplay",
    "Imagine Dragons",
    "Foo Fighters",
    "Linkin Park",
    "Red Hot Chili Peppers",
    "Green Day",
    "Muse",
    "U2",
    "Kings of Leon",
    "The Killers",
    "Pearl Jam",
    "Radiohead",
    "AC/DC",
    "Guns N' Roses",
    "Bon Jovi",
  ],
  Indie: [
    "Arctic Monkeys",
    "Tame Impala",
    "The Strokes",
    "Vampire Weekend",
    "Bon Iver",
    "Fleet Foxes",
    "Arcade Fire",
    "Beach House",
    "Sufjan Stevens",
    "Phoebe Bridgers",
    "Mac DeMarco",
    "Rex Orange County",
    "Girl in Red",
    "Clairo",
    "Alvvays",
  ],
  "EDM / Electronic": [
    "Martin Garrix",
    "Calvin Harris",
    "Marshmello",
    "Deadmau5",
    "Skrillex",
    "Avicii",
    "Zedd",
    "Kygo",
    "Diplo",
    "David Guetta",
    "Tiësto",
    "Daft Punk",
    "Aphex Twin",
    "Four Tet",
    "Disclosure",
  ],
  "Hip-Hop / Rap": [
    "Drake",
    "Kendrick Lamar",
    "J. Cole",
    "Travis Scott",
    "Post Malone",
    "Eminem",
    "Jay-Z",
    "Kanye West",
    "Cardi B",
    "Nicki Minaj",
    "21 Savage",
    "Lil Baby",
    "Tyler, the Creator",
    "A$AP Rocky",
    "Mac Miller",
  ],
  "R&B / Soul": [
    "Frank Ocean",
    "SZA",
    "H.E.R.",
    "Daniel Caesar",
    "Jhené Aiko",
    "Bryson Tiller",
    "The Weeknd",
    "Beyoncé",
    "Usher",
    "Alicia Keys",
    "John Legend",
    "Khalid",
    "Summer Walker",
    "Giveon",
    "Lucky Daye",
  ],
  Jazz: [
    "Miles Davis",
    "John Coltrane",
    "Herbie Hancock",
    "Thelonious Monk",
    "Louis Armstrong",
    "Duke Ellington",
    "Chet Baker",
    "Bill Evans",
    "Dave Brubeck",
    "Norah Jones",
    "Diana Krall",
    "Robert Glasper",
    "Kamasi Washington",
    "Esperanza Spalding",
    "Christian Scott",
  ],
  Classical: [
    "Ludwig van Beethoven",
    "Wolfgang Amadeus Mozart",
    "Johann Sebastian Bach",
    "Frédéric Chopin",
    "Franz Schubert",
    "Claude Debussy",
    "Pyotr Ilyich Tchaikovsky",
    "Antonio Vivaldi",
    "Johannes Brahms",
    "Yo-Yo Ma",
    "Lang Lang",
    "Hilary Hahn",
  ],
  Country: [
    "Morgan Wallen",
    "Luke Combs",
    "Zach Bryan",
    "Chris Stapleton",
    "Carrie Underwood",
    "Miranda Lambert",
    "Blake Shelton",
    "Keith Urban",
    "Kenny Chesney",
    "Tim McGraw",
    "Dolly Parton",
    "Johnny Cash",
    "Kacey Musgraves",
    "Tyler Childers",
    "Cody Johnson",
  ],
  Metal: [
    "Metallica",
    "Iron Maiden",
    "Black Sabbath",
    "Slayer",
    "Megadeth",
    "Pantera",
    "Tool",
    "System of a Down",
    "Rammstein",
    "Slipknot",
    "Mastodon",
    "Lamb of God",
    "Behemoth",
    "Gojira",
    "Ghost",
  ],
  Punk: [
    "The Clash",
    "Sex Pistols",
    "Ramones",
    "Bad Religion",
    "NOFX",
    "Descendents",
    "Dead Kennedys",
    "Misfits",
    "Pennywise",
    "Rise Against",
    "Against Me!",
    "The Offspring",
    "Alkaline Trio",
    "Social Distortion",
    "Dropkick Murphys",
  ],
  Reggae: [
    "Bob Marley",
    "Peter Tosh",
    "Burning Spear",
    "Toots and the Maytals",
    "Jimmy Cliff",
    "Damian Marley",
    "Sizzla",
    "Buju Banton",
    "Chronixx",
    "Protoje",
    "Ziggy Marley",
    "Steel Pulse",
  ],
  Latin: [
    "Bad Bunny",
    "J Balvin",
    "Ozuna",
    "Maluma",
    "Shakira",
    "Marc Anthony",
    "Daddy Yankee",
    "Camilo",
    "Rosalía",
    "Rauw Alejandro",
    "Karol G",
    "Becky G",
    "Enrique Iglesias",
    "Ricky Martin",
    "Carlos Vives",
  ],
  "K-Pop": [
    "BTS",
    "BLACKPINK",
    "EXO",
    "TWICE",
    "Stray Kids",
    "aespa",
    "NCT 127",
    "Red Velvet",
    "Monsta X",
    "GOT7",
    "SHINee",
    "IU",
    "BIGBANG",
    "2NE1",
    "Girls' Generation",
  ],
  "Folk / Acoustic": [
    "Bob Dylan",
    "Simon & Garfunkel",
    "Nick Drake",
    "Joni Mitchell",
    "Iron & Wine",
    "Mumford & Sons",
    "The Lumineers",
    "Of Monsters and Men",
    "Ben Howard",
    "Jose Gonzalez",
    "James Taylor",
    "Cat Stevens",
    "Hozier",
    "Noah Kahan",
    "Gregory Alan Isakov",
  ],
  Blues: [
    "B.B. King",
    "Muddy Waters",
    "Howlin' Wolf",
    "Robert Johnson",
    "Eric Clapton",
    "Stevie Ray Vaughan",
    "John Lee Hooker",
    "Buddy Guy",
    "Taj Mahal",
    "Gary Clark Jr.",
    "Joe Bonamassa",
    "Bonnie Raitt",
  ],
  Alternative: [
    "Nirvana",
    "Pearl Jam",
    "Smashing Pumpkins",
    "R.E.M.",
    "Beck",
    "Pixies",
    "The National",
    "Modest Mouse",
    "Death Cab for Cutie",
    "Interpol",
    "Wilco",
    "Pavement",
    "Weezer",
    "Blur",
    "Oasis",
  ],
};

export const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";
export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  preview_url?: string | null;
  external_urls: { spotify: string };
  duration_ms: number;
}
