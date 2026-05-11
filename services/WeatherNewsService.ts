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

export async function fetchWeatherData(
  lat: number,
  lon: number,
): Promise<WeatherData | null> {
  if (!OPENWEATHER_API_KEY) {
    console.warn(
      "OpenWeatherMap API key is not set. Returning null weather data.",
    );
    return {
      temperature: 25,
      description: "Clear Sky 'Mock'",
      condition: "Clear",
      city: "Singapore 'Mock'",
    };
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${OPENWEATHER_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].description,
        condition: data.weather[0].main,
        city: data.sys.country,
      };
    } else {
      throw new Error(data?.message || "Response not OK!");
    }
  } catch (error: any) {
    console.error("Error fetching weather data:", error?.message);
    return null;
  }
}

export async function fetchNewsData(
  countryCode: string = "us",
): Promise<NewsData | null> {
  if (!NEWS_API_KEY) {
    console.warn("News API key is not set. Returning null news data.");
    return {
      headline: ["Mock Headline 1", "Mock Headline 2"],
      source: ["Mock Source 1", "Mock Source 2"],
    };
  }
  try {
    const url = `https://newsapi.org/v2/top-headlines?country=${countryCode}&pageSize=1&apiKey=${NEWS_API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data?.message || "Response not OK!");
    }

    if (data?.articles?.length) {
      return {
        headline: data.articles[0].title,
        source: data.articles[0].source.name,
      };
    } else {
      console.warn("Couldn't find any news data for:", countryCode);
      return null;
    }
  } catch (error: any) {
    console.error("Error fetching news data:", error?.message);
    return null;
  }
}

export async function fetchUniqueNewsData(
  countryCode: string = "us",
): Promise<NewsData | null> {
  if (!NEWS_API_KEY) {
    return {
      headline: ["Mock Headline 1", "Mock Headline 2"],
      source: ["Mock Source 1", "Mock Source 2"],
    };
  }
  try {
    const topics = [
      "technology",
      "science",
      "music",
      "wellness",
      "culture",
      "lifestyle",
    ];
    const randomTopic = topics[Math.floor(Math.random() * topics.length)];
    const randomPage = Math.floor(Math.random() * 3) + 1;

    const url = `https://newsapi.org/v2/everything?q=${randomTopic}&sortBy=publishedAt&page=${randomPage}&pageSize=20&language=en&apiKey=${NEWS_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data?.message || "Response not OK while fetching unique news!",
      );
    }

    if (data.articles.length > 0) {
      // Filter out articles with null/removed titles
      const validArticles = data.articles.filter(
        (a: any) => a.title && a.title !== "[Removed]",
      );

      if (validArticles.length === 0) {
        return await fetchNewsData(countryCode);
      }

      const randomIndex = Math.floor(Math.random() * validArticles.length);
      const article = validArticles[randomIndex];

      return {
        headline: article.title,
        source: article.source.name,
      };
    } else {
      console.warn("Couldn't find any valid news articles!");
      return null;
    }
  } catch (error: any) {
    console.error("Network error fetching news:", error?.message);
    return null;
  }
}
