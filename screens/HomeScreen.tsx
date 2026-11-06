import Biomarkers from "@/components/ui/biomarkers";
import DebugOptionsModal from "@/components/ui/debug-options-modal";
import { EmotionPicker } from "@/components/ui/emotion-picker";
import LoadingPhrases from "@/components/ui/loading-phrases";
import LyricAnimator from "@/components/ui/lyric-animator";
import {
  addTrackToSession,
  createMusicSession,
  updateTrackFields,
} from "@/services/DbService";
import {
  clearSessionId,
  clearTrackIds,
  getRandomGenres,
  getSessionId,
  getTrackId,
  saveSessionId,
  saveTrackId,
} from "@/services/LocalUserService";
import { formatTime } from "@/util/commonUtils";
import { FontAwesome5 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import * as Location from "expo-location";
import { useNavigation } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CommonButton from "../components/ui/common-button";
import EmotionInput from "../components/ui/emotion-input";
import HealthProviderSection from "../components/ui/health-provider";
import {
  ADD_ABOUT_TO_PROMPT,
  ADD_PROFESSION_TO_PROMPT,
  AUTO_GENERATE_NEWS_IN_PROMPT,
  CONTINUOUS_PLAYBACK_MS,
  DEBUG_MODE,
  HealthProvider,
  HRV_APP_VERSION,
  LISTEN_BEFORE_GENERATE_MS,
  QuadrantKey,
  REPETITIVE_CHECK_IN_PROMPT,
  SHOW_LYRICS,
  SUNO_ORG_PAYLOAD,
  UserInput,
  UserProfile,
} from "../constants/appConstants";
import { useAuth } from "../context/AuthContext";
import {
  buildEmotionPath,
  buildVAPath,
  getAdaptationStrategy,
  getBiometricAdjustedEmotion,
} from "../services/EmotionPathService";
import {
  fetchAppleHealthData,
  fetchHealthConnectData,
  HealthData,
} from "../services/HealthService";
import {
  downloadAndSaveAudio,
  GeneratedSong,
  generatelyrics,
  generateSong,
  onFinalReady,
} from "../services/MusicGenerationService";
import {
  fetchUniqueNewsData,
  fetchWeatherData,
  NewsData,
  WeatherData,
} from "../services/WeatherNewsService";

const DEFAULT_DURATION = 150;

export default function HomeScreen() {
  const authContext = useAuth();
  const user = authContext.user as UserProfile;
  const navigation = useNavigation();

  const [input, setInput] = useState<UserInput>({
    currentMood: "",
    desiredMood: "",
    activity: "",
  });
  // const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>({
    heartRate: 70,
    heartRateSamples: [],
    steps: 372,
    hrv: null,
    arousal: null,
  });
  const [healthProvider, setHealthProvider] =
    useState<HealthProvider>("Apple Health");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsData, setNewsData] = useState<NewsData | null>(null);

  const [loading, setLoading] = useState(false);
  const [nextSongLoading, setNextSongLoading] = useState(false);
  const [songJustFinished, setSongJustFinished] = useState(false);
  const [lyricPrompt, setLyricPrompt] = useState("");

  const [emotionPath, setEmotionPath] = useState<string[]>([]);
  const [songQueue, setSongQueue] = useState<GeneratedSong[]>([]);
  const [lyricsQueue, setLyricsQueue] = useState<string[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [generationLockedForIndex, setGenerationLockedForIndex] = useState<
    number | null
  >(null);
  const [downloadedAudios, setDownloadedAudios] = useState<
    Record<number, string>
  >({});

  // --- NEW: VA trajectory and biometric state ---
  const [vaPath, setVaPath] = useState<{ valence: number; arousal: number }[]>(
    [],
  );
  const [sliderValue, setSliderValue] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [ratingUnlocked, setRatingUnlocked] = useState(false);
  const [songRatings, setSongRatings] = useState<Record<number, "up" | "down">>(
    {},
  );
  const [trackStoredInDB, setTrackStoredInDB] = useState<
    Record<number, boolean>
  >({});

  const listenIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const nudgeAnim = useRef(new Animated.Value(1)).current;
  const scrollViewRef = useRef<ScrollView>(null);
  const lyricsRef = useRef<View>(null);
  const indicatorAnim = useRef(new Animated.Value(1)).current;

  const isFormComplete = useMemo(() => {
    const requiredFields = [input.currentMood, input.desiredMood];
    return requiredFields.every((val) => val.trim() !== "");
  }, [input]);

  const currentSong = songQueue[currentSongIndex] ?? null;
  const currentSongLyrics = lyricsQueue[currentSongIndex] ?? null;
  const player = useAudioPlayer(currentSong?.audioUrl || "");
  const playerStatus = useAudioPlayerStatus(player);
  const duration = player?.duration ?? 0;
  const currentTime = player?.currentTime ?? 0;

  const indicatorIcon = useMemo(() => {
    const { currentMood, desiredMood, activity } = input;

    if (!currentMood) return "current";
    else if (!desiredMood) return "desired";
    else if (!activity) return "activity";
    return "";
  }, [input]);

  const handleSlidingComplete = async (value: number) => {
    try {
      await player.seekTo(value);
    } catch (err: any) {
      console.warn("Seek failed: ", err?.message);
    }
  };

  const handleInputChange = (key: keyof UserInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };

  const fetchLatestHealthData = useCallback(async () => {
    switch (healthProvider) {
      case "Apple Health":
        return await fetchAppleHealthData(5);
      case "Health Connect":
      default:
        return await fetchHealthConnectData();
    }
  }, [healthProvider]);

  const clearStates = async () => {
    setEmotionPath([]);
    setSongQueue([]);
    setCurrentSongIndex(0);
    setGenerationLockedForIndex(null);
    setDownloadedAudios({});
    setVaPath([]);
    setLyricsQueue([]);
    setSongRatings({});
    setTrackStoredInDB({});
    await clearSessionId();
    await clearTrackIds();
  };

  const unlockRating = (index: number) => {
    if (songRatings[index] === undefined) {
      setRatingUnlocked(true);
    }
  };

  const generateTrajectory = () => {
    const { currentMood, desiredMood } = input;

    if (DEBUG_MODE) {
      return [currentMood || "Bored", desiredMood || "Relaxed"];
    }

    let trajec = buildEmotionPath(
      currentMood,
      desiredMood || "Relaxed",
      3,
      false,
    );

    if (trajec.length === 1) {
      return [currentMood || "Bored", desiredMood || "Relaxed"];
    }
    return trajec;
  };

  const buildLyricsPrompt = async (
    mood: string,
    healthData: HealthData,
    favGenre: string,
    valence: number = 0,
    arousal: number = 0,
    strategy: string = "",
  ) => {
    const isHrValid = !!healthData.heartRate;
    const isStepsValid = !!healthData.steps;
    const isHRV = HRV_APP_VERSION;

    const { weather, news } = (await fetchWeatherAndNews()) || {};
    const addProfession = ADD_PROFESSION_TO_PROMPT && !!user?.profession;
    const about = ADD_ABOUT_TO_PROMPT && user?.about?.trim();
    const newsHeadlines = (news?.headline || [])
      .map((h, i) => `  ${i + 1}. "${h}"`)
      .join("\n");

    const preventRepetition = REPETITIVE_CHECK_IN_PROMPT;
    const repetitionRules = `
      PERSONALIZATION STRATEGY (IMPORTANT)
      Do not try to include every user input in the lyrics.

      Before writing, internally select only 2–4 meaningful elements from the available personal context.

      Choose elements that create the strongest emotional story:
      - About details (interests, memories, personality, preferences)
      - Profession experiences or routines
      - Activity/movement state
      - Weather/environment
      - Location atmosphere
      - Mood
      - Music style influence
      - Physical state
      - News context, ONLY when it is emotionally relevant to the mood

      ${
        AUTO_GENERATE_NEWS_IN_PROMPT
          ? `
      NEWS CONTEXT (OPTIONAL):
      News is an optional creative element, just like the other personalization inputs.
      It does NOT need to appear in every song.

      First internally decide whether news would strengthen the current song.
      If a provided news headline is available and emotionally relevant to the mood:
      - You may select it as one of the 2–4 elements.
      - Do not summarize or directly reproduce the headline.
      - Extract a relatable human emotion, situation, experience, or broader theme from it.
      - Weave that theme naturally into the lyrics.

      If provided news is unavailable, irrelevant, or does not fit the selected
      emotional direction:
      - You may optionally create a fictional, general "news-like" situation
        that naturally fits the mood.
      - This should be used only as creative inspiration, not as factual current news.
      - Do not invent real people, organizations, locations, statistics, or specific
        current events.
      - Keep the imagined situation broad and human, such as a community helping
        each other, a small local celebration, a new discovery, people rebuilding
        after difficulty, or an unexpected act of kindness.
      - Transform the situation into an emotion or human experience rather than
        writing a news report.

      The model should decide internally whether to use:
      A) the provided news,
      B) an internally imagined news-like context, or
      C) no news context at all.

      News, whether provided or internally imagined, counts as ONE personalization
      element within the 2–4 element limit.
      Do not force news into the song.
        `
          : ``
      }

      Treat the remaining inputs as background context only.

      Each song should have a different personalization focus.
      Do not repeatedly use the same type of details across songs.

      Example:
      One song may focus on a personal memory + weather.
      Another may focus on daily routine + profession.
      Another may focus on movement + inner emotion.

      The goal is a unique emotional story, not a summary of the user's data.      
    `;
    const originalityRules = `
      6. ORIGINALITY and LYRIC VARIATION RULES:
      - Avoid repeating phrases, metaphors, sentence patterns, and imagery from previous songs.
      - Do not default to common AI lyric imagery.
      - Prefer specific and unexpected details over generic emotional descriptions.
      - Create a new setting, perspective, and emotional angle for each song.

      Avoid overused imagery such as:
      ceiling fans, fluorescent lights, city lights, lonely streets,
      empty roads, rain on windows, coffee cups, shadows,
      heartbeat drums, echoes, midnight trains, neon lights.

      Use different vocabulary, environments, and metaphors each time.
    `;
    const strategyGuidance: Record<string, string> = {
      on_track:
        "The listener is responding well. Continue the current emotional trajectory.",
      slow_down:
        "The listener's arousal is higher than expected (possibly stressed/anxious). " +
        "Use slower tempo, softer instrumentation, and more calming imagery to help them relax.",
      intensify:
        "The listener is calmer than expected. " +
        "Slightly increase energy with more rhythmic elements and uplifting imagery.",
      hold_steady:
        "Maintain the current energy level. The listener is in a transitional state.",
    };
    const prompt = `
      You are a creative songwriter. Generate original song lyrics personalized to the following inputs:

      USER
      ${user?.nickName && `- Name: ${user.nickName}`}
      - Age: ${user?.age}
      ${addProfession ? `- Profession: ${user.profession}` : ""}
      ${about ? `- About: ${about}` : ""}

      MUSIC STYLE
      - Genre preference: ${favGenre}
      - Stylistic influence (do NOT imitate or quote): ${user?.favoriteBand}
      - Mood: ${mood}
      ${isHRV ? `- Emotional coordinates: Valence ${valence} (${valence > 0 ? "positive" : "negative"}), Arousal ${arousal} (${arousal > 0.5 ? "high energy" : "low energy"})` : ""}

      PHYSICAL CONTEXT
      ${isHrValid ? `- Heart rate in last 5 min: ${healthData.heartRate} bpm` : ""}
      ${isStepsValid ? `- Movement in last 5 min: ${healthData.steps} steps` : ""}
      - Current or upcoming activity: ${input.activity}
      ${
        isHRV
          ? `
        - HRV: ${healthData.hrv ?? "N/A"} ms
        - Estimated emotional arousal: ${healthData.arousal !== null ? (healthData.arousal * 100).toFixed(0) + "%" : "N/A"}

        BIOMETRIC ADAPTATION
        ${strategyGuidance[strategy] || strategyGuidance.on_track}
      `
          : ""
      }

      ENVIRONMENT
      - Location: ${weather?.city || "Unknown"}
      - Weather: ${weather?.temperature ? `${weather.temperature}°C, ${weather.description}` : "Unknown"}
      - Optional news inspiration (pick at most one if emotionally relevant, ignore the rest):
      ${newsHeadlines}

      ${preventRepetition ? `${repetitionRules}` : ""}

      TASK:
      Write cohesive song lyrics.
      1. Structure: Verse 1, Pre-Chorus, Chorus, Verse 2, Pre-Chorus, Outro.
      2. Line count (STRICT): Verse = 4 lines, Pre-Chorus = 2 lines, Chorus = 4 lines, Outro = 3 lines. Total: 23 lines.
      3. Line length: Each line must be 6–10 words. No long run-on lines.
      4. Tone: ${mood} and emotionally grounded.
      ${
        preventRepetition
          ? `
      5. Integration:
      - Use selected personal/context elements naturally.
      - Do not force every input into the lyrics.
      - Physical state, environment, activity and news should only appear if they strengthen the emotional story.
      - News is optional and may be omitted entirely.
      - If news is selected, incorporate its underlying human emotion or theme subtly and metaphorically rather than describing it literally.
      `
          : `
      5. Integration: Integrate physical state, environment, and (if relevant) the news mood subtly and metaphorically
      `
      }
      ${
        preventRepetition
          ? `${originalityRules}`
          : `
      6. Originality: Avoid clichés and generic motivational phrases.
      `
      }
      7. Style: Use the genre and stylistic influence only for rhythm, imagery, and tone guidance—do not imitate or quote them.
      8. If an "About" detail is provided, subtly personalize the lyrics using relevant memories, interests, preferences, or life details. Keep it natural and poetic rather than directly repeating the text.
      ${addProfession ? `9. If profession information is available, subtly reflect experiences, aspirations, or everyday moments associated with that profession. Keep references natural and poetic rather than explicitly stating the profession.` : ``}
      ${addProfession ? `10` : `9`}. Before writing the lyrics, internally consider how the song should feel in terms of emotion, genre, and tempo/beat (e.g., slow emotional, mid-tempo groovy, fast energetic), and reflect that naturally in rhythm, wording, and flow of the lyrics. Do NOT explicitly mention tempo or BPM in the lyrics.

      MUSIC STYLE STRING:
      Based on the mood, heart rate, steps and activity, generate a short Suno-style music style descriptor (max 12 words). It should describe genre, tempo feel, and sonic texture.
      Example: Dreamy indie pop, slow tempo, warm acoustic guitar, soft vocals

      OUTPUT FORMAT (STRICT):
      Return ONLY valid JSON. No preamble or markdown. Use the following structure:
      {
        "lyrics": {
          "verse1": "line1\nline2\nline3\nline4",
          "pre_chorus": "line1\nline2",
          "chorus": "line1\nline2\nline3\nline4",
          "verse2": "line1\nline2\nline3\nline4",
          "pre_chorus2": "line1\nline2",
          "outro": "line1\nline2\nline3"
        },
        "musicStyle": "short suno-style descriptor here"
      }
    `;

    return prompt;
  };

  const generateLyricsAndSong = async () => {
    if (!isFormComplete || !healthData) {
      console.warn(`Missing form data!`);
      return;
    }
    if (loading) {
      return;
    }
    setLoading(true);
    await clearStates();

    const emotionTrajectory = generateTrajectory();
    console.log("Emotion Trajectory:", emotionTrajectory);
    setEmotionPath(emotionTrajectory);

    const favGenre =
      (await getRandomGenres(user?.favoriteGenre || "")) || user?.favoriteGenre;
    let prompt = "";
    let adjustedEmotion = {
      valence: 0,
      arousal: 0,
      emotion: "",
      deviation: 0,
    };
    let hrvMetrics = {};

    if (HRV_APP_VERSION) {
      const vaTrajectory = buildVAPath(input.currentMood, input.desiredMood);
      console.log("VA Trajectory:", vaTrajectory);
      setVaPath(vaTrajectory);

      // Get biometric-adjusted emotion for the first song
      adjustedEmotion = getBiometricAdjustedEmotion(
        vaTrajectory,
        0,
        healthData.arousal,
      );

      const strategy = getAdaptationStrategy(
        adjustedEmotion.deviation,
        vaTrajectory[0]?.arousal ?? 0.5,
        healthData.arousal,
      );

      console.log(
        `Song 0 → Planned: ${emotionTrajectory[0]}, Adjusted: ${adjustedEmotion.emotion} ` +
          `(V:${adjustedEmotion.valence}, A:${adjustedEmotion.arousal}), ` +
          `Deviation: ${adjustedEmotion.deviation}, Strategy: ${strategy}`,
      );

      // Build the prompt with biometric context
      prompt = await buildLyricsPrompt(
        adjustedEmotion.emotion,
        healthData,
        favGenre,
        adjustedEmotion.valence,
        adjustedEmotion.arousal,
        strategy,
      );

      hrvMetrics = {
        plannedVA: vaTrajectory[0],
        adjustedEmotion,
        strategy,
      };
    } else {
      prompt = await buildLyricsPrompt(
        emotionTrajectory[0],
        healthData,
        favGenre,
      );
    }

    setLyricPrompt(prompt);

    // Generate song lyrics
    let currentLyrics = "";
    let suggestedMusicStyle = "";
    try {
      const { lyrics, musicStyle = "" } = (await generatelyrics(prompt)) || {};
      if (lyrics) {
        currentLyrics = lyrics;
        setLyricsQueue([lyrics]);
      } else {
        console.warn("Lyrics Generation Failed!");
      }
      suggestedMusicStyle = musicStyle;
    } catch (error: any) {
      console.error(
        "An error occurred while generating lyrics:",
        error.message,
      );
    }

    // Generate Song Audio
    console.log(
      `Generating song with lyrics: ${(currentLyrics || "").substring(0, 50)}...`,
    );

    let generatedStreamUrl = null;
    try {
      const generatedSong = await generateSong(
        currentLyrics || "Uplifting song",
        suggestedMusicStyle || favGenre,
        adjustedEmotion.emotion || input.desiredMood,
        0,
        favGenre,
        user.favoriteBand,
      );
      if (generatedSong) {
        setSongQueue([generatedSong]);
        generatedStreamUrl = generatedSong?.audioUrl;
      } else {
        console.warn("Song Generation Failed, Could not generate song audio.");
      }
    } catch (error: any) {
      console.error(
        "An error occurred while generating next song audio.",
        error.message,
      );
    }
    setLoading(false);

    try {
      const { activity, currentMood, desiredMood } = input;
      const newSessionID = await createMusicSession(user?.email!, {
        emotionPath: emotionTrajectory,
        userDetails: { activity, currentMood, desiredMood },
        lyricPrompt: prompt,
        songPrompt: currentLyrics,
        hrvUsed: HRV_APP_VERSION,
        sunoOrgPayload: SUNO_ORG_PAYLOAD,
      });
      await saveSessionId(newSessionID);

      const trackRes = await addTrackToSession(user?.email!, newSessionID!, 0, {
        mood: emotionTrajectory[0] || "N/A",
        streamUrl: generatedStreamUrl || songQueue[0]?.audioUrl || "",
        lyrics: currentLyrics,
        lyricsPrompt: prompt,
        heartRate: healthData?.heartRate || "N/A",
        steps: healthData?.steps || "N/A",
        hrvMetrics,
        suggestedAiMusicStyle: suggestedMusicStyle || "",
      });
      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
      setTrackStoredInDB({ 0: true });
    } catch (err) {
      console.error("Error updating DB: ", err);
    }

    unlockRating(0);
  };

  const playAudioPlayer = () => {
    player.setActiveForLockScreen(true, {
      title: currentSong?.title || "Emotion App song",
      artist: user?.nickName || "Emotion App",
      albumTitle: `Your Personalized Playlist`,
    });

    player.play();

    if (Math.floor(currentTime) === Math.floor(duration)) {
      handleNextSong();
    }
  };

  const playSound = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      playAudioPlayer();
    }
  };

  const handlePrevSong = () => {
    if (currentSongIndex === 0) return;
    setCurrentSongIndex((i) => i - 1);
  };
  const handleNextSong = () => {
    if (currentSongIndex === songQueue.length - 1) return;
    setCurrentSongIndex((i) => i + 1);
  };

  const updateTrackInDB = async (updates: object, index: number) => {
    try {
      const trackId = await getTrackId(index);
      const sessionId = await getSessionId();
      await updateTrackFields(user?.email!, sessionId, trackId, {
        ...updates,
      });
    } catch (err) {
      console.error("Error while updating Track fields: ", err);
    }
  };

  const generateNextSong = async () => {
    const nextSongIdx = currentSongIndex + 1;

    if (songQueue.length > nextSongIdx) {
      return;
    }
    if (HRV_APP_VERSION) {
      if (
        nextSongIdx >= vaPath.length // songs generated were more than trajectory length
      ) {
        return;
      }
    } else {
      if (nextSongIdx >= emotionPath.length) {
        return;
      }
    }
    setNextSongLoading(true);

    // const latestHealthData = await fetchAppleHealthData(10);
    const latestHealthData = await fetchLatestHealthData();
    const currentMood = emotionPath?.[nextSongIdx] || input.currentMood;

    let prompt = "";
    let adjustedEmotion = {
      valence: 0,
      arousal: 0,
      emotion: "",
      deviation: 0,
    };
    let hrvMetrics = {};
    const favGenre =
      (await getRandomGenres(user?.favoriteGenre || "")) || user?.favoriteGenre;

    if (HRV_APP_VERSION) {
      adjustedEmotion = getBiometricAdjustedEmotion(
        vaPath,
        nextSongIdx,
        latestHealthData.arousal,
      );

      const plannedVA = vaPath[Math.min(nextSongIdx, vaPath.length - 1)];
      const strategy = getAdaptationStrategy(
        adjustedEmotion.deviation,
        plannedVA?.arousal ?? 0.5,
        latestHealthData.arousal,
      );

      console.log(
        `Song ${nextSongIdx} → Planned mood: ${emotionPath?.[nextSongIdx] || "N/A"}, ` +
          `Adjusted: ${adjustedEmotion.emotion} (V:${adjustedEmotion.valence}, A:${adjustedEmotion.arousal}), ` +
          `Bio arousal: ${latestHealthData.arousal}, Deviation: ${adjustedEmotion.deviation}, ` +
          `Strategy: ${strategy}`,
      );
      console.log(
        `  HR: ${latestHealthData.heartRate}, Steps: ${latestHealthData.steps}, HRV: ${latestHealthData.hrv}`,
      );

      // Build prompt with biometric-adjusted mood
      prompt = await buildLyricsPrompt(
        adjustedEmotion.emotion,
        latestHealthData,
        favGenre,
        adjustedEmotion.valence,
        adjustedEmotion.arousal,
        strategy,
      );

      hrvMetrics = {
        plannedVA,
        adjustedEmotion,
        strategy,
      };
    } else {
      console.log("Mood input for next song: ", currentMood);
      console.log("HR for next song: ", latestHealthData.heartRate);
      console.log("Steps for next song: ", latestHealthData.steps);

      prompt = await buildLyricsPrompt(currentMood, latestHealthData, favGenre);
    }

    // Generate song lyrics
    let currentLyrics = "";
    let suggestedMusicStyle = "";
    try {
      const { lyrics, musicStyle = "" } = (await generatelyrics(prompt)) || {};
      if (lyrics) {
        currentLyrics = lyrics;
        setLyricsQueue((prev) => [...prev, lyrics]);
      } else {
        console.warn("Lyrics Generation failed for next song!");
      }
      suggestedMusicStyle = musicStyle;
    } catch (error: any) {
      console.error(
        "An error occurred while generating lyrics for next song:",
        error.message,
      );
    }

    // Generate Song Audio
    console.log(
      `Generating next song with lyrics: "${(currentLyrics || "").substring(0, 150)}..."`,
    );
    let generatedStreamUrl = null;
    try {
      const generatedSong = await generateSong(
        currentLyrics || "Uplifting song",
        suggestedMusicStyle || favGenre || "Pop, Classical",
        adjustedEmotion.emotion || input?.desiredMood || "N/A",
        nextSongIdx,
        favGenre,
        user?.favoriteBand,
      );
      if (generatedSong) {
        setSongQueue((prev) => [...prev, generatedSong]);
        generatedStreamUrl = generatedSong?.audioUrl;
      } else {
        console.warn("Could not generate next song audio.");
      }
    } catch (error: any) {
      console.error(
        "An error occurred while generating next song audio.",
        error.message,
      );
      setGenerationLockedForIndex(null);
    }

    try {
      const sessionId = await getSessionId();
      const trackRes = await addTrackToSession(
        user?.email!,
        sessionId,
        nextSongIdx,
        {
          mood: currentMood || "N/A",
          streamUrl:
            generatedStreamUrl || songQueue[nextSongIdx]?.audioUrl || "",
          lyrics: currentLyrics,
          lyricsPrompt: prompt,
          heartRate: latestHealthData?.heartRate || "N/A",
          steps: latestHealthData?.steps || "N/A",
          hrvMetrics,
          suggestedAiMusicStyle: suggestedMusicStyle || "",
        },
      );

      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
      setTrackStoredInDB((prev) => ({ ...prev, [nextSongIdx]: true }));
    } catch (err) {
      console.error("Error while updating DB: ", err);
    }

    setNextSongLoading(false);
  };

  const fetchWeatherAndNews = async (
    firstCall: boolean = false,
  ): Promise<{ weather: WeatherData | null; news: NewsData | null } | null> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") return null;

    let loc = await Location.getCurrentPositionAsync({});
    if (firstCall) console.log("location set");

    const weather = await fetchWeatherData(
      loc.coords.latitude,
      loc.coords.longitude,
    );
    setWeatherData(weather);

    let news = null;
    news = await fetchUniqueNewsData(weather?.city);

    // If news data isn't available for a particular country-code, then try 'US' as fallback
    if (!news) {
      news = await fetchUniqueNewsData("us");
    }
    setNewsData(news);

    return { weather, news };
  };

  const handleChangeEmotion = (
    payload: { emotion: string; quadrant: QuadrantKey } | null,
    type: "curr" | "desired",
  ) => {
    const mood = type === "curr" ? "currentMood" : "desiredMood";
    const quad = type === "curr" ? "currentQuad" : "desiredQuad";
    const emotion = payload ? payload.emotion : "";
    const quadrant = payload ? payload.quadrant : "";

    handleInputChange(mood, emotion);
    handleInputChange(quad, quadrant);
  };

  const handleRate = async (rating: "up" | "down") => {
    const idx = currentSongIndex;
    setSongRatings((prev) => ({ ...prev, [idx]: rating }));
    setRatingUnlocked(false);
    await updateTrackInDB({ liked: rating === "up" }, idx);
  };

  const handleEditProfile = () => {
    navigation.navigate({
      name: "Login",
      params: { mode: "edit" },
    } as never);
  };

  const AnimatedIcon = (
    <Animated.View
      style={{
        opacity: indicatorAnim,
        marginBottom: 5,
        transform: [
          {
            scale: indicatorAnim,
          },
        ],
      }}
    >
      <FontAwesome5 name="hand-point-right" size={22} color={"#fff"} />
    </Animated.View>
  );

  // Fetch news and weather info
  useEffect(() => {
    fetchWeatherAndNews(true);

    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: "doNotMix",
    });
  }, []);

  // Update listening time of user for current song
  useEffect(() => {
    const clearListenInterval = () => {
      if (listenIntervalRef.current) {
        clearInterval(listenIntervalRef.current);
        listenIntervalRef.current = null;
      }
    };

    if (!playerStatus.playing || currentSongIndex === null) {
      clearListenInterval();
      return;
    }

    if (!listenIntervalRef.current) {
      listenIntervalRef.current = setInterval(async () => {
        await updateTrackInDB(
          {
            listendTime: CONTINUOUS_PLAYBACK_MS,
          },
          currentSongIndex,
        );
      }, CONTINUOUS_PLAYBACK_MS);
    }

    // Cleanup when song changes or pauses
    return () => {
      clearListenInterval();
    };
  }, [playerStatus.playing, currentSongIndex]);

  // Replace audio urls with their final downloaded urls and play audio player when song changes
  useEffect(() => {
    const audios = Object.entries(downloadedAudios);
    audios.forEach(([idx, uri]) => {
      const index = parseInt(idx);
      if (index === currentSongIndex || !uri?.length) return;

      setSongQueue((prev) => {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          audioUrl: uri,
        };
        return updated;
      });

      setDownloadedAudios((prev) => ({ ...prev, [index]: "" }));
    });

    // Auto playing song when previous or next button is pressed
    if (!currentSong) return;
    playAudioPlayer();
  }, [currentSong?.audioUrl]);

  // Plays next song once current one finishes
  useEffect(() => {
    const index = currentSongIndex;
    if (playerStatus.didJustFinish) {
      setSongJustFinished(true);

      updateTrackInDB(
        {
          completed: true,
        },
        index,
      );

      //Song ended, auto-playing next
      handleNextSong();
    }
  }, [playerStatus.playing]);

  // Start generating next song once listening threshold reaches
  useEffect(() => {
    const clearGenerateTimerInterval = () => {
      if (generateTimerRef.current) {
        clearTimeout(generateTimerRef.current);
        generateTimerRef.current = null;
      }
    };
    clearGenerateTimerInterval();

    const index = currentSongIndex;
    if (
      !playerStatus.playing ||
      !currentSong ||
      generationLockedForIndex === index ||
      songQueue.length > index + 1
    ) {
      return;
    }
    if (index + 1 >= emotionPath.length) {
      console.warn(
        "Could not generate next song as songs generation completed for all the emotions in the path!",
      );
      return;
    }

    generateTimerRef.current = setTimeout(() => {
      console.log(
        `--Listen threshold reached. Generating next song for index ${index}`,
      );

      setGenerationLockedForIndex(index);
      generateNextSong();
    }, LISTEN_BEFORE_GENERATE_MS);

    setTimeout(() => {
      if (trackStoredInDB[index]) {
        unlockRating(index);
      }
    }, 10_000);

    return () => {
      clearGenerateTimerInterval();
    };
  }, [playerStatus.playing, currentSongIndex, currentSong?.audioUrl]);

  // Reset states when song changes
  useEffect(() => {
    setGenerationLockedForIndex(null);
    setRatingUnlocked(false);
    setSongJustFinished(false);
  }, [currentSongIndex]);

  // Download finalURL song when it's ready
  useEffect(() => {
    onFinalReady(async (taskId, finalUrl) => {
      const index = songQueue.findIndex((s) => s?.id === taskId);
      if (index === -1) return;

      const { audioUrl: localUri } = await downloadAndSaveAudio(
        finalUrl,
        `suno_${taskId}.mp3`,
        "mock-mood",
        "MOCK",
      );

      if (index === currentSongIndex) {
        setDownloadedAudios((prev) => ({ ...prev, [index]: localUri }));

        const prevTime = player?.currentTime || 0;
        player.pause();
        player.replace(localUri);
        await new Promise((r) => setTimeout(r, 500));
        await player.seekTo(player?.currentTime || prevTime);
        playAudioPlayer();
      } else {
        setSongQueue((prev) => {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            audioUrl: localUri,
          };
          return updated;
        });
      }

      await updateTrackInDB(
        {
          finalAudioUrl: finalUrl,
          downloadedUrl: localUri,
        },
        index,
      );
    });
  }, [songQueue, currentSongIndex]);

  // Sync duration slider value with song duration
  useEffect(() => {
    if (!playerStatus.isLoaded) return;

    if (!isSliding) {
      setSliderValue(playerStatus.currentTime ?? 0);
    }
  }, [playerStatus.currentTime, isSliding]);

  // Automatic playback transition to the next song when it finishes generating
  useEffect(() => {
    if (songJustFinished && songQueue.length > currentSongIndex + 1) {
      handleNextSong();
    }
  }, [songQueue.length, songJustFinished]);

  // Pulse animation — fires when unlocked but not yet rated
  useEffect(() => {
    if (ratingUnlocked && songRatings[currentSongIndex] === undefined) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(nudgeAnim, {
            toValue: 1.25,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(nudgeAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    } else {
      nudgeAnim.stopAnimation();
      nudgeAnim.setValue(1);
    }
  }, [ratingUnlocked, currentSongIndex, songRatings]);

  // Scroll the view towards lyrics container once the lyrics are ready
  useEffect(() => {
    if (!currentSongLyrics) return;

    setTimeout(() => {
      lyricsRef.current?.measureLayout(
        scrollViewRef.current as any,
        (_, y) => {
          scrollViewRef.current?.scrollTo({
            y: Math.max(0, y - 40),
            animated: true,
          });
        },
        () => console.warn("Can't scroll to lyrics!"),
      );
    }, 300);
  }, [currentSongLyrics]);

  // Pulse animation - Start and Target emotion inputs
  useEffect(() => {
    if (indicatorIcon) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(indicatorAnim, {
            toValue: 0.7,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(indicatorAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]),
      );
      loop.start();

      return () => loop.stop();
    } else {
      indicatorAnim.stopAnimation();
      indicatorAnim.setValue(1);
    }
  }, [indicatorIcon]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#171A1F" }}>
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true} // Helpful for debugging scrolling
        onContentSizeChange={(w, h) => console.log("Content height:", h)}
        nestedScrollEnabled={true}
      >
        {/* Header with profile icon */}
        <View
          style={[
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 5,
            },
          ]}
        >
          <Text style={styles.header}>Emotion to Song Generator</Text>
          <Pressable
            onPress={handleEditProfile}
            disabled={loading}
            hitSlop={12}
            style={{ opacity: loading ? 0.4 : 1 }}
            accessibilityLabel="Edit profile details"
          >
            <FontAwesome5 name="user-circle" size={24} color="#B07FE0" />
          </Pressable>
        </View>

        {/* Current and Desired Emotion selection */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <EmotionPicker
            shortLabel="Feeling now"
            label={
              user?.nickName
                ? `Hi ${user.nickName}, how are you feeling today?`
                : "How are you feeling today?"
            }
            placeholderIcon="🎙️"
            placeholder="Sad, Calm, Mysterious, Tense..."
            emotion={input.currentMood}
            quad={input.currentQuad}
            onChange={(payload) => handleChangeEmotion(payload, "curr")}
            allowCustomEmotion
            indicatorIcon={indicatorIcon === "current" ? AnimatedIcon : null}
          />

          <EmotionPicker
            shortLabel="Want to feel"
            label="How would you like to feel?"
            placeholderIcon="⚡"
            placeholder="Joyful, Excited, Cheerful, Energetic..."
            emotion={input.desiredMood}
            quad={input.desiredQuad}
            onChange={(payload) => handleChangeEmotion(payload, "desired")}
            allowedQuadrants={["sunny", "breezy"]}
            indicatorIcon={indicatorIcon === "desired" ? AnimatedIcon : null}
          />
        </View>

        {/* Activity input */}
        <EmotionInput
          label="Are you starting some activity?"
          placeholder="Workout, Walking, Studying, Meditating..."
          icon={<FontAwesome5 name="running" size={16} color="#fff" />}
          value={input.activity}
          onChange={(t) => handleInputChange("activity", t)}
          indicatorIcon={indicatorIcon === "activity" ? AnimatedIcon : null}
        />

        {/* Health Provider */}
        {!healthData && (
          <HealthProviderSection
            updateHealthData={(data) => setHealthData(data)}
            provider={healthProvider}
            setProvider={setHealthProvider}
          />
        )}

        {/* Weather and News info */}
        <Biomarkers
          healthData={healthData}
          weatherData={weatherData}
          newsData={newsData}
        />

        {/* Generate button */}
        {isFormComplete && healthData && (
          <Pressable
            onPress={generateLyricsAndSong}
            disabled={loading}
            style={styles.generateButton}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              {loading ? "Creating Magic..." : "Generate Lyrics & Song"}
            </Text>
          </Pressable>
        )}
        {loading && (
          <LoadingPhrases
            style={{ marginTop: 30 }}
            phrases={[
              "Composing your song...",
              "Weaving melodies to match your mood...",
              "Crafting lyrics just for this moment...",
              "Almost ready — your song is taking shape...",
            ]}
          />
        )}

        {/* Display  lyrics and Audio Player */}
        {currentSong && (
          <View style={styles.stepContainer}>
            {SHOW_LYRICS && currentSongLyrics && (
              <View ref={lyricsRef}>
                <Text style={styles.lyricsTitle}>Your Song Lyrics</Text>
                <LyricAnimator
                  text={currentSongLyrics}
                  currentTimeMs={currentTime * 1000}
                  songDurationMs={(duration || DEFAULT_DURATION) * 1000}
                  alignedWords={currentSong?.alignedWords || []}
                  autoScroll={true}
                  highlightWords={true}
                />
              </View>
            )}

            <>
              {currentSong?.title && (
                <Text
                  style={{
                    marginTop: 15,
                    marginBottom: 10,
                    fontSize: 16,
                    fontWeight: "bold",
                    color: "#fff",
                    textAlign: "center",
                  }}
                >
                  {/* 🎵 {currentSong.title} */}
                  🎵 Your Personalized Song {currentSongIndex + 1}
                </Text>
              )}

              <View style={styles.progressContainer}>
                <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

                <Slider
                  style={{ flex: 1, marginHorizontal: 10 }}
                  minimumValue={0}
                  maximumValue={duration || 150}
                  value={sliderValue}
                  minimumTrackTintColor="#9b5cff"
                  maximumTrackTintColor="#444"
                  thumbTintColor="#fff"
                  onSlidingStart={() => setIsSliding(true)}
                  onValueChange={(value) => setSliderValue(value)}
                  onSlidingComplete={(value) => {
                    setIsSliding(false);
                    handleSlidingComplete(value);
                  }}
                />

                <Text style={styles.timeText}>
                  {formatTime(duration || 150)}
                </Text>
              </View>

              <View style={styles.playerBar}>
                <CommonButton
                  onPress={handlePrevSong}
                  disabled={currentSongIndex === 0}
                  icon={
                    <FontAwesome5 name="step-backward" size={22} color="#fff" />
                  }
                />

                {playerStatus.isBuffering || !playerStatus.isLoaded ? (
                  <ActivityIndicator color="#fff" size={30} />
                ) : (
                  <CommonButton
                    onPress={playSound}
                    style={styles.playButton}
                    icon={
                      <FontAwesome5
                        name={playerStatus.playing ? "pause" : "play"}
                        size={24}
                        color="#9b5cff"
                      />
                    }
                  />
                )}

                <CommonButton
                  onPress={handleNextSong}
                  disabled={currentSongIndex === songQueue.length - 1}
                  icon={
                    <FontAwesome5 name="step-forward" size={22} color="#fff" />
                  }
                />
              </View>
            </>
          </View>
        )}

        {/* Thumbs Up/Down buttons */}
        {!songRatings[currentSongIndex] &&
          ratingUnlocked &&
          songQueue?.length > 0 && (
            <View
              style={{
                height: 40,
                flexDirection: "row",
                alignItems: "center",
                marginHorizontal: 10,
                marginTop: 5,
              }}
            >
              <Animated.View
                style={{
                  flexDirection: "row",
                  marginLeft: 0,
                  gap: 12,
                  transform: [
                    {
                      scale: nudgeAnim,
                    },
                  ],
                }}
              >
                <Pressable
                  onPress={() => handleRate("up")}
                  style={{
                    padding: 8,
                    borderRadius: 20,
                  }}
                >
                  <FontAwesome5 name="thumbs-up" size={20} color={"#fff"} />
                </Pressable>

                <Pressable
                  onPress={() => handleRate("down")}
                  style={{
                    padding: 8,
                    borderRadius: 20,
                  }}
                >
                  <FontAwesome5 name="thumbs-down" size={20} color={"#fff"} />
                </Pressable>
              </Animated.View>
            </View>
          )}

        {/* Loading Phrases for next song */}
        {nextSongLoading && songJustFinished && (
          <LoadingPhrases
            style={{ marginTop: 30 }}
            phrases={[
              "Composing your next song...",
              "Weaving melodies to match your mood...",
              "Crafting lyrics just for this moment...",
              "Almost ready — your song is taking shape...",
            ]}
          />
        )}

        {/* Debug options modal */}
        <DebugOptionsModal isHomeScreen={true} />

        <View style={{ marginTop: 20, opacity: 0.5 }}>
          <Text style={{ color: "#ece5e5", fontSize: 12 }}>
            Is playing: {playerStatus?.playing ? "Yes" : "No"}
          </Text>
          <Text style={{ color: "#ece5e5", fontSize: 12 }}>
            Number of songs generated: {songQueue.length}
          </Text>
        </View>

        {songQueue?.length ? (
          <View style={{ marginTop: 20, opacity: 0.5 }}>
            {/* <Text style={{ color: "#ece5e5", fontSize: 12 }}>
                Current duration: {player.currentTime}
              </Text> */}
            <Text style={{ color: "#ece5e5", fontSize: 12 }}>
              Current music number: {currentSongIndex + 1}
            </Text>
            <Text style={{ color: "#ece5e5", fontSize: 12 }}>
              Audio source: {currentSong?.audioUrl || "--"}
            </Text>
          </View>
        ) : null}

        {emotionPath?.length ? (
          <View style={{ marginTop: 20, opacity: 0.5 }}>
            <Text style={{ color: "#ece5e5", fontSize: 12 }}>
              Emotion Path:
            </Text>
            <Text style={{ color: "#ccc", fontSize: 12 }}>
              {emotionPath.join(", ")}
            </Text>
          </View>
        ) : null}
        {/*Debug Prompt Display*/}
        {currentSongLyrics && lyricPrompt ? (
          <View style={{ marginTop: 20, opacity: 0.5 }}>
            <Text style={{ color: "#ece5e5", fontSize: 12 }}>
              Debug Prompt:
            </Text>
            <Text style={{ color: "#ccc", fontSize: 12 }}>{lyricPrompt}</Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginVertical: 20,
  },
  stepContainer: {
    backgroundColor: "#171A1F",
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  lyricsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  lyricsText: { fontSize: 14, color: "#ccc" },
  generateButton: {
    marginTop: 20,
    marginBottom: 10,
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    backgroundColor: "#9b5cff",
  },
  disabled: {
    opacity: 0.4,
  },
  playerBar: {
    height: 70,
    backgroundColor: "#9b5cff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
  },
  playButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  timeText: {
    color: "#ccc",
    fontSize: 12,
    textAlign: "center",
  },
});
