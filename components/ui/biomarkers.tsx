import { StyleSheet, Text, View } from "react-native";
import BiomarkerCard from "./biomarker-card";
import { FontAwesome5 } from "@expo/vector-icons";
import { NewsData, WeatherData } from "@/services/WeatherNewsService";
import { HealthData } from "@/services/HealthService";

interface BiomarkersProps {
  healthData?: HealthData | null;
  weatherData: WeatherData | null;
  newsData: NewsData | null;
  isParticipantScreen?: boolean;
}

export default function Biomarkers({
  healthData,
  weatherData,
  newsData,
  isParticipantScreen = false,
}: BiomarkersProps) {
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

            {!isParticipantScreen ? (
              <>
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
                    <FontAwesome5
                      name="map-marker-alt"
                      size={20}
                      color="#b36cff"
                    />
                  }
                  label="Location"
                  value={weatherData?.city || "--"}
                />
              </>
            ) : (
              <BiomarkerCard
                icon={
                  <FontAwesome5
                    name="thermometer-half"
                    size={20}
                    color="#b36cff"
                  />
                }
                label="Weather"
                value={`${weatherData?.temperature || "--"}°C • ${
                  weatherData?.city || "--"
                }`}
                numberOfLines={2}
                customWidth={100}
                variant="row"
              />
            )}

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
