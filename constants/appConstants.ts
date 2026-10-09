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
  name?: string;
  nickName?: string;
  profession?: string;
  about?: string;
  age: string;
  email: string;
  favoriteGenre: string;
  favoriteBand: string;
};

export interface LyricsResult {
  lyrics: string;
  musicStyle: string;
}

export const APP_VERSION = 36
export const DEBUG_MODE = false;
export const LISTEN_BEFORE_GENERATE_MS = 2000;
export const CONTINUOUS_PLAYBACK_MS = 5000;

export const EMOTION_MAP: EmotionPoint[] = [
  // ── Q1: High Valence, High Arousal ─────────────────────────────────────────
  { emotion: "Liked",        valence: 9.83, arousal: 5.17 }, // Eerola (NRC)
  { emotion: "Happy",        valence: 9.66, arousal: 7.15 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Encouraged",   valence: 9.58, arousal: 7.32 }, // Eerola (NRC)
  { emotion: "Joyful",       valence: 9.54, arousal: 6.34 }, // Eerola (War+NRC) ← study target
  { emotion: "In Love",      valence: 9.53, arousal: 5.50 }, // Eerola (NRC)
  { emotion: "Fantastic",    valence: 9.50, arousal: 7.17 }, // Eerola (War+NRC)
  { emotion: "Fun",          valence: 9.27, arousal: 7.79 }, // Eerola (War+NRC)
  { emotion: "Successful",   valence: 9.18, arousal: 6.55 }, // Eerola (War+NRC)
  { emotion: "Delighted",    valence: 9.15, arousal: 7.62 }, // Eerola+Russell (War+NRC)
  { emotion: "Free",         valence: 9.11, arousal: 5.71 }, // Eerola (War+NRC)
  { emotion: "Excited",      valence: 9.09, arousal: 8.25 }, // Eerola+Russell (War+NRC)
  { emotion: "Pleasurable",  valence: 9.06, arousal: 6.38 }, // J&L (War+NRC)
  { emotion: "Pleased",      valence: 9.06, arousal: 5.29 }, // Russell (War+NRC)
  { emotion: "Positive",     valence: 9.01, arousal: 5.82 }, // Eerola (War+NRC)
  { emotion: "Adorable",     valence: 8.96, arousal: 5.39 }, // Eerola (War+NRC)
  { emotion: "Passionate",   valence: 8.95, arousal: 7.26 }, // Eerola (War+NRC)
  { emotion: "Romantic",     valence: 8.93, arousal: 5.71 }, // Eerola (War+NRC)
  { emotion: "Funny",        valence: 8.84, arousal: 6.21 }, // Eerola (War+NRC)
  { emotion: "Playful",      valence: 8.75, arousal: 6.85 }, // Eerola (War+NRC)
  { emotion: "Celebratory",  valence: 8.71, arousal: 6.88 }, // Eerola (NRC)
  { emotion: "Enthusiastic", valence: 8.66, arousal: 7.66 }, // Eerola (War+NRC)
  { emotion: "Inspired",     valence: 8.66, arousal: 6.72 }, // Eerola (War+NRC)
  { emotion: "Amused",       valence: 8.64, arousal: 6.65 }, // J&L (War+NRC)
  { emotion: "Heroic",       valence: 8.63, arousal: 6.98 }, // Eerola (War+NRC)
  { emotion: "Glorious",     valence: 8.63, arousal: 6.09 }, // Eerola (War+NRC)
  { emotion: "Energetic",    valence: 8.50, arousal: 7.78 }, // Eerola (War+NRC)
  { emotion: "Strong",       valence: 8.38, arousal: 6.68 }, // Eerola (War+NRC)
  { emotion: "Epic",         valence: 8.34, arousal: 6.35 }, // Eerola (War+NRC)
  { emotion: "Motivational", valence: 8.32, arousal: 6.92 }, // Eerola (War+NRC)
  { emotion: "Festive",      valence: 8.30, arousal: 6.96 }, // Eerola (War+NRC)
  { emotion: "Amazed",       valence: 8.27, arousal: 7.29 }, // Eerola (War+NRC)
  { emotion: "Elegant",      valence: 8.27, arousal: 5.14 }, // Eerola (War+NRC)
  { emotion: "Euphoric",     valence: 8.18, arousal: 7.46 }, // Eerola (War+NRC)
  { emotion: "Liberated",    valence: 8.02, arousal: 6.67 }, // Eerola (NRC)
  { emotion: "Animated",     valence: 7.88, arousal: 6.72 }, // Eerola (War+NRC)
  { emotion: "Moved",        valence: 7.86, arousal: 7.84 }, // J&L (NRC)
  { emotion: "Uplifting",    valence: 7.82, arousal: 5.54 }, // Eerola (War+NRC)
  { emotion: "Spontaneous",  valence: 7.67, arousal: 6.25 }, // Eerola (War+NRC)
  { emotion: "Interested",   valence: 7.65, arousal: 5.32 }, // Eerola+J&L (War+NRC)
  { emotion: "Powerful",     valence: 7.60, arousal: 7.21 }, // Eerola (War+NRC)
  { emotion: "Emotional",    valence: 6.81, arousal: 6.64 }, // Eerola (War+NRC)
  { emotion: "Astonished",   valence: 6.34, arousal: 7.15 }, // Russell (War+NRC)
  { emotion: "Intense",      valence: 6.28, arousal: 7.63 }, // Eerola (War+NRC)
  { emotion: "Hot",          valence: 5.87, arousal: 6.45 }, // Eerola (War+NRC)

  // ── Q2: Low Valence, High Arousal ──────────────────────────────────────────
  { emotion: "Jumpy",        valence: 4.73, arousal: 7.15 }, // Eerola (War+NRC)
  { emotion: "Tense",        valence: 3.76, arousal: 5.41 }, // Russell+J&L (War+NRC)
  { emotion: "Moody",        valence: 3.62, arousal: 6.90 }, // Eerola (War+NRC)
  { emotion: "Distressed",   valence: 2.99, arousal: 7.44 }, // Russell (War+NRC)
  { emotion: "Severe",       valence: 2.99, arousal: 6.80 }, // Eerola (War+NRC)
  { emotion: "Aggressive",   valence: 2.73, arousal: 8.01 }, // Eerola (War+NRC)
  { emotion: "Alarmed",      valence: 2.69, arousal: 8.40 }, // Russell (NRC)
  { emotion: "Tragic",       valence: 2.63, arousal: 7.52 }, // Eerola (War+NRC)
  { emotion: "Annoyed",      valence: 2.48, arousal: 6.94 }, // Russell (War+NRC)
  { emotion: "Angry",        valence: 2.41, arousal: 7.66 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Frustrated",   valence: 2.23, arousal: 6.41 }, // Russell (War+NRC)
  { emotion: "Miserable",    valence: 2.18, arousal: 5.36 }, // Russell (War+NRC)
  { emotion: "Furious",      valence: 2.17, arousal: 8.16 }, // Eerola (War+NRC)
  { emotion: "Afraid",       valence: 1.76, arousal: 6.36 }, // Russell (War+NRC)

  // ── Q3: Low Valence, Low Arousal ───────────────────────────────────────────
  { emotion: "Sorry",        valence: 4.97, arousal: 4.67 }, // Eerola (War+NRC)
  { emotion: "Droopy",       valence: 4.66, arousal: 3.80 }, // Russell (War+NRC)
  { emotion: "Tired",        valence: 3.41, arousal: 3.92 }, // Russell (War+NRC)
  { emotion: "Bored",        valence: 2.79, arousal: 3.24 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Gloomy",       valence: 2.69, arousal: 4.15 }, // Russell (War+NRC)
  { emotion: "Sad",          valence: 2.63, arousal: 3.90 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Melancholic",  valence: 2.63, arousal: 3.75 }, // Eerola (NRC)
  { emotion: "Depressed",    valence: 1.83, arousal: 4.83 }, // Russell (War+NRC)

  // ── Q4: High Valence, Low Arousal ──────────────────────────────────────────
  { emotion: "Good",         valence: 9.09, arousal: 4.15 }, // Eerola (War+NRC)
  { emotion: "Friendly",     valence: 8.97, arousal: 4.63 }, // Eerola (War+NRC)
  { emotion: "Peaceful",     valence: 8.84, arousal: 3.15 }, // Eerola (War+NRC)
  { emotion: "Satisfied",    valence: 8.78, arousal: 4.96 }, // Eerola+Russell (War+NRC)
  { emotion: "Tranquil",     valence: 8.75, arousal: 2.04 }, // Eerola (War+NRC)
  { emotion: "Pleasant",     valence: 8.73, arousal: 3.47 }, // Eerola (War+NRC)
  { emotion: "Easy",         valence: 8.53, arousal: 3.46 }, // Eerola (War+NRC)
  { emotion: "Dreamy",       valence: 8.43, arousal: 4.77 }, // Eerola (War+NRC)
  { emotion: "Graceful",     valence: 8.42, arousal: 4.98 }, // Eerola (War+NRC)
  { emotion: "Gentle",       valence: 8.42, arousal: 3.81 }, // Eerola (War+NRC)
  { emotion: "Relaxed",      valence: 8.40, arousal: 2.04 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Cool",         valence: 8.26, arousal: 4.79 }, // Eerola (War+NRC)
  { emotion: "Calm",         valence: 8.26, arousal: 1.60 }, // Russell (War+NRC) ← study target
  { emotion: "Light Hearted",valence: 8.05, arousal: 4.60 }, // Eerola (NRC)
  { emotion: "Spiritual",    valence: 7.93, arousal: 4.62 }, // Eerola+J&L (War+NRC)
  { emotion: "Serene",       valence: 7.93, arousal: 3.66 }, // Eerola+Russell (War+NRC)
  { emotion: "Soft",         valence: 7.87, arousal: 2.96 }, // Eerola (War+NRC)
  { emotion: "Content",      valence: 7.64, arousal: 3.55 }, // Russell (War+NRC)
  { emotion: "Tender",       valence: 6.91, arousal: 4.59 }, // J&L (War+NRC)
  { emotion: "Religious",    valence: 6.69, arousal: 4.11 }, // Eerola (War+NRC)
  { emotion: "Sentimental",  valence: 6.59, arousal: 3.79 }, // Eerola (War+NRC)
  { emotion: "Reflective",   valence: 6.52, arousal: 3.66 }, // Eerola (War+NRC)
  { emotion: "Longing",      valence: 6.44, arousal: 4.91 }, // J&L (NRC)
  { emotion: "Nostalgic",    valence: 6.25, arousal: 4.47 }, // J&L (War+NRC)
  { emotion: "Solemn",       valence: 6.25, arousal: 3.74 }, // J&L (War+NRC)
  { emotion: "At Ease",      valence: 5.79, arousal: 3.84 }, // Russell (NRC)
  { emotion: "Deep",         valence: 5.71, arousal: 4.76 }, // Eerola (War+NRC)
  { emotion: "Sleepy",       valence: 5.61, arousal: 2.71 }, // Russell (War+NRC)
];

export const EMOTION_OPTIONS = EMOTION_MAP.map((e) => e.emotion).sort();
export const MAX_LOG_FILE_SIZE = 500_000; // 500KB
export const HRV_APP_VERSION = false;
export const HRV_DURATION_MINS = 1440; //24 hours

export const LYRICS_PROVIDERS = ["CLAUDE", "GROK", "OPEN_AI", "GEMINI"];
export type LyricsProviderType = (typeof LYRICS_PROVIDERS)[number];
export const CURRENT_LYRICS_PROVIDER:
  | "GEMINI"
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
export const DEFAULT_HEALTH_DATA = {
  heartRate: 75,
  steps: 0,
  hrv: null,
  arousal: null,
  heartRateSamples: [],
};

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

export const SHOW_LYRICS = true;
export const SHOW_WEATHER_INFO = false;
export const SHOW_NEWS = false;

export const EMOTION_TEMPO_MAP = {
  relaxed: [60, 75],
  comforting: [70, 90],
  hopeful: [85, 110],
  joyful: [105, 135],
};

export const EMOTION_GRID: string[][] = [
  ["Distressed", "Angry", "Tense", "Frustrated", "Afraid"], //Q2
  ["Excited", "Happy", "Delighted", "Joyful", "Inspired"], //Q1
  ["Sad", "Melancholic", "Depressed", "Bored", "Tired"], // Q3
  ["Relaxed", "Light Hearted", "Satisfied", "Peaceful", "Pleasant"], //Q4
];

export const PRE_GENERATED_PLAYLIST = {
  relaxed: [
    {
      id: "1",
      // title: "Tate McRae, Jeremy Zucker - that way",
      title: "Your Personal Playlist",
      audioUrl:
        "https://www.image2url.com/r2/default/audio/1778741665093-59d08d61-3a82-48ca-9479-3250af7d8c09.mp3",
      provider: "MOCK",
      lyrics: `
        Run me in circles
        Like you always do
        Mess with me on purpose
        So I'll hang onto you

        I know what you mean when you act like that
        You don't know it's breaking my heart
        Said that it was just never gonna happen
        Then almost kissed me in the dark
        Every time we talk, it just hurts so bad
        'Cause I don't even know what we are
        I don't even know where to start
        But I can play the part

        We say we're friends, but I'm catching you across the room
        It makes no sense, 'cause we're fighting over what we do
        And there's no way that I'll end up being with you
        But friends don't look at friends that way
        Friends don't look at friends that way

        Can't even tell if
        I love or hate you more
        You've got me addicted
        And I can't tell who's keeping score

        I know what you mean when you act like that
        You don't know it's breaking my heart
        Said that it was just never gonna happen
        Then almost kissed me in the dark
        Every time we talk, it just hurts so bad
        'Cause I don't even know what we are
        I don't even know where to start
        But I can play the part

        We say we're friends, but I'm catching you across the room
        It makes no sense, 'cause we're fighting over what we do
        And there's no way that I'll end up being with you
        But friends don't look at friends that way

        Friends don't look at friends that way
        Friends don't look at friends that way
        Friends don't look at friends that way
        Mm-mm, ayy

        We say we're friends, but I'm catching you across the room
        It makes no sense, 'cause we're fighting over what we do
        And there's no way that I'll end up being with you
        But friends don't look at friends that way

        Friends don't look at friends that way
      `,
    },
    {
      id: "2",
      // title: "At My Worst",
      title: "Your Personal Playlist",
      audioUrl:
        "https://www.image2url.com/r2/default/audio/1778741914719-94c8546e-53b0-4f6c-be1b-cdff7a290df4.mp3",
      provider: "MOCK",
      lyrics: `
        Can I call you baby?
        Can you be my friend?
        Can you be my lover up until the very end?
        Let me show you love, oh, I don't pretend
        Stick by my side even when the world is givin' in, yeah

        Oh, oh, oh, don't
        Don't you worry
        I'll be there, whenever you want me

        I need somebody who can love me at my worst
        No, I'm not perfect, but I hope you see my worth
        'Cause it's only you, nobody new, I put you first
        And for you, girl, I swear I'd do the worst

        If you stay forever, let me hold your hand
        I can fill those places in your heart no else can
        Let me show you love, oh, no pretend, yeah
        I'll be right here, baby, you know it's sink or swim

        Oh, oh, oh, don't
        Don't you worry
        I'll be there, whenever you want me

        I need somebody who can love me at my worst
        No, I'm not perfect, but I hope you see my worth, yeah
        'Cause it's only you, nobody new, I put you first (you first)
        And for you, girl, I swear I'd do the worst

        I need somebody who can love me at my worst
        No, I'm not perfect, but I hope you see my worth
        'Cause it's only you, nobody new, I put you first
        And for you, girl, I swear I'd do the worst
      `,
    },
    {
      id: "3",
      // title: "Lonely",
      title: "Your Personal Playlist",
      audioUrl:
        "https://www.image2url.com/r2/default/audio/1778741966574-c4a1b2d7-866b-4fb7-a60e-939f54a62e3f.mp3",
      provider: "MOCK",
      lyrics: `
        Everybody knows my name now
        But somethin' 'bout it still feels strange
        Like lookin' in a mirror, tryna steady yourself
        And seein' somebody else

        And everything is not the same now
        It feels like all our lives have changed
        Maybe when I'm older, it'll all calm down
        But it's killin' me now

        What if you had it all
        But nobody to call?
        Maybe then you'd know me
        'Cause I've had everything
        But no one's listening
        And that's just lonely

        I'm so lonely
        Lonely

        Everybody knows my past now
        Like my house was always made of glass
        And maybe that's the price you pay
        For the money and fame at an early age

        And everybody saw me sick
        And it felt like no one gave
        They criticized the things I did as an idiot kid

        What if you had it all
        But nobody to call?
        Maybe then you'd know me
        'Cause I've had everything
        But no one's listening
        And that's just lonely

        I'm so lonely
        Lonely
        I'm so lonely
        Lonely
      `,
    },
    {
      id: "4",
      // title: "Til Death Do Us Part",
      title: "Your Personal Playlist",
      audioUrl:
        "https://www.image2url.com/r2/default/audio/1778742015318-04cddb11-6476-4756-b5a0-70e3ca0728cc.mp3",
      provider: "MOCK",
      lyrics: `
        We lost our broken pieces on the floor
        I tried but can't put them back no more
        All those stolen nights that I can't let go of
        I hate the fact that you're all I know

        3am again when you're calling me up
        You say you know we gotta talk
        Then you get in my head
        Breakup then we makeup
        Every other weekend
        You know that I'll be there til the end

        To love and to cherish
        Then tear me apart
        Through health and in sickness
        The hell kinda love
        For richer for poorer
        But tears come for free
        So go ahead and break my heart

        Off and on
        Til death do us part
        Ohhhh
        Off and on til death do us part
        Ohhhh
        Off and on till death do us part
        
        If I could go back to before we met
        I'd take that train no questions said
        But the way we locked eyes
        Got me missing all your lies
        But it's hard for me to not call you mine

        To love and to cherish
        Then tear me apart
        Through health and in sickness
        The hell kinda love
        For richer for poorer
        But tears come for free
        So go ahead and break my heart

        Off and on
        Til death do us part
        Ohhhh
        Off and on til death do us part
        Ohhhh
        Off and on til death do us part

        3am again when you calling me up
        You say you know we gotta talk
        Then you get in my head
        Breakup then we makeup
        Every other weekend
        You know that I'll be there til the end
        Off and on til death do us part
      `,
    },
  ],
  joyful: [
    {
      id: "1",
      // title: "As It Was",
      title: "Your Personal Playlist",
      audioUrl:
        "https://www.image2url.com/r2/default/audio/1778742697895-6009e483-ed3b-4d88-ba19-0b9519eb530c.mp3",
      provider: "MOCK",
      lyrics: `
        Holdin' me back
        Gravity's holdin' me back
        I want you to hold out the palm of your hand
        Why don't we leave it at that?
        Nothin' to say
        When everything gets in the way
        Seems you cannot be replaced
        And I'm the one who will stay, oh-oh-oh

        In this world, it's just us
        You know it's not the same as it was
        In this world, it's just us
        You know it's not the same as it was
        As it was, as it was
        You know it's not the same

        Answer the phone
        "Harry, you're no good alone
        Why are you sittin' at home on the floor?
        What kind of pills are you on?"
        Ringin' the bell
        And nobody's comin' to help
        Your daddy lives by himself
        He just wants to know that you're well, oh-oh-oh

        In this world, it's just us
        You know it's not the same as it was
        In this world, it's just us
        You know it's not the same as it was
        As it was, as it was
        You know it's not the same

        Go home, get ahead, light-speed internet
        I don't wanna talk about the way that it was
        Leave America, two kids follow her
        I don't wanna talk about who's doin' it first

        As it was
        You know it's not the same as it was
        As it was, as it was
      `,
    },
    {
      id: "2",
      // title: "Belong Together",
      title: "Your Personal Playlist",
      audioUrl:
        "https://www.image2url.com/r2/default/audio/1778742816618-73a263f3-34e7-476c-81b7-530e1ad320d2.mp3",
      provider: "MOCK",
      lyrics: `
        I know sleep is friends with death
        But maybe I should get some rest
        'Cause I've been out here workin' all damn day
        Blueberries and butterflies
        The pretty things that greet my eyes
        When you call and I say, "I'm on my way"

        You and me belong together
        Like cold iced tea and warmer weather
        Where we lay out late underneath the pines
        And we still have fun when the sun won't shine
        You and me belong together all the time

        Spillin' wine and homemade drinks
        We throw a cheers, the worries sink
        Damnit, it's so good to be alive
        We know that we don't got much
        But, then again, it's just enough
        To always find a way for a good time

        You and me belong together
        Like cold iced tea and warmer weather
        Where we lay out late underneath the pines
        And we still have fun when the sun won't shine
        You and me belong together

        This love is all we need
        Oh, we've got so much
        You and me, oh

        You and me belong together
        Like cold iced tea and warmer weather
        Where we lay out late underneath the pines
        And we still have fun when the sun won't shine
        You and me belong together all the time
        
        It goes on and on and on (hey)
        It goes on and on and on
        It goes on and on and on (woo)
      `,
    },
    {
      id: "3",
      // title: "Ain't No Mountain High Enough",
      title: "Your Personal Playlist",
      audioUrl:
        "https://www.image2url.com/r2/default/audio/1778742870579-f7949513-3682-49c6-8156-118d8e114959.mp3",
      provider: "MOCK",
      lyrics: `
        Listen, baby
        Ain't no mountain high
        Ain't no vally low
        Ain't no river wide enough, baby

        If you need me, call me
        No matter where you are
        No matter how far
        Just call my name
        I'll be there in a hurry
        You don't have to worry

        * 'Cause baby,
        There ain't no mountain high enough
        Ain't no valley low enough
        Ain't no river wide enough
        To keep me from getting to you

        Remember the day
        I set you free
        I told you
        You could always count on me
        From that day on I made a vow
        I'll be there when you want me
        Some way,some how

        [Repeat *]

        No wind, no rain

        My love is alive
        Way down in my heart
        Although we are miles apart
        If you ever need a helping hand
        I'll be there on the double
        As fast as I can

        ** Don't you know that
        There ain't no mountain high enough
        Ain't no valley low enough
        Ain't no river wide enough
        (To keep me from getting to you)

        [Repeat **]
      `,
    },
    {
      id: "4",
      // title: "Until I Found You",
      title: "Your Personal Playlist",
      audioUrl:
        "https://www.image2url.com/r2/default/audio/1778743282741-9c175eb7-b8d2-4cea-b8bd-31ca17c348ae.mp3",
      provider: "MOCK",
      lyrics: `
        Georgia, wrap me up in all your
        I want you in my arms
        Oh, let me hold you
        I'll never let you go again like I did
        Oh, I used to say

        I would never fall in love again until I found her
        I said, "I would never fall unless it's you I fall into"
        I was lost within the darkness, but then I found her
        I found you

        Georgia, pulled me in, I asked to
        Love her once again
        You fell, I caught you
        I'll never let you go again like I did
        Oh, I used to say

        I would never fall in love again until I found her
        I said, "I would never fall unless it's you I fall into"
        I was lost within the darkness, but then I found her
        I found you

        I would never fall in love again until I found her
        I said, "I would never fall unless it's you I fall into"
        I was lost within the darkness, but then I found her
        I found you
      `,
    },
    {
      id: "5",
      // title: "So Easy (To Fall In Love)",
      title: "Your Personal Playlist",
      audioUrl:
        "https://www.image2url.com/r2/default/audio/1776774880658-0fced3b3-4ea6-4258-8504-734b74992e22.mp3",
      provider: "MOCK",
      lyrics: `
        I could be the twist, the one to make you stop
        The icing on your cake, the cherry on the top
        There's Heaven in my heart, and we could find you some space
        Mm-mm
        I could be the world to you, the missing piece
        The extra sentimental kind of chemistry
        Some people make it hard, with me, that isn't the case

        'Cause I make it so easy to fall in love
        So, come give me a call, and we'll fall into us
        I'm the perfect mix of Saturday night and the rest of your life
        Anyone with a heart would agree
        It's so easy
        To fall in love with

        The way I do my hair, the way I make you laugh
        The way we like to share a walk in Central Park
        I could be fresh air, might be the girl of your dreams (dream, dream, dream, dreams)
        There's no need to hide if you're into me
        'Cause I'm into you quite intimately
        And maybe one night could turn into three
        Well, I'm down to see

        'Cause I make it so easy to fall in love
        So, come give me a call, and we'll fall into us
        I'm the perfect mix of Saturday night and the rest of your life
        Anyone with a heart would agree
        It's so easy
        To fall in love with me

        Me
        Me (me)
        Me
        Me (me)
        Me
        Me (me)
        Me
        Me
        It's so easy (me, me)
        It's so easy (me, me)
        It's so easy (me, me)
        Yeah, yeah (me, me)
        
        So easy to fall in love
        So, come give me a call, and we'll fall into us
        I'm the perfect mix of Saturday night and the rest of your life
        Anyone with a heart would agree
        It's so easy
        To fall in love with me
      `,
    },
  ],
};

export const AI_TRAJECTORY_LENGTH = 4;

export const ADD_PROFESSION_TO_PROMPT = false;
export const ADD_ABOUT_TO_PROMPT = true;
export const REPETITIVE_CHECK_IN_PROMPT = true;
export const AUTO_GENERATE_NEWS_IN_PROMPT = true;

export const NON_AI_PLAYLIST_TYPE: "PRE_GEN" | "JAMENDO" = "JAMENDO";

export const JAMENDO_PLAYLIST = {
  relaxed: [
    {
      id: "1",
      // title: "Horizons - Train Room",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=1321406&format=mp31&from=9AtCOlwkbI6GWRs7wMTN9w%3D%3D%7CtqCUvoRL%2FvZXlOw77Gp4Qw%3D%3D",
      provider: "MOCK",
      lyrics: `
        Maybe your tired of the waves that come and knock you of your feet
        I long to see you on a day when you won't drown
        The constant dragging and deceit
        Your hands been tied and made to greet 
        A life thats bounded to a world that keeps on taking everyday

        Maybe your tired of the strains, the lonely highs, the constant rains
        That seep right through you on the days your coming down
        Maybe relying on horizons when the skies will fill with diamonds
        It ain't surprising that the love that you have lost is in your mind 

        So if we go 
        We'll take the highs and lows with us
        While we seek 
        Forever free from here

        Maybe your tired of the waves that come and knock you of your feet
        I long to see you on a day when you won't drown
        Maybe the answer lies beneath these scattered words that flood our streets and now the lights without the power flicker on into the night

        So if we go 
        We'll take the highs and lows with us
        While we seek 
        Forever free from here

        So if we go 
        We'll take the highs and lows with us
        While we seek 
        Forever free from here

        So if we go 
        We'll take the highs and lows with us
        While we seek 
        Forever free from here

        So if we go 
        We'll take the highs and lows with us
        While we seek 
        Forever free from here
      `,
    },
    {
      id: "2",
      // title: "North Hollywood Skyline - Brady Harris",
      title: "Your Personal Playlist",
      audioUrl: "https://prod-1.storage.jamendo.com/?trackid=291174&format=mp31&from=MQZOAq%2B3OGa%2BkPJNWcL5Aw%3D%3D%7CxCWrjhpRbLU%2BfM0sM%2FvyNA%3D%3D",
      provider: "MOCK",
      lyrics: `
        We can get a drink at the Money Tree
        Or come see me at the UBG
        Either way it’s okay
        You can get home on the subway
        In my mind
        Nights are fine
        Most of the time

        ‘Neath the North Hollywood Skyline
        North Hollywood Skyline
        North Hollywood Skyline
        North Hollywood Skyline

        You can get a tea or an antique cloth
        And if you drove find somewhere to park
        Not a lot of thrills you can buy
        That’s okay cos in my mind
        The air is fine
        Most of the time
        Except summertime

        ‘Neath the North Hollywood Skyline
        North Hollywood Skyline
        North Hollywood Skyline
        North Hollywood Skyline
      `,
    },
    {
      id: "3",
      // title: "Winter Sunlight (airtone feat. Leza2unes) - Snowflake & ccMixter",
      title: "Your Personal Playlist",
      audioUrl: "https://prod-1.storage.jamendo.com/?trackid=472893&format=mp31&from=pCFTaJKC%2BPuF5h%2FghKdukA%3D%3D%7CLwRCsKWj63M8iGV4amrNcQ%3D%3D",
      provider: "MOCK",
      lyrics: `
        You are like the winter sun
        Shining down until your day is done
        Spiritual finding, pure deep down inside
        Within me

        Naturally I feel everywhere
        In our ebbing sun, present on his hair
        Solstice horizon, wisdom wells up inside him
        Reflectively

        Moment-by-moment meditatively
        Stillness snowdrift into reverie
        Awareness unfolding
        To awaken your soul
        Set you free

        Mindfully watching all you do
        What comes in, you are open to
        A welcoming feeling,
        Yule Tide is the season for me

        So you are like the winter sun
        Shining down until your light is done
        Spiritual findings, pure deep down inside
        Within me
      `,
    },
    {
      id: "4",
      // title: "You're Always With Me - Marco Margna",
      title: "Your Personal Playlist",
      audioUrl: "https://prod-1.storage.jamendo.com/?trackid=1121394&format=mp31&from=sJJv%2FhT1wKinsei35JAS8w%3D%3D%7CTjL86fBk3dyEpuy67KVueA%3D%3D",
      provider: "MOCK",
      lyrics: `
        I’ve seen the world from many sides
        The sun made love to the sea
        I’ve danced with angels in the sky
        And with mermaids deep in the sea
        I’ve crossed the mountains hundred times
        Rainbow all over me
        But those things ain’t nothing, next to your love
        You’re the one that I need

        You're always with me
        Wherever we are
        You can touch my heart and my soul
        Your love is with me
        Deep in my heart
        You and me
        Me and you

        I’ve touched the sun and walked on clouds
        Like a bird a flew in the sky
        Seen seven wonders of the world
        And Marie Antoinette in Versailles

        But those things ain’t nothing, next to your love
        You’re the one that I need

        You're always with me
        Wherever we are
        You can touch my heart and my soul
        Your love is with me
        Deep in my heart
        You and me
        Me and you
      `,
    },
    {
      id: "5",
      // title: "Gravity - Steven Dunston",
      title: "Your Personal Playlist",
      audioUrl: "https://prod-1.storage.jamendo.com/?trackid=6722&format=mp31&from=640purZh1EuQVjkCBSHMXQ%3D%3D%7Cad5%2FaBZ33sL6tAXHmJcEYQ%3D%3D",
      provider: "MOCK",
      lyrics: `
        It's true you're gone baby I saw you leave
        You got on the airplane and waved back at me
        You taxied the runway and climbed up the sky
        And left me at home here with myself and I

        But no matter how far away you might be
        I can still feel the weight of your body on me
        Baby, that’s gravity

        Back in the orbit of everyday things
        Objects are pulling my celestial strings
        Forcing upon me their new point of view
        As if I no longer orbit around you

        But no matter how far away you might be
        I can still feel the weight of your body on me
        Baby, that’s gravity
        Baby, that’s gravity
        Baby, that’s gravity
        Baby, that’s gravity

        Days pass me by and the phone doesn't ring
        You're far away and accelerating
        I'd pull you back if I had enough weight
        Escape velocity says it's too late

        But no matter how far away you might be
        I can still feel the weight of your body on me
        Baby, that’s gravity
        Baby, that’s gravity
        Baby, that’s gravity
        Baby, that’s gravity
        Baby, that’s gravity
        Baby, that’s gravity
      `,
    },
  ],
  joyful: [
    {
      id: "1",
      // title: "What Is Love - Melanie Ungar",
      title: "Your Personal Playlist",
      audioUrl: "https://prod-1.storage.jamendo.com/?trackid=1204669&format=mp31&from=6t2WYTMKhQZd3IFwJmhgmQ%3D%3D%7CrurfNYLMs1VpakDYKh6YJw%3D%3D",
      provider: "MOCK",
      lyrics: `
        Put on my red heels and did my hair
        Waited up all night 'cause i thought you care
        And now you're calling me, saying "babe, don't start a fight
        Stop living in a fantasy," uhm sorry excuse me?

        This isn't how i thought it would be,
        This isn't the fairytale you promised me

        What is love 'cause i'm really not sure anymore
        Butterflies in my stomach, good night kisses no more
        Where are the passion, the romance, and those flowers at my door?
        Where is love, because i surely don't know?
        I don't know

        Remember how we first met,
        Or did you already forget?
        Like the time you forgot my birthday
        You stood there with nothing to say
        What about an apology?
        Oh yeah, it's only me (add harmony)

        This isn't how i thought it would be,
        This isn't the fairytale you promised me

        What is love 'cause i'm really not sure anymore
        Butterflies in my stomach, good night kisses no more
        Where are the passion, the romance, and those flowers at my door?
        Where is love, because i surely don't know?
        I don't know

        Oh help me tap 3 times to get rid of you, i wanna tap my heels and get over you (x2)
        Over you, over you

        What is love 'cause i'm really not sure anymore
        What is love 'cause i'm really not sure anymore
        What is love 'cause i'm really not sure anymore
        Butterflies in my stomach, good night kisses no more

        Where is the passion, the romance, and those flowers at my door?
        Where is love, because i surely don't know?
        What is love 'cause i'm really not sure anymore
        Butterflies in my stomach, good night kisses no more
        I need the passion, the romance, and those flowers at my door?
        Where is love 'cause it's not with you anymore
        Anymore!
      `,
    },
    {
      id: "2",
      // title: "It Could Be You - STEEP",
      title: "Your Personal Playlist",
      audioUrl: "https://prod-1.storage.jamendo.com/?trackid=1162014&format=mp31&from=1fSrPI%2Bo%2B%2FSFP5HUtpBmaA%3D%3D%7C1KVr%2FrUy89Ae22SUa49uTw%3D%3D",
      provider: "MOCK",
      lyrics: `
        Another place, another town, memories lost, but for now
        Breathing in, breathing out to get my thoughts back off the ground
        Walking down another street, passing by, people meet
        anyhow, just for now I'm realizing what I need
        And then you come to my mind
        well I guess that's kinda sign
        Don't take long to realize
        I think it's time, so I raise my pace and

        I am running around, looking for you
        It could be you, It could be you, It could be you
        Searching all over town, just to be sure
        It could be you, It could be you, It could be you
        Where you're hanging around, seems nothing new
        It could be you, It could be you, It could be you
        I’m finally asking you out: how do you do, do, do, do?

        Look around, see me stare, looking back, now I'm there
        in the sand, take my hand, let's find something for us to share
        Making out, touching down, every smile in your face,
        seems to me, brings up thoughts of every second that I wasted
        Without you right by my side
        How did manage just to hide
        that this feels so very right?
        But I'm restless, so I raise my pace and

        I am running around, looking for you
        It could be you, It could be you, It could be you
        Searching all over town, just to be sure
        It could be you, It could be you, It could be you
        Where you're hanging around, seems nothing new
        It could be you, It could be you, It could be you
        I’m finally asking you out: how do you do, do, do, do?

        The only reason, can’t you see?
        That keeps me running down that street
        is any chance for us to meet.
        It could be you I’m looking for
        I think I’ve never been so sure
        Catch you and never let you go

        I am running around, looking for you
        It could be you, It could be you, It could be you
        Searching all over town, just to be sure
        It could be you, It could be you, It could be you
        Where you're hanging around, seems nothing new
        It could be you, It could be you, It could be you
        I’m finally asking you out: how do you do, do, do, do?

        I am running around, looking for you
        It could be you, It could be you, It could be you
        Searching all over town, just to be sure
        It could be you, It could be you, It could be you
        Where you're hanging around, seems nothing new
        It could be you, It could be you, It could be you
        I’m finally asking you out: how do you do, do, do, do?
      `,
    },
    {
      id: "3",
      // title: "The Feel - Backnbloom",
      title: "Your Personal Playlist",
      audioUrl: "https://prod-1.storage.jamendo.com/?trackid=1071004&format=mp31&from=aauynZgqP5xdsIaDK8uLJQ%3D%3D%7CrPMKAuspjn%2B6INSKQ7mbBg%3D%3D",
      provider: "MOCK",
      lyrics: `
        Can u tell me how the sun can shine as rain drops on my hand?
        How a bird will fly into the night not knowing where to land?
        There's a reason we all wake and rise, a line of common ground
        And a secret that we all should know,
        This secret that I found

        Do not let go
        It’s only a feeling
        A yes or no
        Break through the ceiling
        Your choices can lift you up or pull you under

        Just keep the feel flowing
        Just keep the feel flowing
        Just keep the feel flowing, flowing
        Just keep the feel flowing

        See the architects of buildings tall, one seed became a plan
        To the doubters tossing mocking words they took a stand
        For a moment let your mind resolve, electing what is right
        Turning over thoughts, go for the prize with all your might

        Do not let go
        It’s only a feeling
        A yes or no
        Break through the ceiling
        Your choices can lift you up or pull you under

        Just keep the feel flowing
        Just keep the feel flowing
        Just keep the feel flowing, flowing
        Just keep the feel flowing
        Keep the feel flowing

        Just keep the feel flowing
        Just keep the feel flowing
        Just keep the feel flowing, flowing
        Just keep the feel flowing
      `,
    },
    {
      id: "4",
      // title: "Love is a Journey - Robert Avellanet",
      title: "Your Personal Playlist",
      audioUrl: "https://prod-1.storage.jamendo.com/?trackid=1119654&format=mp31&from=YN3XsDx8jcazay7OI1WvzQ%3D%3D%7CkRwkgJkPLqovWB3JMClMug%3D%3D",
      provider: "MOCK",
      lyrics: `
        love is a journey, love is a journey
        and i want to go, everywhere with you
        theres lots of places to explore
        and this is what life is for
        lets go
        oh oh oh
        lets go
        oh oh oh oh
        life is a journey, life is a jouney
        and i want to go, and live it up with you
        so come with me and take my hand
        enjoy the ride here i am
        lets go
        oh oh oh
        lets go
        oh oh oh oh
        lets see the world, just take my hand
        its all apart of this master plan
        theres so much beauty for both of us to see
        love is a journey, wanna go everywhere with you
        come with me baby
        ((tommorrow never comes))
        lets go
        oh oh oh
        life is a journey
        wanna go everywhere with you
      `,
    },
    {
      id: "5",
      // title: "Do You Still Dream - Explosive Ear Candy",
      title: "Your Personal Playlist",
      audioUrl: "https://prod-1.storage.jamendo.com/?trackid=1313604&format=mp31&from=KAoxihnLMoMxaUaRJCz9lA%3D%3D%7C18KY5JYvhKxE2WwPxyqjIg%3D%3D",
      provider: "MOCK",
      lyrics: `
        Do you still dream
        About when we were young
        And the world was our playground to claim
        Everything seemed like a new gift just waiting for us to share.

        Do you still dream
        That we’re falling in love
        For the first time again and again
        Walking on clouds with the sun in our pockets without a care.

        I open my eyes and I see you
        You’re there by my side all along
        The smile on your face
        Always tells me love came true (oohhhhhh).

        Do you still dream
        Of the things that we’ve done
        And the things that we’ll do up ahead
        We’re one in a billion but still we’re together
        By chance or fate.

        I open my eyes and I see you
        You’re there by my side all along
        The smile on your face
        Always tells me love came true (oohhhhhh).

        I open my eyes and I see you
        You’re there by my side all along
        The smile on your face
        Always tells me love came true (oohhhhhh).
      `,
    },
  ],
};

export type QuadrantKey = "sunny" | "stormy" | "rainy" | "breezy";
export const ALL_QUADRANTS: QuadrantKey[] = ["sunny", "stormy", "rainy", "breezy"];
export const EMOTION_PICKER_QUADRANTS: Record<
  QuadrantKey,
  { label: string; subtitle: string; emoji: string; bg: string }
> = {
  sunny: {
    label: "Sunny",
    subtitle: "Bright & energized",
    emoji: "☀️",
    bg: "#3e8f52",
  },
  stormy: {
    label: "Stormy",
    subtitle: "Charged & heavy",
    emoji: "⛈️",
    bg: "#b5394a",
  },
  rainy: {
    label: "Rainy",
    subtitle: "Low & quiet",
    emoji: "🌧️",
    bg: "#6b6485",
  },
  breezy: {
    label: "Breezy",
    subtitle: "Calm & light",
    emoji: "🌤️",
    bg: "#2c8c7c",
  },
};  
      