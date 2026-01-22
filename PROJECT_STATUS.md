Emotion App - Project Status Report
Date: January 21, 2026
Framework: React Native / Expo (Managed Workflow)
Target Platform: iOS (primary), Android (compatible)

1. Working Modules

Location
Weather
News
Apple Health (Steps and Heart Rate)
Fitbit/Garmin (Mock)
Scrolling 


2. Configuration Requirements

To run this app on a fresh machine, you need these API Keys in App.tsx or WeatherNewsService.ts:
OPENWEATHER_API_KEY: For weather data.
NEWS_API_KEY: For local news context.
EXPO_PUBLIC_PPLX_API_KEY: For Perplexity LLM generation.

3. Installation & Run Guide

Prerequisities
Node.js & npm installed.
Mac with Xcode installed (for iOS Simulator).
Watchman (optional but recommended: brew install watchman).
Clean Re-Install Steps
If the folder gets corrupted or you move to a new laptop:
Initialize Project:
npx create-expo-app emotionApp
cd emotionApp


Install Dependencies:
npx expo install react-native-health expo-location expo-dev-client react-native-safe-area-context expo-build-properties expo-constants @expo/vector-icons


Restore Code:

Replace App.js with your backed-up App.tsx.

Create services/ folder and restore HealthService.ts and WeatherNewsService.ts.

Update package.json main entry: "main": "node_modules/expo/AppEntry.js".

Configure Native Permissions (app.json):

Ensure infoPlist has NSHealthShareUsageDescription and NSLocationWhenInUseUsageDescription.
Ensure entitlements has "com.apple.developer.healthkit": true.

How to Run
Generate Native Build (Once):
npx expo prebuild --platform ios --clean


Launch:
npx expo run:ios --device "iPhone 16e"


