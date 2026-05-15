import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
import { Alert } from "react-native";
import {
  CURRENT_LYRICS_PROVIDER,
  CURRENT_SONG_PROVIDER,
  LYRICS_PROVIDERS,
  LyricsProviderType,
  LyricsResult,
  PRE_GENERATED_PLAYLIST,
  SUNO_ORG_PAYLOAD,
} from "@/constants/appConstants";
import {
  getPgpIdsOfEmotion,
  getVocalGender,
  savePgpIds,
} from "./LocalUserService";

// --- API KEYS & CONSTANTS ---
const OPEN_AI_API_KEY = process.env.EXPO_PUBLIC_OPEN_AI_API_KEY;
const GROK_API_KEY = process.env.EXPO_PUBLIC_GROK_API_KEY;
const CLAUDE_API_KEY = process.env.EXPO_PUBLIC_CLAUDE_API_KEY;
const PPLX_API_KEY = process.env.EXPO_PUBLIC_PPLX_API_KEY;
const SUNO_API_KEY = process.env.EXPO_PUBLIC_SUNO_API_KEY;
const SUNO_ORG_API_KEY = process.env.EXPO_PUBLIC_SUNO_ORG_API_KEY;
const REPLICATE_API_KEY = process.env.EXPO_PUBLIC_REPLICATE_API_KEY;

const SUNO_URL_CREATE = "https://api.musicapi.ai/api/v1/sonic/create";
const SUNO_URL_TASK = "https://api.musicapi.ai/api/v1/sonic/task";

const REPLICATE_API_URL = "https://api.replicate.com/v1/predictions";
// Meta's MusicGen Large Model
const REPLICATE_MODEL_VERSION =
  "7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906";

export type GeneratedSong = {
  id?: string;
  audioUrl: string;
  title?: string;
  duration?: number;
  provider: string;
  songProviderPayload?: object;
  lyrics?: string;
  mood?: string;
};

type FinalReadyListener = (taskId: string, url: string) => void;
let finalReadyListener: FinalReadyListener | null = null;

export function onFinalReady(listener: FinalReadyListener) {
  finalReadyListener = listener;
}
function notifyFinalReady(taskId: string, url: string) {
  if (finalReadyListener) {
    // console.log("calling final-Ready-Listener for: ", taskId);
    finalReadyListener(taskId, url);
  }
}

export async function generatelyrics(
  prompt: string,
): Promise<LyricsResult | null> {
  const providers: LyricsProviderType[] = [
    CURRENT_LYRICS_PROVIDER,
    ...LYRICS_PROVIDERS.filter((p) => p !== CURRENT_LYRICS_PROVIDER),
  ];

  for (const provider of providers) {
    console.log(
      `LYRICS SERVICE: Starting Lyrics Generation using [${provider}]`,
    );

    const result = await generateWithProvider(provider, prompt);

    if (result) {
      if (provider !== CURRENT_LYRICS_PROVIDER) {
        console.log(`LYRICS SERVICE: Fell back to [${provider}] successfully`);
      }
      return result;
    }

    console.warn(
      `LYRICS SERVICE: Provider [${provider}] failed, trying next...`,
    );
  }

  console.error("LYRICS SERVICE: All providers failed.");
  return null;
}

async function generateWithProvider(
  provider: LyricsProviderType,
  prompt: string,
): Promise<LyricsResult | null> {
  switch (provider) {
    case "CLAUDE":
      return await generateWithClaude(prompt);
    case "GROK":
      return await generateWithGrok(prompt);
    case "OPEN_AI":
      return await generateWithOpenAi(prompt);
    case "PERPLEXITY":
    default:
      return await generateWithPerplexity(prompt);
  }
}

function extractLyrics(text: string): LyricsResult | null {
  try {
    const cleaned = (text || "").replace(/```json\n/, "").replace(/\n```$/, "");
    const parsed = JSON.parse(cleaned);

    // const lyrics = Object.values(parsed.lyrics).join("\n\n");
    const { verse1, chorus, verse2, outro } = parsed.lyrics;
    const lyrics = [
      `[Verse]\n${verse1}`,
      `[Chorus]\n${chorus}`,
      `[Verse]\n${verse2}`,
      `[Outro]\n${outro}`,
    ].join("\n\n");
    const musicStyle = parsed?.musicStyle || "";

    return { lyrics, musicStyle };
  } catch (error: any) {
    console.error(
      `Failed to extract lyrics from response by [${CURRENT_LYRICS_PROVIDER}]: `,
      error?.message,
    );
    return null;
  }
}

async function generateWithPerplexity(
  prompt: string,
): Promise<LyricsResult | null> {
  if (!PPLX_API_KEY) {
    Alert.alert(
      "API Key Missing",
      "Please set the PPLX API key to generate lyrics.",
    );
    return null;
  }

  try {
    const response = await fetch("https://api.perplexity.ai/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PPLX_API_KEY}`,
      },
      body: JSON.stringify({
        model: "sonar-pro",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error?.message || "PERPLEXITY failed to generate lyrics.",
      );
    }

    return extractLyrics(data.choices[0]?.message?.content || "");
  } catch (error: any) {
    console.error(
      "An error occurred while generating song lyrics with PERPLEXITY:",
      error.message,
    );
    return null;
  }
}

async function generateWithClaude(
  prompt: string,
): Promise<LyricsResult | null> {
  if (!CLAUDE_API_KEY) {
    Alert.alert(
      "API Key Missing",
      "Please set the CLAUDE API key to generate lyrics.",
    );
    return null;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": `${CLAUDE_API_KEY}`,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        messages: [{ role: "user", content: prompt }],
        // max_tokens: 1024,
        max_tokens: 512,
        model: "claude-opus-4-6",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error?.message || "CLAUDE failed to generate lyrics.",
      );
    }

    return extractLyrics(data?.content[0]?.text || "");
  } catch (error: any) {
    console.error(
      "An error occurred while generating song lyrics with CLUADE:",
      error?.message,
    );
    return null;
  }
}

async function generateWithOpenAi(
  prompt: string,
): Promise<LyricsResult | null> {
  if (!OPEN_AI_API_KEY) {
    Alert.alert(
      "API Key Missing",
      "Please set the OPEN_AI API key to generate lyrics.",
    );
    return null;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPEN_AI_API_KEY}`,
      },
      body: JSON.stringify({
        input: [{ role: "user", content: prompt }],
        model: "gpt-5.2",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error?.message || "OPEN_AI failed to generate lyrics.",
      );
    }

    return extractLyrics(data?.output[0]?.content[0]?.text || "");
  } catch (error: any) {
    console.error(
      "An error occurred while generating song lyrics with OPEN_AI:",
      error?.message,
    );
    return null;
  }
}

async function generateWithGrok(prompt: string): Promise<LyricsResult | null> {
  if (!GROK_API_KEY) {
    Alert.alert(
      "API Key Missing",
      "Please set the GROK API key to generate lyrics.",
    );
    return null;
  }

  try {
    const response = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
      },
      body: JSON.stringify({
        input: [{ role: "user", content: prompt }],
        model: "grok-4-0709",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error?.message || "GROK failed to generate lyrics.");
    }

    return extractLyrics(data?.output[0]?.content[0]?.text || "");
  } catch (error: any) {
    console.error(
      "An error occurred while generating lyrics with GROK:",
      error?.message,
    );
    return null;
  }
}

// --- MAIN SERVICE ENTRY POINT ---
export async function generateSong(
  lyrics: string,
  style: string,
  mood: string,
  index?: number,
  genres?: string,
  artists?: string,
  tempoRange?: number[],
): Promise<GeneratedSong | null> {
  console.log(` SERVICE: Starting Generation using [${CURRENT_SONG_PROVIDER}]`);
  console.log(` Lyrics snippet: "${lyrics.substring(0, 30)}..."`);

  switch (CURRENT_SONG_PROVIDER) {
    case "SUNO_ORG":
      return await generateWithSunoOrg(
        lyrics,
        style,
        mood,
        genres,
        artists,
        tempoRange,
      );
    case "SUNO":
      return await generateWithSuno(lyrics, style, mood);
    case "REPLICATE":
      return await generateWithReplicate(lyrics, style, mood);
    case "MOCK":
    default:
      return await generateWithMock(lyrics, style, mood, index);
  }
}
// =================================================================
// 1_1. SUNO_ORG PROVIDER (MusicAPI.ai)
// =================================================================

async function buildSunoOrgPayload(
  lyrics: string,
  genres: string,
  artists: string,
  musicStyle: string,
  tempoRange?: number[],
  currentMood?: string,
) {
  const artistsArr = artists
    .split(",")
    .map((a) => a.trim())
    .filter(Boolean);

  const styleHeader = [
    !!currentMood
      ? `Current emotional stage: ${currentMood}. This song should feel like part of a gradual emotional journey.`
      : "",
    musicStyle?.length ? `${musicStyle}` : "",
    genres?.length ? `Style: ${genres}.` : "",
    artists?.length
      ? `Artists: ${artistsArr.map((a) => `${a}-style`).join(", ")}.`
      : "",
    Array.isArray(tempoRange) && tempoRange?.length
      ? `Tempo: ${tempoRange[0]}-${tempoRange[1]} BPM.`
      : "",
  ]
    .filter(Boolean)
    .join("\n");

  const prompt = styleHeader?.length
    ? `[${styleHeader}]\n\n[LYRICS]\n${lyrics}`
    : lyrics;
  const vocalGender = await getVocalGender();

  const payload = {
    ...SUNO_ORG_PAYLOAD,
    vocalGender,
    callBackUrl: "https://api.example.com/callback",
    title: "Your Personal Playlist",
    prompt,
  };

  return payload;
}

async function generateWithSunoOrg(
  lyrics: string,
  musicStyle: string,
  mood: string,
  genres?: string,
  artists?: string,
  tempoRange?: number[],
): Promise<GeneratedSong | null> {
  if (!SUNO_ORG_API_KEY) {
    Alert.alert("Config Error", "Missing EXPO_PUBLIC_SUNO_ORG_API_KEY");
    return null;
  }

  try {
    console.log("SUNO_ORG: Sending request");
    // SunoAPI.org uses 'custom' mode for specific lyrics
    let payload = {
      ...SUNO_ORG_PAYLOAD,
      callBackUrl: "https://api.example.com/callback",
      prompt: lyrics,
      title: "Your Personal Playlist",
    };

    if (genres && artists) {
      payload = await buildSunoOrgPayload(
        lyrics,
        genres,
        artists,
        musicStyle,
        tempoRange,
        mood,
      );
    }

    const response = await fetch("https://api.sunoapi.org/api/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${SUNO_ORG_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`SunoOrg Failed: ${err}`);
    }
    const data = await response.json();
    // Returns { code: 200, data: { taskId: "..." } } usually
    // OR sometimes it returns the list directly if immediate.

    const req = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUNO_ORG_API_KEY}`,
        Prefer: "wait",
      },
      body: JSON.stringify(payload),
    };

    console.log("SUNO_ORG request: ", req);
    console.log("SUNO_ORG resp: ", response);

    const taskId = data.data?.taskId || data.id;
    console.log(` SUNO_ORG: Task ID: ${taskId}`);
    if (!taskId) {
      console.error("Task ID not retrieved: ", data?.msg || data?.data?.msg);
      return null;
    }

    // return await pollSunoOrg(taskId, mood);
    return await pollSunoOrgStreamUrl(taskId, mood, payload);
  } catch (error: any) {
    console.error(" SUNO_ORG Error:", error);
    Alert.alert("Generation Failed", error.message);
    return null;
  }
}

function extractSunoOrgData(info: any) {
  let songList: any[] = [];

  if (Array.isArray(info)) {
    // Case A: Info is the list itself
    songList = info;
  } else if (info?.response && Array.isArray(info.response.sunoData)) {
    // Case B: Your Log (Nested inside response.sunoData)
    songList = info.response.sunoData;
  } else {
    // Case C: Fallback single object
    songList = [info];
  }

  return songList;
}
async function pollSunoOrgStreamUrl(
  taskId: string,
  mood: string,
  payload: object,
): Promise<GeneratedSong | null> {
  if (!taskId) {
    throw new Error("Undefined Suno Task ID for polling!");
  }

  const maxAttempts = 150;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 3000));
    attempts++;

    const response = await fetch(
      `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`,
      {
        headers: { Authorization: `Bearer ${SUNO_ORG_API_KEY}` },
      },
    );

    const data = await response.json();
    const info = data.data;
    const status = info?.status || info?.[0]?.status;

    console.log(`Polling (${attempts}) Status: ${status}`);
    const sunoData = extractSunoOrgData(info);

    // Stream url is ready
    if (status === "TEXT_SUCCESS") {
      const streamable = sunoData?.find((item: any) => item.streamAudioUrl);

      if (streamable?.streamAudioUrl) {
        console.log(
          "returning SUNO_ORG stream url: ",
          streamable.streamAudioUrl,
        );
        const generatedSong: GeneratedSong = {
          id: taskId,
          audioUrl: streamable.streamAudioUrl,
          title: streamable.title || `Generated ${mood} Track`,
          duration: 30,
          provider: "SUNO_ORG",
          songProviderPayload: payload,
        };

        // Continue polling in background
        continueSunoOrgPolling(taskId, mood);
        return generatedSong;
      }
    } else if (
      status === "SUCCESS" ||
      status === "FIRST_SUCCESS" ||
      status === "completed"
    ) {
      const validSong = sunoData?.find(
        (item: any) => item?.audioUrl || item?.audio_url,
      );

      if (validSong) {
        const finalUrl = validSong.audioUrl || validSong.audio_url;
        console.log(
          "Suno Org Final MP3 Ready even before TEXT_SUCCESS:",
          finalUrl,
        );

        const generatedSong: GeneratedSong = {
          id: taskId,
          audioUrl: finalUrl,
          title: validSong?.title || `Generated ${mood} Track`,
          duration: 30,
          provider: "SUNO_ORG",
          songProviderPayload: payload,
        };

        return generatedSong;
      }
    }

    if (status === "FAILED" || status === "GENERATE_AUDIO_FAILED") {
      throw new Error("SunoOrg task failed.");
    }
  }

  throw new Error("SunoOrg stream timeout.");
}
async function continueSunoOrgPolling(taskId: string, mood: string) {
  if (!taskId) {
    console.error("Undefined Suno Task ID for Background polling!");
  }
  console.log("Background Suno Org polling for final MP3...");

  const maxAttempts = 150;
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((r) => setTimeout(r, 3000));
    attempts++;

    const response = await fetch(
      `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`,
      {
        headers: { Authorization: `Bearer ${SUNO_ORG_API_KEY}` },
      },
    );

    const data = await response.json();
    const info = data.data;
    const status = info?.status || info?.[0]?.status;

    console.log(`(BG) Polling (${attempts}) Status: ${status}`);
    if (
      status === "SUCCESS" ||
      status === "FIRST_SUCCESS" ||
      status === "completed"
    ) {
      const sunoData = extractSunoOrgData(info);

      const validSong = sunoData?.find(
        (item: any) => item?.audioUrl || item?.audio_url,
      );

      if (validSong) {
        const finalUrl = validSong.audioUrl || validSong.audio_url;
        console.log("Final Suno Org MP3 Ready:", finalUrl);

        // Emit event to app layer
        notifyFinalReady(taskId, finalUrl);
        return;
      }
    }

    if (status === "FAILED") {
      console.error("SunoOrg (BG) Polling task failed.");
    }
  }

  console.log("Background polling timeout.");
}

// =================================================================
// 1. SUNO PROVIDER (MusicAPI.ai)
// =================================================================
async function generateWithSuno(
  lyrics: string,
  style: string,
  mood: string,
): Promise<GeneratedSong | null> {
  if (!SUNO_API_KEY) {
    Alert.alert("Config Error", "Missing SUNO_API_KEY. Check your .env file.");
    return null;
  }

  try {
    // Step 1: Create Task
    console.log(" SUNO: Sending generation request...");
    const payload = {
      custom_mode: true,
      mv: "sonic-v4-5", // Using the latest model from your curl
      title: `Song about ${mood}`,
      tags: `${style}, ${mood}`,
      prompt: `[Verse]\n${lyrics}\n\n[Chorus]\n(Meaningful song with vocals and music)`,
      // Note: Structuring prompt helps Suno understand verses/chorus
    };

    const response = await fetch(SUNO_URL_CREATE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUNO_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const req = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUNO_API_KEY}`,
        Prefer: "wait",
      },
      body: JSON.stringify(payload),
    };

    console.log("SUNO request: ", req);
    console.log("SUNO resp: ", response);

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Suno Creation Failed: ${response.status} - ${errText}`);
    }

    const startData = await response.json();
    const taskId = startData.task_id;
    console.log(` SUNO: Task Started. ID: ${taskId}`);

    // Step 2: Poll for Completion
    return await pollSunoTask(taskId, mood);
  } catch (error: any) {
    console.error(" SUNO Error:", error);
    Alert.alert("Generation Failed", error.message);
    return null;
  }
}

async function pollSunoTask(
  taskId: string,
  mood: string,
): Promise<GeneratedSong | null> {
  const maxAttempts = 60; // 2 minutes (60 * 2s)
  let attempts = 0;

  while (attempts < maxAttempts) {
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2s
    attempts++;

    const response = await fetch(`${SUNO_URL_TASK}/${taskId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${SUNO_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    // Suno returns an array of clips (usually 2 variations). We check the first one.
    // The curl response showed: data.data[0].state
    if (data.data && data.data.length > 0) {
      const clip = data.data[0]; // Take the first variation
      const status = clip.state;

      console.log(`Checking Status (${attempts}/${maxAttempts}): ${status}`);

      if (status === "succeeded") {
        console.log(" SUNO: Generation Succeeded!");
        const audioUrl = clip.audio_url;

        // Step 3: Download & Save
        return await downloadAndSaveAudio(
          audioUrl,
          `suno_${clip.id}.mp3`,
          mood,
          "SUNO",
        );
      }

      if (status === "failed") {
        throw new Error("Suno task reported failure.");
      }
    }
  }

  throw new Error("Suno generation timed out.");
}

// =================================================================
// 2. REPLICATE PROVIDER (Meta MusicGen)
// =================================================================
async function generateWithReplicate(
  lyrics: string,
  style: string,
  mood: string,
): Promise<GeneratedSong | null> {
  if (!REPLICATE_API_KEY) {
    Alert.alert("Config Error", "Missing REPLICATE_API_KEY.");
    return null;
  }

  try {
    console.log(" REPLICATE: Sending request...");
    const payload = {
      version: REPLICATE_MODEL_VERSION,
      input: {
        prompt: `${style} song about ${mood}. Lyrics: ${lyrics}`,
        tags: [style, mood],
        //mv: 'mureka-7.5',
        model_version: "large", //meta-musicgen
        duration: 20,
      },
    };

    const req = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${REPLICATE_API_KEY}`,
        Prefer: "wait",
      },
      body: JSON.stringify(payload),
    };

    console.log("REPLICATE request: ", req);

    const response = await fetch(REPLICATE_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REPLICATE_API_KEY}`,
        "Content-Type": "application/json",
        Prefer: "wait",
      },
      body: JSON.stringify(payload),
    });

    console.log("REPLICATE resp: ", response);

    const startData = await response.json();

    if (response.status !== 201 && response.status !== 200) {
      throw new Error(`Replicate Error: ${startData.detail || "Unknown"}`);
    }

    let prediction = startData;
    const pollUrl = prediction.urls.get;
    let status = prediction.status;

    while (
      status !== "succeeded" &&
      status !== "failed" &&
      status !== "canceled"
    ) {
      console.log(`Checking Status: ${status}...`);
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const pollResponse = await fetch(pollUrl, {
        headers: { Authorization: `Bearer ${REPLICATE_API_KEY}` },
      });
      prediction = await pollResponse.json();
      status = prediction.status;
    }

    if (status === "succeeded") {
      return await downloadAndSaveAudio(
        prediction.output,
        `replicate_${prediction.id}.wav`,
        mood,
        "REPLICATE",
      );
    } else {
      throw new Error(`Replicate failed: ${status}`);
    }
  } catch (error: any) {
    console.error(" REPLICATE Error:", error);
    Alert.alert("AI Error", error.message);
    return null;
  }
}

// =================================================================
// 3. MOCK PROVIDER (Fallback)
// =================================================================
async function generateWithMock(
  lyrics: string,
  style: string,
  mood: string,
  index?: number,
): Promise<GeneratedSong | null> {
  // await new Promise((resolve) => setTimeout(resolve, 2000)); // Fake delay

  const nextSongIdx = ((index || 0) + 1) % 15;
  console.log("MOCK: Simulating generation...", nextSongIdx);
  const TEST_SONG_URL = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${nextSongIdx}.mp3`;
  const id = `Mock-Song-${nextSongIdx}`;
  const generatedSong: GeneratedSong = {
    id,
    audioUrl: TEST_SONG_URL,
    title: id,
    duration: 30,
    provider: "MOCK",
  };

  setTimeout(() => {
    notifyFinalReady(id, TEST_SONG_URL);
  }, 2000);

  return generatedSong;
}

export async function fetchSavedPlaylistTrack(
  emotion: "calm" | "joyful",
): Promise<GeneratedSong> {
  await new Promise((r) => setTimeout(r, 12 * 1000));

  const playedIds = await getPgpIdsOfEmotion(emotion);
  const commonIds = ["1", "2", "3", "4"];
  const totalIds = emotion === "calm" ? [...commonIds] : [...commonIds, "5"];
  const nonPlayedIds = totalIds.filter((id) => !playedIds.includes(id));

  const randomId =
    nonPlayedIds[Math.floor(Math.random() * nonPlayedIds.length)];
  await savePgpIds(emotion, randomId);

  const tracks = PRE_GENERATED_PLAYLIST[emotion] || [];
  const index = Number(randomId) - 1 || 0;
  const song = tracks[index];

  setTimeout(() => {
    notifyFinalReady(song.id!, song.audioUrl);
  }, 12000);

  return song;
}

// =================================================================
// SHARED HELPER: Download & Save
// =================================================================
export async function downloadAndSaveAudio(
  remoteUrl: string,
  fileName: string,
  mood: string,
  providerName: string,
): Promise<GeneratedSong> {
  console.log(` Downloading audio from: ${remoteUrl}`);

  if (!remoteUrl) throw new Error("No audio URL provided to download.");

  const fileDir = documentDirectory || "";
  const fileUri = fileDir + fileName;

  const downloadRes = await downloadAsync(remoteUrl, fileUri);
  console.log(` Saved to: ${downloadRes.uri}`);
  // file:///data/user/0/com.geeta.emotionapp/files/suno_1.mp3

  return {
    audioUrl: downloadRes.uri,
    title: `Generated ${mood} Track`,
    duration: 30, // Approximate duration
    provider: providerName,
  };
}
