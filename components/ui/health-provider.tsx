import { HealthProvider } from "@/constants/appConstants";
import {
  authorizeAppleHealth,
  fetchAppleHealthData,
  HealthData,
} from "@/services/HealthService";
import { useHealthConnect } from "@/hooks/useHealthConnect";
import { FontAwesome5 } from "@expo/vector-icons";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
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
import { HealthConnectInstallModal } from "./health-connect-install-modal";

export default function HealthProviderSection({
  provider,
  isParticipantScreen,
  setProvider,
  updateHealthData,
}: {
  provider: HealthProvider;
  isParticipantScreen?: boolean;
  setProvider: Dispatch<SetStateAction<HealthProvider>>;
  updateHealthData: (data: HealthData) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [isAppleAuthorized, setIsAppleAuthorized] = useState(false);

  const {
    sdkStatus: hcSdkStatus,
    isAuthorized: isHcAuthorized,
    loading: hcLoading,
    authorizeAndFetch: hcAuthorizeAndFetch,
  } = useHealthConnect(updateHealthData);

  const [hcInstallModalVisible, setHcInstallModalVisible] = useState(false);

  const handleAuthorizeAndFetch = useCallback(async () => {
    // ── Health Connect ───────────────────────────────────────
    if (provider === "Health Connect") {
      if (Platform.OS !== "android") {
        Alert.alert(
          "Not supported",
          "Health Connect is only available on Android.",
        );
        return;
      }
      if (hcSdkStatus === "not_installed") {
        setHcInstallModalVisible(true);
        return;
      }

      await hcAuthorizeAndFetch();
      return;
    }

    // ── Apple Health ─────────────────────────────────────────
    if (provider === "Apple Health") {
      if (Platform.OS !== "ios") {
        Alert.alert("Not supported", "Apple Health is only available on iOS.");
        return;
      }
      setLoading(true);
      let authorized = isAppleAuthorized;
      try {
        if (!isAppleAuthorized) {
          authorized = await authorizeAppleHealth();
          setIsAppleAuthorized(authorized);
        }
        if (authorized) {
          const data = await fetchAppleHealthData();
          updateHealthData(data);
        } else {
          Alert.alert(
            "Authorization Failed",
            "Please grant permissions in Health app.",
          );
        }
      } catch (e: any) {
        console.error("Apple Health error:", e?.message);
      } finally {
        setLoading(false);
      }
    }
  }, [
    provider,
    hcSdkStatus,
    isHcAuthorized,
    hcAuthorizeAndFetch,
    isAppleAuthorized,
    updateHealthData,
  ]);

  const getAuthStatus = () => {
    if (provider === "Health Connect") {
      if (Platform.OS !== "android") return "Android only";
      if (hcSdkStatus === "not_installed") return "App not installed";
      return isHcAuthorized ? "Authorized" : "Authorization Required";
    }
    if (provider === "Apple Health") {
      if (Platform.OS !== "ios") return "iOS only";
      return isAppleAuthorized ? "Authorized" : "Authorization Required";
    }
    return "";
  };

  const getButtonLabel = () => {
    if (provider === "Health Connect") {
      return isHcAuthorized ? "Re-Fetch Data" : "Authorize & Fetch";
    }
    if (provider === "Apple Health")
      return isAppleAuthorized ? "Re-Fetch Data" : "Authorize & Fetch";
    return "Authorize & Fetch";
  };

  const getProviderIcon = (p: HealthProvider) =>
    p === "Apple Health" ? "apple" : "heartbeat";

  const isDisabled = loading || hcLoading;

  return (
    <>
      {!isParticipantScreen && (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>Select Health Provider</Text>

          <View style={styles.providerGrid}>
            {(["Apple Health", "Health Connect"] as HealthProvider[]).map(
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
                    name={getProviderIcon(p)}
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
      )}

      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>
          {!isParticipantScreen
            ? "Connect & Fetch Data"
            : "Connect to Apple Health"}
        </Text>
        <Text style={styles.providerStatus}>{getAuthStatus()}</Text>
        <Button
          title={getButtonLabel()}
          onPress={handleAuthorizeAndFetch}
          disabled={isDisabled}
          color="#b36cff"
        />
      </View>

      {/* Shown only when Health Connect app is not installed */}
      <HealthConnectInstallModal
        visible={hcInstallModalVisible}
        onClose={() => setHcInstallModalVisible(false)}
      />
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
