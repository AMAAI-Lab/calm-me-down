import { fetchHealthConnectData, HealthData } from "@/services/HealthService";
import { useCallback, useEffect, useState } from "react";
import { Alert, Platform } from "react-native";
import {
  getGrantedPermissions,
  getSdkStatus,
  initialize,
  requestPermission,
  SdkAvailabilityStatus,
} from "react-native-health-connect";
import type { Permission } from "react-native-health-connect/lib/typescript/types";

export type HCSdkStatus =
  | "available"
  | "not_installed"
  | "unavailable"
  | "unknown";

const HC_PERMISSIONS: Permission[] = [
  { accessType: "read", recordType: "Steps" },
  { accessType: "read", recordType: "HeartRate" },
  { accessType: "read", recordType: "HeartRateVariabilityRmssd" },
];

export function useHealthConnect(updateHealthData: (data: HealthData) => void) {
  const [sdkStatus, setSdkStatus] = useState<HCSdkStatus>("unknown");
  const [isInitialized, setIsInitialized] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (Platform.OS !== "android") return;
    initHC();
  }, []);

  const initHC = async () => {
    try {
      const status = await getSdkStatus();

      if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
        setSdkStatus("not_installed");
        return;
      }

      setSdkStatus("available");

      const initialized = await initialize();
      if (!initialized) return;
      setIsInitialized(true);

      const alreadyGranted = await checkPermissions();
      setIsAuthorized(alreadyGranted);
    } catch (e: any) {
      console.error(
        "Error while initializing Health_Connect: ",
        e?.message || e,
      );
      setSdkStatus("unavailable");
    }
  };

  const checkPermissions = async (): Promise<boolean> => {
    try {
      const granted = await getGrantedPermissions();

      const hasSteps = granted.some(
        (p) => p.recordType === "Steps" && p.accessType === "read",
      );
      const hasHeartRate = granted.some(
        (p) => p.recordType === "HeartRate" && p.accessType === "read",
      );
      const hasHRV = granted.some(
        (p) =>
          p.recordType === "HeartRateVariabilityRmssd" &&
          p.accessType === "read",
      );

      return hasSteps || hasHeartRate || hasHRV;
    } catch (e: any) {
      console.error(
        "Error while checking Health Connect permissions:",
        e?.message || e,
      );
      return false;
    }
  };

  const authorizeAndFetch = useCallback(async () => {
    setLoading(true);
    try {
      // Re-check SDK in case user installed HC after app launched
      if (sdkStatus !== "available") {
        const status = await getSdkStatus();
        console.log("Health Connect SDK status:", status);

        if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
          setSdkStatus("not_installed");
          return;
        }
        setSdkStatus("available");
      }

      // Ensure initialized
      if (!isInitialized) {
        const ok = await initialize();
        console.log("Health Connect initialized:", ok);

        if (!ok) return;
        setIsInitialized(true);
      }

      // Request permissions if not yet granted
      if (!isAuthorized) {
        const requestedPermissions = await requestPermission(HC_PERMISSIONS);
        console.log(
          "Permissions returned after requesting:",
          JSON.stringify(requestedPermissions),
        );

        const hasPermission = await checkPermissions();
        if (!hasPermission) {
          Alert.alert(
            "Health Connect Permission Required",
            "Please allow access to at least one health data type in Health Connect settings.",
          );
          return;
        }
        setIsAuthorized(true);
      }

      const data = await fetchHealthConnectData();
      updateHealthData(data);
    } catch (e: any) {
      console.error(
        "Error while Authorize and Fetch through Health Connect:",
        e?.message || e,
      );

      Alert.alert(
        "Health Connect Error",
        e?.message || "Unable to fetch health data.",
      );
    } finally {
      setLoading(false);
    }
  }, [sdkStatus, isInitialized, isAuthorized, updateHealthData]);

  return {
    sdkStatus, // "available" | "not_installed" | "unavailable" | "unknown"
    isAuthorized, // true once permissions granted
    loading,
    authorizeAndFetch,
  };
}
