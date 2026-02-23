import * as Location from "expo-location";
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
// We only ask to READ data, not write, to avoid Info.plist errors
const permissions: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.HeartRate,
      AppleHealthKit.Constants.Permissions.StepCount,
    ],
    write: [],
  },
} as HealthKitPermissions;

export type HealthData = {
  heartRate: number | null;
  steps: number | null;
  location?: Location.LocationObject | null;
};

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

// const getLastFiveMinutesISO = () => {
//   const d = new Date();
//   d.setMinutes(d.getMinutes() - 360);
//   return d.toISOString();
// };
const getLast30SecondsISO = () => {
  const d = new Date();
  d.setSeconds(d.getSeconds() - 3600); 
  return d.toISOString();
};

export async function fetchAppleHealthData(): Promise<HealthData> {
  if (Platform.OS !== "ios") return { heartRate: null, steps: null };

  const startDate = getLast30SecondsISO();
  //const startDate = getLastFiveMinutesISO()
  const endDate = new Date().toISOString();
  const options = {
    startDate,
    endDate,
    //limit: 300,
  };

  // Fetch Heart Rate
  const hrPromise = new Promise<number | null>((resolve) => {
    AppleHealthKit.getHeartRateSamples(
      //options,
      { ...options, limit: 1 }, // Just need the most recent
      (err: string, results: HealthValue[]) => {
        // if (err) resolve(null);
        // else
        //   resolve(
        //     results.length > 0
        //       ? (results[results.length - 1].value as number)
        //       : null,
        //   );
        if (err || !results.length) resolve(null);
        else resolve(results[0].value as number);
      },
    );
  });

  // Fetch Steps
  const stepsPromise = new Promise<number | null>((resolve) => {
    //AppleHealthKit.getSamples(
    AppleHealthKit.getStepCount(
      //{
        //...options,
        options, // Use getStepCount for a direct daily/period total
        //type: "Walking",
      //},
      // (err: string, results: HealthValue[]) => {
      //   if (err || !results?.length) {
      //     resolve(0);
      //   } else {
      //     const totalSteps = results.reduce(
      //       (sum, sample) => sum + (sample?.value || 0),
      //       0,
      //     );
      //     resolve(totalSteps);
      (err: string, results: HealthValue) => {
        if (err) {
          console.error("Step fetch error:", err);
          resolve(0);
        } else {
          // getStepCount returns a single HealthValue object with the sum
          resolve(results?.value || 0);
        
        }
      },
    );
  });

  const [heartRate, steps] = await Promise.all([hrPromise, stepsPromise]);
  return { heartRate, steps };
}

export async function fetchFitbitData(): Promise<HealthData> {
  return { heartRate: 80, steps: 5000 };
}
export async function fetchGarminData(): Promise<HealthData> {
  return { heartRate: 75, steps: 6500 };
}
