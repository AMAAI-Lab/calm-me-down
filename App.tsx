import { FontAwesome5 } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { useAudioPlayer, useAudioPlayerStatus } from "expo-audio";
import * as Location from "expo-location";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import BiomarkerCard from "./components/ui/biomarker-card";
import CommonButton from "./components/ui/common-button";
import EmotionDropdown from "./components/ui/emotion-dropdown";
import EmotionInput from "./components/ui/emotion-input";
import HealthProviderSection from "./components/ui/health-provider";
import {
  DEBUG_MODE,
  EMOTION_OPTIONS,
  LISTEN_BEFORE_GENERATE_MS,
  UserInput,
} from "./constants/appConstants";
import { buildEmotionPath } from "./services/EmotionPathService";
import { fetchAppleHealthData, HealthData } from "./services/HealthService";
import {
  downloadAndSaveAudio,
  GeneratedSong,
  generatelyrics,
  generateSong,
  onFinalReady,
} from "./services/MusicGenerationService";
import {
  fetchNewsData,
  fetchWeatherData,
  NewsData,
  WeatherData,
} from "./services/WeatherNewsService";

export default function App() {
  //console.log("DEBUG ENV: ", process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY);
  const [input, setInput] = useState<UserInput>({
    name: "",
    age: "",
    currentMood: "",
    desiredMood: "",
    favoriteGenre: "",
    favoriteBand: "",
    activity: "",
  });
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );

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

  const currentSong = songQueue[currentSongIndex] ?? null;
  const player = useAudioPlayer(currentSong?.audioUrl || "");
  const playerStatus = useAudioPlayerStatus(player);

  const generateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [sliderValue, setSliderValue] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleInputChange = (key: keyof UserInput, value: string) =>
    setInput((prev) => ({ ...prev, [key]: value }));
  const isFormComplete = useMemo(
    () => Object.values(input).every((val) => val.trim() !== ""),
    [input],
  );

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      console.log("location set");

      // Fetch weather and news data based on location
      const weather = await fetchWeatherData(
        loc.coords.latitude,
        loc.coords.longitude,
      );
      setWeatherData(weather);

      // Using US as default country code for news; can be enhanced to use location data
      const news = await fetchNewsData("us");
      setNewsData(news);
    })();
  }, []);

  const generateLyricsAndSong = async () => {
    if (!isFormComplete || !healthData) {
      console.warn(`Missing form data!`);
      return;
    }
    //const prompt = `Create song lyrics for: ${input.name}, Mood: ${input.currentMood} -> ${input.desiredMood}. Health: HR ${healthData.heartRate}, Steps ${healthData.steps}.`;

    const emotionTrajectory = buildEmotionPath(
      input.currentMood,
      input.desiredMood,
    );
    console.log("fetched emotion Trajectory: ", emotionTrajectory);
    // MUSIC TASTE: ${input.favoriteGenre} (Style of ${input.favoriteBand}).
    setEmotionPath(emotionTrajectory);

    const prompt = `
      You are a creative songwriter. Generate original song lyrics personalized to the following inputs:

      USER
      - Name: ${input.name}
      - Age: ${input.age}

      MUSIC STYLE
      - Genre preference: ${input.favoriteGenre}
      - Stylistic influence (do NOT imitate or quote): ${input.favoriteBand}
      - mood: ${emotionTrajectory[0]}

      PHYSICAL CONTEXT
      - Heart rate: ${healthData.heartRate} bpm
      - Daily activity: ${healthData.steps} steps
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

    setLyricPrompt(prompt);
    setGeneratingLyrics(true);
    setGeneratedLyrics("");

    // DEBUG MODE: Skip API calls
    if (DEBUG_MODE) {
      console.log("DEBUG MODE: Generating mock lyrics and song...");

      // Mock Latency
      setTimeout(async () => {
        // 1. Mock Lyrics
        const mockLyrics = `(Mock Lyrics for ${input.name})\n\nIn the city of ${weatherData?.city || "Dreams"},\nHeart beating at ${healthData.heartRate || "steady"} pace,\nWalking through the ${weatherData?.description || "mist"},\nFinding my own space.\n\nFrom ${input.currentMood} shadows,\nTo ${input.desiredMood} light,\nThis song guides me,\nThrough the day and night.`;
        setGeneratedLyrics(mockLyrics);
        setGeneratingLyrics(false);

        // 2. Mock Song (Immediately after)
        setGeneratingSong(true);
        setTimeout(() => {
          const mockSongData: GeneratedSong = {
            audioUrl:
              // "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", // Public domain MP3
              "https://wephotos1.s3.amazonaws.com/bCv0l1ycm2Ac.mp3",
            title: `Song for ${input.name}`,
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
    } finally {
      setGeneratingLyrics(false);
    }

    // Generate Song Audio
    setGeneratingSong(true);
    console.log(
      `Generating song with lyrics: ${(currentLyrics || "").substring(0, 50)}...`,
    );
    try {
      const generatedSong = await generateSong(
        currentLyrics || "Uplifting song",
        input.favoriteGenre,
        input.desiredMood,
        currentSongIndex,
      );
      if (generatedSong) {
        setSongQueue([generatedSong]);
      } else {
        console.warn("Song Generation Failed, Could not generate song audio.");
      }
      setGeneratingSong(false);
    } catch (error: any) {
      console.error(
        "An error occurred while generating next song audio.",
        error.message,
      );
      setGeneratingSong(false);
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
    if (playerStatus.didJustFinish) {
      //Song ended, auto-playing next
      handleNextSong();
    }
  }, [playerStatus.playing]);

  const generateNextSong = async () => {
    if (
      songQueue.length > currentSongIndex + 1 ||
      emotionPath.length < currentSongIndex
    ) {
      return;
    }

    const latestHealthData = await fetchAppleHealthData();

    const currentMood =
      emotionPath?.[currentSongIndex + 1] || input.currentMood;
    console.log("Mood input for next song: ", currentMood);
    console.log("HR for next song: ", latestHealthData.heartRate);
    console.log("Steps for next song: ", latestHealthData.steps);

    const prompt = `
      You are a creative songwriter. Generate original song lyrics personalized to the following inputs:

      USER
      - Name: ${input.name}
      - Age: ${input.age}

      MUSIC STYLE
      - Genre preference: ${input.favoriteGenre}
      - Stylistic influence (do NOT imitate or quote): ${input.favoriteBand}
      - mood: ${currentMood}

      PHYSICAL CONTEXT
      - Heart rate: ${latestHealthData.heartRate} bpm
      - Daily activity: ${latestHealthData.steps} steps
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

    if (DEBUG_MODE) {
      console.log("DEBUG MODE: Generating mock lyrics and next song...");

      setTimeout(async () => {
        const nextSongIdx = ((currentSongIndex + 1) % 15) + 1;
        const mockSongData: GeneratedSong = {
          audioUrl: `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${nextSongIdx}.mp3`, // Public domain MP3
          title: `Song for ${input?.name || "N/A"}`,
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
      `Generating next song with lyrics: "${(currentLyrics || "").substring(0, 30)}..."`,
    );
    try {
      const generatedSong = await generateSong(
        currentLyrics || "Uplifting song",
        input?.favoriteGenre || "N/A",
        input?.desiredMood || "N/A",
        currentSongIndex + 1,
      );
      if (generatedSong) {
        setSongQueue((prev) => [...prev, generatedSong]);
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
    if (emotionPath.length < currentSongIndex) {
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
    });
  }, [songQueue, currentSongIndex]);

  const duration = playerStatus.duration ?? 0;
  const currentTime = playerStatus.currentTime ?? 0;
  const handleSlidingComplete = async (value: number) => {
    try {
      await player.seekTo(value);
    } catch (err: any) {
      console.warn("Seek failed: ", err?.message);
    }
  };
  const formatTime = (seconds: number) => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    if (!playerStatus.isLoaded) return;

    if (!isSliding) {
      setSliderValue(playerStatus.currentTime ?? 0);
    }
  }, [playerStatus.currentTime, isSliding]);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
        {/* Removed the intermediate View causing layout issues */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={true} // Helpful for debugging scrolling
          onContentSizeChange={(w, h) => console.log("Content height:", h)}
          scrollEnabled={!isDropdownOpen}
          nestedScrollEnabled={true}
        >
          <Text style={styles.header}>Emotion to Lyric Generator</Text>

          <EmotionInput
            label="Your name"
            placeholder="e.g. Alex"
            icon={<FontAwesome5 name="user" size={16} color="#fff" />}
            value={input.name}
            onChange={(t) => handleInputChange("name", t)}
          />
          <EmotionInput
            label="Your age"
            placeholder="e.g. 24"
            icon={<FontAwesome5 name="birthday-cake" size={16} color="#fff" />}
            value={input.age}
            onChange={(t) => handleInputChange("age", t)}
          />
          {/* <EmotionInput
            label="How are you feeling?"
            placeholder="Sad, Calm, Mysterious, Tense..."
            icon={<FontAwesome5 name="microphone" size={16} color="#fff" />}
            value={input.currentMood}
            onChange={(t) => handleInputChange("currentMood", t)}
          />
          <EmotionInput
            label="How would you like to feel?"
            placeholder="Joyful, Excited, Cheerful, Energetic..."
            icon={<FontAwesome5 name="bolt" size={16} color="#fff" />}
            value={input.desiredMood}
            onChange={(t) => handleInputChange("desiredMood", t)}
          /> */}
          <EmotionDropdown
            label="How are you feeling?"
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
          {/* <SearchableDropdown
            label="How are you feeling?"
            value={input.currentMood}
            options={EMOTION_OPTIONS}
            placeholder="Sad, Calm, Mysterious, Tense..."
            onSelect={(t) => handleInputChange("currentMood", t)}
            onOpen={() => setIsDropdownOpen(true)}
            onClose={() => setIsDropdownOpen(false)}
          />
          <SearchableDropdown
            label="How would you like to feel?"
            value={input.desiredMood}
            options={EMOTION_OPTIONS}
            placeholder="Joyful, Excited, Cheerful, Energetic..."
            onSelect={(t) => handleInputChange("desiredMood", t)}
            onOpen={() => setIsDropdownOpen(true)}
            onClose={() => setIsDropdownOpen(false)}
          /> */}
          <EmotionInput
            label="Favorite genre"
            placeholder="Pop, Rock, Indie, EDM..."
            icon={<FontAwesome5 name="music" size={16} color="#fff" />}
            value={input.favoriteGenre}
            onChange={(t) => handleInputChange("favoriteGenre", t)}
          />
          <EmotionInput
            label="Favorite band / artist"
            placeholder="Coldplay, Arctic Monkeys, Imagine Dragons..."
            icon={<FontAwesome5 name="headphones" size={16} color="#fff" />}
            value={input.favoriteBand}
            onChange={(t) => handleInputChange("favoriteBand", t)}
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
            />
          )}

          <Text style={styles.sectionTitle}>Current Biomarkers</Text>
          <View style={styles.bioGrid}>
            <BiomarkerCard
              icon={<FontAwesome5 name="heart" size={20} color="#b36cff" />}
              label="Heart Rate"
              value={`${healthData?.heartRate || "--"} bpm`}
            />
            <BiomarkerCard
              icon={<FontAwesome5 name="walking" size={20} color="#b36cff" />}
              label="Steps"
              value={`${healthData?.steps || "--"}`}
            />

            <BiomarkerCard
              icon={
                <FontAwesome5
                  name="thermometer-half"
                  size={20}
                  color="#b36cff"
                />
              }
              label="Temperature"
              value={`${weatherData?.temperature || "--"}°C`}
            />
            <BiomarkerCard
              icon={
                <FontAwesome5 name="map-marker-alt" size={20} color="#b36cff" />
              }
              label="Location"
              value={weatherData?.city || "--"}
            />
          </View>

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
          {generatedLyrics.length > 0 && (
            <View style={styles.stepContainer}>
              <Text style={styles.lyricsTitle}>Your Song</Text>
              <Text style={styles.lyricsText}>{generatedLyrics}</Text>

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
                    <Text style={styles.timeText}>
                      {formatTime(currentTime)}
                    </Text>

                    <Slider
                      style={{ flex: 1, marginHorizontal: 10 }}
                      minimumValue={0}
                      maximumValue={duration || 1}
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

                    <Text style={styles.timeText}>{formatTime(duration)}</Text>
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
          {songQueue?.length ? (
            <View style={{ marginTop: 20, opacity: 0.5 }}>
              {/* <Text style={{ color: "#ece5e5", fontSize: 12 }}>
                Current duration: {player.currentTime}
              </Text> */}
              <Text style={{ color: "#ece5e5", fontSize: 12 }}>
                Current music number: {currentSongIndex + 1}
              </Text>
              <Text style={{ color: "#ece5e5", fontSize: 12 }}>
                Audio source: {currentSong.audioUrl}
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
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#171A1F" },
  scrollView: { flex: 1 }, // Ensure ScrollView takes available space
  scrollContent: { padding: 20, paddingBottom: 150 }, // Ensure content grows to fill and adds bottom padding
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
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  providerStatus: {
    fontSize: 14,
    color: "#b36cff",
    textAlign: "center",
    marginBottom: 10,
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
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 12,
  },
  bioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
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