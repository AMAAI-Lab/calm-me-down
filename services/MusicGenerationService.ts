import { documentDirectory, downloadAsync } from "expo-file-system/legacy";
import { Alert } from "react-native";

// --- CONFIGURATION ---
const CURRENT_LYRICS_PROVIDER: "PERPLEXITY" | "CLAUDE" = "CLAUDE";

// Change this to 'SUNO', 'REPLICATE', or 'MOCK' to switch engines
const CURRENT_SONG_PROVIDER: "SUNO_ORG" | "SUNO" | "REPLICATE" | "MOCK" =
  "MOCK";

// --- API KEYS & CONSTANTS ---
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

export async function generatelyrics(prompt: string): Promise<string | null> {
  console.log(
    `LYRICS SERVICE: Starting Lyrics Generation using [${CURRENT_LYRICS_PROVIDER}]`,
  );

  switch (CURRENT_LYRICS_PROVIDER) {
    case "CLAUDE":
      return await generateWithClaude(prompt);
    case "PERPLEXITY":
    default:
      return await generateWithPerplexity(prompt);
  }
}

async function generateWithPerplexity(prompt: string): Promise<string | null> {
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

    const lyrics = data.choices[0]?.message?.content || "";
    return lyrics;
  } catch (error: any) {
    console.error(
      "An error occurred while generating song lyrics with PERPLEXITY:",
      error.message,
    );
    return null;
  }
}

async function generateWithClaude(prompt: string): Promise<string | null> {
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
        max_tokens: 1024,
        model: "claude-opus-4-6",
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(
        data.error?.message || "CLAUDE failed to generate lyrics.",
      );
    }

    const cleaned = (data?.content[0]?.text || "")
      .replace(/```json\n/, "")
      .replace(/\n```$/, "");

    const parsed = JSON.parse(cleaned);
    // console.log("parsed:", parsed);
    const lyrics = Object.values(parsed.lyrics).join("\n\n");
    // console.log("lyrics:", lyrics);
    return lyrics;
  } catch (error: any) {
    console.error(
      "An error occurred while generating song lyrics with CLUADE:",
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
): Promise<GeneratedSong | null> {
  console.log(` SERVICE: Starting Generation using [${CURRENT_SONG_PROVIDER}]`);
  console.log(` Lyrics snippet: "${lyrics.substring(0, 30)}..."`);

  switch (CURRENT_SONG_PROVIDER) {
    case "SUNO_ORG":
      return await generateWithSunoOrg(lyrics, style, mood);
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
async function generateWithSunoOrg(
  lyrics: string,
  style: string,
  mood: string,
): Promise<GeneratedSong | null> {
  if (!SUNO_ORG_API_KEY) {
    Alert.alert("Config Error", "Missing EXPO_PUBLIC_SUNO_ORG_API_KEY");
    return null;
  }

  try {
    console.log("SUNO_ORG: Sending request");
    // SunoAPI.org uses 'custom' mode for specific lyrics
    const payload = {
      customMode: true,
      instrumental: false,
      model: "V4_5ALL",
      callBackUrl: "https://api.example.com/callback",
      // prompt: "A calm and relaxing piano track with soft melodies",
      prompt: lyrics,
      style: "Classical",
      title: "Peaceful Piano Meditation",
      personaId: "persona_123",
      negativeTags: "Heavy Metal, Upbeat Drums",
      vocalGender: "m",
      styleWeight: 0.65,
      weirdnessConstraint: 0.65,
      audioWeight: 0.65,
    };
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

    // return await pollSunoOrg(taskId, mood);
    return await pollSunoOrgStreamUrl(taskId, mood);
  } catch (error: any) {
    console.error(" SUNO_ORG Error:", error);
    Alert.alert("Generation Failed", error.message);
    return null;
  }
}

// async function pollSunoOrg(
//   taskId: string,
//   mood: string,
// ): Promise<GeneratedSong | null> {
//   const maxAttempts = 150;
//   let attempts = 0;

//   console.log(`Polling Task ${taskId} (Max 5 mins)...`);

//   while (attempts < maxAttempts) {
//     await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait 3s
//     attempts++;

//     // SunoAPI.org polling endpoint
//     const response = await fetch(
//       `https://api.sunoapi.org/api/v1/generate/record-info?taskId=${taskId}`,
//       {
//         headers: { Authorization: `Bearer ${SUNO_ORG_API_KEY}` },
//       },
//     );

//     const data = await response.json();
//     const info = data.data; // Usually data.data[0] or just data.data

//     // Check structure (API response format varies slightly by account tier)
//     const status = info?.status || info?.[0]?.status;

//     console.log(`Checking Status (${attempts}): ${status}`);

//     if (
//       status === "SUCCESS" ||
//       status === "completed" ||
//       status === "FIRST_SUCCESS"
//     ) {
//       // Success!
//       let songList: any[] = [];

//       if (Array.isArray(info)) {
//         // Case A: Info is the list itself
//         songList = info;
//       } else if (info.response && Array.isArray(info.response.sunoData)) {
//         // Case B: Your Log (Nested inside response.sunoData)
//         songList = info.response.sunoData;
//       } else {
//         // Case C: Fallback single object
//         songList = [info];
//       }

//       // 3. Find the first song that actually has a URL
//       // (In FIRST_SUCCESS, the second song usually has an empty "" url)
//       const validSong = songList.find(
//         (item: any) =>
//           (item.audioUrl && item.audioUrl.length > 0) ||
//           (item.audio_url && item.audio_url.length > 0),
//       );

//       if (validSong) {
//         const finalUrl = validSong.audioUrl || validSong.audio_url;
//         console.log("SUNO_ORG: Generation Complete! URL:", finalUrl);
//         return await downloadAndSaveAudio(
//           finalUrl,
//           `suno_org_${taskId}.mp3`,
//           mood,
//           "SUNO_ORG",
//         );
//       } else {
//         console.log(`Status is ${status} but valid audio URL not found yet.`);
//       }
//     } else if (status === "TEXT_SUCCESS") {
//       // Do NOTHING. Just log it and keep looping.
//       console.log(" Lyrics written... waiting for audio...");
//     } else if (status === "FAILED") throw new Error("SunoOrg task failed.");
//   }

//   throw new Error("SunoOrg timeout.");
// }

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
): Promise<GeneratedSong | null> {
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

    // Stream url is ready
    if (status === "TEXT_SUCCESS") {
      //       sunoData: [
      //   {
      //     "id": "8900987c-3b68-4ea8-8104-2ed567cd20a0",
      //     "audioUrl": "",
      //     "sourceAudioUrl": null,
      //     "streamAudioUrl": "https://musicfile.removeai.ai/ODkwMDk4N2MtM2I2OC00ZWE4LTgxMDQtMmVkNTY3Y2QyMGEw",
      //     "sourceStreamAudioUrl": "https://audiopipe.suno.ai/?item_id=8900987c-3b68-4ea8-8104-2ed567cd20a0",
      //     "imageUrl": "https://tempfile.aiquickdraw.com/r/396b202e49584bd4a6ab336e45e13f3b.jpeg",
      //     "sourceImageUrl": "https://cdn2.suno.ai/image_8900987c-3b68-4ea8-8104-2ed567cd20a0.jpeg",
      //     "prompt": "A calm and relaxing piano track with soft melodies",
      //     "modelName": "chirp-auk-turbo",
      //     "title": "Peaceful Piano Meditation",
      //     "tags": "Classical",
      //     "createTime": 1770707826604,
      //     "duration": null
      //   },
      // ]

      const sunoData = extractSunoOrgData(info);
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
        };

        // Continue polling in background
        continueSunoOrgPolling(taskId, mood);
        return generatedSong;
      }
    }

    if (status === "FAILED") {
      throw new Error("SunoOrg task failed.");
    }
  }

  throw new Error("SunoOrg stream timeout.");
}
async function continueSunoOrgPolling(taskId: string, mood: string) {
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
        console.log("✅ Final Suno Org MP3 Ready:", finalUrl);

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

  // return await downloadAndSaveAudio(
  //   TEST_SONG_URL,
  //   `Mock-Song-${nextSongIdx}`,
  //   mood,
  //   "MOCK",
  // );
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

  return {
    audioUrl: downloadRes.uri,
    title: `Generated ${mood} Track`,
    duration: 30, // Approximate duration
    provider: providerName,
  };
}

// async function downloadAndSaveAudio(
//   remoteUrl: string,
//   fileName: string,
// ): Promise<string> {
//   if (!remoteUrl) throw new Error("No audio URL provided.");

//   const fileUri = FileSystem.documentDirectory + fileName;

//   const downloadResumable = FileSystem.createDownloadResumable(
//     remoteUrl,
//     fileUri
//   );

//   const result = await downloadResumable.downloadAsync();

//   return result?.uri || fileUri;
// }

//******************************************************************* */
//****Commenting below, as making it modular now... use for fallback
//******************************************************************* */

// //Real song generation service using Replicate MusicGen model
// export async function generateSong(lyrics: string, style: string, mood:string): Promise<GeneratedSong | null> {
//     console.log("SERVICE: GEN SONG: Starting Mureka with lyrics:", lyrics.substring(0, 30) + '...');
//     if (!REPLICATE_API_KEY) {
//     //if (!HF_API_KEY) {
//         console.warn('SERVICE: GEN SONG: Replicate Music Generation API key is not set.  Generating mock song.');
//         Alert.alert('Music Generation API key is not set. Generating mock song.');
//         return {
//             audioUrl: 'hhttps://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
//             title: 'Mock Song',
//             duration: 180,
//         };
//     }

//     try {
//         //console.log("SERVICE: GEN SONG: Sending request to Replicate...");
//         console.log("SERVICE: GEN SONG: Sending request to SUNO...");
//         const payload = {
//             version: REPLICATE_MODEL_VERSION,
//             input: {
//                 prompt: `${style} song about ${mood}. Lyrics: ${lyrics}`,
//                 tags: [style, mood],
//                 //mv: 'mureka-7.5',
//                 model_version: 'large', //meta-musicgen
//                 duration: 20

//             }
//         };

//         const payload_suno = {
//             custom_mode: true,
//             mv: 'sonic-v4.5',
//             prompt: `${style} song about ${mood}. Lyrics: ${lyrics}`,
//             tags: [style, mood],
//         }

//         //console.log("REPLICATE DEBUG")
//         console.log("SUNO")

//         const req = {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${SUNO_API_KEY}`,
//                 'Prefer': 'wait',
//             },
//             body: JSON.stringify(payload_suno),
//         }
//         console.log (" about to print req");
//         //console.log("REPLICATE request : ", req);
//         console.log("SUNO request : ", req);
//         const response = await fetch(SUNO_URL, req);

//         if (response.status === 503) {
//             const errorData = await response.json();
//             const waitTime = errorData.estimated_time || 20;
//             console.log("SERVICE: GEN SONG: Model is loading, waiting for", waitTime, "seconds.");
//             Alert.alert(`Music generation model is loading, please wait for ${waitTime} seconds and try again.`);
//             return null;
//         }

//         if (!response.ok) {
//             console.error('Failed to generate new song:', response.statusText);
//             const err = await response.text();
//             console.error('SUNO failed:', err)
//             throw new Error(`SUNO error: ${response.status}`);

//         }

//         // const data = await response.json();

//         // return {
//         //     audioUrl: data.audioUrl || data[0].audioUrl,
//         //     title: data.title || 'Generated Song',
//         //     duration: data.duration,
//         // };
//         // const blob = await response.blob();
//         // const reader = new FileReader();
//         // return new Promise ((resolve) => {
//         //     reader.onloadend = async () => {
//         //         const base64data = (reader.result as string).split(',')[1]; // Remove data URL prefix

//         //         // Use FileSystem (Main) for the directory path
//         //         const fileDir = documentDirectory || '';
//         //         const fileUri = fileDir + 'generated_song.wav';

//         //         await writeAsStringAsync(fileUri, base64data, { encoding: 'base64' });
//         //         console.log("SERVICE: GEN SONG: Song generated and saved to:", fileUri);
//         //         resolve({
//         //             audioUrl: fileUri,
//         //             title: `Generated ${mood} Song`,
//         //             duration: 15,
//         //         });
//         //     };
//         //     reader.readAsDataURL(blob);
//         // });

//         console.log("Response from SUNO: ", response)

//         const startData = await response.json();
//         const taskID = startData.id;
//         console.log("SERVICE: GEN SONG: SUNO Task ID:", taskID);

//         //in case of suno, task id needs to be added to the GET request

//         let prediction = startData;

//         const getUrl = prediction.urls.get; //  link to poll

//         let status = prediction.status;

//         while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
//             console.log(`Status: ${status}... waiting 2s`);
//             await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

//             const pollResponse = await fetch(getUrl, {
//                 headers: {
//                     'Authorization': `Bearer ${REPLICATE_API_KEY}`,
//                     'Content-Type': 'application/json',
//                 }
//             });

//             prediction = await pollResponse.json();
//             status = prediction.status;
//         }

//         if (status !== 'succeeded') {
//             console.error("REPLICATE Song Generation Failed Logs:", prediction.logs);
//             throw new Error(`AI Generation failed: ${status}`);
//         }

//         //After generation, get audio from the link and save
//         const remoteAudioUrl = prediction.output;
//         console.log("REPLICATE AI Generation Finished! Downloading audio from:", remoteAudioUrl);

//         if (!remoteAudioUrl) {
//             throw new Error("REPLICATE AI finished but returned no audio URL.");
//         }

//         const fileDir = documentDirectory || '';
//         const fileUri = fileDir + `replicate_${prediction.id}.wav`;

//         const downloadRes = await downloadAsync(remoteAudioUrl, fileUri);

//         console.log(" Song saved to:", downloadRes.uri);

//         return {
//             audioUrl: downloadRes.uri,
//             title: `Generated ${mood} Track`,
//             duration: 20,
//         };

//     } catch (error:any) {
//         console.error('REPLICATE ERROR : Error generating song:', error);
//         alert("AI Error: " + error.message);
//         return null;
//     }
// }

// //mock song generation service
// // export async function generateSong(lyrics: string, style: string, mood: string): Promise<GeneratedSong | null> {
// //     console.log(" MOCK SERVICE: Starting 'Generation'...");

// //     // 1. Simulate API Processing Time (2 seconds)
// //     // This lets you test your "Loading..." spinners in the UI
// //     await new Promise(resolve => setTimeout(resolve, 2000));

// //     try {
// //         console.log("Downloading test audio...");

// //         // 2. Download the test song to a local temp file
// //         // We use downloadAsync because it's more robust for large files
// //         const fileDir = documentDirectory || '';
// //         const fileUri = fileDir + 'generated_song.mp3';

// //         const downloadRes = await downloadAsync(
// //             TEST_SONG_URL,
// //             fileUri
// //         );

// //         if (downloadRes.status !== 200) {
// //             throw new Error("Failed to download mock song");
// //         }

// //         console.log("Mock Song saved to:", downloadRes.uri);

// //         // 3. Return the LOCAL URI (just like the real service will)
// //         return {
// //             audioUrl: downloadRes.uri,
// //             title: `Generated ${mood} Track (Mock)`,
// //             duration: 30,
// //         };

// //     } catch (error: any) {
// //         console.error(' Error inside mock generateSong:', error);
// //         Alert.alert("Mock Failed", error.message);
// //         return null;
// //     }
// // }
//**/
