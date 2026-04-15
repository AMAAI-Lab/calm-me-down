import { StyleSheet, Text, View } from "react-native";
import BiomarkerCard from "./biomarker-card";
import { FontAwesome5 } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useEffect } from "react";
import * as Location from "expo-location";
import {
  fetchNewsData,
  fetchWeatherData,
  NewsData,
  WeatherData,
} from "@/services/WeatherNewsService";
import { HealthData } from "@/services/HealthService";

interface BiomarkersProps {
  healthData?: HealthData | null;
  weatherData: WeatherData | null;
  setWeatherData: Dispatch<SetStateAction<WeatherData | null>>;
  newsData: NewsData | null;
  setNewsData: Dispatch<SetStateAction<NewsData | null>>;
  isParticipantScreen?: boolean;
}

export default function Biomarkers({
  healthData,
  weatherData,
  setWeatherData,
  newsData,
  setNewsData,
  isParticipantScreen = false,
}: BiomarkersProps) {
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      let loc = await Location.getCurrentPositionAsync({});
      console.log("location set");

      // Fetch weather and news data based on location
      const weather = await fetchWeatherData(
        loc.coords.latitude,
        loc.coords.longitude,
      );
      setWeatherData(weather);

      // Using US as default country code for news; can be enhanced to use location data
      let news = null;
      news = await fetchNewsData(weatherData?.city || "us");

      // If news data isn't available for a particular country-code, then try 'US' as fallback
      if (!news) {
        news = await fetchNewsData("us");
      }
      setNewsData(news);
    })();
  }, []);

  return (
    <>
      {((isParticipantScreen && weatherData) || !isParticipantScreen) && (
        <>
          <Text style={styles.sectionTitle}>Current Biomarkers</Text>

          <View style={styles.bioGrid}>
            {!isParticipantScreen && (
              <BiomarkerCard
                icon={<FontAwesome5 name="heart" size={20} color="#b36cff" />}
                label="Heart Rate"
                value={`${healthData?.heartRate || "--"} bpm`}
              />
            )}
            {!isParticipantScreen && (
              <BiomarkerCard
                icon={<FontAwesome5 name="walking" size={20} color="#b36cff" />}
                label="Steps"
                value={`${healthData?.steps || "--"}`}
              />
            )}

            <BiomarkerCard
              icon={
                <FontAwesome5
                  name="thermometer-half"
                  size={20}
                  color="#b36cff"
                />
              }
              label="Temperature"
              value={`${weatherData?.temperature || "--"}°C`}
            />
            <BiomarkerCard
              icon={
                <FontAwesome5 name="map-marker-alt" size={20} color="#b36cff" />
              }
              label="Location"
              value={weatherData?.city || "--"}
            />
            <BiomarkerCard
              icon={<FontAwesome5 name="newspaper" size={20} color="#b36cff" />}
              label="News Headline"
              value={
                (Array.isArray(newsData?.headline)
                  ? newsData?.headline[0]
                  : newsData?.headline) || "--"
              }
              numberOfLines={3}
              customWidth={100}
            />
          </View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginVertical: 12,
  },
  bioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
  },
});
