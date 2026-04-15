import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Linking,
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
import { fetchAppleHealthData, HealthData } from "@/services/HealthService";
import {
  CONTINUOUS_PLAYBACK_MS,
  HealthProvider,
  LISTEN_BEFORE_GENERATE_MS,
  // SpotifyTrack,
  SUNO_ORG_PAYLOAD,
} from "@/constants/appConstants";
import {
  downloadAndSaveAudio,
  fetchSavedPlaylistTrack,
  // fetchSpotifyTrack,
  GeneratedSong,
  generatelyrics,
  generateSong,
  // getSpotifyToken,
  onFinalReady,
} from "@/services/MusicGenerationService";
import { formatTime } from "@/util/commonUtils";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import Slider from "@react-native-community/slider";
import CommonButton from "@/components/ui/common-button";
import {
  clearSessionId,
  clearTrackIds,
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
// import TrackCard from "@/components/ui/track-card";
import MoodCard from "@/components/ui/mood-card";
import Biomarkers from "@/components/ui/biomarkers";
import { NewsData, WeatherData } from "@/services/WeatherNewsService";
import LyricAnimator from "@/components/ui/lyric-animator";

type StartEmotion = "calm" | "joyful";
type ActivityCtx = "Sitting in Lab" | "Walking Outside";
// type PlaylistType = "Trajectory" | "Spotify" | "SavedPlaylist";
type PlaylistType = "Trajectory" | "SavedPlaylist";
type SessionId = "A" | "B" | "C" | "D";
type Phase = "setup" | "running" | "complete";

interface SessionDef {
  startEmotion: StartEmotion;
  targetEmotion: StartEmotion;
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
    startEmotion: "calm",
    targetEmotion: "joyful",
    playlistType: "Trajectory",
    context: "Sitting in Lab",
  },
  B: {
    startEmotion: "joyful",
    targetEmotion: "calm",
    playlistType: "Trajectory",
    context: "Walking Outside",
  },
  C: {
    startEmotion: "calm",
    targetEmotion: "joyful",
    // playlistType: "Spotify",
    playlistType: "SavedPlaylist",
    context: "Walking Outside",
  },
  D: {
    startEmotion: "joyful",
    targetEmotion: "calm",
    // playlistType: "Spotify",
    playlistType: "SavedPlaylist",
    context: "Sitting in Lab",
  },
};

const SEQUENCES: Record<StartEmotion, [SessionId[], SessionId[]]> = {
  calm: [
    ["A", "B", "C", "D"],
    ["C", "D", "A", "B"],
  ],
  joyful: [
    ["B", "C", "D", "A"],
    ["D", "A", "B", "C"],
  ],
};

const TRAJECTORY = {
  calm: ["Calm", "Comforting", "Hopeful", "Joyful"],
  // calm: ["Calm", "Comforting"],
  joyful: ["Joyful", "Hopeful", "Comforting", "Calm"],
  // joyful: ["Joyful", "Upbeat"],
};

const DEFAULT_HEALTH_DATA: HealthData = {
  heartRate: 75,
  steps: 6500,
  hrv: null,
  arousal: null,
  heartRateSamples: [],
};

function pickSequence(start: StartEmotion, activity: string): SessionId[] {
  let sessionId = null;
  Object.entries(SESSION_DEFS).forEach(([id, def]) => {
    if (def.startEmotion === start && def.context === activity) {
      sessionId = id;
    }
  });

  const [s1, s2] = SEQUENCES[start];
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
  const [startEmotion, setStartEmotion] = useState<StartEmotion | null>(null);
  const [activityValue, setActivityValue] = useState<string>("");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsData, setNewsData] = useState<NewsData | null>(null);
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [healthProvider, setHealthProvider] =
    useState<HealthProvider>("Apple Health");

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
  // const [spotifyTracks, setSpotifyTracks] = useState<SpotifyTrack[]>([]);
  // const [spotifyClickedTracks, setSpotifyClickedTracks] = useState<number[]>(
  //   [],
  // );
  const [sequence, setSequence] = useState<SessionId[]>([]);
  const [sessionIdx, setSessionIdx] = useState(0);
  const [songRatings, setSongRatings] = useState<Record<number, "up" | "down">>(
    {},
  );
  const [ratingUnlocked, setRatingUnlocked] = useState(false);
  const [showRatingAlert, setShowRatingAlert] = useState(false);
  const [playlistType, setPlaylistType] = useState<PlaylistType | "">("");
  const [generatedLyrics, setGeneratedLyrics] = useState("");

  const nudgeAnim = useRef(new Animated.Value(1)).current;
  const listenIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const generateTimerRef = useRef<NodeJS.Timeout | null>(null);

  const emotionTrajectory = useMemo(() => {
    return startEmotion === "calm" ? TRAJECTORY.calm : TRAJECTORY.joyful;
  }, [startEmotion]);

  // const currSessionFinished =
  //   (spotifyTracks.length > 0 &&
  //     spotifyTracks.length === spotifyClickedTracks.length) ||
  //   (emotionTrajectory.length > 0 &&
  //     currentSongIndex + 1 >= emotionTrajectory.length);
  const currSessionFinished =
    emotionTrajectory.length > 0 &&
    currentSongIndex + 1 >= emotionTrajectory.length;
  const allSessionsCompleted =
    currSessionFinished && sessionIdx === sequence.length - 1;

  const isLocked = phase !== "setup";
  const canStart = !!startEmotion && !!activityValue;

  const currentSong = songQueue[currentSongIndex] ?? null;
  const player = useAudioPlayer(currentSong?.audioUrl || "");
  const playerStatus = useAudioPlayerStatus(player);
  const duration = player?.duration ?? 0;
  const currentTime = player?.currentTime ?? 0;

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
    // setSpotifyTracks([]);
    // setSpotifyClickedTracks([]);
    setGeneratedLyrics("");
    setPlaylistType("");
    await clearSessionId();
    await clearTrackIds();
  };

  const buildLyricsPrompt = (mood: string, healthData: HealthData) => {
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
      - Heart rate in last 5 min: ${healthData.heartRate} bpm
      - Movement in last 5 min: ${healthData.steps} steps
      - Current or upcoming activity: ${activityValue || "None specified"}

      ENVIRONMENT
      - Location: ${weatherData?.city || "Unknown"}
      - Weather: ${weatherData?.temperature ? `${weatherData.temperature}°C, ${weatherData.description}` : "Unknown"}
      - News mood cue (optional): ${newsData?.headline || "N/A"}

      TASK:
      Write cohesive song lyrics.
      1. Structure: Verse 1, Chorus, Verse 2, and Outro.
      2. Line count (STRICT): Verse = 4 lines, Chorus = 4 lines, Outro = 2 lines. Total: 14 lines.
      3. Line length: Each line must be 6–10 words. No long run-on lines.
      4. Tone: motivational, uplifting, and emotionally grounded.
      5. Integration: Integrate physical state, environment, and (if relevant) the news mood subtly and metaphorically
      6. Originality: Avoid clichés and generic motivational phrases.
      7. Style: Use the genre and stylistic influence only for rhythm, imagery, and tone guidance—do not imitate or quote them.

      OUTPUT FORMAT (STRICT):
      Return ONLY valid JSON. No preamble or markdown. Use the following structure:
      {
        "lyrics": {
          "verse1": "line1\nline2\nline3\nline4",
          "chorus": "line1\nline2\nline3\nline4",
          "verse2": "line1\nline2\nline3\nline4",
          "outro": "line1\nline2"
        }
      }
    `;

    return prompt;
  };

  const generateLyricsAndSong = async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    await clearStates();

    setPlaylistType("Trajectory");
    const currHealthData =
      healthData && healthData?.steps ? healthData : DEFAULT_HEALTH_DATA;

    const prompt = buildLyricsPrompt(
      emotionTrajectory?.[0] || "",
      currHealthData,
    );

    // Generate song lyrics
    let currentLyrics = "";
    try {
      const lyrics = await generatelyrics(prompt);
      if (lyrics) {
        currentLyrics = lyrics;
        setGeneratedLyrics(lyrics);
      } else {
        console.warn("Lyrics Generation Failed!");
      }
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
        user?.favoriteGenre || "Pop, Classical",
        startEmotion || "Calm",
        currentSongIndex,
        user?.favoriteGenre,
        user?.favoriteBand,
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
      const newSessionID = await createMusicSession(
        user?.email!,
        {
          emotionTrajectory: emotionTrajectory,
          userDetails: { ...user },
          lyricPrompt: prompt,
          songPrompt: currentLyrics,
          hrvUsed: false,
          sunoOrgPayload: SUNO_ORG_PAYLOAD,
          playlistType: "trajectory",
        },
        true,
      );
      await saveSessionId(newSessionID);

      const trackRes = await addTrackToSession(
        user?.email!,
        newSessionID!,
        currentSongIndex,
        {
          mood: emotionTrajectory[0] || "N/A",
          streamUrl: generatedStreamUrl || songQueue[0]?.audioUrl || "",
          lyrics: currentLyrics,
          lyricsPrompt: prompt,
          heartRate: healthData?.heartRate || "N/A",
          steps: healthData?.steps || "N/A",
        },
        true,
      );
      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error updating DB: ", err);
    }
  };

  // const generateSpotifyPlaylist = async () => {
  //   setLoading(true);
  //   await clearStates();
  //   const token = await getSpotifyToken();

  //   const promises = emotionTrajectory.map((emotion) =>
  //     fetchSpotifyTrack(token, emotion),
  //   );
  //   const tracks = await Promise.all(promises);
  //   const filteredTracks = tracks.filter((v) => !!v);
  //   setSpotifyTracks(filteredTracks);
  //   setLoading(false);
  // };

  const generateSavedPlaylist = async () => {
    setLoading(true);
    await clearStates();

    setPlaylistType("SavedPlaylist");
    const track = fetchSavedPlaylistTrack(0);
    if (!track) {
      setLoading(false);
      return;
    }

    setSongQueue([track]);
    try {
      const newSessionID = await createMusicSession(
        user?.email!,
        {
          userDetails: { ...user },
          hrvUsed: false,
          playlistType: "savedPlaylist",
        },
        true,
      );
      await saveSessionId(newSessionID);

      const trackRes = await addTrackToSession(
        user?.email!,
        newSessionID!,
        currentSongIndex,
        {
          mood: emotionTrajectory[0] || "N/A",
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
    if (!startEmotion || !activityValue) return;
    const seq = pickSequence(startEmotion, activityValue);
    setSequence(seq);

    const firstSession = SESSION_DEFS[seq[0]];
    if (firstSession.playlistType === "Trajectory") {
      await generateLyricsAndSong();
    } else {
      // await generateSpotifyPlaylist();
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

    const { startEmotion, playlistType, context } = newSessionDef;
    setStartEmotion(startEmotion);
    setActivityValue(context);
    if (playlistType === "Trajectory") {
      await generateLyricsAndSong();
    } else {
      // await generateSpotifyPlaylist();
      await generateSavedPlaylist();
    }

    setLoading(false);
  };

  const playSound = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
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
    const nextSongIdx = currentSongIndex + 1;

    if (songQueue.length > nextSongIdx) {
      return;
    }
    if (nextSongIdx >= emotionTrajectory.length) {
      console.warn(
        "Could not generate next song! Songs generation completed for all the emotions in the path.",
      );
      return;
    }

    const latestHealthData = await fetchAppleHealthData(5);
    const currentMood = emotionTrajectory?.[nextSongIdx] || "Calm";

    console.log("Mood input for next song: ", currentMood);
    console.log("HR for next song: ", latestHealthData.heartRate);
    console.log("Steps for next song: ", latestHealthData.steps);

    const prompt = buildLyricsPrompt(currentMood, latestHealthData);

    // Generate song lyrics
    let currentLyrics = "";
    try {
      const lyrics = await generatelyrics(prompt);
      if (lyrics) {
        currentLyrics = lyrics;
      } else {
        console.warn("Lyrics Generation failed for next song!");
      }
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
        user?.favoriteGenre || "N/A",
        currentMood,
        nextSongIdx,
        user?.favoriteGenre,
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
        },
        true,
      );

      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error while updating DB: ", err);
    }
  };
  const generateNextSavedTrack = async () => {
    const nextSongIdx = currentSongIndex + 1;

    if (nextSongIdx >= emotionTrajectory.length) {
      console.warn(
        "Could not fetch next saved song! Songs already fetched for all the emotions.",
      );
      return;
    }
    const track = fetchSavedPlaylistTrack(nextSongIdx);
    if (!track) {
      setLoading(false);
      return;
    }

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
  };

  // const handleClickSpotifyTrack = (idx: number) => {
  //   if (!spotifyClickedTracks.includes(idx)) {
  //     setSpotifyClickedTracks((prev) => [...prev, idx]);
  //   }
  // };
  // async function openInSpotify(
  //   spotifyUri: string,
  //   webFallbackUrl: string,
  //   idx: number,
  // ) {
  //   try {
  //     handleClickSpotifyTrack(idx);

  //     const canOpen = await Linking.canOpenURL(spotifyUri);
  //     if (canOpen) {
  //       await Linking.openURL(spotifyUri);
  //     } else {
  //       await Linking.openURL(webFallbackUrl);
  //     }
  //   } catch (err: any) {
  //     console.error("Error while opening spotify link: ", err?.message);
  //     Alert.alert("Can't open Spotify link.", "Please try again!", [
  //       { text: "Cancel", style: "cancel" },
  //       {
  //         text: "Retry",
  //         onPress: () => Linking.openURL(webFallbackUrl),
  //       },
  //     ]);
  //   }
  // }

  const updateTrackInDB = async (updates: object, index: number) => {
    try {
      const trackId = await getTrackId(index);
      const sessionId = await getSessionId();
      await updateTrackFields(
        user?.email!,
        sessionId,
        trackId,
        {
          ...updates,
        },
        true,
      );
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
      if (ratingUnlocked && songRatings[currentSongIndex] === undefined) {
        setShowRatingAlert(true);
      }
      updateTrackInDB(
        {
          completed: true,
        },
        index,
      );

      if (currentSongIndex === songQueue.length - 1) return;
      setCurrentSongIndex((i) => i + 1);
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
    // if (currentSongIndex + 1 >= emotionTrajectory.length) {
    //   console.warn(
    //     "Could not generate next song! Songs generation completed for all the emotions in the path.",
    //   );
    //   return;
    // }

    generateTimerRef.current = setTimeout(() => {
      // console.log(
      //   `--Listen threshold reached. Generating next song for index ${currentSongIndex}`,
      // );
      console.log(
        `--Listen threshold reached. Rating unlocked for index ${currentSongIndex}`,
      );

      setRatingUnlocked(true);
      setGenerationLockedForIndex(currentSongIndex);
      // generate NextSong();
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

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.eyebrow}>EMOTION PLAYLIST</Text>
      </View>

      {/* Emotion selection */}
      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>
            {isLocked ? "Starting Emotion" : "How do you feel right now?"}
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
            selected={startEmotion === "calm"}
            locked={isLocked}
            onPress={() => setStartEmotion("calm")}
          />
          <View style={{ width: 12 }} />
          <MoodCard
            mood="joyful"
            selected={startEmotion === "joyful"}
            locked={isLocked}
            onPress={() => setStartEmotion("joyful")}
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
            label="Activity"
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
          setWeatherData={setWeatherData}
          newsData={newsData}
          setNewsData={setNewsData}
          isParticipantScreen={true}
        />
      </View>

      {/* Start button */}
      {phase === "setup" && (
        <View style={[styles.section, { marginTop: 12 }]}>
          <Pressable
            onPress={handleStart}
            disabled={!canStart || loading}
            style={[styles.startBtn, !canStart && { opacity: 0.3 }]}
          >
            <Text style={styles.startBtnText}>Start the session</Text>
            {loading && <ActivityIndicator color="#fff" size={30} />}
          </Pressable>

          {!canStart && (
            <Text style={styles.startHint}>
              {!startEmotion && !activityValue
                ? "Select your emotion and activity to continue"
                : !startEmotion
                  ? "Select your starting emotion above"
                  : "Select your activity context above"}
            </Text>
          )}
        </View>
      )}

      {generatedLyrics && generatedLyrics?.length && (
        <View
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
          <LyricAnimator text={generatedLyrics} />
        </View>
      )}

      {/* Trajectory song */}
      {currentSong && (
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
              🎵 {currentSong.title}
            </Text>
          )}

          {/* Duration Control Progress Bar */}
          <View style={styles.progressContainer}>
            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>

            <Slider
              style={{ flex: 1, marginHorizontal: 10 }}
              minimumValue={0}
              maximumValue={duration || 120}
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

            <Text style={styles.timeText}>{formatTime(duration || 120)}</Text>
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

      {/* Spotify Tracks */}
      {/* spotifyTracks && spotifyTracks.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>Playlist via Spotify</Text>
          </View>

          <View style={{ flex: 1 }}>
            {spotifyTracks.map((track, index) => (
              <TrackCard
                key={`${track?.id}_${index}`}
                track={track}
                index={index}
                onPress={() =>
                  openInSpotify(
                    track?.uri,
                    track?.external_urls?.spotify,
                    index,
                  )
                }
              />
            ))}
          </View>
        </View>
      ) */}

      {/* Next Session button */}
      {currSessionFinished && !allSessionsCompleted && (
        <View style={[styles.section, { marginTop: 60 }]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              Session complete! Tap below to begin the next one.
            </Text>
          </View>

          <Pressable
            onPress={startNextSession}
            disabled={loading}
            style={[styles.startBtn]}
          >
            <Text style={styles.startBtnText}>Start Next session</Text>
            {loading && <ActivityIndicator color="#fff" size={30} />}
          </Pressable>
        </View>
      )}
      {!currSessionFinished && loading && phase !== "setup" && (
        <ActivityIndicator color="#fff" size={30} style={{ paddingTop: 40 }} />
      )}

      {/* Review button */}
      {(currSessionFinished || allSessionsCompleted) && (
        <View style={[styles.section, { marginTop: 60 }]}>
          <View style={styles.sectionHead}>
            <Text style={styles.sectionTitle}>
              {`${allSessionsCompleted ? "You've completed all sessions." : "Current session completed."} We'd love your feedback!`}
            </Text>
          </View>

          <Pressable
            onPress={() => navigation.navigate("Feedback" as never)}
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
