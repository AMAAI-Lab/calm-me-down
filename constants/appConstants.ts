export type EmotionPoint = {
  emotion: string;
  valence: number; // 1–10
  arousal: number; // 1–10
};

export type UserInput = {
  currentMood: string;
  desiredMood: string;
  activity: string;
  currentQuad?: QuadrantKey;
  desiredQuad?: QuadrantKey;
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

export const APP_VERSION = 38;
export const DEBUG_MODE = false;
export const LISTEN_BEFORE_GENERATE_MS = 2000;
export const CONTINUOUS_PLAYBACK_MS = 5000;

export const EMOTION_MAP: EmotionPoint[] = [
  // ── Q1: High Valence, High Arousal ─────────────────────────────────────────
  { emotion: "Liked", valence: 9.83, arousal: 5.17 }, // Eerola (NRC)
  { emotion: "Happy", valence: 9.66, arousal: 7.15 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Encouraged", valence: 9.58, arousal: 7.32 }, // Eerola (NRC)
  { emotion: "Joyful", valence: 9.54, arousal: 6.34 }, // Eerola (War+NRC) ← study target
  { emotion: "In Love", valence: 9.53, arousal: 5.5 }, // Eerola (NRC)
  { emotion: "Fantastic", valence: 9.5, arousal: 7.17 }, // Eerola (War+NRC)
  { emotion: "Fun", valence: 9.27, arousal: 7.79 }, // Eerola (War+NRC)
  { emotion: "Successful", valence: 9.18, arousal: 6.55 }, // Eerola (War+NRC)
  { emotion: "Delighted", valence: 9.15, arousal: 7.62 }, // Eerola+Russell (War+NRC)
  { emotion: "Free", valence: 9.11, arousal: 5.71 }, // Eerola (War+NRC)
  { emotion: "Excited", valence: 9.09, arousal: 8.25 }, // Eerola+Russell (War+NRC)
  { emotion: "Pleasurable", valence: 9.06, arousal: 6.38 }, // J&L (War+NRC)
  { emotion: "Pleased", valence: 9.06, arousal: 5.29 }, // Russell (War+NRC)
  { emotion: "Positive", valence: 9.01, arousal: 5.82 }, // Eerola (War+NRC)
  { emotion: "Adorable", valence: 8.96, arousal: 5.39 }, // Eerola (War+NRC)
  { emotion: "Passionate", valence: 8.95, arousal: 7.26 }, // Eerola (War+NRC)
  { emotion: "Romantic", valence: 8.93, arousal: 5.71 }, // Eerola (War+NRC)
  { emotion: "Funny", valence: 8.84, arousal: 6.21 }, // Eerola (War+NRC)
  { emotion: "Playful", valence: 8.75, arousal: 6.85 }, // Eerola (War+NRC)
  { emotion: "Celebratory", valence: 8.71, arousal: 6.88 }, // Eerola (NRC)
  { emotion: "Enthusiastic", valence: 8.66, arousal: 7.66 }, // Eerola (War+NRC)
  { emotion: "Inspired", valence: 8.66, arousal: 6.72 }, // Eerola (War+NRC)
  { emotion: "Amused", valence: 8.64, arousal: 6.65 }, // J&L (War+NRC)
  { emotion: "Heroic", valence: 8.63, arousal: 6.98 }, // Eerola (War+NRC)
  { emotion: "Glorious", valence: 8.63, arousal: 6.09 }, // Eerola (War+NRC)
  { emotion: "Energetic", valence: 8.5, arousal: 7.78 }, // Eerola (War+NRC)
  { emotion: "Strong", valence: 8.38, arousal: 6.68 }, // Eerola (War+NRC)
  { emotion: "Epic", valence: 8.34, arousal: 6.35 }, // Eerola (War+NRC)
  { emotion: "Motivational", valence: 8.32, arousal: 6.92 }, // Eerola (War+NRC)
  { emotion: "Festive", valence: 8.3, arousal: 6.96 }, // Eerola (War+NRC)
  { emotion: "Amazed", valence: 8.27, arousal: 7.29 }, // Eerola (War+NRC)
  { emotion: "Elegant", valence: 8.27, arousal: 5.14 }, // Eerola (War+NRC)
  { emotion: "Euphoric", valence: 8.18, arousal: 7.46 }, // Eerola (War+NRC)
  { emotion: "Liberated", valence: 8.02, arousal: 6.67 }, // Eerola (NRC)
  { emotion: "Animated", valence: 7.88, arousal: 6.72 }, // Eerola (War+NRC)
  { emotion: "Moved", valence: 7.86, arousal: 7.84 }, // J&L (NRC)
  { emotion: "Uplifting", valence: 7.82, arousal: 5.54 }, // Eerola (War+NRC)
  { emotion: "Spontaneous", valence: 7.67, arousal: 6.25 }, // Eerola (War+NRC)
  { emotion: "Interested", valence: 7.65, arousal: 5.32 }, // Eerola+J&L (War+NRC)
  { emotion: "Powerful", valence: 7.6, arousal: 7.21 }, // Eerola (War+NRC)
  { emotion: "Emotional", valence: 6.81, arousal: 6.64 }, // Eerola (War+NRC)
  { emotion: "Astonished", valence: 6.34, arousal: 7.15 }, // Russell (War+NRC)
  { emotion: "Intense", valence: 6.28, arousal: 7.63 }, // Eerola (War+NRC)
  { emotion: "Hot", valence: 5.87, arousal: 6.45 }, // Eerola (War+NRC)

  // ── Q2: Low Valence, High Arousal ──────────────────────────────────────────
  { emotion: "Jumpy", valence: 4.73, arousal: 7.15 }, // Eerola (War+NRC)
  { emotion: "Tense", valence: 3.76, arousal: 5.41 }, // Russell+J&L (War+NRC)
  { emotion: "Moody", valence: 3.62, arousal: 6.9 }, // Eerola (War+NRC)
  { emotion: "Distressed", valence: 2.99, arousal: 7.44 }, // Russell (War+NRC)
  { emotion: "Severe", valence: 2.99, arousal: 6.8 }, // Eerola (War+NRC)
  { emotion: "Aggressive", valence: 2.73, arousal: 8.01 }, // Eerola (War+NRC)
  { emotion: "Alarmed", valence: 2.69, arousal: 8.4 }, // Russell (NRC)
  { emotion: "Tragic", valence: 2.63, arousal: 7.52 }, // Eerola (War+NRC)
  { emotion: "Annoyed", valence: 2.48, arousal: 6.94 }, // Russell (War+NRC)
  { emotion: "Angry", valence: 2.41, arousal: 7.66 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Frustrated", valence: 2.23, arousal: 6.41 }, // Russell (War+NRC)
  { emotion: "Miserable", valence: 2.18, arousal: 5.36 }, // Russell (War+NRC)
  { emotion: "Furious", valence: 2.17, arousal: 8.16 }, // Eerola (War+NRC)
  { emotion: "Afraid", valence: 1.76, arousal: 6.36 }, // Russell (War+NRC)

  // ── Q3: Low Valence, Low Arousal ───────────────────────────────────────────
  { emotion: "Sorry", valence: 4.97, arousal: 4.67 }, // Eerola (War+NRC)
  { emotion: "Droopy", valence: 4.66, arousal: 3.8 }, // Russell (War+NRC)
  { emotion: "Tired", valence: 3.41, arousal: 3.92 }, // Russell (War+NRC)
  { emotion: "Bored", valence: 2.79, arousal: 3.24 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Gloomy", valence: 2.69, arousal: 4.15 }, // Russell (War+NRC)
  { emotion: "Sad", valence: 2.63, arousal: 3.9 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Melancholic", valence: 2.63, arousal: 3.75 }, // Eerola (NRC)
  { emotion: "Depressed", valence: 1.83, arousal: 4.83 }, // Russell (War+NRC)

  // ── Q4: High Valence, Low Arousal ──────────────────────────────────────────
  { emotion: "Good", valence: 9.09, arousal: 4.15 }, // Eerola (War+NRC)
  { emotion: "Friendly", valence: 8.97, arousal: 4.63 }, // Eerola (War+NRC)
  { emotion: "Peaceful", valence: 8.84, arousal: 3.15 }, // Eerola (War+NRC)
  { emotion: "Satisfied", valence: 8.78, arousal: 4.96 }, // Eerola+Russell (War+NRC)
  { emotion: "Tranquil", valence: 8.75, arousal: 2.04 }, // Eerola (War+NRC)
  { emotion: "Pleasant", valence: 8.73, arousal: 3.47 }, // Eerola (War+NRC)
  { emotion: "Easy", valence: 8.53, arousal: 3.46 }, // Eerola (War+NRC)
  { emotion: "Dreamy", valence: 8.43, arousal: 4.77 }, // Eerola (War+NRC)
  { emotion: "Graceful", valence: 8.42, arousal: 4.98 }, // Eerola (War+NRC)
  { emotion: "Gentle", valence: 8.42, arousal: 3.81 }, // Eerola (War+NRC)
  { emotion: "Relaxed", valence: 8.4, arousal: 2.04 }, // Eerola+Russell+J&L (War+NRC)
  { emotion: "Cool", valence: 8.26, arousal: 4.79 }, // Eerola (War+NRC)
  { emotion: "Calm", valence: 8.26, arousal: 1.6 }, // Russell (War+NRC) ← study target
  { emotion: "Light Hearted", valence: 8.05, arousal: 4.6 }, // Eerola (NRC)
  { emotion: "Spiritual", valence: 7.93, arousal: 4.62 }, // Eerola+J&L (War+NRC)
  { emotion: "Serene", valence: 7.93, arousal: 3.66 }, // Eerola+Russell (War+NRC)
  { emotion: "Soft", valence: 7.87, arousal: 2.96 }, // Eerola (War+NRC)
  { emotion: "Content", valence: 7.64, arousal: 3.55 }, // Russell (War+NRC)
  { emotion: "Tender", valence: 6.91, arousal: 4.59 }, // J&L (War+NRC)
  { emotion: "Religious", valence: 6.69, arousal: 4.11 }, // Eerola (War+NRC)
  { emotion: "Sentimental", valence: 6.59, arousal: 3.79 }, // Eerola (War+NRC)
  { emotion: "Reflective", valence: 6.52, arousal: 3.66 }, // Eerola (War+NRC)
  { emotion: "Longing", valence: 6.44, arousal: 4.91 }, // J&L (NRC)
  { emotion: "Nostalgic", valence: 6.25, arousal: 4.47 }, // J&L (War+NRC)
  { emotion: "Solemn", valence: 6.25, arousal: 3.74 }, // J&L (War+NRC)
  { emotion: "At Ease", valence: 5.79, arousal: 3.84 }, // Russell (NRC)
  { emotion: "Deep", valence: 5.71, arousal: 4.76 }, // Eerola (War+NRC)
  { emotion: "Sleepy", valence: 5.61, arousal: 2.71 }, // Russell (War+NRC)
];

export const EMOTION_OPTIONS = EMOTION_MAP.map((e) => e.emotion).sort();
export const MAX_LOG_FILE_SIZE = 500_000; // 500KB
export const HRV_APP_VERSION = false;
export const HRV_DURATION_MINS = 1440; //24 hours

export const LYRICS_PROVIDERS = ["CLAUDE", "GROK", "OPEN_AI", "GEMINI"];
export type LyricsProviderType = (typeof LYRICS_PROVIDERS)[number];
export const CURRENT_LYRICS_PROVIDER: "GEMINI" | "CLAUDE" | "GROK" | "OPEN_AI" =
  "CLAUDE";
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
      alignedWords: [
        {
          word: "Maybe ",
          success: true,
          startS: 22.04,
          endS: 22.12,
        },
        {
          word: "your ",
          success: true,
          startS: 22.12,
          endS: 22.58,
        },
        {
          word: "tired ",
          success: true,
          startS: 22.58,
          endS: 22.8,
        },
        {
          word: "of ",
          success: true,
          startS: 22.8,
          endS: 23.44,
        },
        {
          word: "the ",
          success: true,
          startS: 23.44,
          endS: 23.6,
        },
        {
          word: "waves ",
          success: true,
          startS: 23.6,
          endS: 23.94,
        },
        {
          word: "that ",
          success: true,
          startS: 23.94,
          endS: 24.2,
        },
        {
          word: "come ",
          success: true,
          startS: 24.2,
          endS: 24.44,
        },
        {
          word: "and ",
          success: true,
          startS: 24.44,
          endS: 24.68,
        },
        {
          word: "knock ",
          success: true,
          startS: 24.68,
          endS: 24.86,
        },
        {
          word: "you ",
          success: true,
          startS: 24.86,
          endS: 25.24,
        },
        {
          word: "of ",
          success: true,
          startS: 25.24,
          endS: 25.38,
        },
        {
          word: "your ",
          success: true,
          startS: 25.38,
          endS: 25.6,
        },
        {
          word: "feet\n",
          success: true,
          startS: 25.6,
          endS: 25.98,
        },
        {
          word: "I ",
          success: true,
          startS: 26.16,
          endS: 26.24,
        },
        {
          word: "long ",
          success: true,
          startS: 26.24,
          endS: 26.4,
        },
        {
          word: "to ",
          success: true,
          startS: 26.4,
          endS: 26.66,
        },
        {
          word: "see ",
          success: true,
          startS: 26.66,
          endS: 27.02,
        },
        {
          word: "you ",
          success: true,
          startS: 27.02,
          endS: 27.3,
        },
        {
          word: "on ",
          success: true,
          startS: 27.3,
          endS: 27.64,
        },
        {
          word: "a ",
          success: true,
          startS: 27.64,
          endS: 27.76,
        },
        {
          word: "day ",
          success: true,
          startS: 27.76,
          endS: 27.96,
        },
        {
          word: "when ",
          success: true,
          startS: 27.96,
          endS: 28.18,
        },
        {
          word: "you ",
          success: true,
          startS: 28.18,
          endS: 28.38,
        },
        {
          word: "won't ",
          success: true,
          startS: 28.38,
          endS: 28.7,
        },
        {
          word: "drown\n",
          success: true,
          startS: 28.7,
          endS: 28.94,
        },
        {
          word: "The ",
          success: true,
          startS: 29.84,
          endS: 30.18,
        },
        {
          word: "constant ",
          success: true,
          startS: 30.18,
          endS: 30.56,
        },
        {
          word: "dragging ",
          success: true,
          startS: 30.56,
          endS: 31.18,
        },
        {
          word: "and ",
          success: true,
          startS: 31.18,
          endS: 31.54,
        },
        {
          word: "deceit\n",
          success: true,
          startS: 31.54,
          endS: 32.04,
        },
        {
          word: "Your ",
          success: true,
          startS: 32.28,
          endS: 32.3,
        },
        {
          word: "hands ",
          success: true,
          startS: 32.3,
          endS: 32.46,
        },
        {
          word: "been ",
          success: true,
          startS: 32.46,
          endS: 32.66,
        },
        {
          word: "tied ",
          success: true,
          startS: 32.66,
          endS: 32.98,
        },
        {
          word: "and ",
          success: true,
          startS: 32.98,
          endS: 33.38,
        },
        {
          word: "made ",
          success: true,
          startS: 33.38,
          endS: 33.5,
        },
        {
          word: "to ",
          success: true,
          startS: 33.5,
          endS: 33.74,
        },
        {
          word: "greet\n",
          success: true,
          startS: 33.74,
          endS: 33.98,
        },
        {
          word: "A ",
          success: true,
          startS: 34.1,
          endS: 34.24,
        },
        {
          word: "life ",
          success: true,
          startS: 34.24,
          endS: 34.44,
        },
        {
          word: "thats ",
          success: true,
          startS: 34.44,
          endS: 34.74,
        },
        {
          word: "bounded ",
          success: true,
          startS: 34.74,
          endS: 35.18,
        },
        {
          word: "to ",
          success: true,
          startS: 35.18,
          endS: 35.58,
        },
        {
          word: "a ",
          success: true,
          startS: 35.58,
          endS: 35.76,
        },
        {
          word: "world ",
          success: true,
          startS: 35.76,
          endS: 36.04,
        },
        {
          word: "that ",
          success: true,
          startS: 36.04,
          endS: 36.4,
        },
        {
          word: "keeps ",
          success: true,
          startS: 36.4,
          endS: 36.56,
        },
        {
          word: "on ",
          success: true,
          startS: 36.56,
          endS: 36.86,
        },
        {
          word: "taking ",
          success: true,
          startS: 36.86,
          endS: 37.28,
        },
        {
          word: "everyday\n",
          success: true,
          startS: 38.1,
          endS: 38.1,
        },
        {
          word: "Maybe ",
          success: true,
          startS: 45.96,
          endS: 46.4,
        },
        {
          word: "your ",
          success: true,
          startS: 46.4,
          endS: 46.96,
        },
        {
          word: "tired ",
          success: true,
          startS: 46.96,
          endS: 47.44,
        },
        {
          word: "of ",
          success: true,
          startS: 47.44,
          endS: 47.8,
        },
        {
          word: "the ",
          success: true,
          startS: 47.8,
          endS: 47.94,
        },
        {
          word: "strains, ",
          success: true,
          startS: 47.94,
          endS: 48.34,
        },
        {
          word: "the ",
          success: true,
          startS: 48.34,
          endS: 48.7,
        },
        {
          word: "lonely ",
          success: true,
          startS: 48.7,
          endS: 48.92,
        },
        {
          word: "highs, ",
          success: true,
          startS: 48.92,
          endS: 49.56,
        },
        {
          word: "the ",
          success: true,
          startS: 49.56,
          endS: 49.56,
        },
        {
          word: "constant ",
          success: true,
          startS: 49.56,
          endS: 49.98,
        },
        {
          word: "rains\n",
          success: true,
          startS: 49.98,
          endS: 50.32,
        },
        {
          word: "That ",
          success: true,
          startS: 50.6,
          endS: 50.6,
        },
        {
          word: "seep ",
          success: true,
          startS: 50.6,
          endS: 50.94,
        },
        {
          word: "right ",
          success: true,
          startS: 50.94,
          endS: 51.06,
        },
        {
          word: "through ",
          success: true,
          startS: 51.06,
          endS: 51.34,
        },
        {
          word: "you ",
          success: true,
          startS: 51.34,
          endS: 51.56,
        },
        {
          word: "on ",
          success: true,
          startS: 51.56,
          endS: 51.76,
        },
        {
          word: "the ",
          success: true,
          startS: 51.76,
          endS: 51.96,
        },
        {
          word: "days ",
          success: true,
          startS: 51.96,
          endS: 52.28,
        },
        {
          word: "your ",
          success: true,
          startS: 52.28,
          endS: 52.54,
        },
        {
          word: "coming ",
          success: true,
          startS: 52.54,
          endS: 52.88,
        },
        {
          word: "down\n",
          success: true,
          startS: 52.88,
          endS: 53.34,
        },
        {
          word: "Maybe ",
          success: true,
          startS: 54.46,
          endS: 54.6,
        },
        {
          word: "relying ",
          success: true,
          startS: 54.6,
          endS: 55.12,
        },
        {
          word: "on ",
          success: true,
          startS: 55.12,
          endS: 55.9,
        },
        {
          word: "horizons ",
          success: true,
          startS: 55.9,
          endS: 56.7,
        },
        {
          word: "when ",
          success: true,
          startS: 56.7,
          endS: 56.92,
        },
        {
          word: "the ",
          success: true,
          startS: 56.92,
          endS: 57.12,
        },
        {
          word: "skies ",
          success: true,
          startS: 57.12,
          endS: 57.42,
        },
        {
          word: "will ",
          success: true,
          startS: 57.42,
          endS: 57.68,
        },
        {
          word: "fill ",
          success: true,
          startS: 57.68,
          endS: 57.96,
        },
        {
          word: "with ",
          success: true,
          startS: 57.96,
          endS: 58.24,
        },
        {
          word: "diamonds\n",
          success: true,
          startS: 58.24,
          endS: 58.66,
        },
        {
          word: "It ",
          success: true,
          startS: 58.94,
          endS: 59.02,
        },
        {
          word: "ain't ",
          success: true,
          startS: 59.02,
          endS: 59.06,
        },
        {
          word: "surprising ",
          success: true,
          startS: 59.06,
          endS: 59.48,
        },
        {
          word: "that ",
          success: true,
          startS: 59.48,
          endS: 60.06,
        },
        {
          word: "the ",
          success: true,
          startS: 60.06,
          endS: 60.18,
        },
        {
          word: "love ",
          success: true,
          startS: 60.18,
          endS: 60.42,
        },
        {
          word: "that ",
          success: true,
          startS: 60.42,
          endS: 60.74,
        },
        {
          word: "you ",
          success: true,
          startS: 60.74,
          endS: 60.98,
        },
        {
          word: "have ",
          success: true,
          startS: 60.98,
          endS: 61.18,
        },
        {
          word: "lost ",
          success: true,
          startS: 61.18,
          endS: 61.44,
        },
        {
          word: "is ",
          success: true,
          startS: 61.44,
          endS: 61.84,
        },
        {
          word: "in ",
          success: true,
          startS: 61.84,
          endS: 62.08,
        },
        {
          word: "your ",
          success: true,
          startS: 62.08,
          endS: 62.26,
        },
        {
          word: "mind\n",
          success: true,
          startS: 62.26,
          endS: 62.5,
        },
        {
          word: "So ",
          success: true,
          startS: 62.5,
          endS: 62.5,
        },
        {
          word: "if ",
          success: true,
          startS: 62.5,
          endS: 62.78,
        },
        {
          word: "we ",
          success: true,
          startS: 62.78,
          endS: 64.08,
        },
        {
          word: "go\n",
          success: true,
          startS: 64.08,
          endS: 64.6,
        },
        {
          word: "We'll ",
          success: true,
          startS: 65.64,
          endS: 65.88,
        },
        {
          word: "take ",
          success: true,
          startS: 65.88,
          endS: 66.1,
        },
        {
          word: "the ",
          success: true,
          startS: 66.1,
          endS: 66.38,
        },
        {
          word: "highs ",
          success: true,
          startS: 66.38,
          endS: 67.42,
        },
        {
          word: "and ",
          success: true,
          startS: 67.68,
          endS: 68.08,
        },
        {
          word: "lows ",
          success: true,
          startS: 68.08,
          endS: 69.0,
        },
        {
          word: "with ",
          success: true,
          startS: 69.0,
          endS: 69.74,
        },
        {
          word: "us\n",
          success: true,
          startS: 69.74,
          endS: 70.46,
        },
        {
          word: "While ",
          success: true,
          startS: 70.96,
          endS: 70.96,
        },
        {
          word: "we ",
          success: true,
          startS: 70.96,
          endS: 72.28,
        },
        {
          word: "seek\n",
          success: true,
          startS: 72.28,
          endS: 72.88,
        },
        {
          word: "Forever ",
          success: true,
          startS: 74.26,
          endS: 74.26,
        },
        {
          word: "free ",
          success: true,
          startS: 74.26,
          endS: 74.88,
        },
        {
          word: "from ",
          success: true,
          startS: 74.88,
          endS: 75.26,
        },
        {
          word: "here\n",
          success: true,
          startS: 75.26,
          endS: 76.18,
        },
        {
          word: "Maybe ",
          success: true,
          startS: 77.16,
          endS: 79.02,
        },
        {
          word: "your ",
          success: true,
          startS: 79.02,
          endS: 79.38,
        },
        {
          word: "tired ",
          success: true,
          startS: 79.38,
          endS: 79.98,
        },
        {
          word: "of ",
          success: true,
          startS: 79.98,
          endS: 80.36,
        },
        {
          word: "the ",
          success: true,
          startS: 80.36,
          endS: 80.52,
        },
        {
          word: "waves ",
          success: true,
          startS: 80.52,
          endS: 80.84,
        },
        {
          word: "that ",
          success: true,
          startS: 80.84,
          endS: 81.1,
        },
        {
          word: "come ",
          success: true,
          startS: 81.1,
          endS: 81.34,
        },
        {
          word: "and ",
          success: true,
          startS: 81.34,
          endS: 81.48,
        },
        {
          word: "knock ",
          success: true,
          startS: 81.48,
          endS: 81.78,
        },
        {
          word: "you ",
          success: true,
          startS: 81.78,
          endS: 82.16,
        },
        {
          word: "of ",
          success: true,
          startS: 82.16,
          endS: 82.28,
        },
        {
          word: "your ",
          success: true,
          startS: 82.28,
          endS: 82.5,
        },
        {
          word: "feet\n",
          success: true,
          startS: 82.5,
          endS: 82.9,
        },
        {
          word: "I ",
          success: true,
          startS: 82.9,
          endS: 83.14,
        },
        {
          word: "long ",
          success: true,
          startS: 83.14,
          endS: 83.3,
        },
        {
          word: "to ",
          success: true,
          startS: 83.3,
          endS: 83.58,
        },
        {
          word: "see ",
          success: true,
          startS: 83.58,
          endS: 84.0,
        },
        {
          word: "you ",
          success: true,
          startS: 84.0,
          endS: 84.28,
        },
        {
          word: "on ",
          success: true,
          startS: 84.28,
          endS: 84.44,
        },
        {
          word: "a ",
          success: true,
          startS: 84.44,
          endS: 84.58,
        },
        {
          word: "day ",
          success: true,
          startS: 84.58,
          endS: 84.82,
        },
        {
          word: "when ",
          success: true,
          startS: 84.82,
          endS: 85.14,
        },
        {
          word: "you ",
          success: true,
          startS: 85.14,
          endS: 85.36,
        },
        {
          word: "won't ",
          success: true,
          startS: 85.36,
          endS: 85.6,
        },
        {
          word: "drown\n",
          success: true,
          startS: 85.6,
          endS: 85.82,
        },
        {
          word: "Maybe ",
          success: true,
          startS: 86.52,
          endS: 87.18,
        },
        {
          word: "the ",
          success: true,
          startS: 87.18,
          endS: 87.54,
        },
        {
          word: "answer ",
          success: true,
          startS: 87.54,
          endS: 88.1,
        },
        {
          word: "lies ",
          success: true,
          startS: 88.1,
          endS: 88.46,
        },
        {
          word: "beneath ",
          success: true,
          startS: 88.46,
          endS: 88.84,
        },
        {
          word: "these ",
          success: true,
          startS: 88.84,
          endS: 89.28,
        },
        {
          word: "scattered ",
          success: true,
          startS: 89.28,
          endS: 89.58,
        },
        {
          word: "words ",
          success: true,
          startS: 89.58,
          endS: 90.0,
        },
        {
          word: "that ",
          success: true,
          startS: 90.0,
          endS: 90.3,
        },
        {
          word: "flood ",
          success: true,
          startS: 90.3,
          endS: 90.52,
        },
        {
          word: "our ",
          success: true,
          startS: 90.52,
          endS: 90.72,
        },
        {
          word: "streets ",
          success: true,
          startS: 90.72,
          endS: 91.0,
        },
        {
          word: "and ",
          success: true,
          startS: 91.0,
          endS: 91.3,
        },
        {
          word: "now ",
          success: true,
          startS: 91.3,
          endS: 91.54,
        },
        {
          word: "the ",
          success: true,
          startS: 91.54,
          endS: 91.7,
        },
        {
          word: "lights ",
          success: true,
          startS: 91.7,
          endS: 92.02,
        },
        {
          word: "without ",
          success: true,
          startS: 92.02,
          endS: 92.4,
        },
        {
          word: "the ",
          success: true,
          startS: 92.4,
          endS: 92.68,
        },
        {
          word: "power ",
          success: true,
          startS: 92.68,
          endS: 93.14,
        },
        {
          word: "flicker ",
          success: true,
          startS: 93.14,
          endS: 93.68,
        },
        {
          word: "on ",
          success: true,
          startS: 93.68,
          endS: 93.96,
        },
        {
          word: "into ",
          success: true,
          startS: 93.96,
          endS: 94.52,
        },
        {
          word: "the ",
          success: true,
          startS: 94.52,
          endS: 94.86,
        },
        {
          word: "night\n",
          success: true,
          startS: 94.86,
          endS: 95.36,
        },
        {
          word: "So ",
          success: true,
          startS: 96.2,
          endS: 96.56,
        },
        {
          word: "if ",
          success: true,
          startS: 96.64,
          endS: 96.7,
        },
        {
          word: "we ",
          success: true,
          startS: 96.7,
          endS: 96.74,
        },
        {
          word: "go\n",
          success: true,
          startS: 96.74,
          endS: 97.16,
        },
        {
          word: "We'll ",
          success: true,
          startS: 98.22,
          endS: 98.38,
        },
        {
          word: "take ",
          success: true,
          startS: 98.38,
          endS: 98.64,
        },
        {
          word: "the ",
          success: true,
          startS: 98.64,
          endS: 98.94,
        },
        {
          word: "highs ",
          success: true,
          startS: 98.94,
          endS: 99.96,
        },
        {
          word: "and ",
          success: true,
          startS: 99.96,
          endS: 100.62,
        },
        {
          word: "lows ",
          success: true,
          startS: 100.62,
          endS: 101.18,
        },
        {
          word: "with ",
          success: true,
          startS: 101.18,
          endS: 102.36,
        },
        {
          word: "us\n",
          success: true,
          startS: 102.36,
          endS: 103.0,
        },
        {
          word: "While ",
          success: true,
          startS: 103.16,
          endS: 103.64,
        },
        {
          word: "we ",
          success: true,
          startS: 103.64,
          endS: 104.84,
        },
        {
          word: "seek\n",
          success: true,
          startS: 104.84,
          endS: 105.38,
        },
        {
          word: "Forever ",
          success: true,
          startS: 106.46,
          endS: 106.74,
        },
        {
          word: "free ",
          success: true,
          startS: 106.74,
          endS: 107.42,
        },
        {
          word: "from ",
          success: true,
          startS: 107.42,
          endS: 107.82,
        },
        {
          word: "here\n",
          success: true,
          startS: 107.82,
          endS: 108.4,
        },
        {
          word: "So ",
          success: true,
          startS: 109.9,
          endS: 111.08,
        },
        {
          word: "if ",
          success: true,
          startS: 111.08,
          endS: 111.58,
        },
        {
          word: "we ",
          success: true,
          startS: 111.58,
          endS: 112.92,
        },
        {
          word: "go\n",
          success: true,
          startS: 112.92,
          endS: 113.44,
        },
        {
          word: "We'll ",
          success: true,
          startS: 114.4,
          endS: 114.66,
        },
        {
          word: "take ",
          success: true,
          startS: 114.66,
          endS: 114.9,
        },
        {
          word: "the ",
          success: true,
          startS: 114.9,
          endS: 115.22,
        },
        {
          word: "highs ",
          success: true,
          startS: 115.22,
          endS: 116.24,
        },
        {
          word: "and ",
          success: true,
          startS: 116.24,
          endS: 116.9,
        },
        {
          word: "lows ",
          success: true,
          startS: 116.9,
          endS: 117.44,
        },
        {
          word: "with ",
          success: true,
          startS: 117.44,
          endS: 118.6,
        },
        {
          word: "us\n",
          success: true,
          startS: 118.6,
          endS: 119.28,
        },
        {
          word: "While ",
          success: true,
          startS: 119.5,
          endS: 119.86,
        },
        {
          word: "we ",
          success: true,
          startS: 119.86,
          endS: 121.1,
        },
        {
          word: "seek\n",
          success: true,
          startS: 121.1,
          endS: 121.64,
        },
        {
          word: "Forever ",
          success: true,
          startS: 123.06,
          endS: 123.06,
        },
        {
          word: "free ",
          success: true,
          startS: 123.06,
          endS: 123.7,
        },
        {
          word: "from ",
          success: true,
          startS: 123.7,
          endS: 124.12,
        },
        {
          word: "here\n",
          success: true,
          startS: 124.12,
          endS: 125.14,
        },
        {
          word: "So ",
          success: true,
          startS: 143.64,
          endS: 143.64,
        },
        {
          word: "if ",
          success: true,
          startS: 143.64,
          endS: 143.9,
        },
        {
          word: "we ",
          success: true,
          startS: 143.9,
          endS: 145.44,
        },
        {
          word: "go\n",
          success: true,
          startS: 145.44,
          endS: 146.02,
        },
        {
          word: "We'll ",
          success: true,
          startS: 147.14,
          endS: 147.24,
        },
        {
          word: "take ",
          success: true,
          startS: 147.24,
          endS: 147.48,
        },
        {
          word: "the ",
          success: true,
          startS: 147.48,
          endS: 147.76,
        },
        {
          word: "highs ",
          success: true,
          startS: 147.76,
          endS: 148.92,
        },
        {
          word: "and ",
          success: true,
          startS: 148.92,
          endS: 149.56,
        },
        {
          word: "lows ",
          success: true,
          startS: 149.56,
          endS: 150.12,
        },
        {
          word: "with ",
          success: true,
          startS: 150.12,
          endS: 151.22,
        },
        {
          word: "us\n",
          success: true,
          startS: 151.22,
          endS: 151.9,
        },
        {
          word: "While ",
          success: true,
          startS: 152.4,
          endS: 152.4,
        },
        {
          word: "we ",
          success: true,
          startS: 152.4,
          endS: 153.64,
        },
        {
          word: "seek\n",
          success: true,
          startS: 153.64,
          endS: 154.24,
        },
        {
          word: "Forever ",
          success: true,
          startS: 155.26,
          endS: 155.48,
        },
        {
          word: "free ",
          success: true,
          startS: 155.48,
          endS: 156.46,
        },
        {
          word: "from ",
          success: true,
          startS: 156.46,
          endS: 156.74,
        },
        {
          word: "here\n",
          success: true,
          startS: 156.74,
          endS: 157.88,
        },
        {
          word: "So ",
          success: true,
          startS: 159.34,
          endS: 159.94,
        },
        {
          word: "if ",
          success: true,
          startS: 159.94,
          endS: 160.24,
        },
        {
          word: "we ",
          success: true,
          startS: 160.24,
          endS: 161.74,
        },
        {
          word: "go\n",
          success: true,
          startS: 161.74,
          endS: 162.28,
        },
        {
          word: "We'll ",
          success: true,
          startS: 163.34,
          endS: 163.48,
        },
        {
          word: "take ",
          success: true,
          startS: 163.48,
          endS: 163.74,
        },
        {
          word: "the ",
          success: true,
          startS: 163.74,
          endS: 164.06,
        },
        {
          word: "highs ",
          success: true,
          startS: 164.06,
          endS: 165.3,
        },
        {
          word: "and ",
          success: true,
          startS: 165.3,
          endS: 165.84,
        },
        {
          word: "lows ",
          success: true,
          startS: 165.84,
          endS: 166.28,
        },
        {
          word: "with ",
          success: true,
          startS: 166.28,
          endS: 167.44,
        },
        {
          word: "us\n",
          success: true,
          startS: 167.44,
          endS: 168.1,
        },
        {
          word: "While ",
          success: true,
          startS: 168.26,
          endS: 168.68,
        },
        {
          word: "we ",
          success: true,
          startS: 168.68,
          endS: 169.92,
        },
        {
          word: "seek\n",
          success: true,
          startS: 169.92,
          endS: 170.44,
        },
        {
          word: "Forever ",
          success: true,
          startS: 171.5,
          endS: 171.72,
        },
        {
          word: "free ",
          success: true,
          startS: 219.98,
          endS: 219.98,
        },
        {
          word: "from ",
          success: true,
          startS: 219.98,
          endS: 219.98,
        },
        {
          word: "here\n",
          success: true,
          startS: 219.98,
          endS: 219.98,
        },
      ],
    },
    {
      id: "2",
      // title: "North Hollywood Skyline - Brady Harris",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=291174&format=mp31&from=MQZOAq%2B3OGa%2BkPJNWcL5Aw%3D%3D%7CxCWrjhpRbLU%2BfM0sM%2FvyNA%3D%3D",
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
      alignedWords: [
        {
          word: "We ",
          success: true,
          startS: 22.36,
          endS: 22.36,
        },
        {
          word: "can ",
          success: true,
          startS: 22.36,
          endS: 22.56,
        },
        {
          word: "get ",
          success: true,
          startS: 22.56,
          endS: 22.72,
        },
        {
          word: "a ",
          success: true,
          startS: 22.72,
          endS: 22.88,
        },
        {
          word: "drink ",
          success: true,
          startS: 22.88,
          endS: 23.38,
        },
        {
          word: "at ",
          success: true,
          startS: 23.38,
          endS: 23.78,
        },
        {
          word: "the ",
          success: true,
          startS: 23.78,
          endS: 23.88,
        },
        {
          word: "Money ",
          success: true,
          startS: 23.88,
          endS: 24.14,
        },
        {
          word: "Tree\n",
          success: true,
          startS: 24.14,
          endS: 24.72,
        },
        {
          word: "Or ",
          success: true,
          startS: 26.3,
          endS: 26.66,
        },
        {
          word: "come ",
          success: true,
          startS: 26.66,
          endS: 26.86,
        },
        {
          word: "see ",
          success: true,
          startS: 26.86,
          endS: 27.18,
        },
        {
          word: "me ",
          success: true,
          startS: 27.18,
          endS: 27.68,
        },
        {
          word: "at ",
          success: true,
          startS: 27.68,
          endS: 28.22,
        },
        {
          word: "the ",
          success: true,
          startS: 28.22,
          endS: 28.42,
        },
        {
          word: "UBG\n",
          success: true,
          startS: 28.42,
          endS: 29.2,
        },
        {
          word: "Either ",
          success: true,
          startS: 30.76,
          endS: 31.38,
        },
        {
          word: "way ",
          success: true,
          startS: 31.38,
          endS: 32.02,
        },
        {
          word: "it’s ",
          success: true,
          startS: 32.02,
          endS: 33.12,
        },
        {
          word: "okay\n",
          success: true,
          startS: 33.12,
          endS: 33.6,
        },
        {
          word: "You ",
          success: true,
          startS: 35.4,
          endS: 35.76,
        },
        {
          word: "can ",
          success: true,
          startS: 35.76,
          endS: 35.88,
        },
        {
          word: "get ",
          success: true,
          startS: 35.88,
          endS: 36.1,
        },
        {
          word: "home ",
          success: true,
          startS: 36.1,
          endS: 36.76,
        },
        {
          word: "on ",
          success: true,
          startS: 36.76,
          endS: 37.2,
        },
        {
          word: "the ",
          success: true,
          startS: 37.2,
          endS: 37.36,
        },
        {
          word: "subway\n",
          success: true,
          startS: 37.36,
          endS: 38.08,
        },
        {
          word: "In ",
          success: true,
          startS: 39.44,
          endS: 39.7,
        },
        {
          word: "my ",
          success: true,
          startS: 39.7,
          endS: 39.92,
        },
        {
          word: "mind\n",
          success: true,
          startS: 39.92,
          endS: 40.76,
        },
        {
          word: "Nights ",
          success: true,
          startS: 43.62,
          endS: 44.12,
        },
        {
          word: "are ",
          success: true,
          startS: 44.12,
          endS: 44.3,
        },
        {
          word: "fine\n",
          success: true,
          startS: 44.3,
          endS: 45.0,
        },
        {
          word: "Most ",
          success: true,
          startS: 47.92,
          endS: 48.52,
        },
        {
          word: "of ",
          success: true,
          startS: 48.52,
          endS: 48.74,
        },
        {
          word: "the ",
          success: true,
          startS: 48.74,
          endS: 48.88,
        },
        {
          word: "time\n",
          success: true,
          startS: 48.88,
          endS: 49.54,
        },
        {
          word: "‘Neath ",
          success: true,
          startS: 52.34,
          endS: 53.04,
        },
        {
          word: "the ",
          success: true,
          startS: 53.04,
          endS: 53.2,
        },
        {
          word: "North ",
          success: true,
          startS: 53.2,
          endS: 53.62,
        },
        {
          word: "Hollywood ",
          success: true,
          startS: 53.62,
          endS: 54.4,
        },
        {
          word: "Skyline\n",
          success: true,
          startS: 54.4,
          endS: 56.2,
        },
        {
          word: "North ",
          success: true,
          startS: 57.76,
          endS: 58.22,
        },
        {
          word: "Hollywood ",
          success: true,
          startS: 58.22,
          endS: 59.02,
        },
        {
          word: "Skyline\n",
          success: true,
          startS: 59.02,
          endS: 61.04,
        },
        {
          word: "North ",
          success: true,
          startS: 62.18,
          endS: 62.6,
        },
        {
          word: "Hollywood ",
          success: true,
          startS: 62.6,
          endS: 63.28,
        },
        {
          word: "Skyline\n",
          success: true,
          startS: 63.28,
          endS: 64.82,
        },
        {
          word: "North ",
          success: true,
          startS: 66.6,
          endS: 67.04,
        },
        {
          word: "Hollywood ",
          success: true,
          startS: 67.04,
          endS: 67.82,
        },
        {
          word: "Skyline\n",
          success: true,
          startS: 67.82,
          endS: 69.26,
        },
        {
          word: "You ",
          success: true,
          startS: 87.92,
          endS: 88.16,
        },
        {
          word: "can ",
          success: true,
          startS: 88.38,
          endS: 89.24,
        },
        {
          word: "get ",
          success: true,
          startS: 89.24,
          endS: 89.6,
        },
        {
          word: "a ",
          success: true,
          startS: 89.6,
          endS: 89.96,
        },
        {
          word: "tea ",
          success: true,
          startS: 89.96,
          endS: 90.24,
        },
        {
          word: "or ",
          success: true,
          startS: 90.24,
          endS: 90.6,
        },
        {
          word: "an ",
          success: true,
          startS: 90.6,
          endS: 90.72,
        },
        {
          word: "antique ",
          success: true,
          startS: 90.72,
          endS: 91.04,
        },
        {
          word: "cloth\n",
          success: true,
          startS: 91.04,
          endS: 91.78,
        },
        {
          word: "And ",
          success: true,
          startS: 92.48,
          endS: 93.46,
        },
        {
          word: "if ",
          success: true,
          startS: 93.46,
          endS: 93.64,
        },
        {
          word: "you ",
          success: true,
          startS: 93.64,
          endS: 93.78,
        },
        {
          word: "drove ",
          success: true,
          startS: 93.78,
          endS: 94.36,
        },
        {
          word: "find ",
          success: true,
          startS: 94.36,
          endS: 94.94,
        },
        {
          word: "somewhere ",
          success: true,
          startS: 94.94,
          endS: 95.54,
        },
        {
          word: "to ",
          success: true,
          startS: 95.54,
          endS: 95.98,
        },
        {
          word: "park\n",
          success: true,
          startS: 95.98,
          endS: 96.54,
        },
        {
          word: "Not ",
          success: true,
          startS: 97.4,
          endS: 98.04,
        },
        {
          word: "a ",
          success: true,
          startS: 98.04,
          endS: 98.3,
        },
        {
          word: "lot ",
          success: true,
          startS: 98.3,
          endS: 98.34,
        },
        {
          word: "of ",
          success: true,
          startS: 98.34,
          endS: 98.54,
        },
        {
          word: "thrills ",
          success: true,
          startS: 98.54,
          endS: 99.24,
        },
        {
          word: "you ",
          success: true,
          startS: 99.24,
          endS: 99.68,
        },
        {
          word: "can ",
          success: true,
          startS: 99.68,
          endS: 99.9,
        },
        {
          word: "buy\n",
          success: true,
          startS: 99.9,
          endS: 100.46,
        },
        {
          word: "That’s ",
          success: true,
          startS: 101.82,
          endS: 102.66,
        },
        {
          word: "okay ",
          success: true,
          startS: 102.66,
          endS: 103.0,
        },
        {
          word: "cos ",
          success: true,
          startS: 103.0,
          endS: 104.06,
        },
        {
          word: "in ",
          success: true,
          startS: 104.06,
          endS: 104.24,
        },
        {
          word: "my ",
          success: true,
          startS: 104.24,
          endS: 104.52,
        },
        {
          word: "mind\n",
          success: true,
          startS: 104.52,
          endS: 105.38,
        },
        {
          word: "The ",
          success: true,
          startS: 106.12,
          endS: 106.28,
        },
        {
          word: "air ",
          success: true,
          startS: 106.28,
          endS: 106.44,
        },
        {
          word: "is ",
          success: true,
          startS: 106.44,
          endS: 106.68,
        },
        {
          word: "fine\n",
          success: true,
          startS: 106.68,
          endS: 107.34,
        },
        {
          word: "Most ",
          success: true,
          startS: 110.26,
          endS: 110.8,
        },
        {
          word: "of ",
          success: true,
          startS: 110.8,
          endS: 110.96,
        },
        {
          word: "the ",
          success: true,
          startS: 110.96,
          endS: 111.14,
        },
        {
          word: "time\n",
          success: true,
          startS: 111.14,
          endS: 111.98,
        },
        {
          word: "Except ",
          success: true,
          startS: 114.64,
          endS: 115.02,
        },
        {
          word: "summertime\n",
          success: true,
          startS: 115.02,
          endS: 115.98,
        },
        {
          word: "‘Neath ",
          success: true,
          startS: 118.36,
          endS: 119.78,
        },
        {
          word: "the ",
          success: true,
          startS: 119.78,
          endS: 119.96,
        },
        {
          word: "North ",
          success: true,
          startS: 119.96,
          endS: 120.4,
        },
        {
          word: "Hollywood ",
          success: true,
          startS: 120.4,
          endS: 121.16,
        },
        {
          word: "Skyline\n",
          success: true,
          startS: 121.16,
          endS: 122.86,
        },
        {
          word: "North ",
          success: true,
          startS: 124.16,
          endS: 124.9,
        },
        {
          word: "Hollywood ",
          success: true,
          startS: 124.9,
          endS: 125.58,
        },
        {
          word: "Skyline\n",
          success: true,
          startS: 125.58,
          endS: 128.02,
        },
        {
          word: "North ",
          success: true,
          startS: 128.74,
          endS: 129.24,
        },
        {
          word: "Hollywood ",
          success: true,
          startS: 129.24,
          endS: 129.98,
        },
        {
          word: "Skyline\n",
          success: true,
          startS: 129.98,
          endS: 131.46,
        },
        {
          word: "North ",
          success: true,
          startS: 133.02,
          endS: 133.72,
        },
        {
          word: "Hollywood ",
          success: true,
          startS: 133.72,
          endS: 134.48,
        },
        {
          word: "Skyline\n",
          success: true,
          startS: 134.48,
          endS: 135.92,
        },
      ],
    },
    {
      id: "3",
      // title: "Winter Sunlight (airtone feat. Leza2unes) - Snowflake & ccMixter",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=472893&format=mp31&from=pCFTaJKC%2BPuF5h%2FghKdukA%3D%3D%7CLwRCsKWj63M8iGV4amrNcQ%3D%3D",
      provider: "MOCK",
      lyrics: `
        You are like the winter sun
        Shining down until your day is done
        Spiritual finding, pure deep down inside
        Within me

        Naturally feel you everywhere
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
      alignedWords: [
        {
          word: "You ",
          success: true,
          startS: 12.48,
          endS: 12.48,
        },
        {
          word: "are ",
          success: true,
          startS: 12.48,
          endS: 13.24,
        },
        {
          word: "like ",
          success: true,
          startS: 13.24,
          endS: 14.24,
        },
        {
          word: "the ",
          success: true,
          startS: 14.24,
          endS: 14.84,
        },
        {
          word: "winter ",
          success: true,
          startS: 14.84,
          endS: 15.5,
        },
        {
          word: "sun\n",
          success: true,
          startS: 15.5,
          endS: 16.38,
        },
        {
          word: "Shining ",
          success: true,
          startS: 16.88,
          endS: 18.84,
        },
        {
          word: "down ",
          success: true,
          startS: 18.84,
          endS: 19.84,
        },
        {
          word: "until ",
          success: true,
          startS: 19.84,
          endS: 20.34,
        },
        {
          word: "your ",
          success: true,
          startS: 20.34,
          endS: 20.8,
        },
        {
          word: "day ",
          success: true,
          startS: 20.8,
          endS: 21.34,
        },
        {
          word: "is ",
          success: true,
          startS: 21.34,
          endS: 21.72,
        },
        {
          word: "done\n",
          success: true,
          startS: 21.72,
          endS: 22.06,
        },
        {
          word: "Spiritual ",
          success: true,
          startS: 23.2,
          endS: 24.8,
        },
        {
          word: "finding, ",
          success: true,
          startS: 24.8,
          endS: 26.5,
        },
        {
          word: "pure ",
          success: true,
          startS: 26.5,
          endS: 26.74,
        },
        {
          word: "deep ",
          success: true,
          startS: 26.74,
          endS: 27.34,
        },
        {
          word: "down ",
          success: true,
          startS: 27.34,
          endS: 27.9,
        },
        {
          word: "inside\n",
          success: true,
          startS: 27.9,
          endS: 28.86,
        },
        {
          word: "Within ",
          success: true,
          startS: 29.6,
          endS: 29.86,
        },
        {
          word: "me\n",
          success: true,
          startS: 35.06,
          endS: 36.58,
        },
        {
          word: "Naturally ",
          success: true,
          startS: 36.64,
          endS: 37.02,
        },
        {
          word: "feel ",
          success: true,
          startS: 37.02,
          endS: 37.58,
        },
        {
          word: "you ",
          success: true,
          startS: 37.58,
          endS: 38.28,
        },
        {
          word: "everywhere\n",
          success: true,
          startS: 38.28,
          endS: 39.78,
        },
        {
          word: "In ",
          success: true,
          startS: 41.56,
          endS: 41.6,
        },
        {
          word: "our ",
          success: true,
          startS: 41.6,
          endS: 41.6,
        },
        {
          word: "ebbing ",
          success: true,
          startS: 41.6,
          endS: 43.28,
        },
        {
          word: "sun, ",
          success: true,
          startS: 43.28,
          endS: 44.18,
        },
        {
          word: "present ",
          success: true,
          startS: 44.18,
          endS: 44.72,
        },
        {
          word: "on ",
          success: true,
          startS: 44.72,
          endS: 45.44,
        },
        {
          word: "his ",
          success: true,
          startS: 45.44,
          endS: 45.74,
        },
        {
          word: "hair\n",
          success: true,
          startS: 45.74,
          endS: 46.42,
        },
        {
          word: "Solstice ",
          success: true,
          startS: 47.2,
          endS: 48.88,
        },
        {
          word: "horizon, ",
          success: true,
          startS: 48.88,
          endS: 50.4,
        },
        {
          word: "wisdom ",
          success: true,
          startS: 50.4,
          endS: 50.72,
        },
        {
          word: "wells ",
          success: true,
          startS: 50.72,
          endS: 51.4,
        },
        {
          word: "up ",
          success: true,
          startS: 51.4,
          endS: 51.72,
        },
        {
          word: "inside ",
          success: true,
          startS: 51.72,
          endS: 52.62,
        },
        {
          word: "him\n",
          success: true,
          startS: 52.62,
          endS: 53.24,
        },
        {
          word: "Reflectively\n",
          success: true,
          startS: 53.7,
          endS: 54.7,
        },
        {
          word: "Moment-by-moment ",
          success: true,
          startS: 60.7,
          endS: 62.52,
        },
        {
          word: "meditatively\n",
          success: true,
          startS: 62.52,
          endS: 64.46,
        },
        {
          word: "Stillness ",
          success: true,
          startS: 65.02,
          endS: 66.88,
        },
        {
          word: "snowdrift ",
          success: true,
          startS: 66.88,
          endS: 68.16,
        },
        {
          word: "into ",
          success: true,
          startS: 68.16,
          endS: 68.92,
        },
        {
          word: "reverie\n",
          success: true,
          startS: 68.92,
          endS: 70.82,
        },
        {
          word: "Awareness ",
          success: true,
          startS: 71.64,
          endS: 73.1,
        },
        {
          word: "unfolding\n",
          success: true,
          startS: 73.1,
          endS: 74.18,
        },
        {
          word: "To ",
          success: true,
          startS: 74.8,
          endS: 74.84,
        },
        {
          word: "awaken ",
          success: true,
          startS: 74.84,
          endS: 75.88,
        },
        {
          word: "your ",
          success: true,
          startS: 75.88,
          endS: 76.5,
        },
        {
          word: "soul\n",
          success: true,
          startS: 76.5,
          endS: 77.02,
        },
        {
          word: "Set ",
          success: true,
          startS: 77.3,
          endS: 77.62,
        },
        {
          word: "you ",
          success: true,
          startS: 77.62,
          endS: 78.14,
        },
        {
          word: "free\n",
          success: true,
          startS: 83.08,
          endS: 84.42,
        },
        {
          word: "Mindfully ",
          success: true,
          startS: 84.42,
          endS: 85.06,
        },
        {
          word: "watching ",
          success: true,
          startS: 85.06,
          endS: 86.44,
        },
        {
          word: "all ",
          success: true,
          startS: 86.44,
          endS: 87.36,
        },
        {
          word: "you ",
          success: true,
          startS: 87.36,
          endS: 87.64,
        },
        {
          word: "do\n",
          success: true,
          startS: 87.64,
          endS: 88.7,
        },
        {
          word: "What ",
          success: true,
          startS: 88.7,
          endS: 90.36,
        },
        {
          word: "comes ",
          success: true,
          startS: 90.36,
          endS: 91.22,
        },
        {
          word: "in, ",
          success: true,
          startS: 91.22,
          endS: 92.14,
        },
        {
          word: "you ",
          success: true,
          startS: 92.14,
          endS: 92.3,
        },
        {
          word: "are ",
          success: true,
          startS: 92.3,
          endS: 92.8,
        },
        {
          word: "open ",
          success: true,
          startS: 92.8,
          endS: 93.46,
        },
        {
          word: "to\n",
          success: true,
          startS: 93.46,
          endS: 93.92,
        },
        {
          word: "A ",
          success: true,
          startS: 95.66,
          endS: 95.66,
        },
        {
          word: "welcoming ",
          success: true,
          startS: 95.66,
          endS: 96.74,
        },
        {
          word: "feeling,\n",
          success: true,
          startS: 96.74,
          endS: 98.5,
        },
        {
          word: "Yule ",
          success: true,
          startS: 98.58,
          endS: 98.78,
        },
        {
          word: "Tide ",
          success: true,
          startS: 98.78,
          endS: 99.44,
        },
        {
          word: "is ",
          success: true,
          startS: 99.44,
          endS: 99.86,
        },
        {
          word: "the ",
          success: true,
          startS: 99.86,
          endS: 100.22,
        },
        {
          word: "season ",
          success: true,
          startS: 100.22,
          endS: 101.08,
        },
        {
          word: "for ",
          success: true,
          startS: 101.08,
          endS: 102.08,
        },
        {
          word: "me\n",
          success: true,
          startS: 107.78,
          endS: 108.44,
        },
        {
          word: "So ",
          success: true,
          startS: 131.34,
          endS: 131.34,
        },
        {
          word: "you ",
          success: true,
          startS: 131.34,
          endS: 132.4,
        },
        {
          word: "are ",
          success: true,
          startS: 132.4,
          endS: 133.2,
        },
        {
          word: "like ",
          success: true,
          startS: 133.2,
          endS: 134.32,
        },
        {
          word: "the ",
          success: true,
          startS: 134.32,
          endS: 134.88,
        },
        {
          word: "winter ",
          success: true,
          startS: 134.88,
          endS: 135.34,
        },
        {
          word: "sun\n",
          success: true,
          startS: 135.34,
          endS: 136.3,
        },
        {
          word: "Shining ",
          success: true,
          startS: 137.76,
          endS: 138.74,
        },
        {
          word: "down ",
          success: true,
          startS: 138.74,
          endS: 139.78,
        },
        {
          word: "until ",
          success: true,
          startS: 139.78,
          endS: 140.42,
        },
        {
          word: "your ",
          success: true,
          startS: 140.42,
          endS: 141.06,
        },
        {
          word: "light ",
          success: true,
          startS: 141.06,
          endS: 141.22,
        },
        {
          word: "is ",
          success: true,
          startS: 141.22,
          endS: 141.72,
        },
        {
          word: "done\n",
          success: true,
          startS: 141.72,
          endS: 142.28,
        },
        {
          word: "Spiritual ",
          success: true,
          startS: 142.66,
          endS: 144.7,
        },
        {
          word: "findings, ",
          success: true,
          startS: 144.7,
          endS: 146.54,
        },
        {
          word: "pure ",
          success: true,
          startS: 146.54,
          endS: 146.74,
        },
        {
          word: "deep ",
          success: true,
          startS: 146.74,
          endS: 147.38,
        },
        {
          word: "down ",
          success: true,
          startS: 147.38,
          endS: 147.98,
        },
        {
          word: "inside\n",
          success: true,
          startS: 147.98,
          endS: 148.86,
        },
        {
          word: "Within ",
          success: true,
          startS: 149.76,
          endS: 150.34,
        },
        {
          word: "me\n",
          success: true,
          startS: 150.34,
          endS: 151.16,
        },
      ],
    },
    {
      id: "4",
      // title: "You're Always With Me - Marco Margna",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=1121394&format=mp31&from=sJJv%2FhT1wKinsei35JAS8w%3D%3D%7CTjL86fBk3dyEpuy67KVueA%3D%3D",
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
      alignedWords: [
        {
          word: "I’ve ",
          success: true,
          startS: 16.52,
          endS: 16.62,
        },
        {
          word: "seen ",
          success: true,
          startS: 16.62,
          endS: 16.9,
        },
        {
          word: "the ",
          success: true,
          startS: 16.9,
          endS: 17.2,
        },
        {
          word: "world ",
          success: true,
          startS: 17.2,
          endS: 17.56,
        },
        {
          word: "from ",
          success: true,
          startS: 17.56,
          endS: 17.92,
        },
        {
          word: "many ",
          success: true,
          startS: 17.92,
          endS: 18.56,
        },
        {
          word: "sides\n",
          success: true,
          startS: 18.56,
          endS: 19.5,
        },
        {
          word: "The ",
          success: true,
          startS: 19.7,
          endS: 20.58,
        },
        {
          word: "sun ",
          success: true,
          startS: 20.58,
          endS: 20.88,
        },
        {
          word: "made ",
          success: true,
          startS: 20.88,
          endS: 21.12,
        },
        {
          word: "love ",
          success: true,
          startS: 21.12,
          endS: 21.52,
        },
        {
          word: "to ",
          success: true,
          startS: 21.52,
          endS: 21.84,
        },
        {
          word: "the ",
          success: true,
          startS: 21.84,
          endS: 22.04,
        },
        {
          word: "sea\n",
          success: true,
          startS: 22.04,
          endS: 22.52,
        },
        {
          word: "I’ve ",
          success: true,
          startS: 24.06,
          endS: 24.7,
        },
        {
          word: "danced ",
          success: true,
          startS: 24.7,
          endS: 24.94,
        },
        {
          word: "with ",
          success: true,
          startS: 24.94,
          endS: 25.26,
        },
        {
          word: "angels ",
          success: true,
          startS: 25.26,
          endS: 25.86,
        },
        {
          word: "in ",
          success: true,
          startS: 25.86,
          endS: 26.56,
        },
        {
          word: "the ",
          success: true,
          startS: 26.56,
          endS: 26.88,
        },
        {
          word: "sky\n",
          success: true,
          startS: 26.88,
          endS: 27.24,
        },
        {
          word: "And ",
          success: true,
          startS: 27.6,
          endS: 27.92,
        },
        {
          word: "with ",
          success: true,
          startS: 27.92,
          endS: 28.12,
        },
        {
          word: "mermaids ",
          success: true,
          startS: 28.12,
          endS: 28.9,
        },
        {
          word: "deep ",
          success: true,
          startS: 28.9,
          endS: 29.28,
        },
        {
          word: "in ",
          success: true,
          startS: 29.28,
          endS: 29.86,
        },
        {
          word: "the ",
          success: true,
          startS: 29.86,
          endS: 30.1,
        },
        {
          word: "sea\n",
          success: true,
          startS: 30.1,
          endS: 30.6,
        },
        {
          word: "I’ve ",
          success: true,
          startS: 31.96,
          endS: 32.68,
        },
        {
          word: "crossed ",
          success: true,
          startS: 32.68,
          endS: 32.86,
        },
        {
          word: "the ",
          success: true,
          startS: 32.86,
          endS: 33.18,
        },
        {
          word: "mountains ",
          success: true,
          startS: 33.18,
          endS: 33.62,
        },
        {
          word: "hundred ",
          success: true,
          startS: 33.62,
          endS: 34.6,
        },
        {
          word: "times\n",
          success: true,
          startS: 34.6,
          endS: 35.46,
        },
        {
          word: "Rainbow ",
          success: true,
          startS: 36.24,
          endS: 36.7,
        },
        {
          word: "all ",
          success: true,
          startS: 36.7,
          endS: 37.56,
        },
        {
          word: "over ",
          success: true,
          startS: 37.56,
          endS: 38.06,
        },
        {
          word: "me\n",
          success: true,
          startS: 38.06,
          endS: 38.64,
        },
        {
          word: "But ",
          success: true,
          startS: 40.28,
          endS: 40.28,
        },
        {
          word: "those ",
          success: true,
          startS: 40.28,
          endS: 41.16,
        },
        {
          word: "things ",
          success: true,
          startS: 41.16,
          endS: 41.56,
        },
        {
          word: "ain’t ",
          success: true,
          startS: 41.56,
          endS: 42.18,
        },
        {
          word: "nothing, ",
          success: true,
          startS: 42.18,
          endS: 42.52,
        },
        {
          word: "next ",
          success: true,
          startS: 42.52,
          endS: 43.32,
        },
        {
          word: "to ",
          success: true,
          startS: 43.32,
          endS: 43.66,
        },
        {
          word: "your ",
          success: true,
          startS: 43.66,
          endS: 43.86,
        },
        {
          word: "love\n",
          success: true,
          startS: 43.86,
          endS: 44.54,
        },
        {
          word: "You’re ",
          success: true,
          startS: 45.44,
          endS: 47.0,
        },
        {
          word: "the ",
          success: true,
          startS: 47.0,
          endS: 47.16,
        },
        {
          word: "one ",
          success: true,
          startS: 47.16,
          endS: 47.66,
        },
        {
          word: "that ",
          success: true,
          startS: 47.66,
          endS: 48.12,
        },
        {
          word: "I ",
          success: true,
          startS: 48.12,
          endS: 48.18,
        },
        {
          word: "need\n",
          success: true,
          startS: 48.18,
          endS: 49.08,
        },
        {
          word: "You're ",
          success: true,
          startS: 49.78,
          endS: 51.12,
        },
        {
          word: "always ",
          success: true,
          startS: 51.12,
          endS: 51.56,
        },
        {
          word: "with ",
          success: true,
          startS: 51.56,
          endS: 51.88,
        },
        {
          word: "me\n",
          success: true,
          startS: 51.88,
          endS: 52.26,
        },
        {
          word: "Wherever ",
          success: true,
          startS: 52.76,
          endS: 53.28,
        },
        {
          word: "we ",
          success: true,
          startS: 53.28,
          endS: 53.98,
        },
        {
          word: "are\n",
          success: true,
          startS: 53.98,
          endS: 54.46,
        },
        {
          word: "You ",
          success: true,
          startS: 55.42,
          endS: 55.62,
        },
        {
          word: "can ",
          success: true,
          startS: 55.62,
          endS: 55.88,
        },
        {
          word: "touch ",
          success: true,
          startS: 55.88,
          endS: 56.38,
        },
        {
          word: "my ",
          success: true,
          startS: 56.38,
          endS: 56.76,
        },
        {
          word: "heart ",
          success: true,
          startS: 56.76,
          endS: 57.44,
        },
        {
          word: "and ",
          success: true,
          startS: 57.44,
          endS: 57.72,
        },
        {
          word: "my ",
          success: true,
          startS: 57.72,
          endS: 57.86,
        },
        {
          word: "soul\n",
          success: true,
          startS: 57.86,
          endS: 58.44,
        },
        {
          word: "Your ",
          success: true,
          startS: 59.5,
          endS: 61.1,
        },
        {
          word: "love ",
          success: true,
          startS: 61.1,
          endS: 61.46,
        },
        {
          word: "is ",
          success: true,
          startS: 61.46,
          endS: 61.68,
        },
        {
          word: "with ",
          success: true,
          startS: 61.68,
          endS: 61.9,
        },
        {
          word: "me\n",
          success: true,
          startS: 61.9,
          endS: 62.4,
        },
        {
          word: "Deep ",
          success: true,
          startS: 63.12,
          endS: 63.38,
        },
        {
          word: "in ",
          success: true,
          startS: 63.38,
          endS: 63.62,
        },
        {
          word: "my ",
          success: true,
          startS: 63.62,
          endS: 63.86,
        },
        {
          word: "heart\n",
          success: true,
          startS: 63.86,
          endS: 64.72,
        },
        {
          word: "You ",
          success: true,
          startS: 66.06,
          endS: 66.52,
        },
        {
          word: "and ",
          success: true,
          startS: 66.52,
          endS: 67.08,
        },
        {
          word: "me\n",
          success: true,
          startS: 67.08,
          endS: 67.76,
        },
        {
          word: "Me ",
          success: true,
          startS: 69.48,
          endS: 70.66,
        },
        {
          word: "and ",
          success: true,
          startS: 70.66,
          endS: 70.96,
        },
        {
          word: "you\n",
          success: true,
          startS: 79.76,
          endS: 80.6,
        },
        {
          word: "I’ve ",
          success: true,
          startS: 80.6,
          endS: 80.68,
        },
        {
          word: "touched ",
          success: true,
          startS: 80.68,
          endS: 81.02,
        },
        {
          word: "the ",
          success: true,
          startS: 81.02,
          endS: 81.28,
        },
        {
          word: "sun ",
          success: true,
          startS: 81.28,
          endS: 81.74,
        },
        {
          word: "and ",
          success: true,
          startS: 81.76,
          endS: 82.12,
        },
        {
          word: "walked ",
          success: true,
          startS: 82.12,
          endS: 82.6,
        },
        {
          word: "on ",
          success: true,
          startS: 82.6,
          endS: 82.88,
        },
        {
          word: "clouds\n",
          success: true,
          startS: 82.88,
          endS: 83.38,
        },
        {
          word: "Like ",
          success: true,
          startS: 83.82,
          endS: 83.9,
        },
        {
          word: "a ",
          success: true,
          startS: 83.9,
          endS: 84.22,
        },
        {
          word: "bird ",
          success: true,
          startS: 84.22,
          endS: 84.38,
        },
        {
          word: "a ",
          success: true,
          startS: 84.38,
          endS: 84.74,
        },
        {
          word: "flew ",
          success: true,
          startS: 84.74,
          endS: 85.1,
        },
        {
          word: "in ",
          success: true,
          startS: 85.1,
          endS: 85.64,
        },
        {
          word: "the ",
          success: true,
          startS: 85.64,
          endS: 85.86,
        },
        {
          word: "sky\n",
          success: true,
          startS: 85.86,
          endS: 86.22,
        },
        {
          word: "Seen ",
          success: true,
          startS: 87.48,
          endS: 89.0,
        },
        {
          word: "seven ",
          success: true,
          startS: 89.0,
          endS: 89.5,
        },
        {
          word: "wonders ",
          success: true,
          startS: 89.5,
          endS: 90.04,
        },
        {
          word: "of ",
          success: true,
          startS: 90.04,
          endS: 90.54,
        },
        {
          word: "the ",
          success: true,
          startS: 90.54,
          endS: 90.84,
        },
        {
          word: "world\n",
          success: true,
          startS: 90.84,
          endS: 91.32,
        },
        {
          word: "And ",
          success: true,
          startS: 91.8,
          endS: 91.82,
        },
        {
          word: "Marie ",
          success: true,
          startS: 91.82,
          endS: 92.12,
        },
        {
          word: "Antoinette ",
          success: true,
          startS: 92.12,
          endS: 93.36,
        },
        {
          word: "in ",
          success: true,
          startS: 93.36,
          endS: 93.82,
        },
        {
          word: "Versailles\n",
          success: true,
          startS: 93.82,
          endS: 94.86,
        },
        {
          word: "But ",
          success: true,
          startS: 95.68,
          endS: 96.84,
        },
        {
          word: "those ",
          success: true,
          startS: 96.84,
          endS: 97.1,
        },
        {
          word: "things ",
          success: true,
          startS: 97.1,
          endS: 97.54,
        },
        {
          word: "ain’t ",
          success: true,
          startS: 97.54,
          endS: 98.16,
        },
        {
          word: "nothing, ",
          success: true,
          startS: 98.16,
          endS: 98.48,
        },
        {
          word: "next ",
          success: true,
          startS: 98.48,
          endS: 99.32,
        },
        {
          word: "to ",
          success: true,
          startS: 99.32,
          endS: 99.66,
        },
        {
          word: "your ",
          success: true,
          startS: 99.66,
          endS: 99.88,
        },
        {
          word: "love\n",
          success: true,
          startS: 99.88,
          endS: 100.62,
        },
        {
          word: "You’re ",
          success: true,
          startS: 101.44,
          endS: 103.0,
        },
        {
          word: "the ",
          success: true,
          startS: 103.0,
          endS: 103.18,
        },
        {
          word: "one ",
          success: true,
          startS: 103.18,
          endS: 103.64,
        },
        {
          word: "that ",
          success: true,
          startS: 103.64,
          endS: 104.12,
        },
        {
          word: "I ",
          success: true,
          startS: 104.12,
          endS: 104.16,
        },
        {
          word: "need\n",
          success: true,
          startS: 104.16,
          endS: 104.88,
        },
        {
          word: "You're ",
          success: true,
          startS: 105.92,
          endS: 107.12,
        },
        {
          word: "always ",
          success: true,
          startS: 107.12,
          endS: 107.54,
        },
        {
          word: "with ",
          success: true,
          startS: 107.54,
          endS: 107.92,
        },
        {
          word: "me\n",
          success: true,
          startS: 107.92,
          endS: 108.22,
        },
        {
          word: "Wherever ",
          success: true,
          startS: 108.72,
          endS: 109.32,
        },
        {
          word: "we ",
          success: true,
          startS: 109.54,
          endS: 109.98,
        },
        {
          word: "are\n",
          success: true,
          startS: 109.98,
          endS: 110.66,
        },
        {
          word: "You ",
          success: true,
          startS: 110.92,
          endS: 111.6,
        },
        {
          word: "can ",
          success: true,
          startS: 111.6,
          endS: 111.88,
        },
        {
          word: "touch ",
          success: true,
          startS: 111.88,
          endS: 112.38,
        },
        {
          word: "my ",
          success: true,
          startS: 112.38,
          endS: 112.78,
        },
        {
          word: "heart ",
          success: true,
          startS: 112.78,
          endS: 113.46,
        },
        {
          word: "and ",
          success: true,
          startS: 113.46,
          endS: 113.68,
        },
        {
          word: "my ",
          success: true,
          startS: 113.68,
          endS: 113.86,
        },
        {
          word: "soul\n",
          success: true,
          startS: 113.86,
          endS: 114.4,
        },
        {
          word: "Your ",
          success: true,
          startS: 115.58,
          endS: 117.1,
        },
        {
          word: "love ",
          success: true,
          startS: 117.1,
          endS: 117.44,
        },
        {
          word: "is ",
          success: true,
          startS: 117.44,
          endS: 117.68,
        },
        {
          word: "with ",
          success: true,
          startS: 117.68,
          endS: 117.9,
        },
        {
          word: "me\n",
          success: true,
          startS: 117.9,
          endS: 118.36,
        },
        {
          word: "Deep ",
          success: true,
          startS: 119.02,
          endS: 119.38,
        },
        {
          word: "in ",
          success: true,
          startS: 119.38,
          endS: 119.62,
        },
        {
          word: "my ",
          success: true,
          startS: 119.62,
          endS: 119.86,
        },
        {
          word: "heart\n",
          success: true,
          startS: 119.86,
          endS: 120.48,
        },
        {
          word: "You ",
          success: true,
          startS: 122.1,
          endS: 122.52,
        },
        {
          word: "and ",
          success: true,
          startS: 122.52,
          endS: 123.06,
        },
        {
          word: "me\n",
          success: true,
          startS: 123.06,
          endS: 123.8,
        },
        {
          word: "Me ",
          success: true,
          startS: 125.72,
          endS: 126.68,
        },
        {
          word: "and ",
          success: true,
          startS: 126.68,
          endS: 126.96,
        },
        {
          word: "you\n",
          success: true,
          startS: 126.96,
          endS: 127.3,
        },
      ],
    },
    {
      id: "5",
      // title: "Gravity - Steven Dunston",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=6722&format=mp31&from=640purZh1EuQVjkCBSHMXQ%3D%3D%7Cad5%2FaBZ33sL6tAXHmJcEYQ%3D%3D",
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
      alignedWords: [
        {
          word: "It's ",
          success: true,
          startS: 9.28,
          endS: 9.4,
        },
        {
          word: "true ",
          success: true,
          startS: 9.4,
          endS: 9.78,
        },
        {
          word: "you're ",
          success: true,
          startS: 9.78,
          endS: 10.1,
        },
        {
          word: "gone ",
          success: true,
          startS: 10.1,
          endS: 10.42,
        },
        {
          word: "baby ",
          success: true,
          startS: 10.42,
          endS: 11.02,
        },
        {
          word: "I ",
          success: true,
          startS: 11.02,
          endS: 11.58,
        },
        {
          word: "saw ",
          success: true,
          startS: 11.58,
          endS: 11.96,
        },
        {
          word: "you ",
          success: true,
          startS: 11.96,
          endS: 12.32,
        },
        {
          word: "leave\n",
          success: true,
          startS: 12.32,
          endS: 12.9,
        },
        {
          word: "You ",
          success: true,
          startS: 13.18,
          endS: 13.68,
        },
        {
          word: "got ",
          success: true,
          startS: 13.68,
          endS: 14.0,
        },
        {
          word: "on ",
          success: true,
          startS: 14.0,
          endS: 14.52,
        },
        {
          word: "the ",
          success: true,
          startS: 14.52,
          endS: 14.74,
        },
        {
          word: "airplane ",
          success: true,
          startS: 14.74,
          endS: 15.24,
        },
        {
          word: "and ",
          success: true,
          startS: 15.24,
          endS: 15.86,
        },
        {
          word: "waved ",
          success: true,
          startS: 15.86,
          endS: 16.28,
        },
        {
          word: "back ",
          success: true,
          startS: 16.28,
          endS: 16.64,
        },
        {
          word: "at ",
          success: true,
          startS: 16.64,
          endS: 16.92,
        },
        {
          word: "me\n",
          success: true,
          startS: 16.92,
          endS: 17.22,
        },
        {
          word: "You ",
          success: true,
          startS: 17.94,
          endS: 18.24,
        },
        {
          word: "taxied ",
          success: true,
          startS: 18.24,
          endS: 18.94,
        },
        {
          word: "the ",
          success: true,
          startS: 18.94,
          endS: 19.26,
        },
        {
          word: "runway ",
          success: true,
          startS: 19.26,
          endS: 19.66,
        },
        {
          word: "and ",
          success: true,
          startS: 19.66,
          endS: 20.36,
        },
        {
          word: "climbed ",
          success: true,
          startS: 20.36,
          endS: 20.68,
        },
        {
          word: "up ",
          success: true,
          startS: 20.68,
          endS: 21.24,
        },
        {
          word: "the ",
          success: true,
          startS: 21.24,
          endS: 21.48,
        },
        {
          word: "sky\n",
          success: true,
          startS: 21.48,
          endS: 21.74,
        },
        {
          word: "And ",
          success: true,
          startS: 22.62,
          endS: 22.86,
        },
        {
          word: "left ",
          success: true,
          startS: 22.86,
          endS: 23.14,
        },
        {
          word: "me ",
          success: true,
          startS: 23.14,
          endS: 23.58,
        },
        {
          word: "at ",
          success: true,
          startS: 23.58,
          endS: 23.9,
        },
        {
          word: "home ",
          success: true,
          startS: 23.9,
          endS: 24.28,
        },
        {
          word: "here ",
          success: true,
          startS: 24.28,
          endS: 24.7,
        },
        {
          word: "with ",
          success: true,
          startS: 24.7,
          endS: 24.98,
        },
        {
          word: "myself ",
          success: true,
          startS: 24.98,
          endS: 25.74,
        },
        {
          word: "and ",
          success: true,
          startS: 25.74,
          endS: 26.16,
        },
        {
          word: "I\n",
          success: true,
          startS: 26.16,
          endS: 26.56,
        },
        {
          word: "But ",
          success: true,
          startS: 27.28,
          endS: 27.5,
        },
        {
          word: "no ",
          success: true,
          startS: 27.5,
          endS: 27.72,
        },
        {
          word: "matter ",
          success: true,
          startS: 27.72,
          endS: 28.14,
        },
        {
          word: "how ",
          success: true,
          startS: 28.14,
          endS: 28.8,
        },
        {
          word: "far ",
          success: true,
          startS: 28.8,
          endS: 29.36,
        },
        {
          word: "away ",
          success: true,
          startS: 29.36,
          endS: 29.82,
        },
        {
          word: "you ",
          success: true,
          startS: 29.98,
          endS: 30.24,
        },
        {
          word: "might ",
          success: true,
          startS: 30.24,
          endS: 30.62,
        },
        {
          word: "be\n",
          success: true,
          startS: 30.62,
          endS: 31.14,
        },
        {
          word: "I ",
          success: true,
          startS: 31.46,
          endS: 31.78,
        },
        {
          word: "can ",
          success: true,
          startS: 31.78,
          endS: 31.94,
        },
        {
          word: "still ",
          success: true,
          startS: 31.94,
          endS: 32.26,
        },
        {
          word: "feel ",
          success: true,
          startS: 32.26,
          endS: 32.68,
        },
        {
          word: "the ",
          success: true,
          startS: 32.68,
          endS: 33.0,
        },
        {
          word: "weight ",
          success: true,
          startS: 33.0,
          endS: 33.54,
        },
        {
          word: "of ",
          success: true,
          startS: 33.54,
          endS: 33.96,
        },
        {
          word: "your ",
          success: true,
          startS: 33.96,
          endS: 34.12,
        },
        {
          word: "body ",
          success: true,
          startS: 34.12,
          endS: 34.76,
        },
        {
          word: "on ",
          success: true,
          startS: 34.76,
          endS: 35.38,
        },
        {
          word: "me\n",
          success: true,
          startS: 35.38,
          endS: 35.94,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 36.66,
          endS: 38.74,
        },
        {
          word: "that’s ",
          success: true,
          startS: 38.74,
          endS: 39.9,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 47.34,
          endS: 48.38,
        },
        {
          word: "Back ",
          success: true,
          startS: 48.38,
          endS: 48.38,
        },
        {
          word: "in ",
          success: true,
          startS: 48.38,
          endS: 48.82,
        },
        {
          word: "the ",
          success: true,
          startS: 48.82,
          endS: 49.12,
        },
        {
          word: "orbit ",
          success: true,
          startS: 49.12,
          endS: 49.74,
        },
        {
          word: "of ",
          success: true,
          startS: 49.74,
          endS: 50.3,
        },
        {
          word: "everyday ",
          success: true,
          startS: 50.3,
          endS: 51.04,
        },
        {
          word: "things\n",
          success: true,
          startS: 51.04,
          endS: 52.14,
        },
        {
          word: "Objects ",
          success: true,
          startS: 52.62,
          endS: 53.46,
        },
        {
          word: "are ",
          success: true,
          startS: 53.46,
          endS: 53.56,
        },
        {
          word: "pulling ",
          success: true,
          startS: 53.56,
          endS: 54.02,
        },
        {
          word: "my ",
          success: true,
          startS: 54.02,
          endS: 54.78,
        },
        {
          word: "celestial ",
          success: true,
          startS: 54.78,
          endS: 55.56,
        },
        {
          word: "strings\n",
          success: true,
          startS: 55.56,
          endS: 56.54,
        },
        {
          word: "Forcing ",
          success: true,
          startS: 57.38,
          endS: 57.9,
        },
        {
          word: "upon ",
          success: true,
          startS: 57.9,
          endS: 58.38,
        },
        {
          word: "me ",
          success: true,
          startS: 58.38,
          endS: 59.12,
        },
        {
          word: "their ",
          success: true,
          startS: 59.12,
          endS: 59.48,
        },
        {
          word: "new ",
          success: true,
          startS: 59.48,
          endS: 59.82,
        },
        {
          word: "point ",
          success: true,
          startS: 59.82,
          endS: 60.28,
        },
        {
          word: "of ",
          success: true,
          startS: 60.28,
          endS: 60.58,
        },
        {
          word: "view\n",
          success: true,
          startS: 60.58,
          endS: 61.12,
        },
        {
          word: "As ",
          success: true,
          startS: 61.82,
          endS: 62.18,
        },
        {
          word: "if ",
          success: true,
          startS: 62.18,
          endS: 62.56,
        },
        {
          word: "I ",
          success: true,
          startS: 62.56,
          endS: 62.86,
        },
        {
          word: "no ",
          success: true,
          startS: 62.86,
          endS: 63.2,
        },
        {
          word: "longer ",
          success: true,
          startS: 63.2,
          endS: 63.88,
        },
        {
          word: "orbit ",
          success: true,
          startS: 63.88,
          endS: 64.58,
        },
        {
          word: "around ",
          success: true,
          startS: 64.58,
          endS: 65.1,
        },
        {
          word: "you\n",
          success: true,
          startS: 65.1,
          endS: 65.92,
        },
        {
          word: "But ",
          success: true,
          startS: 66.1,
          endS: 66.34,
        },
        {
          word: "no ",
          success: true,
          startS: 66.34,
          endS: 66.68,
        },
        {
          word: "matter ",
          success: true,
          startS: 66.68,
          endS: 67.16,
        },
        {
          word: "how ",
          success: true,
          startS: 67.16,
          endS: 67.82,
        },
        {
          word: "far ",
          success: true,
          startS: 67.82,
          endS: 68.4,
        },
        {
          word: "away ",
          success: true,
          startS: 68.4,
          endS: 68.88,
        },
        {
          word: "you ",
          success: true,
          startS: 68.88,
          endS: 69.3,
        },
        {
          word: "might ",
          success: true,
          startS: 69.3,
          endS: 69.68,
        },
        {
          word: "be\n",
          success: true,
          startS: 69.68,
          endS: 70.16,
        },
        {
          word: "I ",
          success: true,
          startS: 70.68,
          endS: 70.84,
        },
        {
          word: "can ",
          success: true,
          startS: 70.84,
          endS: 70.96,
        },
        {
          word: "still ",
          success: true,
          startS: 70.96,
          endS: 71.26,
        },
        {
          word: "feel ",
          success: true,
          startS: 71.26,
          endS: 71.72,
        },
        {
          word: "the ",
          success: true,
          startS: 71.72,
          endS: 72.02,
        },
        {
          word: "weight ",
          success: true,
          startS: 72.02,
          endS: 72.58,
        },
        {
          word: "of ",
          success: true,
          startS: 72.58,
          endS: 72.94,
        },
        {
          word: "your ",
          success: true,
          startS: 72.94,
          endS: 73.1,
        },
        {
          word: "body ",
          success: true,
          startS: 73.1,
          endS: 73.74,
        },
        {
          word: "on ",
          success: true,
          startS: 73.74,
          endS: 74.3,
        },
        {
          word: "me\n",
          success: true,
          startS: 74.3,
          endS: 74.86,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 76.58,
          endS: 77.32,
        },
        {
          word: "that’s ",
          success: true,
          startS: 77.64,
          endS: 78.2,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 78.2,
          endS: 78.66,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 80.24,
          endS: 81.94,
        },
        {
          word: "that’s ",
          success: true,
          startS: 81.94,
          endS: 82.84,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 82.84,
          endS: 83.36,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 85.58,
          endS: 86.74,
        },
        {
          word: "that’s ",
          success: true,
          startS: 86.74,
          endS: 87.44,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 87.44,
          endS: 87.76,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 89.4,
          endS: 91.36,
        },
        {
          word: "that’s ",
          success: true,
          startS: 91.36,
          endS: 92.0,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 92.0,
          endS: 92.34,
        },
        {
          word: "Days ",
          success: true,
          startS: 107.82,
          endS: 107.82,
        },
        {
          word: "pass ",
          success: true,
          startS: 107.82,
          endS: 108.26,
        },
        {
          word: "me ",
          success: true,
          startS: 108.26,
          endS: 108.58,
        },
        {
          word: "by ",
          success: true,
          startS: 108.58,
          endS: 109.06,
        },
        {
          word: "and ",
          success: true,
          startS: 109.06,
          endS: 109.6,
        },
        {
          word: "the ",
          success: true,
          startS: 109.6,
          endS: 109.82,
        },
        {
          word: "phone ",
          success: true,
          startS: 109.82,
          endS: 110.22,
        },
        {
          word: "doesn't ",
          success: true,
          startS: 110.22,
          endS: 110.94,
        },
        {
          word: "ring\n",
          success: true,
          startS: 110.94,
          endS: 111.38,
        },
        {
          word: "You're ",
          success: true,
          startS: 111.74,
          endS: 112.62,
        },
        {
          word: "far ",
          success: true,
          startS: 112.62,
          endS: 113.0,
        },
        {
          word: "away ",
          success: true,
          startS: 113.0,
          endS: 113.66,
        },
        {
          word: "and ",
          success: true,
          startS: 113.66,
          endS: 114.26,
        },
        {
          word: "accelerating\n",
          success: true,
          startS: 114.26,
          endS: 115.5,
        },
        {
          word: "I'd ",
          success: true,
          startS: 116.54,
          endS: 117.3,
        },
        {
          word: "pull ",
          success: true,
          startS: 117.3,
          endS: 117.58,
        },
        {
          word: "you ",
          success: true,
          startS: 117.58,
          endS: 117.82,
        },
        {
          word: "back ",
          success: true,
          startS: 117.82,
          endS: 118.26,
        },
        {
          word: "if ",
          success: true,
          startS: 118.26,
          endS: 118.84,
        },
        {
          word: "I ",
          success: true,
          startS: 118.84,
          endS: 119.16,
        },
        {
          word: "had ",
          success: true,
          startS: 119.16,
          endS: 119.64,
        },
        {
          word: "enough ",
          success: true,
          startS: 119.64,
          endS: 120.02,
        },
        {
          word: "weight\n",
          success: true,
          startS: 120.02,
          endS: 120.64,
        },
        {
          word: "Escape ",
          success: true,
          startS: 121.44,
          endS: 121.96,
        },
        {
          word: "velocity ",
          success: true,
          startS: 121.96,
          endS: 123.0,
        },
        {
          word: "says ",
          success: true,
          startS: 123.0,
          endS: 124.02,
        },
        {
          word: "it's ",
          success: true,
          startS: 124.02,
          endS: 124.42,
        },
        {
          word: "too ",
          success: true,
          startS: 124.42,
          endS: 124.62,
        },
        {
          word: "late\n",
          success: true,
          startS: 124.72,
          endS: 125.54,
        },
        {
          word: "But ",
          success: true,
          startS: 125.86,
          endS: 125.9,
        },
        {
          word: "no ",
          success: true,
          startS: 125.9,
          endS: 126.32,
        },
        {
          word: "matter ",
          success: true,
          startS: 126.32,
          endS: 126.78,
        },
        {
          word: "how ",
          success: true,
          startS: 126.78,
          endS: 127.36,
        },
        {
          word: "far ",
          success: true,
          startS: 127.36,
          endS: 127.94,
        },
        {
          word: "away ",
          success: true,
          startS: 127.94,
          endS: 128.6,
        },
        {
          word: "you ",
          success: true,
          startS: 128.6,
          endS: 128.9,
        },
        {
          word: "might ",
          success: true,
          startS: 128.9,
          endS: 129.24,
        },
        {
          word: "be\n",
          success: true,
          startS: 129.24,
          endS: 129.82,
        },
        {
          word: "I ",
          success: true,
          startS: 130.0,
          endS: 130.46,
        },
        {
          word: "can ",
          success: true,
          startS: 130.46,
          endS: 130.6,
        },
        {
          word: "still ",
          success: true,
          startS: 130.6,
          endS: 130.9,
        },
        {
          word: "feel ",
          success: true,
          startS: 130.9,
          endS: 131.32,
        },
        {
          word: "the ",
          success: true,
          startS: 131.32,
          endS: 131.6,
        },
        {
          word: "weight ",
          success: true,
          startS: 131.6,
          endS: 132.08,
        },
        {
          word: "of ",
          success: true,
          startS: 132.08,
          endS: 132.56,
        },
        {
          word: "your ",
          success: true,
          startS: 132.56,
          endS: 132.72,
        },
        {
          word: "body ",
          success: true,
          startS: 132.72,
          endS: 133.34,
        },
        {
          word: "on ",
          success: true,
          startS: 133.34,
          endS: 133.98,
        },
        {
          word: "me\n",
          success: true,
          startS: 133.98,
          endS: 134.88,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 135.92,
          endS: 137.38,
        },
        {
          word: "that’s ",
          success: true,
          startS: 137.38,
          endS: 138.52,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 138.52,
          endS: 138.52,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 140.48,
          endS: 141.62,
        },
        {
          word: "that’s ",
          success: true,
          startS: 141.62,
          endS: 142.48,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 142.48,
          endS: 143.0,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 144.38,
          endS: 146.4,
        },
        {
          word: "that’s ",
          success: true,
          startS: 146.4,
          endS: 147.06,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 147.06,
          endS: 147.58,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 149.12,
          endS: 151.04,
        },
        {
          word: "that’s ",
          success: true,
          startS: 151.56,
          endS: 151.66,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 151.66,
          endS: 152.06,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 153.64,
          endS: 153.76,
        },
        {
          word: "that’s ",
          success: true,
          startS: 153.76,
          endS: 153.92,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 153.92,
          endS: 153.94,
        },
        {
          word: "Baby, ",
          success: true,
          startS: 153.94,
          endS: 154.6,
        },
        {
          word: "that’s ",
          success: true,
          startS: 158.38,
          endS: 160.88,
        },
        {
          word: "gravity\n",
          success: true,
          startS: 160.88,
          endS: 161.34,
        },
      ],
    },
  ],
  joyful: [
    {
      id: "1",
      // title: "What Is Love - Melanie Ungar",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=1204669&format=mp31&from=6t2WYTMKhQZd3IFwJmhgmQ%3D%3D%7CrurfNYLMs1VpakDYKh6YJw%3D%3D",
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
      alignedWords: [
        {
          word: "Put ",
          success: true,
          startS: 10.88,
          endS: 10.88,
        },
        {
          word: "on ",
          success: true,
          startS: 10.88,
          endS: 11.04,
        },
        {
          word: "my ",
          success: true,
          startS: 11.04,
          endS: 11.3,
        },
        {
          word: "red ",
          success: true,
          startS: 11.3,
          endS: 11.56,
        },
        {
          word: "heels ",
          success: true,
          startS: 11.56,
          endS: 12.02,
        },
        {
          word: "and ",
          success: true,
          startS: 12.02,
          endS: 12.22,
        },
        {
          word: "did ",
          success: true,
          startS: 12.22,
          endS: 12.42,
        },
        {
          word: "my ",
          success: true,
          startS: 12.42,
          endS: 12.72,
        },
        {
          word: "hair\n",
          success: true,
          startS: 12.72,
          endS: 13.54,
        },
        {
          word: "Waited ",
          success: true,
          startS: 13.86,
          endS: 16.28,
        },
        {
          word: "up ",
          success: true,
          startS: 16.28,
          endS: 16.44,
        },
        {
          word: "all ",
          success: true,
          startS: 16.44,
          endS: 16.72,
        },
        {
          word: "night ",
          success: true,
          startS: 16.72,
          endS: 17.14,
        },
        {
          word: "'cause ",
          success: true,
          startS: 17.14,
          endS: 17.36,
        },
        {
          word: "i ",
          success: true,
          startS: 17.36,
          endS: 17.54,
        },
        {
          word: "thought ",
          success: true,
          startS: 17.54,
          endS: 17.7,
        },
        {
          word: "you ",
          success: true,
          startS: 17.7,
          endS: 17.96,
        },
        {
          word: "care\n",
          success: true,
          startS: 17.96,
          endS: 18.06,
        },
        {
          word: "And ",
          success: true,
          startS: 20.92,
          endS: 21.3,
        },
        {
          word: "now ",
          success: true,
          startS: 21.3,
          endS: 21.76,
        },
        {
          word: "you're ",
          success: true,
          startS: 21.76,
          endS: 21.98,
        },
        {
          word: "calling ",
          success: true,
          startS: 21.98,
          endS: 22.4,
        },
        {
          word: "me, ",
          success: true,
          startS: 22.4,
          endS: 22.84,
        },
        {
          word: "saying ",
          success: true,
          startS: 22.84,
          endS: 23.32,
        },
        {
          word: '"babe, ',
          success: true,
          startS: 23.32,
          endS: 24.3,
        },
        {
          word: "don't ",
          success: true,
          startS: 24.3,
          endS: 24.54,
        },
        {
          word: "start ",
          success: true,
          startS: 24.54,
          endS: 24.92,
        },
        {
          word: "a ",
          success: true,
          startS: 24.92,
          endS: 25.1,
        },
        {
          word: "fight\n",
          success: true,
          startS: 25.1,
          endS: 25.48,
        },
        {
          word: "Stop ",
          success: true,
          startS: 26.2,
          endS: 26.5,
        },
        {
          word: "living ",
          success: true,
          startS: 26.5,
          endS: 26.84,
        },
        {
          word: "in ",
          success: true,
          startS: 26.84,
          endS: 27.2,
        },
        {
          word: "a ",
          success: true,
          startS: 27.2,
          endS: 27.22,
        },
        {
          word: 'fantasy," ',
          success: true,
          startS: 27.22,
          endS: 28.32,
        },
        {
          word: "uhm ",
          success: true,
          startS: 28.32,
          endS: 28.52,
        },
        {
          word: "sorry ",
          success: true,
          startS: 28.52,
          endS: 29.38,
        },
        {
          word: "excuse ",
          success: true,
          startS: 29.78,
          endS: 29.88,
        },
        {
          word: "me?\n",
          success: true,
          startS: 29.88,
          endS: 31.72,
        },
        {
          word: "This ",
          success: true,
          startS: 31.72,
          endS: 32.18,
        },
        {
          word: "isn't ",
          success: true,
          startS: 32.18,
          endS: 33.1,
        },
        {
          word: "how ",
          success: true,
          startS: 33.1,
          endS: 33.38,
        },
        {
          word: "i ",
          success: true,
          startS: 33.38,
          endS: 33.74,
        },
        {
          word: "thought ",
          success: true,
          startS: 33.74,
          endS: 34.4,
        },
        {
          word: "it ",
          success: true,
          startS: 34.4,
          endS: 34.68,
        },
        {
          word: "would ",
          success: true,
          startS: 34.68,
          endS: 35.04,
        },
        {
          word: "be,\n",
          success: true,
          startS: 35.04,
          endS: 36.26,
        },
        {
          word: "This ",
          success: true,
          startS: 36.26,
          endS: 36.92,
        },
        {
          word: "isn't ",
          success: true,
          startS: 36.92,
          endS: 37.3,
        },
        {
          word: "the ",
          success: true,
          startS: 37.3,
          endS: 37.48,
        },
        {
          word: "fairytale ",
          success: true,
          startS: 37.48,
          endS: 38.52,
        },
        {
          word: "you ",
          success: true,
          startS: 38.52,
          endS: 38.92,
        },
        {
          word: "promised ",
          success: true,
          startS: 38.92,
          endS: 39.62,
        },
        {
          word: "me\n",
          success: true,
          startS: 39.62,
          endS: 39.76,
        },
        {
          word: "What ",
          success: true,
          startS: 40.58,
          endS: 41.06,
        },
        {
          word: "is ",
          success: true,
          startS: 41.06,
          endS: 41.44,
        },
        {
          word: "love ",
          success: true,
          startS: 41.44,
          endS: 41.88,
        },
        {
          word: "'cause ",
          success: true,
          startS: 41.88,
          endS: 42.04,
        },
        {
          word: "i'm ",
          success: true,
          startS: 42.04,
          endS: 42.2,
        },
        {
          word: "really ",
          success: true,
          startS: 42.2,
          endS: 42.44,
        },
        {
          word: "not ",
          success: true,
          startS: 42.44,
          endS: 42.74,
        },
        {
          word: "sure ",
          success: true,
          startS: 42.74,
          endS: 43.1,
        },
        {
          word: "anymore\n",
          success: true,
          startS: 43.1,
          endS: 44.34,
        },
        {
          word: "Butterflies ",
          success: true,
          startS: 45.5,
          endS: 46.82,
        },
        {
          word: "in ",
          success: true,
          startS: 46.82,
          endS: 47.26,
        },
        {
          word: "my ",
          success: true,
          startS: 47.26,
          endS: 47.34,
        },
        {
          word: "stomach, ",
          success: true,
          startS: 47.34,
          endS: 47.9,
        },
        {
          word: "good ",
          success: true,
          startS: 47.9,
          endS: 47.98,
        },
        {
          word: "night ",
          success: true,
          startS: 47.98,
          endS: 47.98,
        },
        {
          word: "kisses ",
          success: true,
          startS: 47.98,
          endS: 48.42,
        },
        {
          word: "no ",
          success: true,
          startS: 48.42,
          endS: 48.96,
        },
        {
          word: "more\n",
          success: true,
          startS: 48.96,
          endS: 49.7,
        },
        {
          word: "Where ",
          success: true,
          startS: 51.2,
          endS: 51.52,
        },
        {
          word: "are ",
          success: true,
          startS: 51.52,
          endS: 51.68,
        },
        {
          word: "the ",
          success: true,
          startS: 51.68,
          endS: 51.86,
        },
        {
          word: "passion, ",
          success: true,
          startS: 51.86,
          endS: 52.6,
        },
        {
          word: "the ",
          success: true,
          startS: 52.6,
          endS: 52.78,
        },
        {
          word: "romance, ",
          success: true,
          startS: 52.78,
          endS: 53.64,
        },
        {
          word: "and ",
          success: true,
          startS: 53.64,
          endS: 54.12,
        },
        {
          word: "those ",
          success: true,
          startS: 54.12,
          endS: 54.4,
        },
        {
          word: "flowers ",
          success: true,
          startS: 54.4,
          endS: 54.86,
        },
        {
          word: "at ",
          success: true,
          startS: 54.86,
          endS: 55.24,
        },
        {
          word: "my ",
          success: true,
          startS: 55.24,
          endS: 55.48,
        },
        {
          word: "door?\n",
          success: true,
          startS: 55.48,
          endS: 56.44,
        },
        {
          word: "Where ",
          success: true,
          startS: 56.44,
          endS: 56.62,
        },
        {
          word: "is ",
          success: true,
          startS: 56.62,
          endS: 57.04,
        },
        {
          word: "love, ",
          success: true,
          startS: 57.04,
          endS: 57.46,
        },
        {
          word: "because ",
          success: true,
          startS: 57.46,
          endS: 57.86,
        },
        {
          word: "i ",
          success: true,
          startS: 57.86,
          endS: 58.3,
        },
        {
          word: "surely ",
          success: true,
          startS: 58.3,
          endS: 58.76,
        },
        {
          word: "don't ",
          success: true,
          startS: 58.76,
          endS: 59.5,
        },
        {
          word: "know?\n",
          success: true,
          startS: 59.5,
          endS: 61.3,
        },
        {
          word: "I ",
          success: true,
          startS: 61.3,
          endS: 61.84,
        },
        {
          word: "don't ",
          success: true,
          startS: 61.84,
          endS: 62.18,
        },
        {
          word: "know\n",
          success: true,
          startS: 67.42,
          endS: 67.52,
        },
        {
          word: "Remember ",
          success: true,
          startS: 68.58,
          endS: 68.58,
        },
        {
          word: "how ",
          success: true,
          startS: 68.58,
          endS: 69.08,
        },
        {
          word: "we ",
          success: true,
          startS: 69.08,
          endS: 69.34,
        },
        {
          word: "first ",
          success: true,
          startS: 69.34,
          endS: 69.72,
        },
        {
          word: "met,\n",
          success: true,
          startS: 69.72,
          endS: 70.88,
        },
        {
          word: "Or ",
          success: true,
          startS: 71.96,
          endS: 73.14,
        },
        {
          word: "did ",
          success: true,
          startS: 73.14,
          endS: 73.52,
        },
        {
          word: "you ",
          success: true,
          startS: 73.52,
          endS: 73.82,
        },
        {
          word: "already ",
          success: true,
          startS: 73.82,
          endS: 74.5,
        },
        {
          word: "forget?\n",
          success: true,
          startS: 75.4,
          endS: 76.1,
        },
        {
          word: "Like ",
          success: true,
          startS: 76.52,
          endS: 78.26,
        },
        {
          word: "the ",
          success: true,
          startS: 78.26,
          endS: 78.46,
        },
        {
          word: "time ",
          success: true,
          startS: 78.46,
          endS: 78.76,
        },
        {
          word: "you ",
          success: true,
          startS: 78.76,
          endS: 78.94,
        },
        {
          word: "forgot ",
          success: true,
          startS: 79.04,
          endS: 79.2,
        },
        {
          word: "my ",
          success: true,
          startS: 79.2,
          endS: 79.76,
        },
        {
          word: "birthday\n",
          success: true,
          startS: 79.76,
          endS: 80.94,
        },
        {
          word: "You ",
          success: true,
          startS: 81.94,
          endS: 83.32,
        },
        {
          word: "stood ",
          success: true,
          startS: 83.32,
          endS: 83.5,
        },
        {
          word: "there ",
          success: true,
          startS: 83.5,
          endS: 83.96,
        },
        {
          word: "with ",
          success: true,
          startS: 83.96,
          endS: 84.2,
        },
        {
          word: "nothing ",
          success: true,
          startS: 84.22,
          endS: 84.74,
        },
        {
          word: "to ",
          success: true,
          startS: 84.74,
          endS: 85.2,
        },
        {
          word: "say\n",
          success: true,
          startS: 85.2,
          endS: 85.66,
        },
        {
          word: "What ",
          success: true,
          startS: 88.06,
          endS: 88.74,
        },
        {
          word: "about ",
          success: true,
          startS: 88.74,
          endS: 89.08,
        },
        {
          word: "an ",
          success: true,
          startS: 89.08,
          endS: 89.4,
        },
        {
          word: "apology?\n",
          success: true,
          startS: 89.4,
          endS: 90.94,
        },
        {
          word: "Oh ",
          success: true,
          startS: 90.98,
          endS: 91.02,
        },
        {
          word: "yeah, ",
          success: true,
          startS: 91.02,
          endS: 91.8,
        },
        {
          word: "it's ",
          success: true,
          startS: 91.8,
          endS: 92.1,
        },
        {
          word: "only ",
          success: true,
          startS: 92.14,
          endS: 92.36,
        },
        {
          word: "me ",
          success: true,
          startS: 92.36,
          endS: 92.94,
        },
        {
          word: "(add ",
          success: true,
          startS: 92.94,
          endS: 93.84,
        },
        {
          word: "harmony)\n",
          success: true,
          startS: 93.84,
          endS: 93.84,
        },
        {
          word: "This ",
          success: true,
          startS: 94.0,
          endS: 94.48,
        },
        {
          word: "isn't ",
          success: true,
          startS: 94.48,
          endS: 95.34,
        },
        {
          word: "how ",
          success: true,
          startS: 95.34,
          endS: 95.66,
        },
        {
          word: "i ",
          success: true,
          startS: 95.66,
          endS: 96.02,
        },
        {
          word: "thought ",
          success: true,
          startS: 96.02,
          endS: 96.6,
        },
        {
          word: "it ",
          success: true,
          startS: 96.6,
          endS: 96.92,
        },
        {
          word: "would ",
          success: true,
          startS: 96.92,
          endS: 97.1,
        },
        {
          word: "be,\n",
          success: true,
          startS: 97.1,
          endS: 98.24,
        },
        {
          word: "This ",
          success: true,
          startS: 98.6,
          endS: 99.2,
        },
        {
          word: "isn't ",
          success: true,
          startS: 99.2,
          endS: 99.46,
        },
        {
          word: "the ",
          success: true,
          startS: 99.46,
          endS: 99.78,
        },
        {
          word: "fairytale ",
          success: true,
          startS: 99.78,
          endS: 100.78,
        },
        {
          word: "you ",
          success: true,
          startS: 100.78,
          endS: 101.16,
        },
        {
          word: "promised ",
          success: true,
          startS: 101.16,
          endS: 101.86,
        },
        {
          word: "me\n",
          success: true,
          startS: 101.86,
          endS: 102.54,
        },
        {
          word: "What ",
          success: true,
          startS: 103.2,
          endS: 103.4,
        },
        {
          word: "is ",
          success: true,
          startS: 103.4,
          endS: 103.64,
        },
        {
          word: "love ",
          success: true,
          startS: 103.64,
          endS: 104.1,
        },
        {
          word: "'cause ",
          success: true,
          startS: 104.1,
          endS: 104.3,
        },
        {
          word: "i'm ",
          success: true,
          startS: 104.4,
          endS: 104.46,
        },
        {
          word: "really ",
          success: true,
          startS: 104.46,
          endS: 104.66,
        },
        {
          word: "not ",
          success: true,
          startS: 104.66,
          endS: 104.98,
        },
        {
          word: "sure ",
          success: true,
          startS: 104.98,
          endS: 105.36,
        },
        {
          word: "anymore\n",
          success: true,
          startS: 105.36,
          endS: 106.62,
        },
        {
          word: "Butterflies ",
          success: true,
          startS: 107.7,
          endS: 109.18,
        },
        {
          word: "in ",
          success: true,
          startS: 109.18,
          endS: 109.52,
        },
        {
          word: "my ",
          success: true,
          startS: 109.52,
          endS: 109.6,
        },
        {
          word: "stomach, ",
          success: true,
          startS: 109.6,
          endS: 110.0,
        },
        {
          word: "good ",
          success: true,
          startS: 110.0,
          endS: 110.14,
        },
        {
          word: "night ",
          success: true,
          startS: 110.14,
          endS: 110.36,
        },
        {
          word: "kisses ",
          success: true,
          startS: 110.36,
          endS: 110.7,
        },
        {
          word: "no ",
          success: true,
          startS: 110.7,
          endS: 111.22,
        },
        {
          word: "more\n",
          success: true,
          startS: 111.22,
          endS: 112.56,
        },
        {
          word: "Where ",
          success: true,
          startS: 113.18,
          endS: 113.74,
        },
        {
          word: "are ",
          success: true,
          startS: 113.74,
          endS: 113.9,
        },
        {
          word: "the ",
          success: true,
          startS: 113.9,
          endS: 114.08,
        },
        {
          word: "passion, ",
          success: true,
          startS: 114.08,
          endS: 114.86,
        },
        {
          word: "the ",
          success: true,
          startS: 114.86,
          endS: 115.08,
        },
        {
          word: "romance, ",
          success: true,
          startS: 115.08,
          endS: 116.16,
        },
        {
          word: "and ",
          success: true,
          startS: 116.16,
          endS: 116.44,
        },
        {
          word: "those ",
          success: true,
          startS: 116.44,
          endS: 116.66,
        },
        {
          word: "flowers ",
          success: true,
          startS: 116.66,
          endS: 117.08,
        },
        {
          word: "at ",
          success: true,
          startS: 117.08,
          endS: 117.5,
        },
        {
          word: "my ",
          success: true,
          startS: 117.5,
          endS: 117.74,
        },
        {
          word: "door?\n",
          success: true,
          startS: 117.74,
          endS: 118.68,
        },
        {
          word: "Where ",
          success: true,
          startS: 118.68,
          endS: 118.9,
        },
        {
          word: "is ",
          success: true,
          startS: 118.9,
          endS: 119.32,
        },
        {
          word: "love, ",
          success: true,
          startS: 119.32,
          endS: 119.8,
        },
        {
          word: "because ",
          success: true,
          startS: 119.8,
          endS: 120.12,
        },
        {
          word: "i ",
          success: true,
          startS: 120.12,
          endS: 120.54,
        },
        {
          word: "surely ",
          success: true,
          startS: 120.54,
          endS: 120.96,
        },
        {
          word: "don't ",
          success: true,
          startS: 120.96,
          endS: 121.76,
        },
        {
          word: "know?\n",
          success: true,
          startS: 121.76,
          endS: 123.86,
        },
        {
          word: "I ",
          success: true,
          startS: 123.88,
          endS: 124.08,
        },
        {
          word: "don't ",
          success: true,
          startS: 124.08,
          endS: 124.52,
        },
        {
          word: "know\n",
          success: true,
          startS: 124.52,
          endS: 125.22,
        },
        {
          word: "Oh ",
          success: true,
          startS: 134.56,
          endS: 134.56,
        },
        {
          word: "help ",
          success: true,
          startS: 134.56,
          endS: 134.56,
        },
        {
          word: "me ",
          success: true,
          startS: 134.56,
          endS: 134.7,
        },
        {
          word: "tap ",
          success: true,
          startS: 134.7,
          endS: 135.14,
        },
        {
          word: "3 ",
          success: true,
          startS: 135.14,
          endS: 135.5,
        },
        {
          word: "times ",
          success: true,
          startS: 135.5,
          endS: 135.88,
        },
        {
          word: "to ",
          success: true,
          startS: 135.88,
          endS: 136.1,
        },
        {
          word: "get ",
          success: true,
          startS: 136.1,
          endS: 136.38,
        },
        {
          word: "rid ",
          success: true,
          startS: 136.38,
          endS: 136.66,
        },
        {
          word: "of ",
          success: true,
          startS: 136.66,
          endS: 136.9,
        },
        {
          word: "you, ",
          success: true,
          startS: 136.9,
          endS: 137.18,
        },
        {
          word: "i ",
          success: true,
          startS: 137.18,
          endS: 137.4,
        },
        {
          word: "wanna ",
          success: true,
          startS: 137.4,
          endS: 137.52,
        },
        {
          word: "tap ",
          success: true,
          startS: 137.52,
          endS: 137.86,
        },
        {
          word: "my ",
          success: true,
          startS: 137.86,
          endS: 138.2,
        },
        {
          word: "heels ",
          success: true,
          startS: 138.2,
          endS: 138.5,
        },
        {
          word: "and ",
          success: true,
          startS: 138.5,
          endS: 138.7,
        },
        {
          word: "get ",
          success: true,
          startS: 138.7,
          endS: 138.88,
        },
        {
          word: "over ",
          success: true,
          startS: 138.88,
          endS: 139.38,
        },
        {
          word: "you ",
          success: true,
          startS: 139.38,
          endS: 139.76,
        },
        {
          word: "(x2)\n",
          success: true,
          startS: 139.76,
          endS: 142.44,
        },
        {
          word: "Over ",
          success: true,
          startS: 144.68,
          endS: 144.76,
        },
        {
          word: "you, ",
          success: true,
          startS: 144.76,
          endS: 145.94,
        },
        {
          word: "over ",
          success: true,
          startS: 149.28,
          endS: 150.12,
        },
        {
          word: "you\n",
          success: true,
          startS: 154.6,
          endS: 155.24,
        },
        {
          word: "What ",
          success: true,
          startS: 155.24,
          endS: 155.24,
        },
        {
          word: "is ",
          success: true,
          startS: 155.24,
          endS: 155.58,
        },
        {
          word: "love ",
          success: true,
          startS: 155.6,
          endS: 156.06,
        },
        {
          word: "'cause ",
          success: true,
          startS: 156.06,
          endS: 156.32,
        },
        {
          word: "i'm ",
          success: true,
          startS: 156.32,
          endS: 156.32,
        },
        {
          word: "really ",
          success: true,
          startS: 156.32,
          endS: 156.54,
        },
        {
          word: "not ",
          success: true,
          startS: 156.54,
          endS: 156.84,
        },
        {
          word: "sure ",
          success: true,
          startS: 156.84,
          endS: 157.22,
        },
        {
          word: "anymore\n",
          success: true,
          startS: 157.22,
          endS: 158.5,
        },
        {
          word: "What ",
          success: true,
          startS: 160.34,
          endS: 160.52,
        },
        {
          word: "is ",
          success: true,
          startS: 160.52,
          endS: 160.88,
        },
        {
          word: "love ",
          success: true,
          startS: 160.88,
          endS: 161.34,
        },
        {
          word: "'cause ",
          success: true,
          startS: 161.34,
          endS: 161.54,
        },
        {
          word: "i'm ",
          success: true,
          startS: 161.6,
          endS: 161.7,
        },
        {
          word: "really ",
          success: true,
          startS: 161.7,
          endS: 161.9,
        },
        {
          word: "not ",
          success: true,
          startS: 161.9,
          endS: 162.18,
        },
        {
          word: "sure ",
          success: true,
          startS: 162.18,
          endS: 162.7,
        },
        {
          word: "anymore\n",
          success: true,
          startS: 162.7,
          endS: 163.52,
        },
        {
          word: "What ",
          success: true,
          startS: 165.56,
          endS: 165.82,
        },
        {
          word: "is ",
          success: true,
          startS: 165.82,
          endS: 166.14,
        },
        {
          word: "love ",
          success: true,
          startS: 166.14,
          endS: 166.62,
        },
        {
          word: "'cause ",
          success: true,
          startS: 166.62,
          endS: 166.78,
        },
        {
          word: "i'm ",
          success: true,
          startS: 166.78,
          endS: 166.96,
        },
        {
          word: "really ",
          success: true,
          startS: 166.96,
          endS: 167.16,
        },
        {
          word: "not ",
          success: true,
          startS: 167.16,
          endS: 167.44,
        },
        {
          word: "sure ",
          success: true,
          startS: 167.44,
          endS: 167.86,
        },
        {
          word: "anymore\n",
          success: true,
          startS: 167.86,
          endS: 168.88,
        },
        {
          word: "Butterflies ",
          success: true,
          startS: 170.78,
          endS: 171.68,
        },
        {
          word: "in ",
          success: true,
          startS: 171.68,
          endS: 171.98,
        },
        {
          word: "my ",
          success: true,
          startS: 171.98,
          endS: 172.1,
        },
        {
          word: "stomach, ",
          success: true,
          startS: 172.1,
          endS: 172.48,
        },
        {
          word: "good ",
          success: true,
          startS: 172.48,
          endS: 172.62,
        },
        {
          word: "night ",
          success: true,
          startS: 172.62,
          endS: 172.74,
        },
        {
          word: "kisses ",
          success: true,
          startS: 172.74,
          endS: 173.2,
        },
        {
          word: "no ",
          success: true,
          startS: 173.2,
          endS: 173.74,
        },
        {
          word: "more\n",
          success: true,
          startS: 173.74,
          endS: 174.42,
        },
        {
          word: "Where ",
          success: true,
          startS: 175.94,
          endS: 176.24,
        },
        {
          word: "is ",
          success: true,
          startS: 176.24,
          endS: 176.5,
        },
        {
          word: "the ",
          success: true,
          startS: 176.5,
          endS: 176.66,
        },
        {
          word: "passion, ",
          success: true,
          startS: 176.66,
          endS: 177.38,
        },
        {
          word: "the ",
          success: true,
          startS: 177.38,
          endS: 177.58,
        },
        {
          word: "romance, ",
          success: true,
          startS: 177.58,
          endS: 178.64,
        },
        {
          word: "and ",
          success: true,
          startS: 178.64,
          endS: 178.9,
        },
        {
          word: "those ",
          success: true,
          startS: 178.9,
          endS: 179.16,
        },
        {
          word: "flowers ",
          success: true,
          startS: 179.16,
          endS: 179.6,
        },
        {
          word: "at ",
          success: true,
          startS: 179.6,
          endS: 180.0,
        },
        {
          word: "my ",
          success: true,
          startS: 180.0,
          endS: 180.28,
        },
        {
          word: "door?\n",
          success: true,
          startS: 180.28,
          endS: 181.16,
        },
        {
          word: "Where ",
          success: true,
          startS: 181.16,
          endS: 181.4,
        },
        {
          word: "is ",
          success: true,
          startS: 181.4,
          endS: 181.78,
        },
        {
          word: "love, ",
          success: true,
          startS: 181.78,
          endS: 182.24,
        },
        {
          word: "because ",
          success: true,
          startS: 182.24,
          endS: 182.62,
        },
        {
          word: "i ",
          success: true,
          startS: 182.62,
          endS: 183.02,
        },
        {
          word: "surely ",
          success: true,
          startS: 183.02,
          endS: 183.5,
        },
        {
          word: "don't ",
          success: true,
          startS: 183.5,
          endS: 184.32,
        },
        {
          word: "know?\n",
          success: true,
          startS: 184.32,
          endS: 184.58,
        },
        {
          word: "What ",
          success: true,
          startS: 187.02,
          endS: 187.02,
        },
        {
          word: "is ",
          success: true,
          startS: 187.02,
          endS: 187.02,
        },
        {
          word: "love ",
          success: true,
          startS: 187.02,
          endS: 187.42,
        },
        {
          word: "'cause ",
          success: true,
          startS: 187.42,
          endS: 187.68,
        },
        {
          word: "i'm ",
          success: true,
          startS: 187.68,
          endS: 187.68,
        },
        {
          word: "really ",
          success: true,
          startS: 187.68,
          endS: 187.96,
        },
        {
          word: "not ",
          success: true,
          startS: 187.96,
          endS: 188.26,
        },
        {
          word: "sure ",
          success: true,
          startS: 188.26,
          endS: 188.62,
        },
        {
          word: "anymore\n",
          success: true,
          startS: 188.62,
          endS: 189.78,
        },
        {
          word: "Butterflies ",
          success: true,
          startS: 191.06,
          endS: 192.4,
        },
        {
          word: "in ",
          success: true,
          startS: 192.4,
          endS: 192.7,
        },
        {
          word: "my ",
          success: true,
          startS: 192.7,
          endS: 192.88,
        },
        {
          word: "stomach, ",
          success: true,
          startS: 192.88,
          endS: 193.22,
        },
        {
          word: "good ",
          success: true,
          startS: 193.22,
          endS: 193.38,
        },
        {
          word: "night ",
          success: true,
          startS: 193.38,
          endS: 193.5,
        },
        {
          word: "kisses ",
          success: true,
          startS: 193.5,
          endS: 193.92,
        },
        {
          word: "no ",
          success: true,
          startS: 193.92,
          endS: 194.5,
        },
        {
          word: "more\n",
          success: true,
          startS: 194.5,
          endS: 195.16,
        },
        {
          word: "I ",
          success: true,
          startS: 196.5,
          endS: 196.94,
        },
        {
          word: "need ",
          success: true,
          startS: 196.94,
          endS: 197.2,
        },
        {
          word: "the ",
          success: true,
          startS: 197.2,
          endS: 197.46,
        },
        {
          word: "passion, ",
          success: true,
          startS: 197.46,
          endS: 198.12,
        },
        {
          word: "the ",
          success: true,
          startS: 198.12,
          endS: 198.34,
        },
        {
          word: "romance, ",
          success: true,
          startS: 198.34,
          endS: 199.16,
        },
        {
          word: "and ",
          success: true,
          startS: 199.16,
          endS: 199.7,
        },
        {
          word: "those ",
          success: true,
          startS: 199.7,
          endS: 199.92,
        },
        {
          word: "flowers ",
          success: true,
          startS: 199.92,
          endS: 200.36,
        },
        {
          word: "at ",
          success: true,
          startS: 200.36,
          endS: 200.78,
        },
        {
          word: "my ",
          success: true,
          startS: 200.78,
          endS: 201.0,
        },
        {
          word: "door?\n",
          success: true,
          startS: 201.0,
          endS: 201.94,
        },
        {
          word: "Where ",
          success: true,
          startS: 201.96,
          endS: 202.2,
        },
        {
          word: "is ",
          success: true,
          startS: 202.2,
          endS: 202.56,
        },
        {
          word: "love ",
          success: true,
          startS: 202.56,
          endS: 202.96,
        },
        {
          word: "'cause ",
          success: true,
          startS: 202.96,
          endS: 203.36,
        },
        {
          word: "it's ",
          success: true,
          startS: 203.36,
          endS: 203.4,
        },
        {
          word: "not ",
          success: true,
          startS: 203.4,
          endS: 203.46,
        },
        {
          word: "with ",
          success: true,
          startS: 203.46,
          endS: 203.7,
        },
        {
          word: "you ",
          success: true,
          startS: 203.7,
          endS: 204.16,
        },
        {
          word: "anymore\n",
          success: true,
          startS: 204.16,
          endS: 205.12,
        },
        {
          word: "Anymore!\n",
          success: true,
          startS: 207.06,
          endS: 208.24,
        },
      ],
    },
    {
      id: "2",
      // title: "It Could Be You - STEEP",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=1162014&format=mp31&from=1fSrPI%2Bo%2B%2FSFP5HUtpBmaA%3D%3D%7C1KVr%2FrUy89Ae22SUa49uTw%3D%3D",
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
      alignedWords: [
        {
          word: "Another ",
          success: true,
          startS: 13.98,
          endS: 14.1,
        },
        {
          word: "place, ",
          success: true,
          startS: 14.1,
          endS: 14.52,
        },
        {
          word: "another ",
          success: true,
          startS: 14.52,
          endS: 14.72,
        },
        {
          word: "town, ",
          success: true,
          startS: 14.72,
          endS: 15.12,
        },
        {
          word: "memories ",
          success: true,
          startS: 15.12,
          endS: 15.36,
        },
        {
          word: "lost, ",
          success: true,
          startS: 15.36,
          endS: 15.8,
        },
        {
          word: "but ",
          success: true,
          startS: 15.8,
          endS: 15.94,
        },
        {
          word: "for ",
          success: true,
          startS: 15.94,
          endS: 16.12,
        },
        {
          word: "now\n",
          success: true,
          startS: 16.12,
          endS: 16.36,
        },
        {
          word: "Breathing ",
          success: true,
          startS: 16.54,
          endS: 16.84,
        },
        {
          word: "in, ",
          success: true,
          startS: 16.84,
          endS: 17.14,
        },
        {
          word: "breathing ",
          success: true,
          startS: 17.14,
          endS: 17.36,
        },
        {
          word: "out ",
          success: true,
          startS: 17.36,
          endS: 17.68,
        },
        {
          word: "to ",
          success: true,
          startS: 17.68,
          endS: 17.82,
        },
        {
          word: "get ",
          success: true,
          startS: 17.82,
          endS: 17.96,
        },
        {
          word: "my ",
          success: true,
          startS: 17.96,
          endS: 18.14,
        },
        {
          word: "thoughts ",
          success: true,
          startS: 18.14,
          endS: 18.3,
        },
        {
          word: "back ",
          success: true,
          startS: 18.3,
          endS: 18.48,
        },
        {
          word: "off ",
          success: true,
          startS: 18.48,
          endS: 18.7,
        },
        {
          word: "the ",
          success: true,
          startS: 18.7,
          endS: 18.8,
        },
        {
          word: "ground\n",
          success: true,
          startS: 18.8,
          endS: 19.1,
        },
        {
          word: "Walking ",
          success: true,
          startS: 19.28,
          endS: 19.38,
        },
        {
          word: "down ",
          success: true,
          startS: 19.38,
          endS: 19.76,
        },
        {
          word: "another ",
          success: true,
          startS: 19.76,
          endS: 20.08,
        },
        {
          word: "street, ",
          success: true,
          startS: 20.08,
          endS: 20.54,
        },
        {
          word: "passing ",
          success: true,
          startS: 20.54,
          endS: 20.78,
        },
        {
          word: "by, ",
          success: true,
          startS: 20.78,
          endS: 21.14,
        },
        {
          word: "people ",
          success: true,
          startS: 21.14,
          endS: 21.36,
        },
        {
          word: "meet\n",
          success: true,
          startS: 21.36,
          endS: 21.64,
        },
        {
          word: "anyhow, ",
          success: true,
          startS: 21.9,
          endS: 22.42,
        },
        {
          word: "just ",
          success: true,
          startS: 22.42,
          endS: 22.6,
        },
        {
          word: "for ",
          success: true,
          startS: 22.6,
          endS: 22.8,
        },
        {
          word: "now ",
          success: true,
          startS: 22.8,
          endS: 23.0,
        },
        {
          word: "I'm ",
          success: true,
          startS: 23.0,
          endS: 23.18,
        },
        {
          word: "realizing ",
          success: true,
          startS: 23.18,
          endS: 23.58,
        },
        {
          word: "what ",
          success: true,
          startS: 23.58,
          endS: 23.98,
        },
        {
          word: "I ",
          success: true,
          startS: 23.98,
          endS: 24.16,
        },
        {
          word: "need\n",
          success: true,
          startS: 24.16,
          endS: 24.42,
        },
        {
          word: "And ",
          success: true,
          startS: 24.98,
          endS: 25.18,
        },
        {
          word: "then ",
          success: true,
          startS: 25.18,
          endS: 25.36,
        },
        {
          word: "you ",
          success: true,
          startS: 25.36,
          endS: 25.76,
        },
        {
          word: "come ",
          success: true,
          startS: 25.76,
          endS: 26.48,
        },
        {
          word: "to ",
          success: true,
          startS: 26.48,
          endS: 26.64,
        },
        {
          word: "my ",
          success: true,
          startS: 26.64,
          endS: 26.84,
        },
        {
          word: "mind\n",
          success: true,
          startS: 26.84,
          endS: 27.18,
        },
        {
          word: "well ",
          success: true,
          startS: 28.24,
          endS: 28.66,
        },
        {
          word: "I ",
          success: true,
          startS: 28.66,
          endS: 28.84,
        },
        {
          word: "guess ",
          success: true,
          startS: 28.84,
          endS: 28.94,
        },
        {
          word: "that's ",
          success: true,
          startS: 28.94,
          endS: 29.18,
        },
        {
          word: "kinda ",
          success: true,
          startS: 29.18,
          endS: 29.4,
        },
        {
          word: "sign\n",
          success: true,
          startS: 29.4,
          endS: 29.84,
        },
        {
          word: "Don't ",
          success: true,
          startS: 30.38,
          endS: 30.52,
        },
        {
          word: "take ",
          success: true,
          startS: 30.52,
          endS: 30.74,
        },
        {
          word: "long ",
          success: true,
          startS: 30.74,
          endS: 31.06,
        },
        {
          word: "to ",
          success: true,
          startS: 31.06,
          endS: 31.8,
        },
        {
          word: "realize\n",
          success: true,
          startS: 31.8,
          endS: 32.34,
        },
        {
          word: "I ",
          success: true,
          startS: 33.02,
          endS: 33.14,
        },
        {
          word: "think ",
          success: true,
          startS: 33.14,
          endS: 33.34,
        },
        {
          word: "it's ",
          success: true,
          startS: 33.34,
          endS: 33.54,
        },
        {
          word: "time, ",
          success: true,
          startS: 33.54,
          endS: 33.74,
        },
        {
          word: "so ",
          success: true,
          startS: 33.74,
          endS: 34.0,
        },
        {
          word: "I ",
          success: true,
          startS: 34.0,
          endS: 34.18,
        },
        {
          word: "raise ",
          success: true,
          startS: 34.18,
          endS: 34.36,
        },
        {
          word: "my ",
          success: true,
          startS: 34.36,
          endS: 34.5,
        },
        {
          word: "pace ",
          success: true,
          startS: 34.5,
          endS: 34.66,
        },
        {
          word: "and\n",
          success: true,
          startS: 34.66,
          endS: 34.82,
        },
        {
          word: "I ",
          success: true,
          startS: 34.98,
          endS: 35.12,
        },
        {
          word: "am ",
          success: true,
          startS: 35.12,
          endS: 35.44,
        },
        {
          word: "running ",
          success: true,
          startS: 35.44,
          endS: 35.76,
        },
        {
          word: "around, ",
          success: true,
          startS: 35.76,
          endS: 36.82,
        },
        {
          word: "looking ",
          success: true,
          startS: 36.82,
          endS: 37.24,
        },
        {
          word: "for ",
          success: true,
          startS: 37.24,
          endS: 37.52,
        },
        {
          word: "you\n",
          success: true,
          startS: 37.52,
          endS: 37.82,
        },
        {
          word: "It ",
          success: true,
          startS: 37.98,
          endS: 37.98,
        },
        {
          word: "could ",
          success: true,
          startS: 37.98,
          endS: 37.98,
        },
        {
          word: "be ",
          success: true,
          startS: 37.98,
          endS: 38.2,
        },
        {
          word: "you, ",
          success: true,
          startS: 38.2,
          endS: 38.44,
        },
        {
          word: "It ",
          success: true,
          startS: 38.44,
          endS: 38.64,
        },
        {
          word: "could ",
          success: true,
          startS: 38.64,
          endS: 38.64,
        },
        {
          word: "be ",
          success: true,
          startS: 38.64,
          endS: 38.84,
        },
        {
          word: "you, ",
          success: true,
          startS: 38.84,
          endS: 39.1,
        },
        {
          word: "It ",
          success: true,
          startS: 39.1,
          endS: 39.34,
        },
        {
          word: "could ",
          success: true,
          startS: 39.34,
          endS: 39.34,
        },
        {
          word: "be ",
          success: true,
          startS: 39.34,
          endS: 39.54,
        },
        {
          word: "you\n",
          success: true,
          startS: 39.54,
          endS: 39.76,
        },
        {
          word: "Searching ",
          success: true,
          startS: 40.16,
          endS: 40.8,
        },
        {
          word: "all ",
          success: true,
          startS: 40.8,
          endS: 41.06,
        },
        {
          word: "over ",
          success: true,
          startS: 41.06,
          endS: 41.22,
        },
        {
          word: "town, ",
          success: true,
          startS: 41.22,
          endS: 42.26,
        },
        {
          word: "just ",
          success: true,
          startS: 42.26,
          endS: 42.5,
        },
        {
          word: "to ",
          success: true,
          startS: 42.5,
          endS: 42.72,
        },
        {
          word: "be ",
          success: true,
          startS: 42.72,
          endS: 42.86,
        },
        {
          word: "sure\n",
          success: true,
          startS: 42.86,
          endS: 43.1,
        },
        {
          word: "It ",
          success: true,
          startS: 43.34,
          endS: 43.34,
        },
        {
          word: "could ",
          success: true,
          startS: 43.34,
          endS: 43.34,
        },
        {
          word: "be ",
          success: true,
          startS: 43.34,
          endS: 43.56,
        },
        {
          word: "you, ",
          success: true,
          startS: 43.56,
          endS: 43.84,
        },
        {
          word: "It ",
          success: true,
          startS: 43.84,
          endS: 44.0,
        },
        {
          word: "could ",
          success: true,
          startS: 44.0,
          endS: 44.0,
        },
        {
          word: "be ",
          success: true,
          startS: 44.0,
          endS: 44.18,
        },
        {
          word: "you, ",
          success: true,
          startS: 44.18,
          endS: 44.46,
        },
        {
          word: "It ",
          success: true,
          startS: 44.46,
          endS: 45.16,
        },
        {
          word: "could ",
          success: true,
          startS: 45.16,
          endS: 45.3,
        },
        {
          word: "be ",
          success: true,
          startS: 45.3,
          endS: 45.44,
        },
        {
          word: "you\n",
          success: true,
          startS: 45.44,
          endS: 45.5,
        },
        {
          word: "Where ",
          success: true,
          startS: 45.52,
          endS: 45.74,
        },
        {
          word: "you're ",
          success: true,
          startS: 45.74,
          endS: 46.22,
        },
        {
          word: "hanging ",
          success: true,
          startS: 46.22,
          endS: 46.5,
        },
        {
          word: "around, ",
          success: true,
          startS: 46.5,
          endS: 47.74,
        },
        {
          word: "seems ",
          success: true,
          startS: 47.74,
          endS: 47.88,
        },
        {
          word: "nothing ",
          success: true,
          startS: 47.88,
          endS: 48.08,
        },
        {
          word: "new\n",
          success: true,
          startS: 48.08,
          endS: 48.46,
        },
        {
          word: "It ",
          success: true,
          startS: 48.6,
          endS: 48.7,
        },
        {
          word: "could ",
          success: true,
          startS: 48.7,
          endS: 48.7,
        },
        {
          word: "be ",
          success: true,
          startS: 48.7,
          endS: 48.9,
        },
        {
          word: "you, ",
          success: true,
          startS: 48.9,
          endS: 49.16,
        },
        {
          word: "It ",
          success: true,
          startS: 49.16,
          endS: 49.38,
        },
        {
          word: "could ",
          success: true,
          startS: 49.38,
          endS: 49.38,
        },
        {
          word: "be ",
          success: true,
          startS: 49.38,
          endS: 49.52,
        },
        {
          word: "you, ",
          success: true,
          startS: 49.52,
          endS: 49.84,
        },
        {
          word: "It ",
          success: true,
          startS: 49.84,
          endS: 50.02,
        },
        {
          word: "could ",
          success: true,
          startS: 50.02,
          endS: 50.02,
        },
        {
          word: "be ",
          success: true,
          startS: 50.02,
          endS: 50.2,
        },
        {
          word: "you\n",
          success: true,
          startS: 50.2,
          endS: 50.42,
        },
        {
          word: "I’m ",
          success: true,
          startS: 50.84,
          endS: 50.9,
        },
        {
          word: "finally ",
          success: true,
          startS: 50.9,
          endS: 51.36,
        },
        {
          word: "asking ",
          success: true,
          startS: 51.36,
          endS: 51.76,
        },
        {
          word: "you ",
          success: true,
          startS: 51.76,
          endS: 52.06,
        },
        {
          word: "out: ",
          success: true,
          startS: 52.06,
          endS: 52.92,
        },
        {
          word: "how ",
          success: true,
          startS: 52.92,
          endS: 53.22,
        },
        {
          word: "do ",
          success: true,
          startS: 53.22,
          endS: 53.36,
        },
        {
          word: "you ",
          success: true,
          startS: 53.36,
          endS: 53.56,
        },
        {
          word: "do, ",
          success: true,
          startS: 53.56,
          endS: 53.9,
        },
        {
          word: "do, ",
          success: true,
          startS: 53.9,
          endS: 54.16,
        },
        {
          word: "do, ",
          success: true,
          startS: 54.16,
          endS: 54.7,
        },
        {
          word: "do?\n",
          success: true,
          startS: 66.92,
          endS: 67.38,
        },
        {
          word: "Look ",
          success: true,
          startS: 67.38,
          endS: 67.38,
        },
        {
          word: "around, ",
          success: true,
          startS: 67.38,
          endS: 67.82,
        },
        {
          word: "see ",
          success: true,
          startS: 67.82,
          endS: 67.98,
        },
        {
          word: "me ",
          success: true,
          startS: 67.98,
          endS: 68.08,
        },
        {
          word: "stare, ",
          success: true,
          startS: 68.08,
          endS: 68.48,
        },
        {
          word: "looking ",
          success: true,
          startS: 68.48,
          endS: 68.78,
        },
        {
          word: "back, ",
          success: true,
          startS: 68.78,
          endS: 69.18,
        },
        {
          word: "now ",
          success: true,
          startS: 69.18,
          endS: 69.36,
        },
        {
          word: "I'm ",
          success: true,
          startS: 69.36,
          endS: 69.48,
        },
        {
          word: "there\n",
          success: true,
          startS: 69.48,
          endS: 69.74,
        },
        {
          word: "in ",
          success: true,
          startS: 69.92,
          endS: 69.96,
        },
        {
          word: "the ",
          success: true,
          startS: 69.96,
          endS: 70.1,
        },
        {
          word: "sand, ",
          success: true,
          startS: 70.1,
          endS: 70.42,
        },
        {
          word: "take ",
          success: true,
          startS: 70.42,
          endS: 70.64,
        },
        {
          word: "my ",
          success: true,
          startS: 70.64,
          endS: 70.8,
        },
        {
          word: "hand, ",
          success: true,
          startS: 70.8,
          endS: 71.0,
        },
        {
          word: "let's ",
          success: true,
          startS: 71.0,
          endS: 71.18,
        },
        {
          word: "find ",
          success: true,
          startS: 71.18,
          endS: 71.26,
        },
        {
          word: "something ",
          success: true,
          startS: 71.26,
          endS: 71.48,
        },
        {
          word: "for ",
          success: true,
          startS: 71.48,
          endS: 71.84,
        },
        {
          word: "us ",
          success: true,
          startS: 71.84,
          endS: 71.96,
        },
        {
          word: "to ",
          success: true,
          startS: 71.96,
          endS: 72.1,
        },
        {
          word: "share\n",
          success: true,
          startS: 72.1,
          endS: 72.4,
        },
        {
          word: "Making ",
          success: true,
          startS: 72.5,
          endS: 72.7,
        },
        {
          word: "out, ",
          success: true,
          startS: 72.7,
          endS: 73.2,
        },
        {
          word: "touching ",
          success: true,
          startS: 73.2,
          endS: 73.42,
        },
        {
          word: "down, ",
          success: true,
          startS: 73.42,
          endS: 73.84,
        },
        {
          word: "every ",
          success: true,
          startS: 73.84,
          endS: 74.04,
        },
        {
          word: "smile ",
          success: true,
          startS: 74.04,
          endS: 74.32,
        },
        {
          word: "in ",
          success: true,
          startS: 74.32,
          endS: 74.68,
        },
        {
          word: "your ",
          success: true,
          startS: 74.68,
          endS: 74.76,
        },
        {
          word: "face,\n",
          success: true,
          startS: 74.76,
          endS: 75.04,
        },
        {
          word: "seems ",
          success: true,
          startS: 75.28,
          endS: 75.32,
        },
        {
          word: "to ",
          success: true,
          startS: 75.32,
          endS: 75.5,
        },
        {
          word: "me, ",
          success: true,
          startS: 75.5,
          endS: 75.8,
        },
        {
          word: "brings ",
          success: true,
          startS: 75.8,
          endS: 76.0,
        },
        {
          word: "up ",
          success: true,
          startS: 76.0,
          endS: 76.18,
        },
        {
          word: "thoughts ",
          success: true,
          startS: 76.18,
          endS: 76.32,
        },
        {
          word: "of ",
          success: true,
          startS: 76.32,
          endS: 76.52,
        },
        {
          word: "every ",
          success: true,
          startS: 76.52,
          endS: 76.74,
        },
        {
          word: "second ",
          success: true,
          startS: 76.74,
          endS: 77.06,
        },
        {
          word: "that ",
          success: true,
          startS: 77.06,
          endS: 77.4,
        },
        {
          word: "I ",
          success: true,
          startS: 77.4,
          endS: 77.52,
        },
        {
          word: "wasted\n",
          success: true,
          startS: 77.52,
          endS: 77.86,
        },
        {
          word: "Without ",
          success: true,
          startS: 78.3,
          endS: 78.62,
        },
        {
          word: "you ",
          success: true,
          startS: 78.62,
          endS: 79.06,
        },
        {
          word: "right ",
          success: true,
          startS: 79.06,
          endS: 79.8,
        },
        {
          word: "by ",
          success: true,
          startS: 79.8,
          endS: 79.98,
        },
        {
          word: "my ",
          success: true,
          startS: 79.98,
          endS: 80.08,
        },
        {
          word: "side\n",
          success: true,
          startS: 80.08,
          endS: 80.58,
        },
        {
          word: "How ",
          success: true,
          startS: 81.16,
          endS: 81.86,
        },
        {
          word: "did ",
          success: true,
          startS: 81.86,
          endS: 82.0,
        },
        {
          word: "manage ",
          success: true,
          startS: 82.0,
          endS: 82.26,
        },
        {
          word: "just ",
          success: true,
          startS: 82.26,
          endS: 82.66,
        },
        {
          word: "to ",
          success: true,
          startS: 82.66,
          endS: 82.84,
        },
        {
          word: "hide\n",
          success: true,
          startS: 82.84,
          endS: 83.18,
        },
        {
          word: "that ",
          success: true,
          startS: 83.54,
          endS: 83.84,
        },
        {
          word: "this ",
          success: true,
          startS: 83.84,
          endS: 84.0,
        },
        {
          word: "feels ",
          success: true,
          startS: 84.0,
          endS: 84.48,
        },
        {
          word: "so ",
          success: true,
          startS: 84.48,
          endS: 85.12,
        },
        {
          word: "very ",
          success: true,
          startS: 85.12,
          endS: 85.4,
        },
        {
          word: "right?\n",
          success: true,
          startS: 85.4,
          endS: 86.38,
        },
        {
          word: "But ",
          success: true,
          startS: 86.38,
          endS: 86.7,
        },
        {
          word: "I'm ",
          success: true,
          startS: 86.7,
          endS: 86.84,
        },
        {
          word: "restless, ",
          success: true,
          startS: 86.84,
          endS: 87.26,
        },
        {
          word: "so ",
          success: true,
          startS: 87.26,
          endS: 87.4,
        },
        {
          word: "I ",
          success: true,
          startS: 87.4,
          endS: 87.54,
        },
        {
          word: "raise ",
          success: true,
          startS: 87.54,
          endS: 87.7,
        },
        {
          word: "my ",
          success: true,
          startS: 87.7,
          endS: 87.86,
        },
        {
          word: "pace ",
          success: true,
          startS: 87.86,
          endS: 88.08,
        },
        {
          word: "and\n",
          success: true,
          startS: 88.08,
          endS: 88.24,
        },
        {
          word: "I ",
          success: true,
          startS: 88.48,
          endS: 88.56,
        },
        {
          word: "am ",
          success: true,
          startS: 88.56,
          endS: 88.84,
        },
        {
          word: "running ",
          success: true,
          startS: 88.84,
          endS: 89.16,
        },
        {
          word: "around, ",
          success: true,
          startS: 89.16,
          endS: 90.26,
        },
        {
          word: "looking ",
          success: true,
          startS: 90.26,
          endS: 90.62,
        },
        {
          word: "for ",
          success: true,
          startS: 90.62,
          endS: 90.86,
        },
        {
          word: "you\n",
          success: true,
          startS: 90.86,
          endS: 91.2,
        },
        {
          word: "It ",
          success: true,
          startS: 91.3,
          endS: 91.3,
        },
        {
          word: "could ",
          success: true,
          startS: 91.3,
          endS: 91.3,
        },
        {
          word: "be ",
          success: true,
          startS: 91.3,
          endS: 91.56,
        },
        {
          word: "you, ",
          success: true,
          startS: 91.56,
          endS: 91.8,
        },
        {
          word: "It ",
          success: true,
          startS: 91.8,
          endS: 92.5,
        },
        {
          word: "could ",
          success: true,
          startS: 92.5,
          endS: 92.66,
        },
        {
          word: "be ",
          success: true,
          startS: 92.66,
          endS: 92.86,
        },
        {
          word: "you, ",
          success: true,
          startS: 92.86,
          endS: 93.12,
        },
        {
          word: "It ",
          success: true,
          startS: 93.12,
          endS: 93.32,
        },
        {
          word: "could ",
          success: true,
          startS: 93.32,
          endS: 93.34,
        },
        {
          word: "be ",
          success: true,
          startS: 93.34,
          endS: 93.42,
        },
        {
          word: "you\n",
          success: true,
          startS: 93.42,
          endS: 93.44,
        },
        {
          word: "Searching ",
          success: true,
          startS: 93.46,
          endS: 94.18,
        },
        {
          word: "all ",
          success: true,
          startS: 94.18,
          endS: 94.4,
        },
        {
          word: "over ",
          success: true,
          startS: 94.4,
          endS: 94.54,
        },
        {
          word: "town, ",
          success: true,
          startS: 94.54,
          endS: 95.54,
        },
        {
          word: "just ",
          success: true,
          startS: 95.54,
          endS: 95.82,
        },
        {
          word: "to ",
          success: true,
          startS: 95.82,
          endS: 96.0,
        },
        {
          word: "be ",
          success: true,
          startS: 96.0,
          endS: 96.1,
        },
        {
          word: "sure\n",
          success: true,
          startS: 96.1,
          endS: 96.38,
        },
        {
          word: "It ",
          success: true,
          startS: 96.72,
          endS: 96.72,
        },
        {
          word: "could ",
          success: true,
          startS: 96.72,
          endS: 96.72,
        },
        {
          word: "be ",
          success: true,
          startS: 96.72,
          endS: 96.86,
        },
        {
          word: "you, ",
          success: true,
          startS: 96.86,
          endS: 97.14,
        },
        {
          word: "It ",
          success: true,
          startS: 97.14,
          endS: 97.32,
        },
        {
          word: "could ",
          success: true,
          startS: 97.32,
          endS: 97.32,
        },
        {
          word: "be ",
          success: true,
          startS: 97.32,
          endS: 97.46,
        },
        {
          word: "you, ",
          success: true,
          startS: 97.46,
          endS: 97.7,
        },
        {
          word: "It ",
          success: true,
          startS: 97.7,
          endS: 97.88,
        },
        {
          word: "could ",
          success: true,
          startS: 97.88,
          endS: 97.98,
        },
        {
          word: "be ",
          success: true,
          startS: 97.98,
          endS: 98.14,
        },
        {
          word: "you\n",
          success: true,
          startS: 98.14,
          endS: 98.42,
        },
        {
          word: "Where ",
          success: true,
          startS: 98.74,
          endS: 99.04,
        },
        {
          word: "you're ",
          success: true,
          startS: 99.04,
          endS: 99.46,
        },
        {
          word: "hanging ",
          success: true,
          startS: 99.46,
          endS: 99.78,
        },
        {
          word: "around, ",
          success: true,
          startS: 99.78,
          endS: 101.08,
        },
        {
          word: "seems ",
          success: true,
          startS: 101.08,
          endS: 101.24,
        },
        {
          word: "nothing ",
          success: true,
          startS: 101.24,
          endS: 101.5,
        },
        {
          word: "new\n",
          success: true,
          startS: 101.5,
          endS: 101.86,
        },
        {
          word: "It ",
          success: true,
          startS: 102.06,
          endS: 102.06,
        },
        {
          word: "could ",
          success: true,
          startS: 102.06,
          endS: 102.16,
        },
        {
          word: "be ",
          success: true,
          startS: 102.16,
          endS: 102.2,
        },
        {
          word: "you, ",
          success: true,
          startS: 102.2,
          endS: 102.48,
        },
        {
          word: "It ",
          success: true,
          startS: 102.48,
          endS: 102.68,
        },
        {
          word: "could ",
          success: true,
          startS: 102.68,
          endS: 102.68,
        },
        {
          word: "be ",
          success: true,
          startS: 102.68,
          endS: 102.84,
        },
        {
          word: "you, ",
          success: true,
          startS: 102.84,
          endS: 103.14,
        },
        {
          word: "It ",
          success: true,
          startS: 103.14,
          endS: 103.34,
        },
        {
          word: "could ",
          success: true,
          startS: 103.34,
          endS: 103.34,
        },
        {
          word: "be ",
          success: true,
          startS: 103.34,
          endS: 103.54,
        },
        {
          word: "you\n",
          success: true,
          startS: 103.54,
          endS: 103.72,
        },
        {
          word: "I’m ",
          success: true,
          startS: 104.12,
          endS: 104.56,
        },
        {
          word: "finally ",
          success: true,
          startS: 104.56,
          endS: 104.74,
        },
        {
          word: "asking ",
          success: true,
          startS: 104.74,
          endS: 105.08,
        },
        {
          word: "you ",
          success: true,
          startS: 105.08,
          endS: 105.4,
        },
        {
          word: "out: ",
          success: true,
          startS: 105.4,
          endS: 106.36,
        },
        {
          word: "how ",
          success: true,
          startS: 106.36,
          endS: 106.62,
        },
        {
          word: "do ",
          success: true,
          startS: 106.62,
          endS: 106.72,
        },
        {
          word: "you ",
          success: true,
          startS: 106.72,
          endS: 106.9,
        },
        {
          word: "do, ",
          success: true,
          startS: 106.9,
          endS: 107.32,
        },
        {
          word: "do, ",
          success: true,
          startS: 107.32,
          endS: 107.5,
        },
        {
          word: "do, ",
          success: true,
          startS: 107.5,
          endS: 107.94,
        },
        {
          word: "do?\n",
          success: true,
          startS: 113.95,
          endS: 115.39,
        },
        {
          word: "The ",
          success: true,
          startS: 115.39,
          endS: 115.39,
        },
        {
          word: "only ",
          success: true,
          startS: 115.39,
          endS: 115.79,
        },
        {
          word: "reason, ",
          success: true,
          startS: 115.79,
          endS: 116.43,
        },
        {
          word: "can’t ",
          success: true,
          startS: 116.43,
          endS: 117.09,
        },
        {
          word: "you ",
          success: true,
          startS: 117.09,
          endS: 117.19,
        },
        {
          word: "see?\n",
          success: true,
          startS: 117.19,
          endS: 117.87,
        },
        {
          word: "That ",
          success: true,
          startS: 117.87,
          endS: 118.11,
        },
        {
          word: "keeps ",
          success: true,
          startS: 118.11,
          endS: 118.31,
        },
        {
          word: "me ",
          success: true,
          startS: 118.31,
          endS: 118.57,
        },
        {
          word: "running ",
          success: true,
          startS: 118.57,
          endS: 119.07,
        },
        {
          word: "down ",
          success: true,
          startS: 119.07,
          endS: 119.55,
        },
        {
          word: "that ",
          success: true,
          startS: 119.55,
          endS: 119.91,
        },
        {
          word: "street\n",
          success: true,
          startS: 119.91,
          endS: 120.23,
        },
        {
          word: "is ",
          success: true,
          startS: 120.47,
          endS: 120.85,
        },
        {
          word: "any ",
          success: true,
          startS: 120.85,
          endS: 121.19,
        },
        {
          word: "chance ",
          success: true,
          startS: 121.19,
          endS: 121.59,
        },
        {
          word: "for ",
          success: true,
          startS: 121.59,
          endS: 122.03,
        },
        {
          word: "us ",
          success: true,
          startS: 122.03,
          endS: 122.31,
        },
        {
          word: "to ",
          success: true,
          startS: 122.31,
          endS: 122.57,
        },
        {
          word: "meet.\n",
          success: true,
          startS: 122.57,
          endS: 124.29,
        },
        {
          word: "It ",
          success: true,
          startS: 124.29,
          endS: 125.93,
        },
        {
          word: "could ",
          success: true,
          startS: 125.93,
          endS: 126.25,
        },
        {
          word: "be ",
          success: true,
          startS: 126.25,
          endS: 126.53,
        },
        {
          word: "you ",
          success: true,
          startS: 126.53,
          endS: 126.87,
        },
        {
          word: "I’m ",
          success: true,
          startS: 126.87,
          endS: 127.25,
        },
        {
          word: "looking ",
          success: true,
          startS: 127.25,
          endS: 127.69,
        },
        {
          word: "for\n",
          success: true,
          startS: 127.69,
          endS: 128.27,
        },
        {
          word: "I ",
          success: true,
          startS: 128.51,
          endS: 128.73,
        },
        {
          word: "think ",
          success: true,
          startS: 128.73,
          endS: 128.99,
        },
        {
          word: "I’ve ",
          success: true,
          startS: 128.99,
          endS: 129.33,
        },
        {
          word: "never ",
          success: true,
          startS: 129.33,
          endS: 129.57,
        },
        {
          word: "been ",
          success: true,
          startS: 129.57,
          endS: 130.21,
        },
        {
          word: "so ",
          success: true,
          startS: 130.21,
          endS: 130.53,
        },
        {
          word: "sure\n",
          success: true,
          startS: 130.53,
          endS: 130.91,
        },
        {
          word: "Catch ",
          success: true,
          startS: 131.19,
          endS: 131.43,
        },
        {
          word: "you ",
          success: true,
          startS: 131.43,
          endS: 131.71,
        },
        {
          word: "and ",
          success: true,
          startS: 131.71,
          endS: 131.93,
        },
        {
          word: "never ",
          success: true,
          startS: 131.93,
          endS: 132.41,
        },
        {
          word: "let ",
          success: true,
          startS: 132.41,
          endS: 132.85,
        },
        {
          word: "you ",
          success: true,
          startS: 132.85,
          endS: 133.15,
        },
        {
          word: "go\n",
          success: true,
          startS: 133.15,
          endS: 133.95,
        },
        {
          word: "I ",
          success: true,
          startS: 136.51,
          endS: 139.15,
        },
        {
          word: "am ",
          success: true,
          startS: 139.15,
          endS: 139.45,
        },
        {
          word: "running ",
          success: true,
          startS: 139.45,
          endS: 139.85,
        },
        {
          word: "around, ",
          success: true,
          startS: 139.85,
          endS: 140.91,
        },
        {
          word: "looking ",
          success: true,
          startS: 140.91,
          endS: 141.21,
        },
        {
          word: "for ",
          success: true,
          startS: 141.21,
          endS: 141.45,
        },
        {
          word: "you\n",
          success: true,
          startS: 141.45,
          endS: 141.75,
        },
        {
          word: "It ",
          success: true,
          startS: 141.87,
          endS: 141.99,
        },
        {
          word: "could ",
          success: true,
          startS: 141.99,
          endS: 141.99,
        },
        {
          word: "be ",
          success: true,
          startS: 141.99,
          endS: 142.21,
        },
        {
          word: "you, ",
          success: true,
          startS: 142.21,
          endS: 142.57,
        },
        {
          word: "It ",
          success: true,
          startS: 142.57,
          endS: 142.71,
        },
        {
          word: "could ",
          success: true,
          startS: 142.71,
          endS: 142.71,
        },
        {
          word: "be ",
          success: true,
          startS: 142.71,
          endS: 142.85,
        },
        {
          word: "you, ",
          success: true,
          startS: 142.85,
          endS: 143.19,
        },
        {
          word: "It ",
          success: true,
          startS: 143.19,
          endS: 143.33,
        },
        {
          word: "could ",
          success: true,
          startS: 143.33,
          endS: 143.37,
        },
        {
          word: "be ",
          success: true,
          startS: 143.37,
          endS: 143.51,
        },
        {
          word: "you\n",
          success: true,
          startS: 143.51,
          endS: 143.81,
        },
        {
          word: "Searching ",
          success: true,
          startS: 144.51,
          endS: 144.83,
        },
        {
          word: "all ",
          success: true,
          startS: 144.83,
          endS: 145.11,
        },
        {
          word: "over ",
          success: true,
          startS: 145.11,
          endS: 145.27,
        },
        {
          word: "town, ",
          success: true,
          startS: 145.27,
          endS: 146.01,
        },
        {
          word: "just ",
          success: true,
          startS: 146.01,
          endS: 146.49,
        },
        {
          word: "to ",
          success: true,
          startS: 146.49,
          endS: 146.67,
        },
        {
          word: "be ",
          success: true,
          startS: 146.67,
          endS: 146.79,
        },
        {
          word: "sure\n",
          success: true,
          startS: 146.79,
          endS: 147.13,
        },
        {
          word: "It ",
          success: true,
          startS: 147.31,
          endS: 147.33,
        },
        {
          word: "could ",
          success: true,
          startS: 147.33,
          endS: 147.33,
        },
        {
          word: "be ",
          success: true,
          startS: 147.33,
          endS: 147.55,
        },
        {
          word: "you, ",
          success: true,
          startS: 147.55,
          endS: 147.83,
        },
        {
          word: "It ",
          success: true,
          startS: 147.83,
          endS: 147.99,
        },
        {
          word: "could ",
          success: true,
          startS: 147.99,
          endS: 147.99,
        },
        {
          word: "be ",
          success: true,
          startS: 147.99,
          endS: 148.15,
        },
        {
          word: "you, ",
          success: true,
          startS: 148.15,
          endS: 148.45,
        },
        {
          word: "It ",
          success: true,
          startS: 148.45,
          endS: 148.61,
        },
        {
          word: "could ",
          success: true,
          startS: 148.61,
          endS: 148.65,
        },
        {
          word: "be ",
          success: true,
          startS: 148.65,
          endS: 148.81,
        },
        {
          word: "you\n",
          success: true,
          startS: 148.81,
          endS: 149.13,
        },
        {
          word: "Where ",
          success: true,
          startS: 149.39,
          endS: 149.69,
        },
        {
          word: "you're ",
          success: true,
          startS: 149.69,
          endS: 150.13,
        },
        {
          word: "hanging ",
          success: true,
          startS: 150.13,
          endS: 150.45,
        },
        {
          word: "around, ",
          success: true,
          startS: 150.45,
          endS: 151.59,
        },
        {
          word: "seems ",
          success: true,
          startS: 151.59,
          endS: 151.83,
        },
        {
          word: "nothing ",
          success: true,
          startS: 151.83,
          endS: 152.15,
        },
        {
          word: "new\n",
          success: true,
          startS: 152.15,
          endS: 152.51,
        },
        {
          word: "It ",
          success: true,
          startS: 152.75,
          endS: 152.75,
        },
        {
          word: "could ",
          success: true,
          startS: 152.75,
          endS: 152.75,
        },
        {
          word: "be ",
          success: true,
          startS: 152.75,
          endS: 152.81,
        },
        {
          word: "you, ",
          success: true,
          startS: 152.81,
          endS: 153.19,
        },
        {
          word: "It ",
          success: true,
          startS: 153.19,
          endS: 153.35,
        },
        {
          word: "could ",
          success: true,
          startS: 153.35,
          endS: 153.35,
        },
        {
          word: "be ",
          success: true,
          startS: 153.35,
          endS: 153.51,
        },
        {
          word: "you, ",
          success: true,
          startS: 153.51,
          endS: 153.87,
        },
        {
          word: "It ",
          success: true,
          startS: 153.87,
          endS: 154.17,
        },
        {
          word: "could ",
          success: true,
          startS: 154.17,
          endS: 154.17,
        },
        {
          word: "be ",
          success: true,
          startS: 154.17,
          endS: 154.19,
        },
        {
          word: "you\n",
          success: true,
          startS: 154.19,
          endS: 154.29,
        },
        {
          word: "I’m ",
          success: true,
          startS: 154.33,
          endS: 154.67,
        },
        {
          word: "finally ",
          success: true,
          startS: 154.67,
          endS: 155.33,
        },
        {
          word: "asking ",
          success: true,
          startS: 155.33,
          endS: 155.75,
        },
        {
          word: "you ",
          success: true,
          startS: 155.75,
          endS: 156.03,
        },
        {
          word: "out: ",
          success: true,
          startS: 156.03,
          endS: 157.01,
        },
        {
          word: "how ",
          success: true,
          startS: 157.01,
          endS: 157.21,
        },
        {
          word: "do ",
          success: true,
          startS: 157.21,
          endS: 157.39,
        },
        {
          word: "you ",
          success: true,
          startS: 157.39,
          endS: 157.57,
        },
        {
          word: "do, ",
          success: true,
          startS: 157.57,
          endS: 158.07,
        },
        {
          word: "do, ",
          success: true,
          startS: 158.07,
          endS: 158.13,
        },
        {
          word: "do, ",
          success: true,
          startS: 158.13,
          endS: 158.55,
        },
        {
          word: "do?\n",
          success: true,
          startS: 158.55,
          endS: 159.51,
        },
        {
          word: "I ",
          success: true,
          startS: 159.69,
          endS: 159.89,
        },
        {
          word: "am ",
          success: true,
          startS: 159.89,
          endS: 160.75,
        },
        {
          word: "running ",
          success: true,
          startS: 160.75,
          endS: 161.17,
        },
        {
          word: "around, ",
          success: true,
          startS: 161.17,
          endS: 162.25,
        },
        {
          word: "looking ",
          success: true,
          startS: 162.25,
          endS: 162.57,
        },
        {
          word: "for ",
          success: true,
          startS: 162.57,
          endS: 162.83,
        },
        {
          word: "you\n",
          success: true,
          startS: 162.83,
          endS: 163.13,
        },
        {
          word: "It ",
          success: true,
          startS: 163.23,
          endS: 163.33,
        },
        {
          word: "could ",
          success: true,
          startS: 163.33,
          endS: 163.33,
        },
        {
          word: "be ",
          success: true,
          startS: 163.33,
          endS: 163.53,
        },
        {
          word: "you, ",
          success: true,
          startS: 163.53,
          endS: 163.87,
        },
        {
          word: "It ",
          success: true,
          startS: 163.87,
          endS: 164.01,
        },
        {
          word: "could ",
          success: true,
          startS: 164.01,
          endS: 164.01,
        },
        {
          word: "be ",
          success: true,
          startS: 164.01,
          endS: 164.17,
        },
        {
          word: "you, ",
          success: true,
          startS: 164.17,
          endS: 164.47,
        },
        {
          word: "It ",
          success: true,
          startS: 164.47,
          endS: 164.69,
        },
        {
          word: "could ",
          success: true,
          startS: 164.69,
          endS: 164.69,
        },
        {
          word: "be ",
          success: true,
          startS: 164.69,
          endS: 164.85,
        },
        {
          word: "you\n",
          success: true,
          startS: 164.85,
          endS: 165.07,
        },
        {
          word: "Searching ",
          success: true,
          startS: 165.45,
          endS: 166.15,
        },
        {
          word: "all ",
          success: true,
          startS: 166.15,
          endS: 166.35,
        },
        {
          word: "over ",
          success: true,
          startS: 166.35,
          endS: 166.53,
        },
        {
          word: "town, ",
          success: true,
          startS: 166.53,
          endS: 167.41,
        },
        {
          word: "just ",
          success: true,
          startS: 167.41,
          endS: 167.79,
        },
        {
          word: "to ",
          success: true,
          startS: 167.79,
          endS: 168.01,
        },
        {
          word: "be ",
          success: true,
          startS: 168.01,
          endS: 168.11,
        },
        {
          word: "sure\n",
          success: true,
          startS: 168.11,
          endS: 168.45,
        },
        {
          word: "It ",
          success: true,
          startS: 168.61,
          endS: 168.61,
        },
        {
          word: "could ",
          success: true,
          startS: 168.61,
          endS: 168.69,
        },
        {
          word: "be ",
          success: true,
          startS: 168.69,
          endS: 168.83,
        },
        {
          word: "you, ",
          success: true,
          startS: 168.83,
          endS: 169.13,
        },
        {
          word: "It ",
          success: true,
          startS: 169.13,
          endS: 169.29,
        },
        {
          word: "could ",
          success: true,
          startS: 169.29,
          endS: 169.29,
        },
        {
          word: "be ",
          success: true,
          startS: 169.29,
          endS: 169.49,
        },
        {
          word: "you, ",
          success: true,
          startS: 169.49,
          endS: 169.77,
        },
        {
          word: "It ",
          success: true,
          startS: 169.77,
          endS: 169.87,
        },
        {
          word: "could ",
          success: true,
          startS: 169.87,
          endS: 169.99,
        },
        {
          word: "be ",
          success: true,
          startS: 169.99,
          endS: 170.13,
        },
        {
          word: "you\n",
          success: true,
          startS: 170.13,
          endS: 170.43,
        },
        {
          word: "Where ",
          success: true,
          startS: 170.61,
          endS: 171.07,
        },
        {
          word: "you're ",
          success: true,
          startS: 171.07,
          endS: 171.53,
        },
        {
          word: "hanging ",
          success: true,
          startS: 171.53,
          endS: 171.79,
        },
        {
          word: "around, ",
          success: true,
          startS: 171.79,
          endS: 173.05,
        },
        {
          word: "seems ",
          success: true,
          startS: 173.05,
          endS: 173.23,
        },
        {
          word: "nothing ",
          success: true,
          startS: 173.23,
          endS: 173.51,
        },
        {
          word: "new\n",
          success: true,
          startS: 173.51,
          endS: 174.01,
        },
        {
          word: "It ",
          success: true,
          startS: 174.15,
          endS: 174.17,
        },
        {
          word: "could ",
          success: true,
          startS: 174.17,
          endS: 174.17,
        },
        {
          word: "be ",
          success: true,
          startS: 174.17,
          endS: 174.17,
        },
        {
          word: "you, ",
          success: true,
          startS: 174.17,
          endS: 174.45,
        },
        {
          word: "It ",
          success: true,
          startS: 174.45,
          endS: 174.59,
        },
        {
          word: "could ",
          success: true,
          startS: 174.59,
          endS: 174.63,
        },
        {
          word: "be ",
          success: true,
          startS: 174.63,
          endS: 174.75,
        },
        {
          word: "you, ",
          success: true,
          startS: 174.75,
          endS: 175.13,
        },
        {
          word: "It ",
          success: true,
          startS: 175.13,
          endS: 175.21,
        },
        {
          word: "could ",
          success: true,
          startS: 175.21,
          endS: 175.21,
        },
        {
          word: "be ",
          success: true,
          startS: 175.21,
          endS: 175.21,
        },
        {
          word: "you\n",
          success: true,
          startS: 175.21,
          endS: 175.21,
        },
        {
          word: "I’m ",
          success: true,
          startS: 175.25,
          endS: 175.85,
        },
        {
          word: "finally ",
          success: true,
          startS: 175.85,
          endS: 176.65,
        },
        {
          word: "asking ",
          success: true,
          startS: 176.65,
          endS: 177.15,
        },
        {
          word: "you ",
          success: true,
          startS: 177.15,
          endS: 177.43,
        },
        {
          word: "out: ",
          success: true,
          startS: 177.43,
          endS: 178.31,
        },
        {
          word: "how ",
          success: true,
          startS: 178.31,
          endS: 178.57,
        },
        {
          word: "do ",
          success: true,
          startS: 178.57,
          endS: 178.69,
        },
        {
          word: "you ",
          success: true,
          startS: 178.69,
          endS: 178.85,
        },
        {
          word: "do, ",
          success: true,
          startS: 178.85,
          endS: 179.13,
        },
        {
          word: "do, ",
          success: true,
          startS: 179.13,
          endS: 179.47,
        },
        {
          word: "do, ",
          success: true,
          startS: 193.8,
          endS: 193.8,
        },
        {
          word: "do?\n",
          success: true,
          startS: 193.8,
          endS: 193.8,
        },
      ],
    },
    {
      id: "3",
      // title: "The Feel - Backnbloom",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=1071004&format=mp31&from=aauynZgqP5xdsIaDK8uLJQ%3D%3D%7CrPMKAuspjn%2B6INSKQ7mbBg%3D%3D",
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
      alignedWords: [
        {
          word: "Can ",
          success: true,
          startS: 14.2,
          endS: 14.2,
        },
        {
          word: "u ",
          success: true,
          startS: 14.2,
          endS: 14.3,
        },
        {
          word: "tell ",
          success: true,
          startS: 14.3,
          endS: 14.52,
        },
        {
          word: "me ",
          success: true,
          startS: 14.52,
          endS: 14.74,
        },
        {
          word: "how ",
          success: true,
          startS: 14.74,
          endS: 14.98,
        },
        {
          word: "the ",
          success: true,
          startS: 14.98,
          endS: 15.16,
        },
        {
          word: "sun ",
          success: true,
          startS: 15.16,
          endS: 15.38,
        },
        {
          word: "can ",
          success: true,
          startS: 15.38,
          endS: 15.58,
        },
        {
          word: "shine ",
          success: true,
          startS: 15.58,
          endS: 15.92,
        },
        {
          word: "as ",
          success: true,
          startS: 16.02,
          endS: 16.12,
        },
        {
          word: "rain ",
          success: true,
          startS: 16.12,
          endS: 16.3,
        },
        {
          word: "drops ",
          success: true,
          startS: 16.3,
          endS: 16.52,
        },
        {
          word: "on ",
          success: true,
          startS: 16.52,
          endS: 16.76,
        },
        {
          word: "my ",
          success: true,
          startS: 16.76,
          endS: 16.94,
        },
        {
          word: "hand?\n",
          success: true,
          startS: 16.94,
          endS: 17.56,
        },
        {
          word: "How ",
          success: true,
          startS: 17.7,
          endS: 17.8,
        },
        {
          word: "a ",
          success: true,
          startS: 17.8,
          endS: 17.92,
        },
        {
          word: "bird ",
          success: true,
          startS: 17.92,
          endS: 18.12,
        },
        {
          word: "will ",
          success: true,
          startS: 18.12,
          endS: 18.3,
        },
        {
          word: "fly ",
          success: true,
          startS: 18.3,
          endS: 18.58,
        },
        {
          word: "into ",
          success: true,
          startS: 18.58,
          endS: 18.88,
        },
        {
          word: "the ",
          success: true,
          startS: 18.88,
          endS: 19.16,
        },
        {
          word: "night ",
          success: true,
          startS: 19.16,
          endS: 19.38,
        },
        {
          word: "not ",
          success: true,
          startS: 19.38,
          endS: 19.66,
        },
        {
          word: "knowing ",
          success: true,
          startS: 19.66,
          endS: 20.0,
        },
        {
          word: "where ",
          success: true,
          startS: 20.0,
          endS: 20.34,
        },
        {
          word: "to ",
          success: true,
          startS: 20.34,
          endS: 20.48,
        },
        {
          word: "land?\n",
          success: true,
          startS: 20.48,
          endS: 21.06,
        },
        {
          word: "There's ",
          success: true,
          startS: 21.22,
          endS: 21.4,
        },
        {
          word: "a ",
          success: true,
          startS: 21.4,
          endS: 21.48,
        },
        {
          word: "reason ",
          success: true,
          startS: 21.48,
          endS: 21.76,
        },
        {
          word: "we ",
          success: true,
          startS: 21.76,
          endS: 22.12,
        },
        {
          word: "all ",
          success: true,
          startS: 22.12,
          endS: 22.36,
        },
        {
          word: "wake ",
          success: true,
          startS: 22.36,
          endS: 22.58,
        },
        {
          word: "and ",
          success: true,
          startS: 22.58,
          endS: 22.8,
        },
        {
          word: "rise, ",
          success: true,
          startS: 22.8,
          endS: 23.06,
        },
        {
          word: "a ",
          success: true,
          startS: 23.12,
          endS: 23.22,
        },
        {
          word: "line ",
          success: true,
          startS: 23.28,
          endS: 23.5,
        },
        {
          word: "of ",
          success: true,
          startS: 23.5,
          endS: 23.68,
        },
        {
          word: "common ",
          success: true,
          startS: 23.74,
          endS: 23.92,
        },
        {
          word: "ground\n",
          success: true,
          startS: 23.92,
          endS: 24.42,
        },
        {
          word: "And ",
          success: true,
          startS: 24.74,
          endS: 24.96,
        },
        {
          word: "a ",
          success: true,
          startS: 24.96,
          endS: 25.08,
        },
        {
          word: "secret ",
          success: true,
          startS: 25.08,
          endS: 25.34,
        },
        {
          word: "that ",
          success: true,
          startS: 25.34,
          endS: 25.7,
        },
        {
          word: "we ",
          success: true,
          startS: 25.7,
          endS: 25.94,
        },
        {
          word: "all ",
          success: true,
          startS: 25.94,
          endS: 26.16,
        },
        {
          word: "should ",
          success: true,
          startS: 26.16,
          endS: 26.3,
        },
        {
          word: "know,\n",
          success: true,
          startS: 26.3,
          endS: 26.7,
        },
        {
          word: "This ",
          success: true,
          startS: 27.04,
          endS: 27.1,
        },
        {
          word: "secret ",
          success: true,
          startS: 27.1,
          endS: 27.56,
        },
        {
          word: "that ",
          success: true,
          startS: 27.56,
          endS: 27.56,
        },
        {
          word: "I ",
          success: true,
          startS: 27.56,
          endS: 27.56,
        },
        {
          word: "found\n",
          success: true,
          startS: 27.56,
          endS: 28.2,
        },
        {
          word: "Do ",
          success: true,
          startS: 29.42,
          endS: 29.96,
        },
        {
          word: "not ",
          success: true,
          startS: 29.96,
          endS: 30.5,
        },
        {
          word: "let ",
          success: true,
          startS: 30.5,
          endS: 31.78,
        },
        {
          word: "go\n",
          success: true,
          startS: 31.78,
          endS: 32.36,
        },
        {
          word: "It’s ",
          success: true,
          startS: 33.74,
          endS: 33.84,
        },
        {
          word: "only ",
          success: true,
          startS: 33.84,
          endS: 34.32,
        },
        {
          word: "a ",
          success: true,
          startS: 34.32,
          endS: 34.6,
        },
        {
          word: "feeling\n",
          success: true,
          startS: 34.6,
          endS: 35.22,
        },
        {
          word: "A ",
          success: true,
          startS: 36.78,
          endS: 37.16,
        },
        {
          word: "yes ",
          success: true,
          startS: 37.16,
          endS: 37.86,
        },
        {
          word: "or ",
          success: true,
          startS: 37.86,
          endS: 38.94,
        },
        {
          word: "no\n",
          success: true,
          startS: 38.94,
          endS: 39.46,
        },
        {
          word: "Break ",
          success: true,
          startS: 40.96,
          endS: 41.32,
        },
        {
          word: "through ",
          success: true,
          startS: 41.32,
          endS: 41.58,
        },
        {
          word: "the ",
          success: true,
          startS: 41.58,
          endS: 41.8,
        },
        {
          word: "ceiling\n",
          success: true,
          startS: 42.16,
          endS: 42.62,
        },
        {
          word: "Your ",
          success: true,
          startS: 43.32,
          endS: 44.32,
        },
        {
          word: "choices ",
          success: true,
          startS: 44.32,
          endS: 45.1,
        },
        {
          word: "can ",
          success: true,
          startS: 45.1,
          endS: 45.98,
        },
        {
          word: "lift ",
          success: true,
          startS: 45.98,
          endS: 46.92,
        },
        {
          word: "you ",
          success: true,
          startS: 46.92,
          endS: 47.18,
        },
        {
          word: "up ",
          success: true,
          startS: 47.18,
          endS: 47.5,
        },
        {
          word: "or ",
          success: true,
          startS: 47.5,
          endS: 47.96,
        },
        {
          word: "pull ",
          success: true,
          startS: 47.96,
          endS: 48.44,
        },
        {
          word: "you ",
          success: true,
          startS: 48.44,
          endS: 48.86,
        },
        {
          word: "under\n",
          success: true,
          startS: 48.86,
          endS: 49.6,
        },
        {
          word: "Just ",
          success: true,
          startS: 50.34,
          endS: 50.74,
        },
        {
          word: "keep ",
          success: true,
          startS: 50.74,
          endS: 51.02,
        },
        {
          word: "the ",
          success: true,
          startS: 51.02,
          endS: 51.4,
        },
        {
          word: "feel ",
          success: true,
          startS: 51.4,
          endS: 51.76,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 51.76,
          endS: 52.62,
        },
        {
          word: "Just ",
          success: true,
          startS: 55.12,
          endS: 57.88,
        },
        {
          word: "keep ",
          success: true,
          startS: 57.88,
          endS: 58.18,
        },
        {
          word: "the ",
          success: true,
          startS: 58.18,
          endS: 58.52,
        },
        {
          word: "feel ",
          success: true,
          startS: 58.52,
          endS: 58.94,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 58.94,
          endS: 59.88,
        },
        {
          word: "Just ",
          success: true,
          startS: 63.3,
          endS: 65.12,
        },
        {
          word: "keep ",
          success: true,
          startS: 65.12,
          endS: 65.38,
        },
        {
          word: "the ",
          success: true,
          startS: 65.38,
          endS: 65.7,
        },
        {
          word: "feel ",
          success: true,
          startS: 65.7,
          endS: 66.12,
        },
        {
          word: "flowing, ",
          success: true,
          startS: 66.12,
          endS: 68.8,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 70.76,
          endS: 71.7,
        },
        {
          word: "Just ",
          success: true,
          startS: 72.12,
          endS: 75.04,
        },
        {
          word: "keep ",
          success: true,
          startS: 75.04,
          endS: 75.04,
        },
        {
          word: "the ",
          success: true,
          startS: 75.04,
          endS: 75.04,
        },
        {
          word: "feel ",
          success: true,
          startS: 75.04,
          endS: 75.04,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 75.04,
          endS: 75.04,
        },
        {
          word: "See ",
          success: true,
          startS: 75.04,
          endS: 75.04,
        },
        {
          word: "the ",
          success: true,
          startS: 75.04,
          endS: 75.22,
        },
        {
          word: "architects ",
          success: true,
          startS: 75.22,
          endS: 75.72,
        },
        {
          word: "of ",
          success: true,
          startS: 75.72,
          endS: 76.1,
        },
        {
          word: "buildings ",
          success: true,
          startS: 76.1,
          endS: 76.38,
        },
        {
          word: "tall, ",
          success: true,
          startS: 76.38,
          endS: 76.8,
        },
        {
          word: "one ",
          success: true,
          startS: 76.8,
          endS: 76.96,
        },
        {
          word: "seed ",
          success: true,
          startS: 76.96,
          endS: 77.14,
        },
        {
          word: "became ",
          success: true,
          startS: 77.14,
          endS: 77.58,
        },
        {
          word: "a ",
          success: true,
          startS: 77.58,
          endS: 77.76,
        },
        {
          word: "plan\n",
          success: true,
          startS: 77.76,
          endS: 78.06,
        },
        {
          word: "To ",
          success: true,
          startS: 78.32,
          endS: 78.64,
        },
        {
          word: "the ",
          success: true,
          startS: 78.64,
          endS: 78.76,
        },
        {
          word: "doubters ",
          success: true,
          startS: 78.76,
          endS: 79.18,
        },
        {
          word: "tossing ",
          success: true,
          startS: 79.18,
          endS: 79.66,
        },
        {
          word: "mocking ",
          success: true,
          startS: 79.66,
          endS: 79.96,
        },
        {
          word: "words ",
          success: true,
          startS: 79.96,
          endS: 80.3,
        },
        {
          word: "they ",
          success: true,
          startS: 80.3,
          endS: 80.54,
        },
        {
          word: "took ",
          success: true,
          startS: 80.54,
          endS: 80.82,
        },
        {
          word: "a ",
          success: true,
          startS: 80.82,
          endS: 81.24,
        },
        {
          word: "stand\n",
          success: true,
          startS: 81.24,
          endS: 81.66,
        },
        {
          word: "For ",
          success: true,
          startS: 82.14,
          endS: 82.3,
        },
        {
          word: "a ",
          success: true,
          startS: 82.3,
          endS: 82.42,
        },
        {
          word: "moment ",
          success: true,
          startS: 82.42,
          endS: 82.7,
        },
        {
          word: "let ",
          success: true,
          startS: 82.7,
          endS: 82.98,
        },
        {
          word: "your ",
          success: true,
          startS: 82.98,
          endS: 83.18,
        },
        {
          word: "mind ",
          success: true,
          startS: 83.18,
          endS: 83.48,
        },
        {
          word: "resolve, ",
          success: true,
          startS: 83.48,
          endS: 83.98,
        },
        {
          word: "electing ",
          success: true,
          startS: 83.98,
          endS: 84.54,
        },
        {
          word: "what ",
          success: true,
          startS: 84.54,
          endS: 84.76,
        },
        {
          word: "is ",
          success: true,
          startS: 84.76,
          endS: 84.88,
        },
        {
          word: "right\n",
          success: true,
          startS: 84.88,
          endS: 85.18,
        },
        {
          word: "Turning ",
          success: true,
          startS: 85.66,
          endS: 85.88,
        },
        {
          word: "over ",
          success: true,
          startS: 85.88,
          endS: 86.22,
        },
        {
          word: "thoughts, ",
          success: true,
          startS: 86.22,
          endS: 86.68,
        },
        {
          word: "go ",
          success: true,
          startS: 86.68,
          endS: 86.78,
        },
        {
          word: "for ",
          success: true,
          startS: 86.78,
          endS: 87.0,
        },
        {
          word: "the ",
          success: true,
          startS: 87.0,
          endS: 87.18,
        },
        {
          word: "prize ",
          success: true,
          startS: 87.18,
          endS: 87.48,
        },
        {
          word: "with ",
          success: true,
          startS: 87.48,
          endS: 87.68,
        },
        {
          word: "all ",
          success: true,
          startS: 87.68,
          endS: 88.02,
        },
        {
          word: "your ",
          success: true,
          startS: 88.02,
          endS: 88.36,
        },
        {
          word: "might\n",
          success: true,
          startS: 88.36,
          endS: 88.9,
        },
        {
          word: "Do ",
          success: true,
          startS: 89.94,
          endS: 90.9,
        },
        {
          word: "not ",
          success: true,
          startS: 90.9,
          endS: 91.36,
        },
        {
          word: "let ",
          success: true,
          startS: 91.36,
          endS: 92.66,
        },
        {
          word: "go\n",
          success: true,
          startS: 92.66,
          endS: 93.26,
        },
        {
          word: "It’s ",
          success: true,
          startS: 94.42,
          endS: 94.76,
        },
        {
          word: "only ",
          success: true,
          startS: 94.76,
          endS: 95.24,
        },
        {
          word: "a ",
          success: true,
          startS: 95.24,
          endS: 95.5,
        },
        {
          word: "feeling\n",
          success: true,
          startS: 95.5,
          endS: 96.2,
        },
        {
          word: "A ",
          success: true,
          startS: 97.68,
          endS: 98.1,
        },
        {
          word: "yes ",
          success: true,
          startS: 98.1,
          endS: 98.84,
        },
        {
          word: "or ",
          success: true,
          startS: 98.84,
          endS: 99.86,
        },
        {
          word: "no\n",
          success: true,
          startS: 100.0,
          endS: 100.36,
        },
        {
          word: "Break ",
          success: true,
          startS: 101.26,
          endS: 102.22,
        },
        {
          word: "through ",
          success: true,
          startS: 102.22,
          endS: 102.48,
        },
        {
          word: "the ",
          success: true,
          startS: 102.48,
          endS: 102.74,
        },
        {
          word: "ceiling\n",
          success: true,
          startS: 102.74,
          endS: 103.24,
        },
        {
          word: "Your ",
          success: true,
          startS: 104.34,
          endS: 105.22,
        },
        {
          word: "choices ",
          success: true,
          startS: 105.22,
          endS: 105.98,
        },
        {
          word: "can ",
          success: true,
          startS: 105.98,
          endS: 106.88,
        },
        {
          word: "lift ",
          success: true,
          startS: 106.88,
          endS: 107.84,
        },
        {
          word: "you ",
          success: true,
          startS: 107.84,
          endS: 108.14,
        },
        {
          word: "up ",
          success: true,
          startS: 108.14,
          endS: 108.46,
        },
        {
          word: "or ",
          success: true,
          startS: 108.46,
          endS: 108.86,
        },
        {
          word: "pull ",
          success: true,
          startS: 108.86,
          endS: 109.34,
        },
        {
          word: "you ",
          success: true,
          startS: 109.34,
          endS: 109.76,
        },
        {
          word: "under\n",
          success: true,
          startS: 109.76,
          endS: 110.46,
        },
        {
          word: "Just ",
          success: true,
          startS: 111.18,
          endS: 111.64,
        },
        {
          word: "keep ",
          success: true,
          startS: 111.64,
          endS: 111.94,
        },
        {
          word: "the ",
          success: true,
          startS: 111.94,
          endS: 112.28,
        },
        {
          word: "feel ",
          success: true,
          startS: 112.28,
          endS: 112.66,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 118.02,
          endS: 118.86,
        },
        {
          word: "Just ",
          success: true,
          startS: 118.86,
          endS: 118.86,
        },
        {
          word: "keep ",
          success: true,
          startS: 118.86,
          endS: 119.12,
        },
        {
          word: "the ",
          success: true,
          startS: 119.12,
          endS: 119.42,
        },
        {
          word: "feel ",
          success: true,
          startS: 119.42,
          endS: 119.8,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 125.16,
          endS: 125.98,
        },
        {
          word: "Just ",
          success: true,
          startS: 125.98,
          endS: 125.98,
        },
        {
          word: "keep ",
          success: true,
          startS: 125.98,
          endS: 126.3,
        },
        {
          word: "the ",
          success: true,
          startS: 126.3,
          endS: 126.64,
        },
        {
          word: "feel ",
          success: true,
          startS: 127.04,
          endS: 127.66,
        },
        {
          word: "flowing, ",
          success: true,
          startS: 127.66,
          endS: 128.48,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 157.56,
          endS: 159.96,
        },
        {
          word: "Just ",
          success: true,
          startS: 160.06,
          endS: 161.76,
        },
        {
          word: "keep ",
          success: true,
          startS: 161.76,
          endS: 162.16,
        },
        {
          word: "the ",
          success: true,
          startS: 162.16,
          endS: 162.42,
        },
        {
          word: "feel ",
          success: true,
          startS: 162.42,
          endS: 162.72,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 162.72,
          endS: 163.72,
        },
        {
          word: "Keep ",
          success: true,
          startS: 166.32,
          endS: 169.02,
        },
        {
          word: "the ",
          success: true,
          startS: 169.02,
          endS: 169.58,
        },
        {
          word: "feel ",
          success: true,
          startS: 169.58,
          endS: 170.0,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 170.0,
          endS: 170.86,
        },
        {
          word: "Just ",
          success: true,
          startS: 174.14,
          endS: 176.12,
        },
        {
          word: "keep ",
          success: true,
          startS: 176.12,
          endS: 176.14,
        },
        {
          word: "the ",
          success: true,
          startS: 176.14,
          endS: 176.14,
        },
        {
          word: "feel ",
          success: true,
          startS: 176.14,
          endS: 176.14,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 176.14,
          endS: 176.14,
        },
        {
          word: "Just ",
          success: true,
          startS: 176.14,
          endS: 176.14,
        },
        {
          word: "keep ",
          success: true,
          startS: 176.14,
          endS: 176.44,
        },
        {
          word: "the ",
          success: true,
          startS: 176.44,
          endS: 176.74,
        },
        {
          word: "feel ",
          success: true,
          startS: 176.74,
          endS: 177.18,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 177.18,
          endS: 178.04,
        },
        {
          word: "Just ",
          success: true,
          startS: 180.64,
          endS: 182.78,
        },
        {
          word: "keep ",
          success: true,
          startS: 182.78,
          endS: 185.14,
        },
        {
          word: "the ",
          success: true,
          startS: 185.14,
          endS: 185.14,
        },
        {
          word: "feel ",
          success: true,
          startS: 185.14,
          endS: 185.14,
        },
        {
          word: "flowing, ",
          success: true,
          startS: 185.14,
          endS: 185.14,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 187.54,
          endS: 188.42,
        },
        {
          word: "Just ",
          success: true,
          startS: 191.29,
          endS: 191.29,
        },
        {
          word: "keep ",
          success: true,
          startS: 191.29,
          endS: 191.29,
        },
        {
          word: "the ",
          success: true,
          startS: 191.29,
          endS: 191.29,
        },
        {
          word: "feel ",
          success: true,
          startS: 191.29,
          endS: 191.29,
        },
        {
          word: "flowing\n",
          success: true,
          startS: 191.29,
          endS: 191.29,
        },
      ],
    },
    {
      id: "4",
      // title: "Love is a Journey - Robert Avellanet",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=1119654&format=mp31&from=YN3XsDx8jcazay7OI1WvzQ%3D%3D%7CkRwkgJkPLqovWB3JMClMug%3D%3D",
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
      alignedWords: [
        {
          word: "love ",
          success: true,
          startS: 17.68,
          endS: 18.2,
        },
        {
          word: "is ",
          success: true,
          startS: 18.2,
          endS: 18.7,
        },
        {
          word: "a ",
          success: true,
          startS: 18.7,
          endS: 18.86,
        },
        {
          word: "journey, ",
          success: true,
          startS: 18.86,
          endS: 19.38,
        },
        {
          word: "love ",
          success: true,
          startS: 19.38,
          endS: 20.36,
        },
        {
          word: "is ",
          success: true,
          startS: 20.36,
          endS: 20.84,
        },
        {
          word: "a ",
          success: true,
          startS: 20.84,
          endS: 21.04,
        },
        {
          word: "journey\n",
          success: true,
          startS: 21.04,
          endS: 22.16,
        },
        {
          word: "and ",
          success: true,
          startS: 23.76,
          endS: 26.52,
        },
        {
          word: "i ",
          success: true,
          startS: 26.52,
          endS: 26.84,
        },
        {
          word: "want ",
          success: true,
          startS: 26.84,
          endS: 27.24,
        },
        {
          word: "to ",
          success: true,
          startS: 27.24,
          endS: 27.54,
        },
        {
          word: "go, ",
          success: true,
          startS: 27.54,
          endS: 29.36,
        },
        {
          word: "everywhere ",
          success: true,
          startS: 29.36,
          endS: 30.26,
        },
        {
          word: "with ",
          success: true,
          startS: 30.26,
          endS: 30.66,
        },
        {
          word: "you\n",
          success: true,
          startS: 32.52,
          endS: 33.28,
        },
        {
          word: "theres ",
          success: true,
          startS: 33.32,
          endS: 35.08,
        },
        {
          word: "lots ",
          success: true,
          startS: 35.08,
          endS: 35.38,
        },
        {
          word: "of ",
          success: true,
          startS: 35.38,
          endS: 35.62,
        },
        {
          word: "places ",
          success: true,
          startS: 35.62,
          endS: 35.8,
        },
        {
          word: "to ",
          success: true,
          startS: 35.8,
          endS: 36.4,
        },
        {
          word: "explore\n",
          success: true,
          startS: 36.4,
          endS: 37.5,
        },
        {
          word: "and ",
          success: true,
          startS: 38.92,
          endS: 39.42,
        },
        {
          word: "this ",
          success: true,
          startS: 39.42,
          endS: 39.7,
        },
        {
          word: "is ",
          success: true,
          startS: 39.7,
          endS: 39.9,
        },
        {
          word: "what ",
          success: true,
          startS: 39.9,
          endS: 40.16,
        },
        {
          word: "life ",
          success: true,
          startS: 40.16,
          endS: 40.74,
        },
        {
          word: "is ",
          success: true,
          startS: 40.74,
          endS: 41.16,
        },
        {
          word: "for\n",
          success: true,
          startS: 41.16,
          endS: 41.88,
        },
        {
          word: "lets ",
          success: true,
          startS: 43.0,
          endS: 43.6,
        },
        {
          word: "go\n",
          success: true,
          startS: 43.6,
          endS: 44.36,
        },
        {
          word: "oh ",
          success: true,
          startS: 45.86,
          endS: 46.46,
        },
        {
          word: "oh ",
          success: true,
          startS: 46.46,
          endS: 48.02,
        },
        {
          word: "oh\n",
          success: true,
          startS: 48.02,
          endS: 49.0,
        },
        {
          word: "lets ",
          success: true,
          startS: 50.98,
          endS: 52.22,
        },
        {
          word: "go\n",
          success: true,
          startS: 52.22,
          endS: 53.0,
        },
        {
          word: "oh ",
          success: true,
          startS: 54.44,
          endS: 55.06,
        },
        {
          word: "oh ",
          success: true,
          startS: 55.06,
          endS: 56.56,
        },
        {
          word: "oh ",
          success: true,
          startS: 56.56,
          endS: 57.46,
        },
        {
          word: "oh\n",
          success: true,
          startS: 60.56,
          endS: 61.4,
        },
        {
          word: "life ",
          success: true,
          startS: 61.4,
          endS: 61.4,
        },
        {
          word: "is ",
          success: true,
          startS: 61.4,
          endS: 61.88,
        },
        {
          word: "a ",
          success: true,
          startS: 61.88,
          endS: 62.12,
        },
        {
          word: "journey, ",
          success: true,
          startS: 62.12,
          endS: 62.92,
        },
        {
          word: "life ",
          success: true,
          startS: 62.92,
          endS: 63.58,
        },
        {
          word: "is ",
          success: true,
          startS: 63.58,
          endS: 64.04,
        },
        {
          word: "a ",
          success: true,
          startS: 64.04,
          endS: 64.26,
        },
        {
          word: "jouney\n",
          success: true,
          startS: 68.0,
          endS: 68.1,
        },
        {
          word: "and ",
          success: true,
          startS: 69.52,
          endS: 69.68,
        },
        {
          word: "i ",
          success: true,
          startS: 69.68,
          endS: 70.06,
        },
        {
          word: "want ",
          success: true,
          startS: 70.06,
          endS: 70.46,
        },
        {
          word: "to ",
          success: true,
          startS: 70.46,
          endS: 70.8,
        },
        {
          word: "go, ",
          success: true,
          startS: 70.8,
          endS: 71.94,
        },
        {
          word: "and ",
          success: true,
          startS: 71.94,
          endS: 72.9,
        },
        {
          word: "live ",
          success: true,
          startS: 72.9,
          endS: 73.28,
        },
        {
          word: "it ",
          success: true,
          startS: 73.28,
          endS: 73.5,
        },
        {
          word: "up ",
          success: true,
          startS: 73.5,
          endS: 73.7,
        },
        {
          word: "with ",
          success: true,
          startS: 73.7,
          endS: 73.84,
        },
        {
          word: "you\n",
          success: true,
          startS: 73.84,
          endS: 74.7,
        },
        {
          word: "so ",
          success: true,
          startS: 77.9,
          endS: 78.3,
        },
        {
          word: "come ",
          success: true,
          startS: 78.3,
          endS: 78.6,
        },
        {
          word: "with ",
          success: true,
          startS: 78.6,
          endS: 78.8,
        },
        {
          word: "me ",
          success: true,
          startS: 78.8,
          endS: 79.06,
        },
        {
          word: "and ",
          success: true,
          startS: 79.06,
          endS: 79.26,
        },
        {
          word: "take ",
          success: true,
          startS: 79.26,
          endS: 79.64,
        },
        {
          word: "my ",
          success: true,
          startS: 79.64,
          endS: 80.08,
        },
        {
          word: "hand\n",
          success: true,
          startS: 80.08,
          endS: 81.2,
        },
        {
          word: "enjoy ",
          success: true,
          startS: 82.52,
          endS: 82.92,
        },
        {
          word: "the ",
          success: true,
          startS: 82.92,
          endS: 83.16,
        },
        {
          word: "ride ",
          success: true,
          startS: 83.16,
          endS: 83.44,
        },
        {
          word: "here ",
          success: true,
          startS: 83.44,
          endS: 83.9,
        },
        {
          word: "i ",
          success: true,
          startS: 83.9,
          endS: 84.64,
        },
        {
          word: "am\n",
          success: true,
          startS: 84.64,
          endS: 85.58,
        },
        {
          word: "lets ",
          success: true,
          startS: 86.38,
          endS: 86.82,
        },
        {
          word: "go\n",
          success: true,
          startS: 86.82,
          endS: 87.62,
        },
        {
          word: "oh ",
          success: true,
          startS: 88.98,
          endS: 89.7,
        },
        {
          word: "oh ",
          success: true,
          startS: 89.7,
          endS: 91.66,
        },
        {
          word: "oh\n",
          success: true,
          startS: 91.66,
          endS: 92.6,
        },
        {
          word: "lets ",
          success: true,
          startS: 94.54,
          endS: 95.46,
        },
        {
          word: "go\n",
          success: true,
          startS: 95.46,
          endS: 96.36,
        },
        {
          word: "oh ",
          success: true,
          startS: 97.52,
          endS: 97.98,
        },
        {
          word: "oh ",
          success: true,
          startS: 97.98,
          endS: 97.98,
        },
        {
          word: "oh ",
          success: true,
          startS: 100.34,
          endS: 101.42,
        },
        {
          word: "oh\n",
          success: true,
          startS: 101.42,
          endS: 101.74,
        },
        {
          word: "lets ",
          success: true,
          startS: 103.5,
          endS: 104.22,
        },
        {
          word: "see ",
          success: true,
          startS: 104.22,
          endS: 104.64,
        },
        {
          word: "the ",
          success: true,
          startS: 104.64,
          endS: 104.96,
        },
        {
          word: "world, ",
          success: true,
          startS: 104.96,
          endS: 106.1,
        },
        {
          word: "just ",
          success: true,
          startS: 106.1,
          endS: 106.4,
        },
        {
          word: "take ",
          success: true,
          startS: 106.4,
          endS: 106.82,
        },
        {
          word: "my ",
          success: true,
          startS: 106.82,
          endS: 107.18,
        },
        {
          word: "hand\n",
          success: true,
          startS: 107.18,
          endS: 107.8,
        },
        {
          word: "its ",
          success: true,
          startS: 108.44,
          endS: 108.58,
        },
        {
          word: "all ",
          success: true,
          startS: 108.58,
          endS: 108.96,
        },
        {
          word: "apart ",
          success: true,
          startS: 108.96,
          endS: 109.88,
        },
        {
          word: "of ",
          success: true,
          startS: 109.88,
          endS: 110.7,
        },
        {
          word: "this ",
          success: true,
          startS: 110.7,
          endS: 110.86,
        },
        {
          word: "master ",
          success: true,
          startS: 110.86,
          endS: 111.4,
        },
        {
          word: "plan\n",
          success: true,
          startS: 111.4,
          endS: 112.24,
        },
        {
          word: "theres ",
          success: true,
          startS: 112.58,
          endS: 112.88,
        },
        {
          word: "so ",
          success: true,
          startS: 112.88,
          endS: 113.24,
        },
        {
          word: "much ",
          success: true,
          startS: 113.24,
          endS: 113.7,
        },
        {
          word: "beauty ",
          success: true,
          startS: 113.7,
          endS: 114.32,
        },
        {
          word: "for ",
          success: true,
          startS: 114.32,
          endS: 115.08,
        },
        {
          word: "both ",
          success: true,
          startS: 115.08,
          endS: 115.64,
        },
        {
          word: "of ",
          success: true,
          startS: 115.64,
          endS: 115.96,
        },
        {
          word: "us ",
          success: true,
          startS: 115.96,
          endS: 116.5,
        },
        {
          word: "to ",
          success: true,
          startS: 116.5,
          endS: 116.84,
        },
        {
          word: "see\n",
          success: true,
          startS: 116.84,
          endS: 118.54,
        },
        {
          word: "love ",
          success: true,
          startS: 119.3,
          endS: 121.96,
        },
        {
          word: "is ",
          success: true,
          startS: 121.96,
          endS: 122.46,
        },
        {
          word: "a ",
          success: true,
          startS: 122.46,
          endS: 122.84,
        },
        {
          word: "journey, ",
          success: true,
          startS: 122.84,
          endS: 123.6,
        },
        {
          word: "wanna ",
          success: true,
          startS: 123.72,
          endS: 126.7,
        },
        {
          word: "go ",
          success: true,
          startS: 126.7,
          endS: 126.96,
        },
        {
          word: "everywhere ",
          success: true,
          startS: 126.96,
          endS: 127.44,
        },
        {
          word: "with ",
          success: true,
          startS: 127.44,
          endS: 127.92,
        },
        {
          word: "you\n",
          success: true,
          startS: 132.04,
          endS: 133.16,
        },
        {
          word: "come ",
          success: true,
          startS: 133.16,
          endS: 133.16,
        },
        {
          word: "with ",
          success: true,
          startS: 133.16,
          endS: 133.52,
        },
        {
          word: "me ",
          success: true,
          startS: 133.52,
          endS: 134.08,
        },
        {
          word: "baby\n",
          success: true,
          startS: 134.08,
          endS: 134.08,
        },
        {
          word: "((tommorrow ",
          success: true,
          startS: 134.16,
          endS: 134.86,
        },
        {
          word: "never ",
          success: true,
          startS: 134.86,
          endS: 135.34,
        },
        {
          word: "comes))\n",
          success: true,
          startS: 135.34,
          endS: 136.12,
        },
        {
          word: "lets ",
          success: true,
          startS: 136.24,
          endS: 136.46,
        },
        {
          word: "go\n",
          success: true,
          startS: 136.46,
          endS: 137.44,
        },
        {
          word: "oh ",
          success: true,
          startS: 138.5,
          endS: 139.42,
        },
        {
          word: "oh ",
          success: true,
          startS: 139.42,
          endS: 141.32,
        },
        {
          word: "oh\n",
          success: true,
          startS: 141.32,
          endS: 141.68,
        },
        {
          word: "life ",
          success: true,
          startS: 170.06,
          endS: 170.96,
        },
        {
          word: "is ",
          success: true,
          startS: 170.96,
          endS: 171.86,
        },
        {
          word: "a ",
          success: true,
          startS: 171.86,
          endS: 172.06,
        },
        {
          word: "journey\n",
          success: true,
          startS: 172.06,
          endS: 172.66,
        },
        {
          word: "wanna ",
          success: true,
          startS: 176.16,
          endS: 176.26,
        },
        {
          word: "go ",
          success: true,
          startS: 176.36,
          endS: 176.46,
        },
        {
          word: "everywhere ",
          success: true,
          startS: 176.56,
          endS: 177.12,
        },
        {
          word: "with ",
          success: true,
          startS: 177.12,
          endS: 177.74,
        },
        {
          word: "you\n",
          success: true,
          startS: 177.74,
          endS: 178.02,
        },
      ],
    },
    {
      id: "5",
      // title: "Do You Still Dream - Explosive Ear Candy",
      title: "Your Personal Playlist",
      audioUrl:
        "https://prod-1.storage.jamendo.com/?trackid=1313604&format=mp31&from=KAoxihnLMoMxaUaRJCz9lA%3D%3D%7C18KY5JYvhKxE2WwPxyqjIg%3D%3D",
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
      alignedWords: [
        {
          word: "Do ",
          success: true,
          startS: 17.24,
          endS: 17.24,
        },
        {
          word: "you ",
          success: true,
          startS: 17.24,
          endS: 17.46,
        },
        {
          word: "still ",
          success: true,
          startS: 17.46,
          endS: 17.7,
        },
        {
          word: "dream\n",
          success: true,
          startS: 17.7,
          endS: 18.14,
        },
        {
          word: "About ",
          success: true,
          startS: 18.62,
          endS: 18.62,
        },
        {
          word: "when ",
          success: true,
          startS: 18.62,
          endS: 19.04,
        },
        {
          word: "we ",
          success: true,
          startS: 19.04,
          endS: 19.5,
        },
        {
          word: "were ",
          success: true,
          startS: 19.5,
          endS: 19.68,
        },
        {
          word: "young\n",
          success: true,
          startS: 19.68,
          endS: 20.06,
        },
        {
          word: "And ",
          success: true,
          startS: 20.32,
          endS: 20.46,
        },
        {
          word: "the ",
          success: true,
          startS: 20.46,
          endS: 20.66,
        },
        {
          word: "world ",
          success: true,
          startS: 20.66,
          endS: 21.04,
        },
        {
          word: "was ",
          success: true,
          startS: 21.04,
          endS: 21.46,
        },
        {
          word: "our ",
          success: true,
          startS: 21.46,
          endS: 21.64,
        },
        {
          word: "playground ",
          success: true,
          startS: 21.64,
          endS: 22.3,
        },
        {
          word: "to ",
          success: true,
          startS: 22.3,
          endS: 22.54,
        },
        {
          word: "claim\n",
          success: true,
          startS: 22.54,
          endS: 22.92,
        },
        {
          word: "Everything ",
          success: true,
          startS: 25.28,
          endS: 25.38,
        },
        {
          word: "seemed ",
          success: true,
          startS: 25.38,
          endS: 26.08,
        },
        {
          word: "like ",
          success: true,
          startS: 26.08,
          endS: 26.3,
        },
        {
          word: "a ",
          success: true,
          startS: 26.3,
          endS: 26.5,
        },
        {
          word: "new ",
          success: true,
          startS: 26.5,
          endS: 26.86,
        },
        {
          word: "gift ",
          success: true,
          startS: 26.86,
          endS: 27.22,
        },
        {
          word: "just ",
          success: true,
          startS: 27.22,
          endS: 27.54,
        },
        {
          word: "waiting ",
          success: true,
          startS: 27.54,
          endS: 28.12,
        },
        {
          word: "for ",
          success: true,
          startS: 28.12,
          endS: 28.46,
        },
        {
          word: "us ",
          success: true,
          startS: 28.46,
          endS: 29.02,
        },
        {
          word: "to ",
          success: true,
          startS: 29.02,
          endS: 30.36,
        },
        {
          word: "share.\n",
          success: true,
          startS: 30.36,
          endS: 32.02,
        },
        {
          word: "Do ",
          success: true,
          startS: 32.84,
          endS: 32.84,
        },
        {
          word: "you ",
          success: true,
          startS: 32.84,
          endS: 33.08,
        },
        {
          word: "still ",
          success: true,
          startS: 33.08,
          endS: 33.3,
        },
        {
          word: "dream\n",
          success: true,
          startS: 33.3,
          endS: 33.82,
        },
        {
          word: "That ",
          success: true,
          startS: 34.08,
          endS: 34.08,
        },
        {
          word: "we’re ",
          success: true,
          startS: 34.08,
          endS: 35.08,
        },
        {
          word: "falling ",
          success: true,
          startS: 35.08,
          endS: 35.08,
        },
        {
          word: "in ",
          success: true,
          startS: 35.08,
          endS: 35.48,
        },
        {
          word: "love\n",
          success: true,
          startS: 35.48,
          endS: 35.64,
        },
        {
          word: "For ",
          success: true,
          startS: 35.9,
          endS: 36.06,
        },
        {
          word: "the ",
          success: true,
          startS: 36.06,
          endS: 36.22,
        },
        {
          word: "first ",
          success: true,
          startS: 36.22,
          endS: 36.74,
        },
        {
          word: "time ",
          success: true,
          startS: 36.74,
          endS: 37.06,
        },
        {
          word: "again ",
          success: true,
          startS: 37.06,
          endS: 37.5,
        },
        {
          word: "and ",
          success: true,
          startS: 37.5,
          endS: 38.06,
        },
        {
          word: "again\n",
          success: true,
          startS: 38.06,
          endS: 38.82,
        },
        {
          word: "Walking ",
          success: true,
          startS: 40.34,
          endS: 40.9,
        },
        {
          word: "on ",
          success: true,
          startS: 40.9,
          endS: 41.18,
        },
        {
          word: "clouds ",
          success: true,
          startS: 41.18,
          endS: 41.48,
        },
        {
          word: "with ",
          success: true,
          startS: 41.48,
          endS: 41.94,
        },
        {
          word: "the ",
          success: true,
          startS: 41.94,
          endS: 42.12,
        },
        {
          word: "sun ",
          success: true,
          startS: 42.12,
          endS: 42.56,
        },
        {
          word: "in ",
          success: true,
          startS: 42.56,
          endS: 42.92,
        },
        {
          word: "our ",
          success: true,
          startS: 42.92,
          endS: 43.1,
        },
        {
          word: "pockets ",
          success: true,
          startS: 43.1,
          endS: 43.76,
        },
        {
          word: "without ",
          success: true,
          startS: 44.42,
          endS: 44.42,
        },
        {
          word: "a ",
          success: true,
          startS: 44.42,
          endS: 45.96,
        },
        {
          word: "care.\n",
          success: true,
          startS: 45.96,
          endS: 47.8,
        },
        {
          word: "I ",
          success: true,
          startS: 48.16,
          endS: 48.2,
        },
        {
          word: "open ",
          success: true,
          startS: 48.2,
          endS: 48.66,
        },
        {
          word: "my ",
          success: true,
          startS: 48.66,
          endS: 48.98,
        },
        {
          word: "eyes ",
          success: true,
          startS: 48.98,
          endS: 49.52,
        },
        {
          word: "and ",
          success: true,
          startS: 49.52,
          endS: 49.76,
        },
        {
          word: "I ",
          success: true,
          startS: 49.76,
          endS: 49.92,
        },
        {
          word: "see ",
          success: true,
          startS: 49.92,
          endS: 50.34,
        },
        {
          word: "you\n",
          success: true,
          startS: 50.34,
          endS: 51.68,
        },
        {
          word: "You’re ",
          success: true,
          startS: 52.0,
          endS: 52.44,
        },
        {
          word: "there ",
          success: true,
          startS: 52.44,
          endS: 52.52,
        },
        {
          word: "by ",
          success: true,
          startS: 52.52,
          endS: 52.64,
        },
        {
          word: "my ",
          success: true,
          startS: 52.64,
          endS: 52.84,
        },
        {
          word: "side ",
          success: true,
          startS: 52.84,
          endS: 53.3,
        },
        {
          word: "all ",
          success: true,
          startS: 53.3,
          endS: 53.68,
        },
        {
          word: "along\n",
          success: true,
          startS: 53.68,
          endS: 54.6,
        },
        {
          word: "The ",
          success: true,
          startS: 55.74,
          endS: 56.06,
        },
        {
          word: "smile ",
          success: true,
          startS: 56.06,
          endS: 56.2,
        },
        {
          word: "on ",
          success: true,
          startS: 56.2,
          endS: 56.66,
        },
        {
          word: "your ",
          success: true,
          startS: 56.66,
          endS: 56.78,
        },
        {
          word: "face\n",
          success: true,
          startS: 56.78,
          endS: 57.12,
        },
        {
          word: "Always ",
          success: true,
          startS: 57.44,
          endS: 57.7,
        },
        {
          word: "tells ",
          success: true,
          startS: 57.7,
          endS: 58.14,
        },
        {
          word: "me ",
          success: true,
          startS: 58.14,
          endS: 58.54,
        },
        {
          word: "love ",
          success: true,
          startS: 58.54,
          endS: 59.08,
        },
        {
          word: "came ",
          success: true,
          startS: 59.08,
          endS: 59.54,
        },
        {
          word: "true ",
          success: true,
          startS: 75.98,
          endS: 77.3,
        },
        {
          word: "(oohhhhhh).\n",
          success: true,
          startS: 77.3,
          endS: 79.12,
        },
        {
          word: "Do ",
          success: true,
          startS: 79.64,
          endS: 79.64,
        },
        {
          word: "you ",
          success: true,
          startS: 79.64,
          endS: 79.88,
        },
        {
          word: "still ",
          success: true,
          startS: 79.88,
          endS: 80.14,
        },
        {
          word: "dream\n",
          success: true,
          startS: 80.14,
          endS: 80.64,
        },
        {
          word: "Of ",
          success: true,
          startS: 80.98,
          endS: 80.98,
        },
        {
          word: "the ",
          success: true,
          startS: 81.0,
          endS: 81.14,
        },
        {
          word: "things ",
          success: true,
          startS: 81.14,
          endS: 81.48,
        },
        {
          word: "that ",
          success: true,
          startS: 81.48,
          endS: 81.88,
        },
        {
          word: "we’ve ",
          success: true,
          startS: 81.88,
          endS: 82.24,
        },
        {
          word: "done\n",
          success: true,
          startS: 82.24,
          endS: 82.42,
        },
        {
          word: "And ",
          success: true,
          startS: 82.8,
          endS: 82.92,
        },
        {
          word: "the ",
          success: true,
          startS: 82.92,
          endS: 83.08,
        },
        {
          word: "things ",
          success: true,
          startS: 83.08,
          endS: 83.58,
        },
        {
          word: "that ",
          success: true,
          startS: 83.58,
          endS: 83.84,
        },
        {
          word: "we’ll ",
          success: true,
          startS: 83.84,
          endS: 84.1,
        },
        {
          word: "do ",
          success: true,
          startS: 84.1,
          endS: 84.44,
        },
        {
          word: "up ",
          success: true,
          startS: 84.44,
          endS: 84.86,
        },
        {
          word: "ahead\n",
          success: true,
          startS: 84.86,
          endS: 85.46,
        },
        {
          word: "We’re ",
          success: true,
          startS: 86.96,
          endS: 87.3,
        },
        {
          word: "one ",
          success: true,
          startS: 87.3,
          endS: 87.6,
        },
        {
          word: "in ",
          success: true,
          startS: 87.6,
          endS: 87.82,
        },
        {
          word: "a ",
          success: true,
          startS: 87.82,
          endS: 87.96,
        },
        {
          word: "billion ",
          success: true,
          startS: 87.96,
          endS: 88.56,
        },
        {
          word: "but ",
          success: true,
          startS: 88.56,
          endS: 88.86,
        },
        {
          word: "still ",
          success: true,
          startS: 88.86,
          endS: 89.34,
        },
        {
          word: "we’re ",
          success: true,
          startS: 89.34,
          endS: 90.54,
        },
        {
          word: "together\n",
          success: true,
          startS: 90.54,
          endS: 90.54,
        },
        {
          word: "By ",
          success: true,
          startS: 90.78,
          endS: 90.84,
        },
        {
          word: "chance ",
          success: true,
          startS: 90.84,
          endS: 91.34,
        },
        {
          word: "or ",
          success: true,
          startS: 91.34,
          endS: 92.82,
        },
        {
          word: "fate.\n",
          success: true,
          startS: 92.82,
          endS: 94.62,
        },
        {
          word: "I ",
          success: true,
          startS: 94.88,
          endS: 95.08,
        },
        {
          word: "open ",
          success: true,
          startS: 95.08,
          endS: 95.4,
        },
        {
          word: "my ",
          success: true,
          startS: 95.4,
          endS: 95.82,
        },
        {
          word: "eyes ",
          success: true,
          startS: 95.82,
          endS: 96.34,
        },
        {
          word: "and ",
          success: true,
          startS: 96.34,
          endS: 96.6,
        },
        {
          word: "I ",
          success: true,
          startS: 96.6,
          endS: 96.76,
        },
        {
          word: "see ",
          success: true,
          startS: 96.76,
          endS: 97.06,
        },
        {
          word: "you\n",
          success: true,
          startS: 97.06,
          endS: 97.76,
        },
        {
          word: "You’re ",
          success: true,
          startS: 98.82,
          endS: 99.08,
        },
        {
          word: "there ",
          success: true,
          startS: 99.08,
          endS: 99.3,
        },
        {
          word: "by ",
          success: true,
          startS: 99.3,
          endS: 99.46,
        },
        {
          word: "my ",
          success: true,
          startS: 99.46,
          endS: 99.64,
        },
        {
          word: "side ",
          success: true,
          startS: 99.64,
          endS: 100.12,
        },
        {
          word: "all ",
          success: true,
          startS: 100.12,
          endS: 100.48,
        },
        {
          word: "along\n",
          success: true,
          startS: 100.48,
          endS: 101.04,
        },
        {
          word: "The ",
          success: true,
          startS: 102.68,
          endS: 102.82,
        },
        {
          word: "smile ",
          success: true,
          startS: 102.82,
          endS: 103.2,
        },
        {
          word: "on ",
          success: true,
          startS: 103.2,
          endS: 103.5,
        },
        {
          word: "your ",
          success: true,
          startS: 103.5,
          endS: 103.58,
        },
        {
          word: "face\n",
          success: true,
          startS: 103.58,
          endS: 103.92,
        },
        {
          word: "Always ",
          success: true,
          startS: 104.2,
          endS: 104.5,
        },
        {
          word: "tells ",
          success: true,
          startS: 104.5,
          endS: 104.86,
        },
        {
          word: "me ",
          success: true,
          startS: 104.86,
          endS: 105.32,
        },
        {
          word: "love ",
          success: true,
          startS: 105.86,
          endS: 105.98,
        },
        {
          word: "came ",
          success: true,
          startS: 105.98,
          endS: 106.36,
        },
        {
          word: "true ",
          success: true,
          startS: 109.26,
          endS: 110.66,
        },
        {
          word: "(oohhhhhh).\n",
          success: true,
          startS: 110.66,
          endS: 110.66,
        },
        {
          word: "I ",
          success: true,
          startS: 110.66,
          endS: 110.66,
        },
        {
          word: "open ",
          success: true,
          startS: 110.66,
          endS: 111.04,
        },
        {
          word: "my ",
          success: true,
          startS: 111.04,
          endS: 111.44,
        },
        {
          word: "eyes ",
          success: true,
          startS: 111.44,
          endS: 111.94,
        },
        {
          word: "and ",
          success: true,
          startS: 111.94,
          endS: 112.2,
        },
        {
          word: "I ",
          success: true,
          startS: 112.2,
          endS: 112.34,
        },
        {
          word: "see ",
          success: true,
          startS: 112.34,
          endS: 112.68,
        },
        {
          word: "you\n",
          success: true,
          startS: 112.68,
          endS: 113.88,
        },
        {
          word: "You’re ",
          success: true,
          startS: 113.94,
          endS: 114.9,
        },
        {
          word: "there ",
          success: true,
          startS: 114.9,
          endS: 114.9,
        },
        {
          word: "by ",
          success: true,
          startS: 114.9,
          endS: 115.08,
        },
        {
          word: "my ",
          success: true,
          startS: 115.08,
          endS: 115.24,
        },
        {
          word: "side ",
          success: true,
          startS: 115.24,
          endS: 115.7,
        },
        {
          word: "all ",
          success: true,
          startS: 115.7,
          endS: 116.08,
        },
        {
          word: "along\n",
          success: true,
          startS: 116.08,
          endS: 116.64,
        },
        {
          word: "The ",
          success: true,
          startS: 118.12,
          endS: 118.48,
        },
        {
          word: "smile ",
          success: true,
          startS: 118.48,
          endS: 118.66,
        },
        {
          word: "on ",
          success: true,
          startS: 118.66,
          endS: 119.1,
        },
        {
          word: "your ",
          success: true,
          startS: 119.1,
          endS: 119.2,
        },
        {
          word: "face\n",
          success: true,
          startS: 119.2,
          endS: 119.52,
        },
        {
          word: "Always ",
          success: true,
          startS: 119.8,
          endS: 120.1,
        },
        {
          word: "tells ",
          success: true,
          startS: 120.1,
          endS: 120.54,
        },
        {
          word: "me ",
          success: true,
          startS: 120.54,
          endS: 120.96,
        },
        {
          word: "love ",
          success: true,
          startS: 120.96,
          endS: 121.54,
        },
        {
          word: "came ",
          success: true,
          startS: 121.54,
          endS: 121.98,
        },
        {
          word: "true ",
          success: true,
          startS: 155.32,
          endS: 155.4,
        },
        {
          word: "(oohhhhhh).\n",
          success: true,
          startS: 155.4,
          endS: 157.32,
        },
      ],
    },
  ],
};

export type QuadrantKey = "sunny" | "stormy" | "rainy" | "breezy";
export const ALL_QUADRANTS: QuadrantKey[] = [
  "sunny",
  "stormy",
  "rainy",
  "breezy",
];
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
