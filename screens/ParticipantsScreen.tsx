import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Animated,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FontAwesome5 } from "@expo/vector-icons";
import HealthProviderSection from "@/components/ui/health-provider";
import {
  computeTempoRange,
  fetchAppleHealthData,
  HealthData,
} from "@/services/HealthService";
import {
  ADD_ABOUT_TO_PROMPT,
  ADD_PROFESSION_TO_PROMPT,
  AI_TRAJECTORY_LENGTH,
  APP_VERSION,
  CONTINUOUS_PLAYBACK_MS,
  DEBUG_MODE,
  DEFAULT_HEALTH_DATA,
  HealthProvider,
  LISTEN_BEFORE_GENERATE_MS,
  NON_AI_PLAYLIST_TYPE,
  REPETITIVE_CHECK_IN_PROMPT,
  SHOW_LYRICS,
} from "@/constants/appConstants";
import {
  downloadAndSaveAudio,
  fetchJamendoTrack,
  fetchSavedPlaylistTrack,
  GeneratedSong,
  generatelyrics,
  generateSong,
  onFinalReady,
} from "@/services/MusicGenerationService";
import { formatTime } from "@/util/commonUtils";
import {
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
} from "expo-audio";
import Slider from "@react-native-community/slider";
import CommonButton from "@/components/ui/common-button";
import {
  clearJamendoIds,
  clearPgpIds,
  clearTrackIds,
  clearTrajectoryId,
  clearVocalGenderCounts,
  FeedbackSubmittedStatus,
  getFeedbackSubmitted,
  getPlaylistFeedback,
  getSessionId,
  getTrackId,
  getTrajectoryId,
  saveSessionId,
  saveTrackId,
  saveTrajectoryId,
} from "@/services/LocalUserService";
import { useAuth } from "@/context/AuthContext";
import {
  addTrackToSession as addTrackToTrajectory,
  createMusicSession,
  createMusicTrajectory,
  updateMusicTrajectory,
  updateTrackFields,
} from "@/services/DbService";
import { useNavigation } from "expo-router";
import MoodCard from "@/components/ui/mood-card";
import Biomarkers from "@/components/ui/biomarkers";
import {
  fetchUniqueNewsData,
  fetchWeatherData,
  NewsData,
  WeatherData,
} from "@/services/WeatherNewsService";
import LyricAnimator from "@/components/ui/lyric-animator";
import { useFocusEffect } from "@react-navigation/native";
import * as Location from "expo-location";
import { shareLogs, viewLogs } from "@/services/LoggerService";
import LoadingPhrases from "@/components/ui/loading-phrases";
import { buildEmotionPath } from "@/services/EmotionPathService";
import EmotionGrid from "@/components/ui/emotion-grid";
import EmotionModal from "@/components/ui/emotion-modal";

type TargetEmotion = "calm" | "joyful";
type PlaylistType = "Trajectory" | "SavedPlaylist";
type PlaylistId = "A" | "B" | "C" | "D";
type Phase = "setup" | "running" | "complete";

interface PlaylistDef {
  targetEmotion: TargetEmotion;
  playlistType: PlaylistType;
}

const ACTIVITY_SEQUENCE: string[] = [
  "Sitting in Lab",
  "Sitting in Lab",
  "Walking Outside",
  "Walking Outside",
];

const C = {
  bg: "#0D0D14",
  surfaceHigh: "#1E1E2C",
  border: "#2A2A3A",
  accent: "#b36cff",
  text: "#F0F0F8",
  textDim: "#404060",
} as const;

const PLAYLIST_DEFS: Record<PlaylistId, PlaylistDef> = {
  A: {
    targetEmotion: "calm",
    playlistType: "SavedPlaylist",
  },
  B: {
    targetEmotion: "joyful",
    playlistType: "Trajectory",
  },
  C: {
    targetEmotion: "joyful",
    playlistType: "SavedPlaylist",
  },
  D: {
    targetEmotion: "calm",
    playlistType: "Trajectory",
  },
};

const SEQUENCES: Record<TargetEmotion, [PlaylistId[], PlaylistId[]]> = {
  calm: [
    ["A", "B", "C", "D"],
    ["D", "C", "B", "A"],
  ],
  joyful: [
    ["C", "D", "A", "B"],
    ["B", "A", "D", "C"],
  ],
};

const DEFAULT_DURATION = 120;

function pickSequence(target: TargetEmotion): PlaylistId[] {
  let randomIndex = Math.random() < 0.5 ? 0 : 1;
  if (DEBUG_MODE) {
    randomIndex = 0;
  }

  return SEQUENCES[target][randomIndex];
}

export default function ParticipantsScreen() {
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();
  const navigation = useNavigation();

  const [phase, setPhase] = useState<Phase>("setup");
  const [startEmotion, setStartEmotion] = useState<string>("");
  const [targetEmotion, setTargetEmotion] = useState<TargetEmotion | null>(
    null,
  );
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthProvider, setHealthProvider] =
    useState<HealthProvider>("Apple Health");

  const [isPreFeedbackMessage, setIsPreFeedbackMessage] = useState(true);
  const [showEmotionModal, setShowEmotionModal] = useState(false);
  const [songJustFinished, setSongJustFinished] = useState(false);
  const [nextSongLoading, setNextSongLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [songQueue, setSongQueue] = useState<GeneratedSong[]>([]);
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(0);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [generationLockedForIndex, setGenerationLockedForIndex] = useState<
    number | null
  >(null);
  const [downloadedAudios, setDownloadedAudios] = useState<
    Record<number, string>
  >({});
  const [sequence, setSequence] = useState<PlaylistId[]>([]);
  const [playlistIdx, setPlaylistIdx] = useState(0);
  const [songRatings, setSongRatings] = useState<Record<number, "up" | "down">>(
    {},
  );
  const [ratingUnlocked, setRatingUnlocked] = useState(false);
  const [showRatingAlert, setShowRatingAlert] = useState(false);
  const [playlistType, setPlaylistType] = useState<PlaylistType | "">("");
  const [lyricsQueue, setLyricsQueue] = useState<string[]>([]);
  const [emotionTrajectory, setEmotionTrajectory] = useState<string[]>([]);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Record<
    number,
    FeedbackSubmittedStatus
  > | null>({});
  const [emotionCaptured, setEmotionCaptured] = useState<Record<
    number,
    FeedbackSubmittedStatus
  > | null>({});
  const [finalUrlsReady, setFinalUrlsReady] = useState<Record<number, boolean>>(
    {},
  );

  const nudgeAnim = useRef(new Animated.Value(1)).current;
  const listenIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lyricsRef = useRef<View>(null);

  const startHintMsg = useMemo(() => {
    if (!startEmotion && !targetEmotion) {
      return "Select your emotions to continue";
    } else if (!startEmotion) {
      return "Please select your starting emotion state above";
    } else if (!targetEmotion) {
      return "Select your target emotion above";
    } else if (Platform.OS === "ios" && !healthData) {
      return "Please authorize the Apple Health";
    } else if (!feedbackSubmitted?.[0]?.pre) {
      return "Please set the mood meter before starting the session.";
    }

    return "";
  }, [startEmotion, targetEmotion, healthData, feedbackSubmitted]);

  const nextPlaylistMsg = useMemo(() => {
    if (!emotionCaptured?.[playlistIdx]?.post) {
      return "Please update your emotion state after listening to this playlist.";
    } else if (!feedbackSubmitted?.[playlistIdx]?.post) {
      return "Please review the playlist in google form and also update the mood meter here.";
    } else if (!emotionCaptured?.[playlistIdx + 1]?.pre) {
      return "Please update the emotion state before starting the next one.";
    } else if (!feedbackSubmitted?.[playlistIdx + 1]?.pre) {
      return "Please review the playlist in google form and also update the mood meter here before starting the next one.";
    }

    return "Tap below to begin the next playlist.";
  }, [feedbackSubmitted, playlistIdx, emotionCaptured]);

  const currPlaylistFinished =
    emotionTrajectory.length > 0 &&
    currentSongIndex + 1 >= emotionTrajectory.length;
  const allPlaylistsCompleted =
    currPlaylistFinished && playlistIdx === sequence.length - 1;
  const isLocked = loading || nextSongLoading || phase !== "setup";
  const ratingDone = !!songRatings[currentSongIndex];

  const currentSong = songQueue[currentSongIndex] ?? null;
  const currentSongLyrics = lyricsQueue[currentSongIndex] ?? null;
  const currFinalUrlReady = finalUrlsReady[currentSongIndex] ?? false;
  const player = useAudioPlayer(currentSong?.audioUrl || "");
  const playerStatus = useAudioPlayerStatus(player);
  const duration = player?.duration ?? 0;
  const currentTime = player?.currentTime ?? 0;
  const nextPlaylistBtnDisabled =
    loading ||
    !startEmotion ||
    !feedbackSubmitted?.[playlistIdx]?.post ||
    !feedbackSubmitted?.[playlistIdx + 1]?.pre ||
    !emotionCaptured?.[playlistIdx]?.post ||
    !emotionCaptured?.[playlistIdx + 1]?.pre;
  const showMoodMeterButton =
    !loading &&
    ((!songQueue.length && !feedbackSubmitted?.[playlistIdx]?.pre) ||
      (currPlaylistFinished &&
        ratingDone &&
        (!feedbackSubmitted?.[playlistIdx]?.post ||
          (!feedbackSubmitted?.[playlistIdx + 1]?.pre &&
            !allPlaylistsCompleted))));
  const isEmotionLocked =
    loading ||
    nextSongLoading ||
    (songQueue.length > 0 && (!currPlaylistFinished || !ratingDone));
  const currentActivity = ACTIVITY_SEQUENCE?.[playlistIdx] || "Sitting in Lab";
  const isPreGen = NON_AI_PLAYLIST_TYPE === "PRE_GEN";

  const clearStates = async () => {
    setSongQueue([]);
    setCurrentSongIndex(0);
    setGenerationLockedForIndex(null);
    setDownloadedAudios({});
    setSongRatings({});
    setPlaylistType("");
    setLyricsQueue([]);
    setFinalUrlsReady({});
    await clearTrajectoryId();
    await clearTrackIds();
    await clearPgpIds();
    await clearVocalGenderCounts();
    await clearJamendoIds();
  };

  const fetchWeatherAndNews = async (
    firstCall: boolean = false,
  ): Promise<{ weather: WeatherData | null; news: NewsData | null } | null> => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return null;

      let loc = await Location.getCurrentPositionAsync({});
      if (firstCall) console.log("location set");

      let weather = weatherData;
      if (!weather) {
        weather = await fetchWeatherData(
          loc.coords.latitude,
          loc.coords.longitude,
        );
        setWeatherData(weather);
      }

      let news = null;
      news = await fetchUniqueNewsData(weather?.city);

      // If news data isn't available for a particular country-code, then try 'US' as fallback
      if (!news) {
        news = await fetchUniqueNewsData("us");
      }
      setNewsData(news);

      return { weather, news };
    } catch (err: any) {
      console.warn("Error while fetching weather and news: ", err?.message);
      return null;
    }
  };

  const buildLyricsPrompt = async (mood: string, healthData: HealthData) => {
    const isHrValid = !!healthData.heartRate;
    const isStepsValid = !!healthData.steps;

    const { weather, news } = (await fetchWeatherAndNews()) || {};
    const addProfession = ADD_PROFESSION_TO_PROMPT && !!user?.profession;
    const activityContext =
      currentActivity === "Walking Outside" ? "Walking" : "Sitting";
    const about = ADD_ABOUT_TO_PROMPT && user?.about?.trim();

    const preventRepetition = REPETITIVE_CHECK_IN_PROMPT
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

      Treat the remaining inputs as background context only.

      Each song should have a different personalization focus.
      Do not repeatedly use the same type of details across songs.

      Example:
      One song may focus on a personal memory + weather.
      Another may focus on daily routine + profession.
      Another may focus on movement + inner emotion.

      The goal is a unique emotional story, not a summary of the user's data.      
    `
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
    `
    const prompt = `
      You are a creative songwriter. Generate original song lyrics personalized to the following inputs:

      USER
      - Name: ${user?.nickName || "Spark"}
      - Age: ${user?.age}
      ${addProfession ? `- Profession: ${user.profession}` : ""}
      ${about ? `- About: ${about}` : ""}

      MUSIC STYLE
      - Genre preference: ${user?.favoriteGenre}
      - Stylistic influence (do NOT imitate or quote): ${user?.favoriteBand}
      - mood: ${mood}

      PHYSICAL CONTEXT
      ${isHrValid ? `- Heart rate in last 5 min: ${healthData.heartRate} bpm` : ""}
      ${isStepsValid ? `- Movement in last 5 min: ${healthData.steps} steps` : ""}
      - Current or upcoming activity: ${activityContext}

      ENVIRONMENT
      - Location: ${weather?.city || "Unknown"}
      - Weather: ${weather?.temperature ? `${weather.temperature}°C, ${weather.description}` : "Unknown"}
      - News mood cue (optional): ${news?.headline || "N/A"}

      ${preventRepetition ? `${repetitionRules}` : ""}

      TASK:
      Write cohesive song lyrics.
      1. Structure: Verse 1, Chorus, Verse 2, and Outro.
      2. Line count (STRICT): Verse = 4 lines, Chorus = 4 lines, Outro = 2 lines. Total: 14 lines.
      3. Line length: Each line must be 6–10 words. No long run-on lines.
      4. Tone: ${mood} and emotionally grounded.
      ${preventRepetition ? `
      5. Integration:
      - Use selected personal/context elements naturally.
      - Do not force every input into the lyrics.
      - Physical state, environment, and news mood should only appear if they strengthen the emotional story.
      ` : `
      5. Integration: Integrate physical state, environment, and (if relevant) the news mood subtly and metaphorically
      `}
      ${preventRepetition ? `${originalityRules}` : `
      6. Originality: Avoid clichés and generic motivational phrases.
      `}
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
          "chorus": "line1\nline2\nline3\nline4",
          "verse2": "line1\nline2\nline3\nline4",
          "outro": "line1\nline2"
        },
        "musicStyle": "short suno-style descriptor here"
      }
    `;

    return prompt;
  };

  const generateTrajectory = (givenTargetEmotion?: string) => {
    if (DEBUG_MODE) {
      return [
        startEmotion || "Bored",
        givenTargetEmotion || targetEmotion || "Calm",
      ];
    }

    let trajec = buildEmotionPath(
      startEmotion,
      givenTargetEmotion || targetEmotion || "Calm",
      AI_TRAJECTORY_LENGTH - 2,
      false,
    );

    if (trajec.length === 1) {
      return [
        startEmotion || "Bored",
        givenTargetEmotion || targetEmotion || "Calm",
      ];
    }
    return trajec;
  };

  const generateLyricsAndSong = async (
    givenTargetEmotion?: string,
    nextPlaylistIdx: number = 0,
  ) => {
    await clearStates();

    setPlaylistType("Trajectory");
    const currHealthData =
      healthData && (healthData?.heartRate || healthData?.steps)
        ? healthData
        : DEFAULT_HEALTH_DATA;

    const prompt = await buildLyricsPrompt(
      startEmotion || "Calm",
      currHealthData,
    );

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
    let sunoOrgPayload = null;
    const tempoRange = computeTempoRange(
      startEmotion || "calm",
      currHealthData.heartRate || 0,
    );
    try {
      const generatedSong = await generateSong(
        currentLyrics || "Uplifting song",
        suggestedMusicStyle || user?.favoriteGenre || "Pop, Classical",
        startEmotion || "Calm",
        currentSongIndex,
        user?.favoriteGenre,
        user?.favoriteBand,
        tempoRange,
      );
      if (generatedSong) {
        setSongQueue([generatedSong]);
        generatedStreamUrl = generatedSong?.audioUrl;
        sunoOrgPayload = generatedSong?.songProviderPayload || {};
      } else {
        console.warn("Song Generation Failed, Could not generate song audio.");
      }
    } catch (error: any) {
      console.error(
        "An error occurred while generating next song audio.",
        error.message,
      );
    }

    const currTrajectory = generateTrajectory(givenTargetEmotion);
    setEmotionTrajectory(currTrajectory);
    try {
      const feedbackData = await getPlaylistFeedback();
      const sessionId = await getSessionId();
      const newTrajectoryID = await createMusicTrajectory(
        user?.email!,
        sessionId,
        {
          emotionTrajectory: currTrajectory,
          lyricPrompt: prompt,
          songPrompt: currentLyrics,
          playlistType: "trajectory",
          trajectoryNumber: nextPlaylistIdx + 1,
          feedbackBefore: { ...feedbackData, emotionState: startEmotion },
        },
      );
      await saveTrajectoryId(newTrajectoryID);

      const trackRes = await addTrackToTrajectory(
        user?.email!,
        sessionId!,
        currentSongIndex,
        {
          mood: startEmotion || currTrajectory[0] || "N/A",
          streamUrl: generatedStreamUrl || songQueue[0]?.audioUrl || "",
          lyrics: currentLyrics,
          lyricsPrompt: prompt,
          sunoOrgPayload: { ...sunoOrgPayload },
          heartRate: healthData?.heartRate || "N/A",
          steps: healthData?.steps || "N/A",
          suggestedAiMusicStyle: suggestedMusicStyle || "",
        },
        true,
        newTrajectoryID,
      );
      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error updating DB: ", err);
    }
  };

  const generateSavedPlaylist = async (
    givenTargetEmotion?: string,
    nextPlaylistIdx: number = 0,
  ) => {
    await clearStates();
    if (!DEBUG_MODE) {
      await fetchWeatherAndNews();
    }

    setPlaylistType("SavedPlaylist");
    const currTrajectory = generateTrajectory(givenTargetEmotion);
    setEmotionTrajectory(currTrajectory);

    let track = null;
    const targetEmotionArg =
      (givenTargetEmotion || targetEmotion) === "calm" ? "calm" : "joyful";
    if (isPreGen) {
      track = await fetchSavedPlaylistTrack(targetEmotionArg);
    } else {
      track = await fetchJamendoTrack(targetEmotionArg);
    }

    if (!track) {
      return;
    }
    setLyricsQueue([track?.lyrics || ""]);

    setSongQueue([track]);

    try {
      const feedbackData = await getPlaylistFeedback();
      const sessionId = await getSessionId();
      const newTrajectoryID = await createMusicTrajectory(
        user?.email!,
        sessionId,
        {
          emotionTrajectory: currTrajectory,
          playlistType: isPreGen ? "savedPlaylist" : "jamendoPlaylist",
          trajectoryNumber: nextPlaylistIdx + 1,
          feedbackBefore: { ...feedbackData, emotionState: startEmotion },
        },
      );
      await saveTrajectoryId(newTrajectoryID);

      const trackRes = await addTrackToTrajectory(
        user?.email!,
        sessionId!,
        currentSongIndex,
        {
          mood: startEmotion || currTrajectory[0] || "N/A",
          streamUrl: track.audioUrl || "",
          heartRate: healthData?.heartRate || "N/A",
          steps: healthData?.steps || "N/A",
        },
        true,
        newTrajectoryID,
      );
      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error updating DB: ", err);
    }
  };

  const handleStart = async () => {
    if (loading) {
      return;
    }
    setLoading(true);

    try {
      if (!startEmotion || !targetEmotion) return;
      const seq = pickSequence(targetEmotion);
      setSequence(seq);

      const newSessionID = await createMusicSession(
        user?.email!,
        {
          userDetails: { ...user },
          hrvUsed: false,
        },
        true,
      );
      await saveSessionId(newSessionID);

      const firstPlaylist = PLAYLIST_DEFS[seq[0]];
      if (firstPlaylist.playlistType === "Trajectory") {
        await generateLyricsAndSong();
      } else {
        await generateSavedPlaylist();
      }

      setPhase("running");
    } catch (err: any) {
      console.error("Error while starting session: ", err?.message);
    }

    setLoading(false);
  };

  const startNextPlaylist = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const nextPlaylistIdx = playlistIdx + 1;
      setPlaylistIdx(nextPlaylistIdx);
      if (nextPlaylistIdx >= sequence.length) {
        setLoading(false);
        return;
      }

      const nextSequenceId = sequence[nextPlaylistIdx];
      const newPlaylistDef = PLAYLIST_DEFS[nextSequenceId];

      const { playlistType, targetEmotion: newTargetEmotion } = newPlaylistDef;
      if (playlistType === "Trajectory") {
        await generateLyricsAndSong(newTargetEmotion, nextPlaylistIdx);
      } else {
        await generateSavedPlaylist(newTargetEmotion, nextPlaylistIdx);
      }
    } catch (err: any) {
      console.error("Error while starting next playlist: ", err?.message);
    }

    setLoading(false);
  };

  const resetSlider = async () => {
    await new Promise((r) => setTimeout(r, 100));
    await player.seekTo(0);
    setSliderValue(0);
  };

  const handleNextSong = async () => {
    if (currentSongIndex === songQueue.length - 1 || !ratingDone) return;
    setCurrentSongIndex((i) => i + 1);
    await resetSlider();
  };

  const playAudioPlayer = () => {
    player.setActiveForLockScreen(true, {
      title: currentSong?.title || "Emotion App song",
      artist: user?.nickName || "Emotion App",
      albumTitle: `Playlist ${playlistIdx + 1}`,
    });

    player.play();

    if (Math.floor(currentTime) === Math.floor(duration)) {
      handleNextSong();
    }
  };

  const playSound = () => {
    if (playerStatus.playing) {
      player.pause();
      player.setActiveForLockScreen(false);
    } else {
      playAudioPlayer();
    }
  };
  const handleSlidingComplete = async (value: number) => {
    try {
      await player.seekTo(value);
    } catch (err: any) {
      console.warn("Seek failed: ", err?.message);
    }
  };

  const generateNextSong = async () => {
    setNextSongLoading(true);
    const nextSongIdx = currentSongIndex + 1;

    if (songQueue.length > nextSongIdx) {
      setNextSongLoading(false);
      return;
    }
    if (nextSongIdx >= emotionTrajectory.length) {
      console.warn(
        "Could not generate next song! Songs generation completed for all the emotions in the path.",
      );
      setNextSongLoading(false);
      setStartEmotion("");
      return;
    }

    const latestHealthData = await fetchAppleHealthData(5);
    const currentMood = emotionTrajectory?.[nextSongIdx] || "Calm";

    console.log("Mood input for next song: ", currentMood);
    console.log("HR for next song: ", latestHealthData.heartRate);
    console.log("Steps for next song: ", latestHealthData.steps);

    const prompt = await buildLyricsPrompt(currentMood, latestHealthData);

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
    let sunoOrgPayload = null;
    const tempoRange = computeTempoRange(
      currentMood || "calm",
      latestHealthData.heartRate || 0,
    );
    try {
      const generatedSong = await generateSong(
        currentLyrics || "Uplifting song",
        suggestedMusicStyle || user?.favoriteGenre || "N/A",
        currentMood,
        nextSongIdx,
        user?.favoriteGenre,
        user?.favoriteBand,
        tempoRange,
      );
      if (generatedSong) {
        setSongQueue((prev) => [...prev, generatedSong]);
        generatedStreamUrl = generatedSong?.audioUrl;
        sunoOrgPayload = generatedSong?.songProviderPayload || {};
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
      const trajectoryID = await getTrajectoryId();
      const trackRes = await addTrackToTrajectory(
        user?.email!,
        sessionId,
        nextSongIdx,
        {
          mood: currentMood || "N/A",
          streamUrl:
            generatedStreamUrl || songQueue[nextSongIdx]?.audioUrl || "",
          lyrics: currentLyrics,
          lyricsPrompt: prompt,
          sunoOrgPayload: { ...sunoOrgPayload },
          heartRate: latestHealthData?.heartRate || "N/A",
          steps: latestHealthData?.steps || "N/A",
          suggestedAiMusicStyle: suggestedMusicStyle || "",
        },
        true,
        trajectoryID,
      );

      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error while updating DB: ", err);
    }

    setNextSongLoading(false);
  };
  const generateNextSavedTrack = async () => {
    setNextSongLoading(true);
    const nextSongIdx = currentSongIndex + 1;

    if (nextSongIdx >= emotionTrajectory.length) {
      console.warn(
        "Could not fetch next saved song! Songs already fetched for all the emotions.",
      );
      setNextSongLoading(false);
      setStartEmotion("");
      return;
    }

    if (!DEBUG_MODE) {
      await fetchWeatherAndNews();
    }

    let track = null;
    if (isPreGen) {
      track = await fetchSavedPlaylistTrack(targetEmotion || "calm");
    } else {
      track = await fetchJamendoTrack(targetEmotion || "calm");
    }

    if (!track) {
      setNextSongLoading(false);
      return;
    }
    setLyricsQueue((prev) => [...prev, track?.lyrics || ""]);
    setSongQueue((prev) => [...prev, track]);

    try {
      const currentMood = emotionTrajectory?.[nextSongIdx] || "Calm";
      const latestHealthData = await fetchAppleHealthData(5);

      const sessionId = await getSessionId();
      const trajectoryID = await getTrajectoryId();
      const trackRes = await addTrackToTrajectory(
        user?.email!,
        sessionId,
        nextSongIdx,
        {
          mood: currentMood || "N/A",
          streamUrl: track.audioUrl || "",
          heartRate: latestHealthData?.heartRate || "N/A",
          steps: latestHealthData?.steps || "N/A",
        },
        true,
        trajectoryID,
      );

      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error while updating DB: ", err);
    }

    setNextSongLoading(false);
  };

  const updateTrackInDB = async (updates: object, index: number) => {
    try {
      const trackId = await getTrackId(index);
      const sessionId = await getSessionId();
      const trajectoryID = await getTrajectoryId();

      if (trackId) {
        await updateTrackFields(
          user?.email!,
          sessionId,
          trackId,
          {
            ...updates,
          },
          true,
          trajectoryID,
        );
      }
    } catch (err) {
      console.error("Error while updating Track fields: ", err);
    }
  };

  const handleRate = async (rating: "up" | "down") => {
    const idx = currentSongIndex;
    setSongRatings((prev) => ({ ...prev, [idx]: rating }));
    setRatingUnlocked(false);
    setShowRatingAlert(false);
    await updateTrackInDB({ liked: rating === "up" }, idx);
  };

  const handleNavigate = () => {
    const currPlaylistFeedback = feedbackSubmitted?.[playlistIdx];
    const playlistIdxProp =
      currPlaylistFeedback?.pre && currPlaylistFeedback?.post
        ? playlistIdx + 1
        : playlistIdx;

    navigation.navigate({
      name: "Feedback",
      params: {
        storeInDb:
          feedbackSubmitted?.[playlistIdxProp]?.pre && currPlaylistFinished,
        playlistIdx: playlistIdxProp,
        emotionState: startEmotion,
      },
    } as never);
  };

  const showModalIfBothFeedbackCaptured = (
    feedbackSubmittedVal: any = null,
  ) => {
    if (
      !allPlaylistsCompleted &&
      emotionCaptured?.[playlistIdx]?.post &&
      (feedbackSubmittedVal || feedbackSubmitted)?.[playlistIdx]?.post
    ) {
      setShowEmotionModal(true);
      setIsPreFeedbackMessage(true);
    }
  };

  const handleStartEmotion = async (emotion: string) => {
    setStartEmotion(emotion);

    const currPlaylistEC = emotionCaptured?.[playlistIdx] || {
      pre: false,
      post: false,
    };

    const bothCaptured = currPlaylistEC?.pre && currPlaylistEC?.post;
    if (bothCaptured && !feedbackSubmitted?.[playlistIdx]?.post) {
      return;
    }

    if (bothCaptured && playlistIdx + 1 < sequence.length) {
      const nextSequenceId = sequence[playlistIdx + 1];
      const newPlaylistDef = PLAYLIST_DEFS[nextSequenceId];

      setTargetEmotion(newPlaylistDef.targetEmotion);
    }

    const newPlaylistIdx = bothCaptured ? playlistIdx + 1 : playlistIdx;
    const type =
      emotionCaptured?.[newPlaylistIdx]?.pre && currPlaylistFinished
        ? "post"
        : "pre";

    if (type === "post" && playlistIdx !== newPlaylistIdx) {
      return;
    }

    const newPlaylistEC = emotionCaptured?.[newPlaylistIdx] || {
      pre: false,
      post: false,
    };

    newPlaylistEC[type] = true;

    setEmotionCaptured((prev) => ({
      ...prev,
      [newPlaylistIdx]: { ...newPlaylistEC },
    }));

    if (type === "post" && !bothCaptured) {
      showModalIfBothFeedbackCaptured();
      const feedbackData = await getPlaylistFeedback();
      const sessionId = await getSessionId();
      const trajectoryId = await getTrajectoryId();

      await updateMusicTrajectory(user?.email!, sessionId, trajectoryId, {
        feedbackAfter: { ...feedbackData, emotionState: emotion },
      });
    }
  };

  const handleLogout = () => {
    logout();
    navigation.navigate("Login" as never);
  };

  // Fetch news and weather info
  useEffect(() => {
    fetchWeatherAndNews(true);

    setTimeout(() => {
      setShowEmotionModal(true);
    }, 2000);

    setAudioModeAsync({
      playsInSilentMode: true, // iOS: play even when muted
      shouldPlayInBackground: true, // iOS + Android: keep going when backgrounded
      interruptionMode: "doNotMix", // pause when phone call starts
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

    return () => {
      clearListenInterval();
    };
  }, [playerStatus.playing, currentSongIndex]);

  // Replace audio urls with their downloaded urls
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

    if (!currentSong) return;
    playAudioPlayer();
  }, [currentSong?.audioUrl]);

  // Plays next song once current one finishes
  useEffect(() => {
    const index = currentSongIndex;
    if (playerStatus.didJustFinish) {
      setSongJustFinished(true);
      if (songRatings[currentSongIndex] === undefined) {
        setRatingUnlocked(true);
        setShowRatingAlert(true);
      }

      if (index === emotionTrajectory.length - 1) {
        setShowEmotionModal(true);
        setIsPreFeedbackMessage(false);
      }

      updateTrackInDB(
        {
          completed: true,
        },
        index,
      );

      handleNextSong();
    }
  }, [playerStatus.playing]);

  // Start generating next song once listening threshold reaches
  useEffect(() => {
    const clearGenerateTimerInterval = () => {
      if (generateTimerRef.current) {
        clearInterval(generateTimerRef.current);
        generateTimerRef.current = null;
      }
    };
    clearGenerateTimerInterval();

    if (
      !playerStatus.playing ||
      !currentSong ||
      generationLockedForIndex === currentSongIndex ||
      songQueue.length > currentSongIndex + 1
    ) {
      return;
    }

    generateTimerRef.current = setTimeout(() => {
      console.log(
        `--Listen threshold reached. Generating next song for index ${currentSongIndex}`,
      );

      setGenerationLockedForIndex(currentSongIndex);
      if (playlistType === "Trajectory") {
        generateNextSong();
      } else {
        generateNextSavedTrack();
      }
    }, LISTEN_BEFORE_GENERATE_MS);

    setTimeout(() => {
      if (songRatings[currentSongIndex] === undefined) {
        setRatingUnlocked(true);
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
    resetSlider();
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

      setFinalUrlsReady((prev) => ({ ...prev, [index]: true }));
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

  // Update duration slider value
  useEffect(() => {
    if (!playerStatus.isLoaded) return;

    if (!isSliding) {
      setSliderValue(playerStatus.currentTime ?? 0);
    }
  }, [playerStatus.currentTime, isSliding]);

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

  // Unlocks start next playlist button once user has given a feedback
  useFocusEffect(
    useCallback(() => {
      const prevVal = { ...feedbackSubmitted };

      getFeedbackSubmitted().then((val) => {
        setFeedbackSubmitted(val);

        if (!prevVal?.[playlistIdx]?.post) {
          setTimeout(() => {
            showModalIfBothFeedbackCaptured(val);
          }, 3000);
        }
      });
    }, []),
  );

  return (
    <ScrollView
      ref={scrollViewRef}
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.eyebrow}>EMOTION PLAYLIST</Text>
      </View>

      {/* Mood meter button */}
      {showMoodMeterButton && (
        <View style={[styles.section]}>
          {allPlaylistsCompleted && (
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>
                {`All playlists completed! Please update the mood meter and emotion state.`}
              </Text>
            </View>
          )}

          <Pressable
            onPress={handleNavigate}
            style={[
              styles.startBtn,
              { borderWidth: 1, backgroundColor: "#1E1235" },
            ]}
          >
            <Text
              style={[styles.startBtnText, { color: "#B07FE0", fontSize: 18 }]}
            >
              Update mood meter
            </Text>
          </Pressable>
        </View>
      )}

      {/* Current Emotion selection */}
      <View
        style={styles.section}
        pointerEvents={isEmotionLocked ? "none" : "auto"}
      >
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>
            {isEmotionLocked
              ? "Starting emotion state"
              : "How do you feel right now?"}
          </Text>
          {isEmotionLocked && (
            <FontAwesome5
              name="lock"
              size={11}
              color={C.textDim}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>

        <View
          pointerEvents={isEmotionLocked ? "none" : "auto"}
          style={isEmotionLocked ? { opacity: 0.4 } : undefined}
        >
          <EmotionGrid
            emotion={startEmotion}
            setEmotion={(val) => handleStartEmotion(val)}
          />
        </View>
      </View>

      {/* Desired Emotion selection */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>
            {isLocked ? "Target Emotion" : "How would you like to feel?"}
          </Text>
          {isLocked && (
            <FontAwesome5
              name="lock"
              size={11}
              color={C.textDim}
              style={{ marginLeft: 4 }}
            />
          )}
        </View>

        <View style={styles.moodRow}>
          <MoodCard
            mood="calm"
            selected={targetEmotion === "calm"}
            locked={isLocked}
            onPress={() => setTargetEmotion("calm")}
          />
          <View style={{ width: 12 }} />
          <MoodCard
            mood="joyful"
            selected={targetEmotion === "joyful"}
            locked={isLocked}
            onPress={() => setTargetEmotion("joyful")}
          />
        </View>
      </View>

      {/* Trajectory Number and Location Labels */}
      {(currentSong || currentActivity) && (
        <View
          style={{
            gap: 5,
            backgroundColor: "#181B24",
            borderRadius: 10,
            borderWidth: 1,
            borderColor: "#34373C",
            marginHorizontal: 24,
            marginTop: 24,
            marginBottom: 15,
            paddingHorizontal: 15,
            paddingVertical: 10,
          }}
        >
          {currentSong && (
            <View
              style={{
                flexDirection: "row",
                gap: 4,
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Text style={{ color: C.text, fontSize: 15, opacity: 0.9 }}>
                Trajectory Number:
              </Text>
              <Text style={styles.sectionTitle}>{playlistIdx + 1}</Text>
            </View>
          )}

          {currentActivity && (
            <View
              style={{
                flexDirection: "row",
                gap: 4,
                justifyContent: "flex-start",
                alignItems: "center",
              }}
            >
              <Text style={{ color: C.text, fontSize: 15, opacity: 0.9 }}>
                Location:
              </Text>
              <Text style={styles.sectionTitle}>{currentActivity}</Text>
            </View>
          )}
        </View>
      )}

      {/* Health Provider */}
      {!healthData && (
        <View style={[styles.section, { marginTop: 0 }]}>
          <HealthProviderSection
            updateHealthData={(data) => setHealthData(data)}
            provider={healthProvider}
            setProvider={setHealthProvider}
            isParticipantScreen={true}
          />
        </View>
      )}

      {/* Weather and News info */}
      <View
        style={[
          styles.section,
          { marginTop: 0 },
          weatherData && { marginBottom: 20 },
        ]}
      >
        <Biomarkers
          weatherData={weatherData}
          newsData={newsData}
          isParticipantScreen={true}
        />
      </View>

      {/* Trajectory song */}
      {currentSong && (
        <>
          {SHOW_LYRICS && !!currentSongLyrics && (
            <View
              ref={lyricsRef}
              style={{
                marginHorizontal: 20,
                padding: 16,
                borderRadius: 10,
                marginVertical: 10,
                borderWidth: 1,
                borderColor: "#333",
              }}
            >
              <Text style={styles.lyricsTitle}>Your Song Lyrics</Text>
              <LyricAnimator
                text={currentSongLyrics}
                currentTimeMs={currentTime * 1000}
                songDurationMs={(duration || DEFAULT_DURATION) * 1000}
              />
            </View>
          )}

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
              🎵 {currentSong.title}
            </Text>
          )}

          {/* Duration Control Progress Bar */}
          <View
            style={[
              styles.progressContainer,
              !currFinalUrlReady && { opacity: 0.5 },
            ]}
            pointerEvents={!currFinalUrlReady ? "none" : "auto"}
          >
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

            <Slider
              style={{ flex: 1, marginHorizontal: 10 }}
              minimumValue={0}
              maximumValue={duration || DEFAULT_DURATION}
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
              {formatTime(duration || DEFAULT_DURATION)}
            </Text>
          </View>

          {/* Music Player */}
          <View style={styles.playerBar}>
            {!playerStatus.isBuffering && playerStatus.isLoaded ? (
              <CommonButton
                onPress={playSound}
                style={styles.playButton}
                icon={
                  <FontAwesome5
                    name={playerStatus.playing ? "pause" : "play"}
                    size={18}
                    color="#9b5cff"
                  />
                }
              />
            ) : (
              <ActivityIndicator color="#fff" size={30} />
            )}
          </View>
        </>
      )}

      {/* Thumbs Up/Down buttons */}
      {ratingUnlocked && (
        <View
          style={{
            height: 40,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 5,
            marginHorizontal: 20,
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
                  scale:
                    songRatings[currentSongIndex] === undefined ? nudgeAnim : 1,
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
      {showRatingAlert && (
        <Text style={styles.ratingAlertText}>
          👆 Rate this song to continue to the next one
        </Text>
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

      {/* Start button */}
      {phase === "setup" && !currentSong && (
        <>
          {loading ? (
            <LoadingPhrases
              style={{ marginTop: 30 }}
              phrases={[
                "Composing your song...",
                "Weaving melodies to match your mood...",
                "Crafting lyrics just for this moment...",
                "Almost ready — your song is taking shape...",
              ]}
            />
          ) : (
            <View style={[styles.section, { marginTop: 30 }]}>
              <Pressable
                onPress={handleStart}
                disabled={!!startHintMsg || loading}
                style={[styles.startBtn, !!startHintMsg && { opacity: 0.3 }]}
              >
                <Text style={styles.startBtnText}>Start the session</Text>
              </Pressable>

              {!!startHintMsg && (
                <Text style={styles.startHint}>{startHintMsg}</Text>
              )}
            </View>
          )}
        </>
      )}

      {/* Next Playlist button */}
      {currPlaylistFinished && !allPlaylistsCompleted && ratingDone && (
        <View style={[styles.section, { marginTop: 60 }]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{nextPlaylistMsg}</Text>
          </View>

          <Pressable
            onPress={startNextPlaylist}
            disabled={nextPlaylistBtnDisabled}
            style={[
              styles.startBtn,
              nextPlaylistBtnDisabled && { opacity: 0.35 },
            ]}
          >
            <Text style={styles.startBtnText}>Start Next Playlist</Text>
            {loading && <ActivityIndicator color="#fff" size={30} />}
          </Pressable>
        </View>
      )}
      {!currPlaylistFinished && loading && phase !== "setup" && (
        <LoadingPhrases
          style={{ marginTop: 30 }}
          phrases={[
            "Setting the stage for your next playlist...",
            "Tuning into your emotional space...",
            "Preparing a personalized experience for you...",
            "Getting everything ready — just a moment...",
          ]}
        />
      )}

      {/* All playlists completed Message */}
      {allPlaylistsCompleted && ratingDone && (
        <View style={[styles.section]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              {`You've completed all the playlists of this session. Please update the mood meter and emotion state above!`}
            </Text>
          </View>
        </View>
      )}

      {/* Emotion Modal */}
      <EmotionModal
        visible={showEmotionModal}
        heading="How do you feel right now?"
        subheading={`Please update your emotion state and mood meter ${isPreFeedbackMessage ? "before starting the new playlist." : "after listening to this playlist."}`}
        onClose={() => setShowEmotionModal(false)}
      />

      {/* Logout button */}
      <View
        style={[styles.sectionHead, { gap: 0, marginTop: 60, opacity: 0.5 }]}
      >
        <Text style={{ color: "#ece5e5", fontSize: 12, marginLeft: 40 }}>
          Logout
        </Text>
        <CommonButton
          onPress={handleLogout}
          icon={<FontAwesome5 name="sign-out-alt" size={22} color="#fff" />}
        />
      </View>

      {/* Debug info */}
      <View
        style={{
          marginTop: 20,
          opacity: 0.5,
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: 20,
        }}
      >
        <Text style={{ color: "#ece5e5", fontSize: 12 }}>View logs</Text>
        <CommonButton
          onPress={viewLogs}
          icon={<FontAwesome5 name="eye" size={22} color="#fff" />}
        />
        <Text style={{ color: "#ece5e5", fontSize: 12, marginLeft: 5 }}>
          Share logs
        </Text>
        <CommonButton
          onPress={shareLogs}
          icon={<FontAwesome5 name="share" size={22} color="#fff" />}
        />
      </View>
      {/* {songQueue && songQueue.length > 0 && (
        <View style={{ marginTop: 20, opacity: 0.5, paddingHorizontal: 20 }}>
          <Text style={{ color: "#ece5e5", fontSize: 12 }}>
            Current music number: {currentSongIndex + 1}
          </Text>
          <Text style={{ color: "#ece5e5", fontSize: 12 }}>
            Audio source: {currentSong?.audioUrl || "--"}
          </Text>
          <Text style={{ color: "#ece5e5", fontSize: 12 }}>
            Number of songs generated: {songQueue.length}
          </Text>
        </View>
      )} */}
      {DEBUG_MODE && (
        <Pressable
          onPress={handleNavigate}
          style={[
            styles.startBtn,
            { borderWidth: 1, backgroundColor: "#1E1235" },
          ]}
        >
          <Text
            style={[styles.startBtnText, { color: "#B07FE0", fontSize: 18 }]}
          >
            {`Update mood meter (Test)`}
          </Text>
        </Pressable>
      )}

      {/* App version */}
      <View
        style={[styles.sectionHead, { gap: 0, marginTop: 60, opacity: 0.8 }]}
      >
        <Text style={{ color: "#ece5e5", fontSize: 12, marginLeft: 20 }}>
          App version: {APP_VERSION}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  header: {
    width: "100%",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: C.border,
    display: "flex",
    justifyContent: "center",
    flexDirection: "row",
  },
  eyebrow: {
    color: C.accent,
    fontSize: 21,
    fontWeight: "700",
    letterSpacing: 2.5,
    marginBottom: 10,
  },
  section: { paddingHorizontal: 24, marginTop: 32 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 10,
  },
  sectionTitle: { color: C.text, fontSize: 16, fontWeight: "700", flex: 1 },
  moodRow: { flexDirection: "row" },
  startBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    borderWidth: 1.5,
    borderColor: C.accent,
    backgroundColor: C.surfaceHigh,
    borderRadius: 18,
    paddingVertical: 19,
  },
  startBtnText: { color: C.text, fontSize: 17, fontWeight: "800" },
  startHint: {
    color: C.textDim,
    fontSize: 12,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 18,
  },
  lyricsTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  playerBar: {
    height: 55,
    backgroundColor: "#9b5cff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    marginHorizontal: 20,
    borderRadius: 10,
  },
  playButton: {
    width: 42,
    aspectRatio: 1,
    borderRadius: 27,
    backgroundColor: "#fff",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
    marginHorizontal: 20,
  },
  timeText: {
    color: "#ccc",
    fontSize: 12,
    textAlign: "center",
  },
  ratingAlertText: {
    color: "#fff",
    fontSize: 14,
    marginTop: 8,
    opacity: 0.85,
    paddingHorizontal: 24,
  },
});
