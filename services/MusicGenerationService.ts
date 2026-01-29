import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import { Alert } from 'react-native';

// --- CONFIGURATION ---
// Change this to 'SUNO', 'REPLICATE', or 'MOCK' to switch engines
const CURRENT_PROVIDER: 'SUNO' | 'REPLICATE' | 'MOCK' = 'REPLICATE'; 

// --- API KEYS & CONSTANTS ---
const SUNO_API_KEY = process.env.EXPO_PUBLIC_SUNO_API_KEY; // Verify this is set in .env
const REPLICATE_API_KEY = process.env.EXPO_PUBLIC_REPLICATE_API_KEY;

const SUNO_URL_CREATE = 'https://api.musicapi.ai/api/v1/sonic/create';
const SUNO_URL_TASK = 'https://api.musicapi.ai/api/v1/sonic/task';

const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions';
// Meta's MusicGen Large Model
const REPLICATE_MODEL_VERSION = "7a76a8258b23fae65c5a22debb8841d1d7e816b75c2f24218cd2bd8573787906"; 

export type GeneratedSong = {
    audioUrl: string;
    title?: string;
    duration?: number;
    provider: string;
};

// --- MAIN SERVICE ENTRY POINT ---
export async function generateSong(lyrics: string, style: string, mood: string): Promise<GeneratedSong | null> {
    console.log(` SERVICE: Starting Generation using [${CURRENT_PROVIDER}]`);
    console.log(` Lyrics snippet: "${lyrics.substring(0, 30)}..."`);

    switch (CURRENT_PROVIDER) {
        case 'SUNO':
            return await generateWithSuno(lyrics, style, mood);
        case 'REPLICATE':
            return await generateWithReplicate(lyrics, style, mood);
        case 'MOCK':
        default:
            return await generateWithMock(lyrics, style, mood);
    }
}

// =================================================================
// 1. SUNO PROVIDER (MusicAPI.ai)
// =================================================================
async function generateWithSuno(lyrics: string, style: string, mood: string): Promise<GeneratedSong | null> {
    if (!SUNO_API_KEY) {
        Alert.alert("Config Error", "Missing SUNO_API_KEY. Check your .env file.");
        return null;
    }

    try {
        // Step 1: Create Task
        console.log(" SUNO: Sending generation request...");
        const payload = {
            custom_mode: true,
            mv: 'sonic-v4-5', // Using the latest model from your curl
            title: `Song about ${mood}`,
            tags: `${style}, ${mood}`,
            prompt: `[Verse]\n${lyrics}\n\n[Chorus]\n(Meaningful song with vocals and music)` 
            // Note: Structuring prompt helps Suno understand verses/chorus
        };

        const response = await fetch(SUNO_URL_CREATE, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUNO_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        const req = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUNO_API_KEY}`,
                'Prefer': 'wait',
            },
            body: JSON.stringify(payload),
        }

        console.log("SUNO request: ", req)
        console.log("SUNO resp: ", response)

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

async function pollSunoTask(taskId: string, mood: string): Promise<GeneratedSong | null> {
    const maxAttempts = 60; // 2 minutes (60 * 2s)
    let attempts = 0;

    while (attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
        attempts++;

        const response = await fetch(`${SUNO_URL_TASK}/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${SUNO_API_KEY}`,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        
        // Suno returns an array of clips (usually 2 variations). We check the first one.
        // The curl response showed: data.data[0].state
        if (data.data && data.data.length > 0) {
            const clip = data.data[0]; // Take the first variation
            const status = clip.state;

            console.log(`Checking Status (${attempts}/${maxAttempts}): ${status}`);

            if (status === 'succeeded') {
                console.log(" SUNO: Generation Succeeded!");
                const audioUrl = clip.audio_url;
                
                // Step 3: Download & Save
                return await downloadAndSaveAudio(audioUrl, `suno_${clip.id}.mp3`, mood, 'SUNO');
            }
            
            if (status === 'failed') {
                throw new Error("Suno task reported failure.");
            }
        }
    }
    
    throw new Error("Suno generation timed out.");
}

// =================================================================
// 2. REPLICATE PROVIDER (Meta MusicGen)
// =================================================================
async function generateWithReplicate(lyrics: string, style: string, mood: string): Promise<GeneratedSong | null> {
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
                model_version: 'large', //meta-musicgen
                duration: 20
                
            }
        };

          const req = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${REPLICATE_API_KEY}`,
                'Prefer': 'wait',
            },
            body: JSON.stringify(payload),
        }

        console.log("REPLICATE request: ", req)

        const response = await fetch(REPLICATE_API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${REPLICATE_API_KEY}`,
                'Content-Type': 'application/json',
                'Prefer': 'wait',
            },
            body: JSON.stringify(payload)
                
            })
        

        console.log("REPLICATE resp: ", response)

        const startData = await response.json();
        
        if (response.status !== 201 && response.status !== 200) {
            throw new Error(`Replicate Error: ${startData.detail || 'Unknown'}`);
        }

        let prediction = startData;
        const pollUrl = prediction.urls.get;
        let status = prediction.status;

        while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
            console.log(`Checking Status: ${status}...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            const pollResponse = await fetch(pollUrl, {
                headers: { 'Authorization': `Bearer ${REPLICATE_API_KEY}` }
            });
            prediction = await pollResponse.json();
            status = prediction.status;
        }

        if (status === 'succeeded') {
            return await downloadAndSaveAudio(prediction.output, `replicate_${prediction.id}.wav`, mood, 'REPLICATE');
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
async function generateWithMock(lyrics: string, style: string, mood: string): Promise<GeneratedSong | null> {
    console.log("MOCK: Simulating generation...");
    await new Promise(resolve => setTimeout(resolve, 2000)); // Fake delay

    const TEST_SONG_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
    return await downloadAndSaveAudio(TEST_SONG_URL, 'mock_song.mp3', mood, 'MOCK');
}

// =================================================================
// SHARED HELPER: Download & Save
// =================================================================
async function downloadAndSaveAudio(remoteUrl: string, fileName: string, mood: string, providerName: string): Promise<GeneratedSong> {
    console.log(` Downloading audio from: ${remoteUrl}`);
    
    if (!remoteUrl) throw new Error("No audio URL provided to download.");

    const fileDir = documentDirectory || '';
    const fileUri = fileDir + fileName;

    const downloadRes = await downloadAsync(remoteUrl, fileUri);
    console.log(` Saved to: ${downloadRes.uri}`);

    return {
        audioUrl: downloadRes.uri,
        title: `Generated ${mood} Track`,
        duration: 30, // Approximate duration
        provider: providerName
    };
}


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
// //     console.log("🎵 MOCK SERVICE: Starting 'Generation'...");
    
// //     // 1. Simulate API Processing Time (2 seconds)
// //     // This lets you test your "Loading..." spinners in the UI
// //     await new Promise(resolve => setTimeout(resolve, 2000)); 

// //     try {
// //         console.log("⬇️ Downloading test audio...");
        
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

// //         console.log("✅ Mock Song saved to:", downloadRes.uri);

// //         // 3. Return the LOCAL URI (just like the real service will)
// //         return {
// //             audioUrl: downloadRes.uri,
// //             title: `Generated ${mood} Track (Mock)`,
// //             duration: 30, 
// //         };

// //     } catch (error: any) {
// //         console.error('❌ Error inside mock generateSong:', error);
// //         Alert.alert("Mock Failed", error.message);
// //         return null;
// //     }
// // }
//**/