import { NativeModules, Platform } from 'react-native';
import BrokenHealthKit, { HealthKitPermissions, HealthValue } from 'react-native-health';
import * as Location from 'expo-location';

// --- 1. NATIVE MODULE FIX ---
// This prevents the "Permissions of undefined" crash
const AppleHealthKit = Platform.OS === 'ios' && NativeModules.AppleHealthKit 
  ? (NativeModules.AppleHealthKit as typeof BrokenHealthKit) 
  : ({
      initHealthKit: (opts: any, cb: (err: string | null) => void) => cb("HealthKit not available on this platform"),
      Constants: { Permissions: {} } 
    } as any);

if (Platform.OS === 'ios' && BrokenHealthKit.Constants) {
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
  if (Platform.OS !== 'ios') return false;

  console.log("Requesting Apple Health authorization...");
  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(permissions, (error: string) => {
      if (error) {
        console.error('[ERROR] Cannot grant permissions!', error);
        resolve(false);
        return;
      }
      console.log('Apple Health permissions granted.');
      resolve(true);
    });
  });
}

export async function fetchAppleHealthData(): Promise<HealthData> {
  if (Platform.OS !== 'ios') return { heartRate: null, steps: null };

  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0); // Today midnight
  const options = { startDate: startDate.toISOString() };

  // Fetch Heart Rate
  const hrPromise = new Promise<number | null>((resolve) => {
    AppleHealthKit.getHeartRateSamples(options, (err: string, results: HealthValue[]) => {
      if (err) resolve(null);
      else resolve(results.length > 0 ? (results[results.length - 1].value as number) : null);
    });
  });

  // Fetch Steps
  const stepsPromise = new Promise<number | null>((resolve) => {
    AppleHealthKit.getStepCount(options, (err: string, result: HealthValue) => {
      if (err) resolve(null);
      else resolve(result.value as number);
    });
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