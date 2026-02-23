// config/env.ts
import Constants from "expo-constants";

const extra = Constants.expoConfig?.extra ?? {};

export const ENV = {
  PPLX_API_KEY: extra?.PPLX_API_KEY,
  CLAUDE_API_KEY: extra?.CLAUDE_API_KEY,
  OPENWEATHER_API_KEY: extra?.OPENWEATHER_API_KEY,
  NEWS_API_KEY: extra?.NEWS_API_KEY,
  DATA_GOV_SG_API_KEY: extra?.DATA_GOV_SG_API_KEY,
  REPLICATE_API_KEY: extra?.REPLICATE_API_KEY,
  HF_API_KEY: extra?.HF_API_KEY,
  MUREKA_API_KEY: extra?.MUREKA_API_KEY,
  SUNO_ORG_API_KEY: extra?.SUNO_ORG_API_KEY,
  SUNO_API_KEY: extra?.SUNO_API_KEY,
  UDIO_API_KEY: extra?.UDIO_API_KEY,
  REPLILCATE_MODEL_VERSION: extra?.REPLILCATE_MODEL_VERSION,
};
