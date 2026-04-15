import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";
import {
  getSdkStatus,
  initialize,
  readRecords,
  requestPermission,
  SdkAvailabilityStatus,
} from "react-native-health-connect";
import type { Permission } from "react-native-health-connect/lib/typescript/types";
import { fetchHealthConnectData, HealthData } from "@/services/HealthService";

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

      const alreadyGranted = await probePermissions();
      setIsAuthorized(alreadyGranted);
    } catch {
      setSdkStatus("unavailable");
    }
  };

  const probePermissions = async (): Promise<boolean> => {
    try {
      const now = new Date();
      const probe = new Date(now.getTime() - 60_000);
      await readRecords("Steps", {
        timeRangeFilter: {
          operator: "between",
          startTime: probe.toISOString(),
          endTime: now.toISOString(),
        },
      });
      return true;
    } catch {
      return false;
    }
  };

  const authorizeAndFetch = useCallback(async () => {
    setLoading(true);
    try {
      // Re-check SDK in case user installed HC after app launched
      if (sdkStatus !== "available") {
        const status = await getSdkStatus();
        if (status !== SdkAvailabilityStatus.SDK_AVAILABLE) {
          setSdkStatus("not_installed");
          return;
        }
        setSdkStatus("available");
      }

      // Ensure initialized
      if (!isInitialized) {
        const ok = await initialize();
        if (!ok) return;
        setIsInitialized(true);
      }

      // Request permissions if not yet granted
      if (!isAuthorized) {
        const granted = await requestPermission(HC_PERMISSIONS);
        const hasMinimum =
          granted.some((p) => p.recordType === "Steps") ||
          granted.some((p) => p.recordType === "HeartRate");

        if (!hasMinimum) return;
        setIsAuthorized(true);
      }

      const data = await fetchHealthConnectData();
      updateHealthData(data);
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
