import { FontAwesome5 } from '@expo/vector-icons';
import { useAudioPlayer } from 'expo-audio';
import * as Location from 'expo-location';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Button, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { authorizeAppleHealth, fetchAppleHealthData, fetchFitbitData, fetchGarminData, HealthData } from './services/HealthService';
import { GeneratedSong, generateSong } from './services/MusicGenerationService';
import { fetchNewsData, fetchWeatherData, NewsData, WeatherData } from './services/WeatherNewsService';


const PPLX_API_KEY = process.env.EXPO_PUBLIC_PPLX_API_KEY;

const DEBUG_MODE = false;


type UserInput = {
  name: string;
  age: string;
  currentMood: string;
  desiredMood: string;
  favoriteGenre: string;
  favoriteBand: string;
};

type Provider = 'Apple Health' | 'Fitbit' | 'Garmin';

export default function App() {
  //console.log("DEBUG ENV: ", process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY);
  const [input, setInput] = useState<UserInput>({
    name: '', age: '', currentMood: '', desiredMood: '', favoriteGenre: '', favoriteBand: '',
  });
  const [provider, setProvider] = useState<Provider>('Apple Health');
  const [healthData, setHealthData] = useState<HealthData | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [newsData, setNewsData] = useState<NewsData | null>(null);

  const [loading, setLoading] = useState(false);

  const [generatingLyrics, setGeneratingLyrics] = useState(false);

  const [generatingSong, setGeneratingSong] = useState(false);

  const [isAuthorized, setIsAuthorized] = useState(false);
  const [lyricPrompt, setLyricPrompt] = useState('');

  const [generatedLyrics, setGeneratedLyrics] = useState('');
  const [song, setSong] = useState<GeneratedSong | null>(null);
  //const [sound, setSound] = useState<Audio.Sound | null>(null);
  const player = useAudioPlayer(song?.audioUrl || '');
  const [isPlaying, setIsPlaying] = useState(false);

  const handleInputChange = (key: keyof UserInput, value: string) => setInput(prev => ({ ...prev, [key]: value }));
  const isFormComplete = useMemo(() => Object.values(input).every(val => val.trim() !== ''), [input]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);

      // Fetch weather and news data based on location
      const weather = await fetchWeatherData(loc.coords.latitude, loc.coords.longitude);
      setWeatherData(weather);

      // Using US as default country code for news; can be enhanced to use location data
      const news = await fetchNewsData('us');
      setNewsData(news);
      
    })();
  }, []);

  const handleAuthorizeAndFetch = useCallback(async () => {
    if (provider !== 'Apple Health') {
      Alert.alert('Unavailable', 'Using mock data for ' + provider);
      setHealthData(provider === 'Fitbit' ? await fetchFitbitData() : await fetchGarminData());
      return;
    }
    if (Platform.OS !== 'ios') {
        Alert.alert('Platform Warning', 'Apple Health is only available on iOS.');
        return;
    }
    setLoading(true);
    let authorized = isAuthorized;
    try {
        if (!isAuthorized) {
            authorized = await authorizeAppleHealth();
            setIsAuthorized(authorized);
        }
        if (authorized) {
            const data = await fetchAppleHealthData();
            setHealthData(data);
            Alert.alert('Success', `Fetched HR: ${data.heartRate || 'N/A'}, Steps: ${data.steps || 'N/A'}`);
        } else {
            Alert.alert('Authorization Failed', 'Please grant permissions in Health app.');
        }
    } catch (e: any) {
        Alert.alert('Error', e.message);
    } finally {
        setLoading(false);
    }
  }, [isAuthorized, provider]);

  const generateLyricsAndSong = async () => {
    if (!isFormComplete || !healthData) {
      Alert.alert('Missing Data', 'Complete form and fetch data first.');
      return;
    }
    //const prompt = `Create song lyrics for: ${input.name}, Mood: ${input.currentMood} -> ${input.desiredMood}. Health: HR ${healthData.heartRate}, Steps ${healthData.steps}.`;

    //Enhanced Prompt with Weather and News
    const prompt = `
      Act as a creative songwriter. Create a personalized song lyric for a user.
      
      USER: ${input.name}, ${input.age}y/o. 
      MOOD JOURNEY: ${input.currentMood} -> ${input.desiredMood}.
      MUSIC TASTE: ${input.favoriteGenre} (Style of ${input.favoriteBand}).
      
      PHYSICAL STATE:
      - Heart Rate: ${healthData.heartRate} bpm
      - Activity: ${healthData.steps} steps
      
      ENVIRONMENT:
      - Location: ${weatherData?.city || 'Unknown'}
      - Weather: ${weatherData?.temperature ? `${weatherData.temperature}°C, ${weatherData.description}` : 'Unknown'}
      - Local Vibe (News Headline): "${newsData?.headline || 'N/A'}"
      
      GOAL: Please write cohesive, therapeutic lyrics for a song (Verse1, Chorus, Verse 2, Outro) that reflect their physical state and environment (weather/location), subtly referencing the news mood if relevant, to help them transition to their desired mood.The song should be motivational and uplifting, helping them reach their desired emotional state through music. 
      Keep the lyrics concise, around 200 words, and ensure they flow well together. Avoid generic phrases and focus on creating a unique piece that resonates with their situation and location. Thank you!
      Use the physical state and environment details to add depth and personalization to the lyrics, not just as literal references.
      

    `;
    //const prompt = `Generate only 1 quote, max 10 words`;

    setLyricPrompt(prompt);
    setGeneratingLyrics(true);
    setGeneratedLyrics('');
    setSong(null);

    // DEBUG MODE: Skip API calls
    if (DEBUG_MODE) {
        console.log("DEBUG MODE: Generating mock lyrics and song...");
        
        // Mock Latency
        setTimeout(async () => {
            // 1. Mock Lyrics
            const mockLyrics = `(Mock Lyrics for ${input.name})\n\nIn the city of ${weatherData?.city || 'Dreams'},\nHeart beating at ${healthData.heartRate || 'steady'} pace,\nWalking through the ${weatherData?.description || 'mist'},\nFinding my own space.\n\nFrom ${input.currentMood} shadows,\nTo ${input.desiredMood} light,\nThis song guides me,\nThrough the day and night.`;
            setGeneratedLyrics(mockLyrics);
            setGeneratingLyrics(false);

            // 2. Mock Song (Immediately after)
            setGeneratingSong(true);
            setTimeout(() => {
                const mockSongData: GeneratedSong = {
                    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3', // Public domain MP3
                    title: `Song for ${input.name}`,
                    duration: 30
                };
                setSong(mockSongData);
                setGeneratingSong(false);
            }, 1500); // 1.5s delay for song generation simulation
        }, 1000); // 1s delay for lyrics simulation
        
        return;
    }

    //Check for PPLX_API_KEY
    if (!PPLX_API_KEY) {
      Alert.alert('API Key Missing', 'Please set the PPLX API key to generate lyrics.');
      return;
    }

    // Call PPLX API to generate lyrics

    let currentLyrics = ''; //local variable to hold lyrics
    try {
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${PPLX_API_KEY}`
            },
            body: JSON.stringify({
                model: "sonar-pro",
                messages: [
                    { role: "user", content: prompt }
                ],
                max_tokens: 500,
                temperature: 0.7,
            })
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error?.message || 'Failed to generate lyrics.');
        }

        const lyrics = data.choices[0]?.message?.content || '';
        currentLyrics = lyrics;
        setGeneratedLyrics(lyrics);
    } catch (error: any) {
        Alert.alert('Error', error.message || 'An error occurred while generating lyrics.');
    } finally {
        setGeneratingLyrics(false);
    }

    // Generate Song Audio
    setGeneratingSong(true);
    console.log("Generating song with lyrics:", currentLyrics);
    try {
        const generatedSong = await generateSong(currentLyrics || 'Uplifting song', input.favoriteGenre, input.desiredMood);
        if (generatedSong) {
            setSong(generatedSong);
        } else {
            Alert.alert('Song Generation Failed', 'Could not generate song audio.');
        }
        setGeneratingSong(false);
    } catch (error: any) {
        Alert.alert('Error', error.message || 'An error occurred while generating song audio.');
        setGeneratingSong(false);
    }
}

    // Play generated song audio
    // async function playSound() {
    //     if (!song?.audioUrl) return;
    //     console.log('Playing song from URL:', song.audioUrl);

    //     try {
    //         if (sound) {
    //             console.log('Resuming Sound');
    //             await sound.playAsync();
    //             setIsPlaying(true);
    //             return;
    //         }

    //         console.log('Loading Sound');
    //         const { sound: newSound } = await Audio.Sound.createAsync(
    //             { uri: song.audioUrl },
    //             { shouldPlay: true }
    //         );
    //         setSound(newSound);
    //         setIsPlaying(true);

    //         newSound.setOnPlaybackStatusUpdate((status) => {
    //             if (status.isLoaded && status.didJustFinish) {
    //                 setIsPlaying(false);
    //                 newSound.setPositionAsync(0);
    //             }
    //         });
    //     }
    //     catch (error) {
    //         console.error('Error playing sound:', error);
    //         Alert.alert('Playback Error', 'An error occurred while trying to play the song.');
    //     }
    // }

    const playSound =  () => {
        if (player.playing) {
            console.log("playing, so ill pause");
            player.pause();
        } else {
            console.log("paused, so ill play");
            player.play();  
        }
    };

    const stopSound =  () => {
        console.log("Im going to stop");
        player.pause();
        player.seekTo(0);
    };

    // React.useEffect(() => {
    //     return sound
    //       ? () => {
    //           console.log('Unloading Sound');
    //           sound.unloadAsync(); }
    //       : undefined;
    //   }, [sound]);
  

  const renderHealthProviderSection = () => {
      const isApple = provider === 'Apple Health';
      // const isReady = !isApple || (isApple && Platform.OS === 'ios'); // Not strictly needed for rendering, button handles disabled state
      
      
      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>4. Connect & Fetch Data</Text>
          <Text style={styles.providerStatus}>
            {isApple && Platform.OS !== 'ios' ? "iOS required" : (isAuthorized ? 'Authorized' : 'Authorization Required')}
          </Text>
          <Button
            title={isApple ? (isAuthorized ? 'Re-Fetch Data' : 'Authorize & Fetch') : `Fetch Mock Data`}
            onPress={handleAuthorizeAndFetch}
            disabled={loading} // Simplified disabled logic
            color="#4CAF50"
          />
        </View>
      );
  }

  return (
    <SafeAreaProvider >
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        {/* Removed the intermediate View causing layout issues */}
        <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent} 
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={true} // Helpful for debugging scrolling
            onContentSizeChange={(w,h) => console.log('Content height:', h)}
        >
          <Text style={styles.header}>Emotion to Lyric Generator</Text>
          
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>1. Profile & Mood</Text>
            {Object.keys(input).map(key => (
              <TextInput 
                key={key}
                style={styles.input} 
                placeholder={key}
                placeholderTextColor="#999" 
                value={input[key as keyof UserInput]} 
                onChangeText={(text) => handleInputChange(key as keyof UserInput, text)} 
              />
            ))}
          </View>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>2. Environment </Text>
            {location ? (
                // <Text style={styles.infoText}>
                // {`Lat: ${location.coords.latitude.toFixed(2)}, Lng: ${location.coords.longitude.toFixed(2)}`}
                // </Text>
                <View>
                        <Text style={styles.infoText}>
                            {weatherData?.city || `Lat: ${location.coords.latitude.toFixed(2)}`}
                        </Text>
                        {weatherData && (
                            <Text style={styles.infoText}>
                                {weatherData.temperature}°C - {weatherData.description}
                            </Text>
                        )}
                        {newsData && (
                            <Text style={[styles.infoText, {fontStyle: 'italic', fontSize: 12, marginTop: 5}]}>
                                News: {newsData.headline}...
                            </Text>
                        )}
                    </View>
            ) : (
                <ActivityIndicator color="#4CAF50" />
            )}
          </View>

          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>3. Select Provider</Text>
            <View style={styles.providerGrid}>
                {(['Apple Health', 'Fitbit', 'Garmin'] as Provider[]).map(p => (
                    <TouchableOpacity key={p} style={[styles.providerButton, provider === p && styles.providerButtonSelected]} onPress={() => setProvider(p)}>
                        <FontAwesome5 name={p === 'Apple Health' ? 'apple' : (p === 'Fitbit' ? 'heartbeat' : 'circle')} size={24} color={provider === p ? '#121212' : '#ccc'}/>
                        <Text style={[styles.providerButtonText, provider !== p && {color: '#ccc'}]}>{p}</Text>
                    </TouchableOpacity>
                ))}
            </View>
          </View>

          {/* Explicitly calling the render function here */}
          {renderHealthProviderSection()}

          {healthData && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>5. Health Data</Text>
              <Text style={styles.dataText}>Heart Rate: {healthData.heartRate || 'N/A'} BPM</Text>
              <Text style={styles.dataText}>Steps: {healthData.steps || 'N/A'}</Text>
            </View>
          )}

          {isFormComplete && healthData && (
            <View style={styles.stepContainer}>
              <Button 
                    title={generatingLyrics || generatingSong ? "Creating Magic..." : "Generate Lyrics & Song"} 
                    onPress={generateLyricsAndSong} 
                    disabled={generatingLyrics || generatingSong}
                    color="#007CC3" 
                />
            </View>
          )}

          {/* Display  lyrics and Audio Player */}
          {generatedLyrics.length > 0 && (
            <View style={styles.lyricsContainer}>
              <Text style={styles.lyricsTitle}>Your Song</Text>
              <Text style={styles.lyricsText}>{generatedLyrics}</Text>

              <Text style={{ marginTop: 15, fontSize: 16, fontWeight: 'bold', color: '#fff', textAlign: 'center' }}>Generated Song Audio</Text>

              {/* {song && (
                <View style={styles.playerContainer}>
                    <Text style = {styles.infoText} >{song.title}</Text>
                    <Button title="Play Song" onPress={playSound} color="#4CAF50" />
                </View>
              )}
              { generatingSong && <ActivityIndicator color="#4CAF50" style={{ marginTop: 10 }} />} */}

              {song && (
                        <View style={styles.playerContainer}>
                            <Text style={[styles.infoText, {fontWeight: 'bold', marginBottom: 10}]}>🎵 {song.title}</Text>
                            <View style={styles.controlsRow}>
                                <Button 
                                    title={player.playing ? "Pause" : "▶️ Play Song"} 
                                    onPress={playSound} 
                                    color="#E91E63" 
                                />
                                <View style={{width: 20}} /> 
                                <Button 
                                    title="⏹ Stop" 
                                    onPress={stopSound} 
                                    color="#FF6B6B" 
                                />
                            </View>
                        </View>
                    )}
            </View>
          ) }

          {/*Debug Prompt Display*/}
          {generatedLyrics && lyricPrompt ? (
            <View style={{ marginTop: 20, opacity: 0.5}}>
              <Text style={{ color: '#ece5e5', fontSize: 12 }}>Debug Prompt:</Text>
              <Text style={{ color: '#ccc', fontSize: 12 }}>{lyricPrompt}</Text>
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#121212' },
  scrollView: { flex: 1 }, // Ensure ScrollView takes available space
  scrollContent: {  padding: 20, paddingBottom: 150 }, // Ensure content grows to fill and adds bottom padding
  header: { fontSize: 24, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginVertical: 20 },
  stepContainer: { backgroundColor: '#1e1e1e', padding: 16, borderRadius: 10, marginVertical: 10, borderWidth: 1, borderColor: '#333' },
  stepTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', marginBottom: 12 },
  input: { backgroundColor: '#333', color: '#fff', padding: 12, borderRadius: 8, marginBottom: 10, fontSize: 16, borderWidth: 1, borderColor: '#444' },
  infoText: { fontSize: 14, color: '#ccc', textAlign: 'center' },
  providerStatus: { fontSize: 14, color: '#4CAF50', textAlign: 'center', marginBottom: 10 },
  lyricsContainer: { backgroundColor: '#2a2a2a', padding: 16, borderRadius: 10, marginTop: 16 },
  lyricsTitle: { fontSize: 16, fontWeight: 'bold', color: '#fff', marginBottom: 8 },
  lyricsText: { fontSize: 14, color: '#ccc' },
  dataText: { color: '#fff', fontSize: 16, marginVertical: 4 },
  providerGrid: { flexDirection: 'row', justifyContent: 'space-around', gap: 8 },
  providerButton: { alignItems: 'center', padding: 10, borderRadius: 8, borderWidth: 2, borderColor: '#333', backgroundColor: '#121212', flex: 1, height: 80, justifyContent: 'center' },
  providerButtonSelected: { borderColor: '#4CAF50', backgroundColor: '#4CAF50' },
  providerButtonText: { fontSize: 12, color: '#fff', marginTop: 4, fontWeight: '600' },
  playerContainer: { 
    marginTop: 20,
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#333',
    borderRadius: 10,
 },
 controlsRow: { 
    flexDirection: 'row', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: 10 
  },
});