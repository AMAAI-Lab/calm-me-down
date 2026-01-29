import { documentDirectory, downloadAsync } from 'expo-file-system/legacy';
import { Alert } from 'react-native';

const MUSIC_API_KEY = process.env.EXPO_PUBLIC_MUSIC_API_KEY;
const REPLICATE_API_URL = 'https://api.replicate.com/v1/predictions'; // Placeholder URL


// Using Meta's MusicGen model
const REPLICATE_API_KEY = process.env.EXPO_PUBLIC_REPLICATE_API_KEY
const REPLICATE_MODEL_VERSION = process.env.EXPO_PUBLIC_REPLILCATE_MODEL_VERSION;
const HF_API_KEY = process.env.EXPO_PUBLIC_HF_API_KEY;
const HF_MODEL_URL = `https://router.huggingface.co/models/facebook/musicgen-small`;

const TEST_SONG_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';
const MUREKA_API_KEY = process.env.EXPO_PUBLIC_MUREKA_API_KEY;
const MUREKA_API_URL = 'https://api.mureka.ai/v1/music/generate';
const MUREKA_QUERY_URL = 'https://api.mureka.ai/v1/song/query/';

export type GeneratedSong = {
    audioUrl: string;
    title?: string;
    duration?: number;
};
//Real song generation service using Replicate MusicGen model
export async function generateSong(lyrics: string, style: string, mood:string): Promise<GeneratedSong | null> {
    console.log("SERVICE: GEN SONG: Starting Mureka with lyrics:", lyrics.substring(0, 30) + '...');
    if (!REPLICATE_API_KEY) {
    //if (!HF_API_KEY) {
        console.warn('SERVICE: GEN SONG: Replicate Music Generation API key is not set.  Generating mock song.');
        Alert.alert('Music Generation API key is not set. Generating mock song.');
        return {
            audioUrl: 'hhttps://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            title: 'Mock Song',
            duration: 180,
        };
    }
        
    try {
        console.log("SERVICE: GEN SONG: Sending request to Replicate...");
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


        console.log("REPLICATE DEBUG")
        const req = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${REPLICATE_API_KEY}`,
                'Prefer': 'wait',
            },
            body: JSON.stringify(payload),
        }
        console.log (" about to print req");
        console.log("REPLICATE request : ", req);
        const response = await fetch(REPLICATE_API_URL, req);
        
        if (response.status === 503) {
            const errorData = await response.json();
            const waitTime = errorData.estimated_time || 20;
            console.log("SERVICE: GEN SONG: Model is loading, waiting for", waitTime, "seconds.");
            Alert.alert(`Music generation model is loading, please wait for ${waitTime} seconds and try again.`);
            return null;
        }

        if (!response.ok) {
            console.error('Failed to generate new song:', response.statusText);
            const err = await response.text();
            console.error('REPLICATE failed:', err)
            throw new Error(`REPLICATE error: ${response.status}`);
            
        }

        // const data = await response.json();

        // return {
        //     audioUrl: data.audioUrl || data[0].audioUrl,
        //     title: data.title || 'Generated Song',
        //     duration: data.duration,
        // };
        // const blob = await response.blob();
        // const reader = new FileReader();
        // return new Promise ((resolve) => {
        //     reader.onloadend = async () => {
        //         const base64data = (reader.result as string).split(',')[1]; // Remove data URL prefix
                
        //         // Use FileSystem (Main) for the directory path
        //         const fileDir = documentDirectory || '';
        //         const fileUri = fileDir + 'generated_song.wav';

        //         await writeAsStringAsync(fileUri, base64data, { encoding: 'base64' });
        //         console.log("SERVICE: GEN SONG: Song generated and saved to:", fileUri);
        //         resolve({
        //             audioUrl: fileUri,
        //             title: `Generated ${mood} Song`,
        //             duration: 15,
        //         });
        //     };
        //     reader.readAsDataURL(blob);
        // });

        console.log("Need to change from mureka response handling to replicate response... in the process")
        console.log("Response from Replicate: ", response)

        const startData = await response.json();
        const taskID = startData.id;
        console.log("SERVICE: GEN SONG: REPLICATE Task ID:", taskID);

        let prediction = startData;
        
        const getUrl = prediction.urls.get; //  link to poll

        let status = prediction.status;

        while (status !== 'succeeded' && status !== 'failed' && status !== 'canceled') {
            console.log(`Status: ${status}... waiting 2s`);
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

            const pollResponse = await fetch(getUrl, {
                headers: {
                    'Authorization': `Bearer ${REPLICATE_API_KEY}`,
                    'Content-Type': 'application/json',
                }
            });
            
            prediction = await pollResponse.json();
            status = prediction.status;
        }

        if (status !== 'succeeded') {
            console.error("REPLICATE Song Generation Failed Logs:", prediction.logs);
            throw new Error(`AI Generation failed: ${status}`);
        }

        //After generation, get audio from the link and save
        const remoteAudioUrl = prediction.output;
        console.log("REPLICATE AI Generation Finished! Downloading audio from:", remoteAudioUrl);

        if (!remoteAudioUrl) {
            throw new Error("REPLICATE AI finished but returned no audio URL.");
        }

        const fileDir = documentDirectory || '';
        const fileUri = fileDir + `replicate_${prediction.id}.wav`;

        const downloadRes = await downloadAsync(remoteAudioUrl, fileUri);

        console.log(" Song saved to:", downloadRes.uri);

        return {
            audioUrl: downloadRes.uri,
            title: `Generated ${mood} Track`,
            duration: 20,
        };


    } catch (error:any) {
        console.error('REPLICATE ERROR : Error generating song:', error);
        alert("AI Error: " + error.message); 
        return null;
    }
}

//mock song generation service
// export async function generateSong(lyrics: string, style: string, mood: string): Promise<GeneratedSong | null> {
//     console.log("🎵 MOCK SERVICE: Starting 'Generation'...");
    
//     // 1. Simulate API Processing Time (2 seconds)
//     // This lets you test your "Loading..." spinners in the UI
//     await new Promise(resolve => setTimeout(resolve, 2000)); 

//     try {
//         console.log("⬇️ Downloading test audio...");
        
//         // 2. Download the test song to a local temp file
//         // We use downloadAsync because it's more robust for large files
//         const fileDir = documentDirectory || '';
//         const fileUri = fileDir + 'generated_song.mp3';

//         const downloadRes = await downloadAsync(
//             TEST_SONG_URL,
//             fileUri
//         );

//         if (downloadRes.status !== 200) {
//             throw new Error("Failed to download mock song");
//         }

//         console.log("✅ Mock Song saved to:", downloadRes.uri);

//         // 3. Return the LOCAL URI (just like the real service will)
//         return {
//             audioUrl: downloadRes.uri,
//             title: `Generated ${mood} Track (Mock)`,
//             duration: 30, 
//         };

//     } catch (error: any) {
//         console.error('❌ Error inside mock generateSong:', error);
//         Alert.alert("Mock Failed", error.message);
//         return null;
//     }
// }