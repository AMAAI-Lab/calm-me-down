const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY; 

const NEWS_API_KEY = process.env.EXPO_PUBLIC_NEWS_API_KEY;


export type WeatherData = {
    temperature: number;
    description: string;
    condition: string;
    city: string;
};

export type NewsData = {
    headline: string[];
    source: string[];
};

export async function fetchWeatherData(lat: number, lon: number): Promise<WeatherData | null> {
    if (!OPENWEATHER_API_KEY) {
        console.warn('OpenWeatherMap API key is not set. Returning null weather data.');
        return { temperature: 25, description: "Clear Sky 'Mock'", condition: "Clear", city: "Singapore 'Mock'" };
    }
    console.log("fetching weather1")

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
        const response = await fetch(url);
        console.log("fetching weather2")
        const data = await response.json();

        if (response.ok) {
            return {
                temperature: Math.round(data.main.temp),
                description: data.weather[0].description,
                condition: data.weather[0].main,
                city: data.sys.country,
            };
        } else {
            console.error('Error fetching weather data:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Network error fetching weather data:', error);
        return null;
    }
}

export async function fetchNewsData(countryCode: string = 'us'): Promise<NewsData | null> {
    if (!NEWS_API_KEY) {
        console.warn('News API key is not set. Returning null news data.');
        return { headline: ["Mock Headline 1", "Mock Headline 2"], source: ["Mock Source 1", "Mock Source 2"] };
    }
    try {
        const url = `https://newsapi.org/v2/top-headlines?country=${countryCode}&pageSize=1&apiKey=${NEWS_API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();

        if (response.ok && data.articles.length > 0) {
            return {
                headline: data.articles[0].title,
                source: data.articles[0].source.name,
            };
        } else {
            console.error('Error fetching news data:', data.message);
            return null;
        }
    } catch (error) {
        console.error('Network error fetching news data:', error);
        return null;
    }
}
    

