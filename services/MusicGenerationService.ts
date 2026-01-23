const MUSIC_API_KEY = process.env.EXPO_PUBLIC_MUSIC_API_KEY;
const MUSIC_API_URL = 'https://api.musicgeneration.example.com/generate'; // Placeholder URL

export type GeneratedSong = {
    audioUrl: string;
    title?: string;
    duration?: number;
};

export async function generateSong(lyrics: string, style: string, mood:string): Promise<GeneratedSong | null> {
    console.log("Inside generateSong with lyrics:", lyrics);
    if (!MUSIC_API_KEY) {
        console.warn('Music Generation API key is not set.  Generating mock song.');
        return {
            audioUrl: 'hhttps://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
            title: 'Mock Song',
            duration: 180,
        };
    }
        
    try {
        const payload = {
            prompt: `${style} song about ${mood}. Lyrics: ${lyrics}`,
            tags: [style, mood],
            mv: 'chirp-v3-0',
        };
        const response = await fetch(MUSIC_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${MUSIC_API_KEY}`,
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Failed to generate song:', response.statusText);
            return null;
        }

        const data = await response.json();

        return {
            audioUrl: data.audioUrl || data[0].audioUrl,
            title: data.title || 'Generated Song',
            duration: data.duration,
        };
    } catch (error) {
        console.error('Error generating song:', error);
        return null;
    }
}