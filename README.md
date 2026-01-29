# Emotion-Based Playlist App - Current State Backup

Date: January 22, 2026
Platform: React Native (Expo)
Target: iOS (Simulator/Device)

1. App Status & Features

The app is a functional single-screen application that:

Captures User Context: Name, age, current mood, desired mood, music taste.

Tracks Location: Automatically fetches GPS coordinates (Latitude/Longitude).

Monitors Environment: Fetches real-time Weather (OpenWeatherMap) and News Headlines (NewsAPI) based on location.

Health Integration: Connects to Apple Health (Read-Only) to fetch Heart Rate and Steps. (Fitbit/Garmin are mocked).

UI/UX: Dark-themed, fully scrollable interface with keyboard avoidance and safe area handling.


## How to Run

1. Install dependencies

   ```bash
   npm install
   ```

2. Generate native code (pre build) - for healthkit permissions

   ```bash
   npx expo prebuild --platform ios --clean
   ```

3. Run on simulator

   ```bash
   npx expo run:ios --device "iPhone 16e"
   ```


## Starting fresh (re installation guide)



1. Initialize: npx create-expo-app emotionApp

2. Install Libraries: npx expo install react-native-health expo-location expo-dev-client react-native-safe-area-context expo-build-properties expo-constants expo-audio expo-file-system

3. Configure app.json: Add NSHealthShareUsageDescription, NSLocationWhenInUseUsageDescription, and entitlements.

4. Restore Files: Copy App.tsx and services/ folder to the root.

5. Set API Keys: Add API keys to .env or App.tsx.
## API KEYS

- EXPO_PUBLIC_PPLX_API_KEY (Perplexity AI)

- OPENWEATHER_API_KEY (OpenWeatherMap)

- NEWS_API_KEY (NewsAPI)
