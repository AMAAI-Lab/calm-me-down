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
import EmotionDropdown from "@/components/ui/emotion-dropdown";
import HealthProviderSection from "@/components/ui/health-provider";
import {
  computeTempoRange,
  fetchAppleHealthData,
  HealthData,
} from "@/services/HealthService";
import {
  CONTINUOUS_PLAYBACK_MS,
  DEFAULT_HEALTH_DATA,
  HealthProvider,
  LISTEN_BEFORE_GENERATE_MS,
  SHOW_LYRICS,
} from "@/constants/appConstants";
import {
  downloadAndSaveAudio,
  fetchSavedPlaylistTrack,
  GeneratedSong,
  generatelyrics,
  generateSong,
  onFinalReady,
} from "@/services/MusicGenerationService";
import { formatTime } from "@/util/commonUtils";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import Slider from "@react-native-community/slider";
import CommonButton from "@/components/ui/common-button";
import {
  clearFeedbackSubmitted,
  clearSessionId,
  clearTrackIds,
  FeedbackSubmittedStatus,
  getFeedbackSubmitted,
  getSessionFeedback,
  getSessionId,
  getTrackId,
  saveSessionId,
  saveTrackId,
} from "@/services/LocalUserService";
import { useAuth } from "@/context/AuthContext";
import {
  addTrackToSession,
  createMusicSession,
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

type TargetEmotion = "calm" | "joyful";
type ActivityCtx = "Sitting in Lab" | "Walking Outside";
type PlaylistType = "Trajectory" | "SavedPlaylist";
type SessionId = "A" | "B" | "C" | "D";
type Phase = "setup" | "running" | "complete";

interface SessionDef {
  targetEmotion: TargetEmotion;
  playlistType: PlaylistType;
  context: ActivityCtx;
}

const ACTIVITY_OPTIONS: ActivityCtx[] = ["Sitting in Lab", "Walking Outside"];

const C = {
  bg: "#0D0D14",
  surfaceHigh: "#1E1E2C",
  border: "#2A2A3A",
  accent: "#b36cff",
  text: "#F0F0F8",
  textDim: "#404060",
} as const;

const SESSION_DEFS: Record<SessionId, SessionDef> = {
  A: {
    targetEmotion: "calm",
    playlistType: "Trajectory",
    context: "Sitting in Lab",
  },
  B: {
    targetEmotion: "joyful",
    playlistType: "Trajectory",
    context: "Walking Outside",
  },
  C: {
    targetEmotion: "calm",
    playlistType: "SavedPlaylist",
    context: "Walking Outside",
  },
  D: {
    targetEmotion: "joyful",
    playlistType: "SavedPlaylist",
    context: "Sitting in Lab",
  },
};

const SEQUENCES: Record<TargetEmotion, [SessionId[], SessionId[]]> = {
  calm: [
    ["A", "B", "C", "D"],
    ["C", "D", "A", "B"],
  ],
  joyful: [
    ["B", "C", "D", "A"],
    ["D", "A", "B", "C"],
  ],
};

const DEFAULT_DURATION = 120;

function pickSequence(target: TargetEmotion, activity: string): SessionId[] {
  let sessionId = null;
  Object.entries(SESSION_DEFS).forEach(([id, def]) => {
    if (def.targetEmotion === target && def.context === activity) {
      sessionId = id;
    }
  });

  const [s1, s2] = SEQUENCES[target];
  if (sessionId) {
    return s1[0] === sessionId ? s1 : s2;
  }
  return (Math.random() < 0.5 ? s1 : s2) as SessionId[];
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
  const [activityValue, setActivityValue] = useState<string>("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthProvider, setHealthProvider] =
    useState<HealthProvider>("Apple Health");

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
  const [sequence, setSequence] = useState<SessionId[]>([]);
  const [sessionIdx, setSessionIdx] = useState(0);
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
  const [finalUrlsReady, setFinalUrlsReady] = useState<Record<number, boolean>>(
    {},
  );

  const nudgeAnim = useRef(new Animated.Value(1)).current;
  const listenIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const lyricsRef = useRef<View>(null);

  const startHintMsg = useMemo(() => {
    if (!startEmotion && !targetEmotion && !activityValue) {
      return "Select your emotions and activity to continue";
    } else if (!startEmotion) {
      return "Select your starting emotion above";
    } else if (!targetEmotion) {
      return "Select your target emotion above";
    } else if (!activityValue) {
      return "Select your activity context above";
    } else if (Platform.OS === "ios" && !healthData) {
      return "Please authorize the Apple Health";
    } else if (!feedbackSubmitted?.[0]?.pre) {
      return "Please give a review before starting the session.";
    }

    return "";
  }, [
    startEmotion,
    targetEmotion,
    activityValue,
    healthData,
    feedbackSubmitted,
  ]);

  const nextSessionMsg = useMemo(() => {
    if (!feedbackSubmitted?.[sessionIdx]?.post) {
      return "Please give a review of the session.";
    } else if (!feedbackSubmitted?.[sessionIdx + 1]?.pre) {
      return "Please leave your review before starting the next session.";
    } else if (!startEmotion) {
      return "Please select your starting emotion above";
    }

    return "Tap below to begin the next session.";
  }, [startEmotion, feedbackSubmitted, sessionIdx]);

  const currSessionFinished =
    emotionTrajectory.length > 0 &&
    currentSongIndex + 1 >= emotionTrajectory.length;
  const allSessionsCompleted =
    currSessionFinished && sessionIdx === sequence.length - 1;
  const isLocked = loading || nextSongLoading || phase !== "setup";
  const ratingDone = !!songRatings[currentSongIndex];

  const currentSong = songQueue[currentSongIndex] ?? null;
  const currentSongLyrics = lyricsQueue[currentSongIndex] ?? null;
  const currFinalUrlReady = finalUrlsReady[currentSongIndex] ?? false;
  const player = useAudioPlayer(currentSong?.audioUrl || "");
  const playerStatus = useAudioPlayerStatus(player);
  const duration = player?.duration ?? 0;
  const currentTime = player?.currentTime ?? 0;
  const nextSessionBtnDisabled =
    loading ||
    !startEmotion ||
    !feedbackSubmitted?.[sessionIdx]?.post ||
    !feedbackSubmitted?.[sessionIdx + 1]?.pre;
  const showReviewButton =
    !loading &&
    ((!songQueue.length && !feedbackSubmitted?.[sessionIdx]?.pre) ||
      (currSessionFinished &&
        ratingDone &&
        (!feedbackSubmitted?.[sessionIdx]?.post ||
          !feedbackSubmitted?.[sessionIdx + 1]?.pre)));
  const isEmotionLocked =
    loading ||
    nextSongLoading ||
    (songQueue.length > 0 && (!currSessionFinished || !ratingDone));

  const activityIcon = (
    <FontAwesome5
      name={
        activityValue.toLowerCase().includes("lab")
          ? "flask"
          : activityValue.toLowerCase().includes("out")
            ? "tree"
            : "map-marker-alt"
      }
      size={16}
      color="#fff"
    />
  );

  const clearStates = async () => {
    setSongQueue([]);
    setCurrentSongIndex(0);
    setGenerationLockedForIndex(null);
    setDownloadedAudios({});
    setSongRatings({});
    setPlaylistType("");
    setLyricsQueue([]);
    setFinalUrlsReady({});
    await clearSessionId();
    await clearTrackIds();
  };

  const buildLyricsPrompt = async (mood: string, healthData: HealthData) => {
    const isHrValid = !!healthData.heartRate;
    const isStepsValid = !!healthData.steps;

    const { weather, news } = (await fetchWeatherAndNews()) || {};

    const prompt = `
      You are a creative songwriter. Generate original song lyrics personalized to the following inputs:

      USER
      - Name: ${user?.nickName || "Spark"}
      - Age: ${user?.age}

      MUSIC STYLE
      - Genre preference: ${user?.favoriteGenre}
      - Stylistic influence (do NOT imitate or quote): ${user?.favoriteBand}
      - mood: ${mood}

      PHYSICAL CONTEXT
      ${isHrValid ? `- Heart rate in last 5 min: ${healthData.heartRate} bpm` : ""}
      ${isStepsValid ? `- Movement in last 5 min: ${healthData.steps} steps` : ""}
      - Current or upcoming activity: ${activityValue || "None specified"}

      ENVIRONMENT
      - Location: ${weather?.city || "Unknown"}
      - Weather: ${weather?.temperature ? `${weather.temperature}°C, ${weather.description}` : "Unknown"}
      - News mood cue (optional): ${news?.headline || "N/A"}

      TASK:
      Write cohesive song lyrics.
      1. Structure: Verse 1, Chorus, Verse 2, and Outro.
      2. Line count (STRICT): Verse = 4 lines, Chorus = 4 lines, Outro = 2 lines. Total: 14 lines.
      3. Line length: Each line must be 6–10 words. No long run-on lines.
      4. Tone: ${mood} and emotionally grounded.
      5. Integration: Integrate physical state, environment, and (if relevant) the news mood subtly and metaphorically
      6. Originality: Avoid clichés and generic motivational phrases.
      7. Style: Use the genre and stylistic influence only for rhythm, imagery, and tone guidance—do not imitate or quote them.
      8. Before writing the lyrics, internally consider how the song should feel in terms of emotion, genre, and tempo/beat (e.g., slow emotional, mid-tempo groovy, fast energetic), and reflect that naturally in rhythm, wording, and flow of the lyrics. Do NOT explicitly mention tempo or BPM in the lyrics.

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
    const trajec = buildEmotionPath(
      startEmotion,
      givenTargetEmotion || targetEmotion || "Calm",
      2,
    );

    if (trajec.length === 1) {
      return [
        startEmotion || "",
        givenTargetEmotion || targetEmotion || "Calm",
      ];
    }
    return trajec;
  };

  const generateLyricsAndSong = async (
    givenTargetEmotion?: string,
    nextSessionIdx: number = 0,
  ) => {
    if (loading) {
      return;
    }
    setLoading(true);
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
    setLoading(false);

    const currTrajectory = generateTrajectory(givenTargetEmotion);
    setEmotionTrajectory(currTrajectory);
    try {
      const feedbackBefore = await getSessionFeedback();
      const newSessionID = await createMusicSession(
        user?.email!,
        {
          emotionTrajectory: currTrajectory,
          userDetails: { ...user },
          lyricPrompt: prompt,
          songPrompt: currentLyrics,
          hrvUsed: false,
          playlistType: "trajectory",
          sessionNumber: nextSessionIdx + 1,
          feedbackBefore,
        },
        true,
      );
      await saveSessionId(newSessionID);

      const trackRes = await addTrackToSession(
        user?.email!,
        newSessionID!,
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
      );
      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error updating DB: ", err);
    }
  };

  const generateSavedPlaylist = async (
    givenTargetEmotion?: string,
    nextSessionIdx: number = 0,
  ) => {
    setLoading(true);
    await clearStates();

    setPlaylistType("SavedPlaylist");
    const track = await fetchSavedPlaylistTrack(0);
    if (!track) {
      setLoading(false);
      return;
    }

    setLyricsQueue([track?.lyrics || ""]);
    setSongQueue([track]);
    const currTrajectory = generateTrajectory(givenTargetEmotion);
    setEmotionTrajectory(currTrajectory);

    try {
      const feedbackBefore = await getSessionFeedback();

      const newSessionID = await createMusicSession(
        user?.email!,
        {
          emotionTrajectory: currTrajectory,
          userDetails: { ...user },
          hrvUsed: false,
          playlistType: "savedPlaylist",
          sessionNumber: nextSessionIdx + 1,
          feedbackBefore,
        },
        true,
      );
      await saveSessionId(newSessionID);

      const trackRes = await addTrackToSession(
        user?.email!,
        newSessionID!,
        currentSongIndex,
        {
          mood: startEmotion || currTrajectory[0] || "N/A",
          streamUrl: track.audioUrl || "",
          heartRate: healthData?.heartRate || "N/A",
          steps: healthData?.steps || "N/A",
        },
        true,
      );
      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error updating DB: ", err);
    }

    setLoading(false);
  };

  const handleStart = async () => {
    if (!startEmotion || !targetEmotion || !activityValue) return;
    const seq = pickSequence(targetEmotion, activityValue);
    setSequence(seq);

    const firstSession = SESSION_DEFS[seq[0]];
    if (firstSession.playlistType === "Trajectory") {
      await generateLyricsAndSong();
    } else {
      await generateSavedPlaylist();
    }

    setPhase("running");
  };

  const startNextSession = async () => {
    if (loading) return;
    setLoading(true);

    const nextSessionIdx = sessionIdx + 1;
    setSessionIdx(nextSessionIdx);
    if (nextSessionIdx >= sequence.length) {
      setLoading(false);
      return;
    }

    const nextSequenceId = sequence[nextSessionIdx];
    const newSessionDef = SESSION_DEFS[nextSequenceId];

    const {
      playlistType,
      context,
      targetEmotion: newTargetEmotion,
    } = newSessionDef;
    setActivityValue(context);
    setTargetEmotion(newTargetEmotion);
    if (playlistType === "Trajectory") {
      await generateLyricsAndSong(newTargetEmotion, nextSessionIdx);
    } else {
      await generateSavedPlaylist(newTargetEmotion, nextSessionIdx);
    }

    setLoading(false);
  };

  const handleNextSong = () => {
    if (currentSongIndex === songQueue.length - 1) return;
    setCurrentSongIndex((i) => i + 1);
  };

  const playSound = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();

      if (Math.floor(currentTime) === Math.floor(duration)) {
        handleNextSong();
      }
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
          sunoOrgPayload: { ...sunoOrgPayload },
          heartRate: latestHealthData?.heartRate || "N/A",
          steps: latestHealthData?.steps || "N/A",
          suggestedAiMusicStyle: suggestedMusicStyle || "",
        },
        true,
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

    const track = await fetchSavedPlaylistTrack(nextSongIdx);
    if (!track) {
      setLoading(false);
      setNextSongLoading(false);
      return;
    }

    setLyricsQueue((prev) => [...prev, track?.lyrics || ""]);
    setSongQueue((prev) => [...prev, track]);

    try {
      const currentMood = emotionTrajectory?.[nextSongIdx] || "Calm";
      const latestHealthData = await fetchAppleHealthData(5);

      const sessionId = await getSessionId();
      const trackRes = await addTrackToSession(
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

      if (trackId) {
        await updateTrackFields(
          user?.email!,
          sessionId,
          trackId,
          {
            ...updates,
          },
          true,
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

    if (playlistType === "Trajectory") {
      await generateNextSong();
    } else {
      await generateNextSavedTrack();
    }
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

  const handleNavigate = () => {
    const currSessionFeedback = feedbackSubmitted?.[sessionIdx];
    const sessionIdxProp =
      currSessionFeedback?.pre && currSessionFeedback?.post
        ? sessionIdx + 1
        : sessionIdx;

    navigation.navigate({
      name: "Feedback",
      params: {
        storeInDb:
          feedbackSubmitted?.[sessionIdxProp]?.pre && currSessionFinished,
        sessionIdx: sessionIdxProp,
      },
    } as never);
  };

  // Fetch news and weather info
  useEffect(() => {
    fetchWeatherAndNews(true);

    (async () => {
      await clearFeedbackSubmitted();
    })();
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
    player.play();
  }, [currentSong?.audioUrl]);

  // Plays next song once current one finishes
  useEffect(() => {
    const index = currentSongIndex;
    if (playerStatus.didJustFinish) {
      if (songRatings[currentSongIndex] === undefined) {
        setRatingUnlocked(true);
        setShowRatingAlert(true);
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
    if (generateTimerRef.current) {
      clearTimeout(generateTimerRef.current);
      generateTimerRef.current = null;
    }

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
        `--Listen threshold reached. Rating unlocked for index ${currentSongIndex}`,
      );

      setRatingUnlocked(true);
      setGenerationLockedForIndex(currentSongIndex);
    }, LISTEN_BEFORE_GENERATE_MS);

    return () => {
      if (generateTimerRef.current) {
        clearTimeout(generateTimerRef.current);
        generateTimerRef.current = null;
      }
    };
  }, [playerStatus.playing, currentSongIndex, currentSong?.audioUrl]);

  // Reset states when song changes
  useEffect(() => {
    setGenerationLockedForIndex(null);
    setRatingUnlocked(false);
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
        player.play();
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

  // Unlocks start next session button once user has given a feedback
  useFocusEffect(
    useCallback(() => {
      getFeedbackSubmitted().then((val) => {
        setFeedbackSubmitted(val);
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

      {/* Current Emotion selection */}
      <View
        style={styles.section}
        pointerEvents={isEmotionLocked ? "none" : "auto"}
      >
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>
            {isEmotionLocked
              ? "Starting emotion"
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
          <EmotionGrid emotion={startEmotion} setEmotion={setStartEmotion} />
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

      {/* Activity selection */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>
            {isLocked ? "Activity Context" : "Where are you?"}
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

        <View
          pointerEvents={isLocked ? "none" : "auto"}
          style={isLocked ? { opacity: 0.4 } : undefined}
        >
          <EmotionDropdown
            value={activityValue}
            placeholder="Select activity context…"
            moods={ACTIVITY_OPTIONS}
            icon={activityIcon}
            disableSearch={true}
            onChange={setActivityValue}
          />
        </View>
      </View>

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
      {nextSongLoading && (
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

      {/* Thumbs Up/Down buttons */}
      {ratingUnlocked && (
        <View
          style={{
            height: 40,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 5,
            marginHorizontal: 20,
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

      {/* Review button */}
      {showReviewButton && (
        <View style={[styles.section, { marginTop: 40 }]}>
          {allSessionsCompleted && (
            <View style={styles.sectionHead}>
              <Text style={styles.sectionTitle}>
                {`You've completed all sessions. We'd love your feedback!`}
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
              Leave a Review
            </Text>
          </Pressable>
        </View>
      )}
      {/* <Pressable
        onPress={handleNavigate}
        style={[
          styles.startBtn,
          { borderWidth: 1, backgroundColor: "#1E1235" },
        ]}
      >
        <Text style={[styles.startBtnText, { color: "#B07FE0", fontSize: 18 }]}>
          Leave a Review
        </Text>
      </Pressable> */}

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

      {/* Next Session button */}
      {currSessionFinished && !allSessionsCompleted && ratingDone && (
        <View style={[styles.section, { marginTop: 60 }]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>{nextSessionMsg}</Text>
          </View>

          <Pressable
            onPress={startNextSession}
            disabled={nextSessionBtnDisabled}
            style={[
              styles.startBtn,
              nextSessionBtnDisabled && { opacity: 0.35 },
            ]}
          >
            <Text style={styles.startBtnText}>Start Next session</Text>
            {loading && <ActivityIndicator color="#fff" size={30} />}
          </Pressable>
        </View>
      )}
      {!currSessionFinished && loading && phase !== "setup" && (
        <LoadingPhrases
          style={{ marginTop: 30 }}
          phrases={[
            "Setting the stage for your next session...",
            "Tuning into your emotional space...",
            "Preparing a personalized experience for you...",
            "Getting everything ready — just a moment...",
          ]}
        />
      )}

      {/* Logout button */}
      <View
        style={[styles.sectionHead, { gap: 0, marginTop: 60, opacity: 0.5 }]}
      >
        <Text style={{ color: "#ece5e5", fontSize: 12, marginLeft: 40 }}>
          Logout
        </Text>
        <CommonButton
          onPress={logout}
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
