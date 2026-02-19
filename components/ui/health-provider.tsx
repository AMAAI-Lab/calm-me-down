import { HealthProvider } from "@/constants/appConstants";
import {
  authorizeAppleHealth,
  fetchAppleHealthData,
  fetchFitbitData,
  fetchGarminData,
  HealthData,
} from "@/services/HealthService";
import { FontAwesome5 } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import {
  Alert,
  Button,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function HealthProviderSection({
  updateHealthData,
}: {
  updateHealthData: (data: HealthData) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [provider, setProvider] = useState<HealthProvider>("Apple Health");
  const [isAuthorized, setIsAuthorized] = useState(false);

  const handleAuthorizeAndFetch = useCallback(async () => {
    if (provider !== "Apple Health") {
      console.warn("Using mock health data for " + provider);
      updateHealthData(
        provider === "Fitbit"
          ? await fetchFitbitData()
          : await fetchGarminData(),
      );
      return;
    }
    if (Platform.OS !== "ios") {
      Alert.alert("Platform Warning", "Apple Health is only available on iOS.");
      return;
    }
    setLoading(true);
    let authorized = isAuthorized;
    try {
      if (!isAuthorized) {
        authorized = await authorizeAppleHealth();
        setIsAuthorized(authorized);
      }
      if (authorized) {
        const data = await fetchAppleHealthData();
        updateHealthData(data);
        console.log(
          `Success!! Fetched HR: ${data.heartRate || "N/A"}, Steps: ${data.steps || "N/A"}`,
        );
      } else {
        Alert.alert(
          "Authorization Failed",
          "Please grant permissions in Health app.",
        );
      }
    } catch (e: any) {
      console.error("Error while authorizing Apple Health: ", e?.message);
    } finally {
      setLoading(false);
    }
    // }, [isAuthorized, provider]);
  }, [isAuthorized, provider, updateHealthData]);

  const isApple = provider === "Apple Health";

  return (
    <>
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Select Health Provider</Text>
        <View style={styles.providerGrid}>
          {(["Apple Health", "Fitbit", "Garmin"] as HealthProvider[]).map(
            (p) => (
              <TouchableOpacity
                key={p}
                style={[
                  styles.providerButton,
                  provider === p && styles.providerButtonSelected,
                ]}
                onPress={() => {
                  setProvider(p);
                  Keyboard.dismiss();
                }}
              >
                <FontAwesome5
                  name={
                    p === "Apple Health"
                      ? "apple"
                      : p === "Fitbit"
                        ? "heartbeat"
                        : "circle"
                  }
                  size={24}
                  color={provider === p ? "#ccc" : "#b36cff"}
                />
                <Text
                  style={[
                    styles.providerButtonText,
                    provider !== p && { color: "#ccc" },
                  ]}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ),
          )}
        </View>
      </View>

      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>Connect & Fetch Data</Text>
        <Text style={styles.providerStatus}>
          {isApple && Platform.OS !== "ios"
            ? "iOS required"
            : isAuthorized
              ? "Authorized"
              : "Authorization Required"}
        </Text>
        <Button
          title={
            isApple
              ? isAuthorized
                ? "Re-Fetch Data"
                : "Authorize & Fetch"
              : `Fetch Mock Data`
          }
          onPress={handleAuthorizeAndFetch}
          disabled={loading}
          color="#b36cff"
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  providerGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    gap: 8,
  },
  providerButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: "#333",
    backgroundColor: "#171A1F",
    flex: 1,
    height: 80,
    justifyContent: "center",
  },
  providerButtonSelected: {
    borderColor: "#b36cff",
    backgroundColor: "#b36cff",
  },
  providerButtonText: {
    fontSize: 12,
    color: "#fff",
    marginTop: 4,
    fontWeight: "600",
  },
  stepContainer: {
    backgroundColor: "#171A1F",
    padding: 16,
    borderRadius: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#333",
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 12,
  },
  providerStatus: {
    fontSize: 14,
    color: "#b36cff",
    textAlign: "center",
    marginBottom: 10,
  },
});
