export default {
  expo: {
    name: "emotionApp",
    slug: "emotionApp",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    userInterfaceStyle: "light",
    splash: {
      image: "./assets/images/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.sutd.geeta.emotionapp",
      infoPlist: {
        NSHealthShareUsageDescription:
          "This app requires access to your health data to analyze your heart rate and steps.",
        NSHealthUpdateUsageDescription: "This app writes data to HealthKit.",
        NSLocationWhenInUseUsageDescription:
          "This app uses your location to personalize song lyrics based on where you are.",
      },
      entitlements: {
        "com.apple.developer.healthkit": true,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
      },
      permissions: [
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
        "android.permission.RECORD_AUDIO",
        "android.permission.MODIFY_AUDIO_SETTINGS",
      ],
      package: "com.geeta.emotionapp",
    },
    web: {
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-build-properties",
        {
          ios: {
            deploymentTarget: "17.0",
          },
        },
      ],
      "expo-audio",
    ],
    extra: {
      PPLX_API_KEY: process.env.EXPO_PUBLIC_PPLX_API_KEY,
      CLAUDE_API_KEY: process.env.EXPO_PUBLIC_CLAUDE_API_KEY,
      OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY,
      NEWS_API_KEY: process.env.EXPO_PUBLIC_NEWS_API_KEY,
      DATA_GOV_SG_API_KEY: process.env.EXPO_PUBLIC_DATA_GOV_SG_API_KEY,
      REPLICATE_API_KEY: process.env.EXPO_PUBLIC_REPLICATE_API_KEY,
      HF_API_KEY: process.env.EXPO_PUBLIC_HF_API_KEY,
      MUREKA_API_KEY: process.env.EXPO_PUBLIC_MUREKA_API_KEY,
      SUNO_ORG_API_KEY: process.env.EXPO_PUBLIC_SUNO_ORG_API_KEY,
      SUNO_API_KEY: process.env.EXPO_PUBLIC_SUNO_API_KEY,
      UDIO_API_KEY: process.env.EXPO_PUBLIC_UDIO_API_KEY,
      REPLILCATE_MODEL_VERSION:
        process.env.EXPO_PUBLIC_REPLILCATE_MODEL_VERSION,
    },
  },
};
