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
  age: string;
  email: string;
  favoriteGenre: string;
  favoriteBand: string;
};

export interface LyricsResult {
  lyrics: string;
  musicStyle: string;
}

export const DEBUG_MODE = false;
export const LISTEN_BEFORE_GENERATE_MS = 2000;
export const CONTINUOUS_PLAYBACK_MS = 5000;

export const EMOTION_MAP: EmotionPoint[] = [
  // ── Q1: High Valence, High Arousal ─────────────────────────────────────────
  { emotion: "Excited", valence: 9.17, arousal: 9.38 }, // NRC
  { emotion: "Thrilling", valence: 9.52, arousal: 9.14 }, // NRC
  { emotion: "Elated", valence: 8.19, arousal: 8.2 }, // NRC+ANEW
  { emotion: "Energetic", valence: 8.62, arousal: 8.81 }, // NRC
  { emotion: "Playful", valence: 9.03, arousal: 7.19 }, // NRC
  { emotion: "Lively", valence: 8.3, arousal: 7.19 }, // NRC+ANEW
  { emotion: "Joyful", valence: 9.54, arousal: 6.59 }, // NRC+ANEW
  { emotion: "Cheerful", valence: 9.96, arousal: 6.53 }, // NRC
  { emotion: "Upbeat", valence: 8.9, arousal: 5.78 }, // NRC
  { emotion: "Uplifting", valence: 7.94, arousal: 5.93 }, // NRC
  { emotion: "Hopeful", valence: 8.69, arousal: 5.3 }, // NRC+ANEW

  // ── Q2: Low Valence, High Arousal ──────────────────────────────────────────
  { emotion: "Panicked", valence: 1.9, arousal: 9.54 }, // NRC
  { emotion: "Enraged", valence: 2.19, arousal: 9.34 }, // NRC+ANEW
  { emotion: "Agitated", valence: 5.0, arousal: 8.94 }, // NRC
  { emotion: "Alarmed", valence: 2.69, arousal: 8.4 }, // NRC
  { emotion: "Angry", valence: 2.59, arousal: 8.21 }, // NRC+ANEW
  { emotion: "Anxious", valence: 4.41, arousal: 8.27 }, // NRC+ANEW
  { emotion: "Nervous", valence: 3.23, arousal: 7.83 }, // NRC+ANEW
  { emotion: "Distressed", valence: 2.17, arousal: 7.51 }, // NRC+ANEW
  { emotion: "Stressed", valence: 2.50, arousal: 7.66 }, // NRC+ANEW
  { emotion: "Frustrated", valence: 2.19, arousal: 6.52 }, // NRC+ANEW
  { emotion: "Ashamed", valence: 2.4, arousal: 6.29 }, // NRC
  { emotion: "Fearful", valence: 2.08, arousal: 6.17 }, // NRC+ANEW
  { emotion: "Tense", valence: 4.22, arousal: 6.09 }, // NRC+ANEW

  // ── Q3: Low Valence, Low Arousal ───────────────────────────────────────────
  { emotion: "Sorrowful", valence: 1.44, arousal: 4.8 }, // NRC
  { emotion: "Depressed", valence: 1.57, arousal: 5.1 }, // NRC+ANEW
  { emotion: "Hopeless", valence: 1.85, arousal: 3.68 }, // NRC
  { emotion: "Gloomy", valence: 1.96, arousal: 4.69 }, // NRC
  { emotion: "Sad", valence: 2.36, arousal: 4.26 }, // NRC+ANEW
  { emotion: "Apathetic", valence: 2.69, arousal: 3.63 }, // NRC
  { emotion: "Melancholic", valence: 2.63, arousal: 3.75 }, // NRC
  { emotion: "Lonely", valence: 2.78, arousal: 3.99 }, // NRC+ANEW
  { emotion: "Bored", valence: 2.79, arousal: 2.78 }, // NRC+ANEW
  { emotion: "Weary", valence: 3.44, arousal: 3.85 }, // NRC+ANEW
  { emotion: "Sluggish", valence: 3.02, arousal: 2.12 }, // NRC

  // ── Q4: High Valence, Low Arousal ──────────────────────────────────────────
  { emotion: "Tranquil", valence: 9.63, arousal: 1.28 }, // NRC
  { emotion: "Calm", valence: 8.88, arousal: 1.45 }, // NRC
  { emotion: "Peaceful", valence: 8.8, arousal: 1.49 }, // NRC
  { emotion: "Relaxed", valence: 8.27, arousal: 1.98 }, // NRC+ANEW
  { emotion: "Serene", valence: 8.22, arousal: 2.19 }, // NRC
  { emotion: "Restful", valence: 8.03, arousal: 2.04 }, // NRC
  { emotion: "Content", valence: 7.88, arousal: 3.66 }, // NRC
  { emotion: "Cozy", valence: 8.69, arousal: 3.91 }, // NRC+ANEW
  { emotion: "Comforting", valence: 9.15, arousal: 4.03 }, // NRC
  { emotion: "Dreamy", valence: 8.53, arousal: 4.15 }, // NRC
  { emotion: "Grateful", valence: 8.89, arousal: 4.6 }, // NRC+ANEW
  { emotion: "Nostalgic", valence: 5.12, arousal: 4.16 }, // NRC

  // ── Cross-quadrant: Trajectory waypoints & mid-space ──────────────────────
  { emotion: "Warm", valence: 7.84, arousal: 3.81 }, // NRC
  { emotion: "Contemplative", valence: 7.56, arousal: 3.77 }, // NRC
  { emotion: "Profound", valence: 7.8, arousal: 5.91 }, // NRC
  { emotion: "Solemn", valence: 6.05, arousal: 4.11 }, // NRC+ANEW
  { emotion: "Pensive", valence: 5.86, arousal: 2.98 }, // NRC
  { emotion: "Indifferent", valence: 4.81, arousal: 2.93 }, // NRC+ANEW
  { emotion: "Wistful", valence: 3.91, arousal: 5.06 }, // NRC
  { emotion: "Detached", valence: 3.87, arousal: 4.62 }, // NRC+ANEW
  { emotion: "Uneasy", valence: 2.04, arousal: 6.38 }, // NRC
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

export const EMOTION_TEMPO_MAP = {
  calm: [60, 75],
  comforting: [70, 90],
  hopeful: [85, 110],
  joyful: [105, 135],
};

export const MOCK_LYRICS = `
  Line 1 of the mock lyrics
  Line 2 of the mock lyrics
  Line 3 of the mock lyrics
  Line 4 of the mock lyrics

  Line 5 of the mock lyrics
  Line 6 of the mock lyrics
  Line 7 of the mock lyrics
  Line 8 of the mock lyrics
  
  Line 9 of the mock lyrics
  Line 10 of the mock lyrics
  Line 11 of the mock lyrics
  Line 12 of the mock lyrics
`;
export const EMOTION_GRID: string[][] = [
  ["Stressed", "Angry", "Anxious", "Frustrated"],
  ["Excited", "Energetic", "Hopeful", "Joyful"],
  ["Sad", "Lonely", "Weary", "Bored"],
  ["Calm", "Relaxed", "Content", "Peaceful"],
];

export const PRE_GENERATED_PLAYLIST = {
  calm: [
    {
      id: "1",
      title: "Tate McRae, Jeremy Zucker - that way",
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
      title: "At My Worst",
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
      title: "Lonely",
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
      title: "Til Death Do Us Part",
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
      title: "As It Was",
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
      title: "Belong Together",
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
      title: "Ain't No Mountain High Enough",
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
      title: "Until I Found You",
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
      title: "So Easy (To Fall In Love)",
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
