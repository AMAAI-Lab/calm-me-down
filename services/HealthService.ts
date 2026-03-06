import {
  EmotionPoint,
  HeartRateSample,
  HRV_APP_VERSION,
  HRV_DURATION_MINS,
} from "@/constants/appConstants";
import { LocationObject } from "expo-location";
import { NativeModules, Platform } from "react-native";
import BrokenHealthKit, {
  HealthKitPermissions,
  HealthValue,
} from "react-native-health";

// --- 1. NATIVE MODULE FIX ---
// This prevents the "Permissions of undefined" crash
const AppleHealthKit =
  Platform.OS === "ios" && NativeModules.AppleHealthKit
    ? (NativeModules.AppleHealthKit as typeof BrokenHealthKit)
    : ({
        initHealthKit: (opts: any, cb: (err: string | null) => void) =>
          cb("HealthKit not available on this platform"),
        Constants: { Permissions: {} },
      } as any);

if (Platform.OS === "ios" && BrokenHealthKit.Constants) {
  (AppleHealthKit as any).Constants = BrokenHealthKit.Constants;
}

// --- 2. PERMISSIONS (READ ONLY) ---
const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.StepCount,
      AppleHealthKit.Constants.Permissions.HeartRateVariability,
    ],
    write: [],
  },
} as HealthKitPermissions;

// --- 3. Types
export type HealthData = {
  heartRate: number | null;
  heartRateSamples: HeartRateSample[];
  steps: number | null;
  hrv: number | null;
  arousal: number | null;
  location?: LocationObject | null;
};

// --- 4. AUTHORIZATION ---
export async function authorizeAppleHealth(): Promise<boolean> {
  if (Platform.OS !== "ios") return false;

  console.log("Requesting Apple Health authorization...");
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error("[ERROR] Cannot grant permissions!", error);
        resolve(false);
        return;
      }
      console.log("Apple Health permissions granted.");
      resolve(true);
    });
  });
}

// --- 5. TIME HELPERS ---
const getMinutesAgoISO = (minutes: number) => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - minutes);
  return d.toISOString();
};

// --- 6. AROUSAL ESTIMATION FROM BIOMETRICS ---
/**
 * Estimates emotional arousal from heart rate and activity level.
 *
 * Key insight: activity context disambiguates HR.
 *   - High HR + low steps  = emotional arousal (stress, excitement, anxiety)
 *   - High HR + high steps = physical activity (not emotional)
 *   - Low HR  + low steps  = calm / resting state
 *
 * If HRV is available, low HRV indicates higher stress/arousal.
 *
 * @param hr         - Current average heart rate (bpm)
 * @param steps      - Steps in the same time window
 * @param hrv        - Heart rate variability in ms (optional, from Apple Watch)
 * @param restingHR  - User's resting heart rate (default 70, personalize over time)
 * @returns arousal  - 0 (very calm) to 1 (highly aroused)
 */
export function estimateArousal(
  hr: number | null,
  steps: number | null,
  hrv: number | null = null,
  restingHR: number = 70,
): number | null {
  if (hr === null) return null;

  const safeSteps = steps ?? 0;

  // Normalize HR elevation: 0 = at resting, 1 = near max HR
  const maxHR = 220 - 30; // approximate, assuming ~30 years; adjust as needed
  const hrElevation = Math.max(0, (hr - restingHR) / (maxHR - restingHR));

  // Activity factor: how much of the HR elevation is explained by physical activity
  // ~200 steps in the window = moderate walking, scale 0–1
  const activityFactor = Math.min(safeSteps / 200, 1);

  // Emotional arousal = HR elevation minus the portion explained by activity
  let emotionalArousal = Math.max(0, hrElevation - activityFactor * 0.5);

  // If HRV is available, incorporate it (low HRV = higher stress/arousal)
  // Typical resting HRV: 20–100ms; below 30 = high stress, above 60 = relaxed
  if (hrv !== null && hrv > 0) {
    const hrvStressFactor = Math.max(0, Math.min(1, 1 - (hrv - 20) / 60));
    // Blend: 60% HR-based, 40% HRV-based
    emotionalArousal = 0.6 * emotionalArousal + 0.4 * hrvStressFactor;
  }

  return Math.min(1, Math.round(emotionalArousal * 100) / 100);
}

// --- 7. VA TRAJECTORY FUSION ---
/**
 * Computes a real-time VA (valence-arousal) coordinate by fusing:
 *   - User-reported current and target emotions (for valence trajectory)
 *   - Live biometric arousal (for real-time arousal adjustment)
 *
 * @param currentEmotion - User's reported current emotion as VA
 * @param targetEmotion  - User's desired emotion as VA
 * @param bioArousal     - Live arousal from estimateArousal()
 * @param progress       - 0–1, how far along the playlist/session we are
 * @returns live VA coordinate for music generation
 */
export function computeLiveVA(
  currentEmotion: EmotionPoint,
  targetEmotion: EmotionPoint,
  bioArousal: number | null,
  progress: number, // 0 to 1
): EmotionPoint {
  // Valence: interpolate between reported current → target
  const valence =
    currentEmotion.valence +
    (targetEmotion.valence - currentEmotion.valence) * progress;

  // Arousal: blend trajectory target with live biometric reading
  const targetArousal =
    currentEmotion.arousal +
    (targetEmotion.arousal - currentEmotion.arousal) * progress;

  let arousal: number;
  if (bioArousal !== null) {
    // 40% planned trajectory, 60% live biometric signal
    arousal = 0.4 * targetArousal + 0.6 * bioArousal;
  } else {
    // No biometric data — fall back to planned trajectory
    arousal = targetArousal;
  }

  return {
    emotion: "",
    valence: Math.round(valence * 100) / 100,
    arousal: Math.round(Math.min(1, Math.max(0, arousal)) * 100) / 100,
  };
}

/**
 * Determines if the biometric trajectory is diverging from the planned one.
 * Useful for adaptive re-planning: if the user isn't calming down as expected,
 * the system can slow the transition or change musical features.
 *
 * @returns deviation magnitude (0 = on track, >0.3 = significant divergence)
 */
export function getTrajectoryDeviation(
  expectedArousal: number,
  bioArousal: number | null,
): number {
  if (bioArousal === null) return 0;
  return Math.abs(expectedArousal - bioArousal);
}

// --- 8. FETCH APPLE HEALTH DATA ---
export async function fetchAppleHealthData(
  windowMinutes: number = 10,
): Promise<HealthData> {
  if (Platform.OS !== "ios") {
    return {
      heartRate: null,
      heartRateSamples: [],
      steps: null,
      hrv: null,
      arousal: null,
    };
  }

  const startDate = getMinutesAgoISO(windowMinutes);
  const endDate = new Date().toISOString();

  // Fetch Heart Rate samples
  const hrPromise = new Promise<{
    avg: number | null;
    samples: HeartRateSample[];
  }>((resolve) => {
    AppleHealthKit.getHeartRateSamples(
      { startDate, endDate },
      (err: string, results: HealthValue[]) => {
        if (err || !results.length) {
          console.error("HR NULL");
          resolve({ avg: null, samples: [] });
        } else {
          console.log(
            `HR: ${results.length} samples in last ${windowMinutes} min`,
          );
          results.forEach((r, i) => {
            console.log(` [${i}] ${r.value} bpm at ${r.startDate}`);
          });

          const avg =
            results.reduce((sum, r) => sum + r.value, 0) / results.length;
          const samples = !HRV_APP_VERSION
            ? []
            : results.map((r) => ({
                value: r.value,
                timestamp: r.startDate,
              }));

          resolve({ avg: Math.round(avg), samples });
        }
      },
    );
  });

  // Fetch Steps
  const stepsPromise = new Promise<number | null>((resolve) => {
    AppleHealthKit.getSamples(
      {
        startDate,
        endDate,
        type: "StepCount",
      },
      (err: string, results: HealthValue[]) => {
        console.log("All samples for Steps: ", JSON.stringify(results,null,2));
        if (err || !results?.length) {
          console.error("Error fetching steps");
          resolve(0);
        } else {
          console.log("Fetching steps - ")
          const totalSteps = results.reduce(
            (sum, sample: any) =>
              sum + (sample?.quantity || sample?.value || 0),
            0,
          );
          console.log(
            `Total steps in last ${windowMinutes} min: ${totalSteps}`,
          );
          resolve(totalSteps);
        }
      },
    );
  });

  // Fetch HRV (Heart Rate Variability)
  const hrvPromise = new Promise<number | null>((resolve) => {
    if (!HRV_APP_VERSION) {
      resolve(null);
      return;
    }

    const hrvStartDate = getMinutesAgoISO(HRV_DURATION_MINS);
    try {
      AppleHealthKit.getHeartRateVariabilitySamples(
        { startDate: hrvStartDate, endDate },
        (err: string, results: HealthValue[]) => {
          //console.log("HRV raw results: ", JSON.stringify(results, null, 2));

          if (err || !results?.length) {
            console.log("HRV: no samples available");
            resolve(null);
          } else {
            // HRV is in ms (SDNN). Return the most recent sample.
            const latest = results[results.length - 1];
            const hrvMs = Math.round(latest.value * 1000); //convert seconds to ms
            console.log(`HRV: ${hrvMs} ms at ${latest.startDate}`);
            resolve(hrvMs);
          }
        },
      );
    } catch (e) {
      // getHeartRateVariabilitySamples may not be available in all versions
      console.log("HRV fetch not supported:", e);
      resolve(null);
    }
  });

  const [hrResult, steps, hrv] = await Promise.all([
    hrPromise,
    stepsPromise,
    hrvPromise,
  ]);

  const arousal = estimateArousal(hrResult.avg, steps, hrv);

  console.log(
    `Biometrics → HR: ${hrResult.avg}, Steps: ${steps}, HRV: ${hrv}, Arousal: ${arousal}`,
  );

  return {
    heartRate: hrResult.avg,
    heartRateSamples: hrResult.samples,
    steps,
    hrv,
    arousal,
  };
}

// --- 9. PLACEHOLDER FETCHERS ---
export async function fetchFitbitData(): Promise<HealthData> {
  return {
    heartRate: 80,
    heartRateSamples: [],
    steps: 5000,
    hrv: null,
    arousal: estimateArousal(80, 5000),
  };
}

export async function fetchGarminData(): Promise<HealthData> {
  return {
    heartRate: 75,
    heartRateSamples: [],
    steps: 6500,
    hrv: null,
    arousal: estimateArousal(75, 6500),
  };
}
