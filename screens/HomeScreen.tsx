import {
  addTrackToSession,
  createMusicSession,
  updateTrackFields,
} from "@/services/DbService";
import { FontAwesome5 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import CommonButton from "../components/ui/common-button";
import EmotionDropdown from "../components/ui/emotion-dropdown";
import EmotionInput from "../components/ui/emotion-input";
import HealthProviderSection from "../components/ui/health-provider";
import {
  CONTINUOUS_PLAYBACK_MS,
  DEBUG_MODE,
  EMOTION_OPTIONS,
  HealthProvider,
  HRV_APP_VERSION,
  LISTEN_BEFORE_GENERATE_MS,
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
import { shareLogs, viewLogs } from "../services/LoggerService";
import {
  downloadAndSaveAudio,
  GeneratedSong,
  generatelyrics,
  generateSong,
  onFinalReady,
} from "../services/MusicGenerationService";
import { NewsData, WeatherData } from "../services/WeatherNewsService";
import {
  clearSessionId,
  clearTrackIds,
  getSessionId,
  getTrackId,
  saveSessionId,
  saveTrackId,
} from "@/services/LocalUserService";
import LyricAnimator from "@/components/ui/lyric-animator";
import { formatTime } from "@/util/commonUtils";
import Biomarkers from "@/components/ui/biomarkers";

export default function HomeScreen() {
  const authContext = useAuth();
  const logout = authContext.logout;
  const user = authContext.user as UserProfile;

  const [input, setInput] = useState<UserInput>({
    currentMood: "",
    desiredMood: "",
    activity: "",
  });

  const [healthData, setHealthData] = useState<HealthData | null>(null);

  const [healthProvider, setHealthProvider] =
    useState<HealthProvider>("Apple Health");
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsData, setNewsData] = useState<NewsData | null>(null);

  const [generatingLyrics, setGeneratingLyrics] = useState(false);
  const [generatingSong, setGeneratingSong] = useState(false);
  const [lyricPrompt, setLyricPrompt] = useState("");
  const [generatedLyrics, setGeneratedLyrics] = useState("");

  const [emotionPath, setEmotionPath] = useState<string[]>([]);
  const [songQueue, setSongQueue] = useState<GeneratedSong[]>([]);
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
  const [bioLog, setBioLog] = useState<
    {
      songIndex: number;
      planned: { valence: number; arousal: number };
      adjusted: { valence: number; arousal: number; emotion: string };
      bioArousal: number | null;
      deviation: number;
      strategy: string;
      hr: number | null;
      steps: number | null;
      hrv: number | null;
      timestamp: string;
    }[]
  >([]);

  const currentSong = songQueue[currentSongIndex] ?? null;
  const player = useAudioPlayer(currentSong?.audioUrl || "");
  const playerStatus = useAudioPlayerStatus(player);

  const listenIntervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const generateTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  const handleInputChange = (key: keyof UserInput, value: string) => {
    setInput((prev) => ({ ...prev, [key]: value }));
  };
  const isFormComplete = useMemo(() => {
    const requiredFields = [input.currentMood, input.desiredMood];
    return requiredFields.every((val) => val.trim() !== "");
  }, [input]);

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
    setBioLog([]);
    await clearSessionId();
    await clearTrackIds();
  };

  const generateLyricsAndSong = async () => {
    if (!isFormComplete || !healthData) {
      console.warn(`Missing form data!`);
      return;
    }
    if (generatingLyrics || generatingSong) {
      return;
    }

    await clearStates();

    const emotionTrajectory = buildEmotionPath(
      input.currentMood,
      input.desiredMood,
    );
    console.log("Emotion Trajectory:", emotionTrajectory);
    setEmotionPath(emotionTrajectory);

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

      // Log biometric state for this song
      setBioLog((prev) => [
        ...prev,
        {
          songIndex: 0,
          planned: vaTrajectory[0],
          adjusted: adjustedEmotion,
          bioArousal: healthData.arousal,
          deviation: adjustedEmotion.deviation,
          strategy,
          hr: healthData.heartRate,
          steps: healthData.steps,
          hrv: healthData.hrv,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Build the prompt with biometric context
      prompt = buildLyricPrompt({
        input: { ...user, ...input },
        mood: adjustedEmotion.emotion,
        valence: adjustedEmotion.valence,
        arousal: adjustedEmotion.arousal,
        healthData,
        weatherData,
        newsData,
        strategy,
      });

      hrvMetrics = {
        plannedVA: vaTrajectory[0],
        adjustedEmotion,
        strategy,
      };
    } else {
      prompt = `
        You are a creative songwriter. Generate original song lyrics personalized to the following inputs:

        USER
        - Name: ${user.name}
        - Age: ${user.age}

        MUSIC STYLE
        - Genre preference: ${user.favoriteGenre}
        - Stylistic influence (do NOT imitate or quote): ${user.favoriteBand}
        - mood: ${emotionTrajectory[0]}

        PHYSICAL CONTEXT
        - Heart rate: ${healthData.heartRate} bpm (last 5 min)
        - Daily activity: ${healthData.steps} steps (last 5 min)
        - Current or upcoming activity: ${input.activity || "None specified"}

        ENVIRONMENT
        - Location: ${weatherData?.city || "Unknown"}
        - Weather: ${weatherData?.temperature ? `${weatherData.temperature}°C, ${weatherData.description}` : "Unknown"}
        - News mood cue (optional): ${newsData?.headline || "N/A"}

        TASK:
        Write cohesive song lyrics.
        1. Structure: Verse 1, Chorus, Verse 2, Chorus (exact repeat), and Outro.
        2. Tone: motivational, uplifting, and emotionally grounded.
        3. Length: Target ~180–220 words total.
        4. Integration: Integrate physical state, environment, and (if relevant) the news mood subtly and metaphorically
        5. Originality: Avoid clichés and generic motivational phrases.
        6. Style: Use the genre and stylistic influence only for rhythm, imagery, and tone guidance—do not imitate or quote them.

        OUTPUT FORMAT (STRICT):
        Return ONLY valid JSON. No preamble or markdown. Use the following structure:
        {
          "lyrics": {
            "verse1": "...",
            "chorus": "...",
            "verse2": "...",
            "outro": "..."
          }
        }
      `;
    }

    setLyricPrompt(prompt);
    setGeneratingLyrics(true);
    setGeneratedLyrics("");

    // DEBUG MODE: Skip API calls
    if (DEBUG_MODE) {
      console.log("DEBUG MODE: Generating mock lyrics and song...");

      // Mock Latency
      setTimeout(async () => {
        // 1. Mock Lyrics
        const mockLyrics = `(Mock Lyrics for ${user.name})\n\nIn the city of ${weatherData?.city || "Dreams"},\nHeart beating at ${healthData.heartRate || "steady"} pace,\nWalking through the ${weatherData?.description || "mist"},\nFinding my own space.\n\nFrom ${input.currentMood} shadows,\nTo ${input.desiredMood} light,\nThis song guides me,\nThrough the day and night.`;
        setGeneratedLyrics(mockLyrics);
        setGeneratingLyrics(false);

        // 2. Mock Song (Immediately after)
        setGeneratingSong(true);
        setTimeout(() => {
          const mockSongData: GeneratedSong = {
            audioUrl:
              // "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Public domain MP3
              "https://wephotos1.s3.amazonaws.com/bCv0l1ycm2Ac.mp3",
            title: `Song for ${user.name}`,
            duration: 30,
            provider: "MOCK",
          };
          setSongQueue([mockSongData]);
          setCurrentSongIndex(0);
          setGeneratingSong(false);
        }, 1500); // 1.5s delay for song generation simulation
      }, 1000); // 1s delay for lyrics simulation

      return;
    }

    // Generate song lyrics
    let currentLyrics = "";
    try {
      const { lyrics } = (await generatelyrics(prompt)) || {};
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
    } finally {
      setGeneratingLyrics(false);
    }

    // Generate Song Audio
    setGeneratingSong(true);
    console.log(
      `Generating song with lyrics: ${(currentLyrics || "").substring(0, 50)}...`,
    );

    let generatedStreamUrl = null;
    try {
      const generatedSong = await generateSong(
        currentLyrics || "Uplifting song",
        user.favoriteGenre,
        adjustedEmotion.emotion || input.desiredMood,
        currentSongIndex,
        user.favoriteGenre,
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
    setGeneratingSong(false);

    try {
      const newSessionID = await createMusicSession(user?.email!, {
        emotionPath: emotionTrajectory,
        userDetails: { ...input },
        lyricPrompt: prompt,
        songPrompt: currentLyrics,
        hrvUsed: HRV_APP_VERSION,
        sunoOrgPayload: SUNO_ORG_PAYLOAD,
      });
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
          hrvMetrics,
        },
      );
      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error updating DB: ", err);
    }
  };

  const playSound = () => {
    if (playerStatus.playing) {
      player.pause();
    } else {
      player.play();
    }
    //if song is finished, play from beginning TODO
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
    player.play();
  }, [currentSong?.audioUrl]);

  useEffect(() => {
    const index = currentSongIndex;
    if (playerStatus.didJustFinish) {
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

      // Log biometric state
      setBioLog((prev) => [
        ...prev,
        {
          songIndex: nextSongIdx,
          planned: plannedVA,
          adjusted: adjustedEmotion,
          bioArousal: latestHealthData.arousal,
          deviation: adjustedEmotion.deviation,
          strategy,
          hr: latestHealthData.heartRate,
          steps: latestHealthData.steps,
          hrv: latestHealthData.hrv,
          timestamp: new Date().toISOString(),
        },
      ]);

      // Build prompt with biometric-adjusted mood
      prompt = buildLyricPrompt({
        input: { ...user, ...input },
        mood: adjustedEmotion.emotion,
        valence: adjustedEmotion.valence,
        arousal: adjustedEmotion.arousal,
        healthData: latestHealthData,
        weatherData,
        newsData,
        strategy,
      });

      hrvMetrics = {
        plannedVA,
        adjustedEmotion,
        strategy,
      };
    } else {
      console.log("Mood input for next song: ", currentMood);
      console.log("HR for next song: ", latestHealthData.heartRate);
      console.log("Steps for next song: ", latestHealthData.steps);

      prompt = `
        You are a creative songwriter. Generate original song lyrics personalized to the following inputs:

        USER
        - Name: ${user.name}
        - Age: ${user.age}

        MUSIC STYLE
        - Genre preference: ${user.favoriteGenre}
        - Stylistic influence (do NOT imitate or quote): ${user.favoriteBand}
        - mood: ${currentMood}

        PHYSICAL CONTEXT
        - Heart rate in last 5 min: ${latestHealthData.heartRate} bpm
        - Movement in last 5 min: ${latestHealthData.steps} steps
        - Current or upcoming activity: ${input.activity || "None specified"}

        ENVIRONMENT
        - Location: ${weatherData?.city || "Unknown"}
        - Weather: ${weatherData?.temperature ? `${weatherData.temperature}°C, ${weatherData.description}` : "Unknown"}
        - News mood cue (optional): ${newsData?.headline || "N/A"}

        TASK:
        Write cohesive song lyrics.
        1. Structure: Verse 1, Chorus, Verse 2, Chorus (exact repeat), and Outro.
        2. Tone: motivational, uplifting, and emotionally grounded.
        3. Length: Target ~180-220 words total.
        4. Integration: Integrate physical state, environment, and (if relevant) the news mood subtly and metaphorically
        5. Originality: Avoid clichés and generic motivational phrases.
        6. Style: Use the genre and stylistic influence only for rhythm, imagery, and tone guidance—do not imitate or quote them.

        OUTPUT FORMAT (STRICT):
        Return ONLY valid JSON. No preamble or markdown. Use the following structure:
        {
          "lyrics": {
            "verse1": "...",
            "chorus": "...",
            "verse2": "...",
            "outro": "..."
          }
        }
      `;
    }

    if (DEBUG_MODE) {
      console.log("DEBUG MODE: Generating mock lyrics and next song...");

      setTimeout(async () => {
        const nextSongIdx = ((currentSongIndex + 1) % 15) + 1;
        const mockSongData: GeneratedSong = {
          audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${nextSongIdx}.mp3`, // Public domain MP3
          title: `Song for ${user.name || "N/A"}`,
          duration: 30,
          provider: "MOCK",
        };

        setSongQueue((prev) => [...prev, mockSongData]);
      }, 500);

      return;
    }

    // Generate song lyrics
    let currentLyrics = "";
    try {
      const { lyrics } = (await generatelyrics(prompt)) || {};
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
        adjustedEmotion.emotion || input?.desiredMood || "N/A",
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
          hrvMetrics,
        },
      );

      await saveTrackId(trackRes?.id!, trackRes?.songIdx || 0);
    } catch (err) {
      console.error("Error while updating DB: ", err);
    }
  };

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
    if (currentSongIndex + 1 >= emotionPath.length) {
      console.warn(
        "Could not generate next song as songs generation completed for all the emotions in the path!",
      );
      return;
    }

    generateTimerRef.current = setTimeout(() => {
      console.log(
        `--Listen threshold reached. Generating next song for index ${currentSongIndex}`,
      );

      setGenerationLockedForIndex(currentSongIndex);
      generateNextSong();
    }, LISTEN_BEFORE_GENERATE_MS);

    return () => {
      if (generateTimerRef.current) {
        clearTimeout(generateTimerRef.current);
        generateTimerRef.current = null;
      }
    };
  }, [playerStatus.playing, currentSongIndex, currentSong?.audioUrl]);

  useEffect(() => {
    setGenerationLockedForIndex(null);
  }, [currentSongIndex]);

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

  const duration = player?.duration ?? 0;
  const currentTime = player?.currentTime ?? 0;
  const handleSlidingComplete = async (value: number) => {
    try {
      await player.seekTo(value);
    } catch (err: any) {
      console.warn("Seek failed: ", err?.message);
    }
  };

  useEffect(() => {
    if (!playerStatus.isLoaded) return;

    if (!isSliding) {
      setSliderValue(playerStatus.currentTime ?? 0);
    }
  }, [playerStatus.currentTime, isSliding]);

  const checkEnvVars = () => {
    const ENV = {
      CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
      OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY,
    };
    const { CLAUDE_API_KEY, OPENWEATHER_API_KEY } = ENV;
    Alert.alert(
      "ENV Variables:",
      `-> OPENWEATHER_API_KEY : ${OPENWEATHER_API_KEY} -> CLAUDE_API_KEY: ${CLAUDE_API_KEY}`,
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#171A1F" }}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 150 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={true} // Helpful for debugging scrolling
        onContentSizeChange={(w, h) => console.log("Content height:", h)}
        nestedScrollEnabled={true}
      >
        <Text style={styles.header}>Emotion to Lyric Generator</Text>

        <EmotionDropdown
          label={`Hi ${user?.name}, how are you feeling today?`}
          placeholder="Sad, Calm, Mysterious, Tense..."
          value={input.currentMood}
          moods={EMOTION_OPTIONS}
          icon={<FontAwesome5 name="microphone" size={16} color="#fff" />}
          onChange={(t) => handleInputChange("currentMood", t)}
        />
        <EmotionDropdown
          label="How would you like to feel?"
          placeholder="Joyful, Excited, Cheerful, Energetic..."
          value={input.desiredMood}
          moods={EMOTION_OPTIONS}
          icon={<FontAwesome5 name="bolt" size={16} color="#fff" />}
          onChange={(t) => handleInputChange("desiredMood", t)}
        />
        <EmotionInput
          label="Are you starting some activity?"
          placeholder="Workout, Walking, Studying, Meditating..."
          icon={<FontAwesome5 name="running" size={16} color="#fff" />}
          value={input.activity}
          onChange={(t) => handleInputChange("activity", t)}
        />

        {!healthData && (
          <HealthProviderSection
            updateHealthData={(data) => setHealthData(data)}
            provider={healthProvider}
            setProvider={setHealthProvider}
          />
        )}

        <Biomarkers
          healthData={healthData}
          weatherData={weatherData}
          setWeatherData={setWeatherData}
          newsData={newsData}
          setNewsData={setNewsData}
        />

        {isFormComplete && healthData && (
          <Pressable
            onPress={generateLyricsAndSong}
            disabled={generatingLyrics || generatingSong}
            style={styles.generateButton}
          >
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
              {generatingLyrics || generatingSong
                ? "Creating Magic..."
                : "Generate Lyrics & Song"}
            </Text>
          </Pressable>
        )}

        {/* Display  lyrics and Audio Player */}
        {(generatedLyrics || currentSong) && (
          <View style={styles.stepContainer}>
            {generatedLyrics && generatedLyrics?.length && (
              <View>
                <Text style={styles.lyricsTitle}>Your Song</Text>
                <LyricAnimator text={generatedLyrics} />
                {/* <LyricAnimator
                  text={currentLyrics}
                  currentTimeMs={currentTime * 1000}
                  songDurationMs={(duration || DEFAULT_DURATION) * 1000}
                /> */}
              </View>
            )}

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
                      <FontAwesome5
                        name="step-backward"
                        size={22}
                        color="#fff"
                      />
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
                      <FontAwesome5
                        name="step-forward"
                        size={22}
                        color="#fff"
                      />
                    }
                  />
                </View>
              </>
            )}
          </View>
        )}

        <View style={{ marginTop: 20, opacity: 0.5 }}>
          <Text style={{ color: "#ece5e5", fontSize: 12 }}>
            Is playing: {playerStatus?.playing ? "Yes" : "No"}
          </Text>
          <Text style={{ color: "#ece5e5", fontSize: 12 }}>
            Number of songs generated: {songQueue.length}
          </Text>
        </View>

        <View
          style={{
            marginTop: 20,
            opacity: 0.5,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#ece5e5", fontSize: 12 }}>
            Verify API keys
          </Text>
          <CommonButton
            onPress={checkEnvVars}
            icon={<FontAwesome5 name="question" size={22} color="#fff" />}
          />
          <Text style={{ color: "#ece5e5", fontSize: 12 }}>Logout</Text>
          <CommonButton
            onPress={logout}
            icon={<FontAwesome5 name="sign-out-alt" size={22} color="#fff" />}
          />
        </View>

        <View
          style={{
            marginTop: 20,
            opacity: 0.5,
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
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
        {generatedLyrics && lyricPrompt ? (
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

function buildLyricPrompt({
  input,
  mood,
  valence,
  arousal,
  healthData,
  weatherData,
  newsData,
  strategy,
}: {
  input: {
    activity: string;
    name: string;
    age: string;
    favoriteGenre: string;
    favoriteBand: string;
  };
  mood: string;
  valence: number;
  arousal: number;
  healthData: HealthData;
  weatherData: WeatherData | null;
  newsData: NewsData | null;
  strategy: string;
}): string {
  // Map strategy to musical guidance
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

  return `
    You are a creative songwriter. Generate original song lyrics personalized to the following inputs:

    USER
    - Name: ${input.name}
    - Age: ${input.age}

    MUSIC STYLE
    - Genre preference: ${input.favoriteGenre}
    - Stylistic influence (do NOT imitate or quote): ${input.favoriteBand}
    - Target mood: ${mood}
    - Emotional coordinates: Valence ${valence} (${valence > 0 ? "positive" : "negative"}), Arousal ${arousal} (${arousal > 0.5 ? "high energy" : "low energy"})

    PHYSICAL CONTEXT
    - Heart rate: ${healthData.heartRate ?? "N/A"} bpm (last 5 min)
    - Recent activity: ${healthData.steps ?? "N/A"} steps (last 5 min)
    - HRV: ${healthData.hrv ?? "N/A"} ms
    - Estimated emotional arousal: ${healthData.arousal !== null ? (healthData.arousal * 100).toFixed(0) + "%" : "N/A"}
    - Current or upcoming activity: ${input.activity || "None specified"}

    BIOMETRIC ADAPTATION
    ${strategyGuidance[strategy] || strategyGuidance.on_track}

    ENVIRONMENT
    - Location: ${weatherData?.city || "Unknown"}
    - Weather: ${weatherData?.temperature ? `${weatherData.temperature}°C, ${weatherData.description}` : "Unknown"}
    - News mood cue (optional): ${newsData?.headline || "N/A"}

    TASK:
    Write cohesive song lyrics.
    1. Structure: Verse 1, Chorus, Verse 2, Chorus (exact repeat), and Outro.
    2. Tone: Match the target mood and emotional coordinates above.
    3. Length: Target ~180–220 words total.
    4. Integration: Integrate physical state, environment, and biometric adaptation guidance subtly and metaphorically.
    5. Originality: Avoid clichés and generic motivational phrases.
    6. Style: Use the genre and stylistic influence only for rhythm, imagery, and tone guidance—do not imitate or quote them.

    OUTPUT FORMAT (STRICT):
    Return ONLY valid JSON. No preamble or markdown. Use the following structure:
    {
      "lyrics": {
        "verse1": "...",
        "chorus": "...",
        "verse2": "...",
        "outro": "..."
      }
    }
  `;
}

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
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
