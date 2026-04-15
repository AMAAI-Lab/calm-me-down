import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/constants/appConstants";

const USER_KEY = "@user_profile";
const SESSION_KEY = "@session_id";
const TRACK_KEY = "@track_ids";

export const saveUserLocal = async (user: UserProfile) => {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const getUserLocal = async (): Promise<UserProfile | null> => {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const clearUserLocal = async () => {
  await AsyncStorage.removeItem(USER_KEY);
};

// Methods for SessionID
export const saveSessionId = async (id: string | null) => {
  if (!id) return;
  await AsyncStorage.setItem(SESSION_KEY, id);
};
export const getSessionId = async (): Promise<string | null> => {
  const id = await AsyncStorage.getItem(SESSION_KEY);
  return id || null;
};
export const clearSessionId = async () => {
  await AsyncStorage.removeItem(SESSION_KEY);
};

// Methods for TrackID
export const getTrackIdsObject = async (): Promise<Record<
  string,
  string
> | null> => {
  const raw = await AsyncStorage.getItem(TRACK_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const saveTrackId = async (id: string | null, idx: number) => {
  if (!id) return;

  const trackIDs = (await getTrackIdsObject()) || {};
  trackIDs[idx] = id;
  await AsyncStorage.setItem(TRACK_KEY, JSON.stringify({ ...trackIDs }));
};
export const getTrackId = async (idx: number): Promise<string | null> => {
  const trackIDs = (await getTrackIdsObject()) || {};
  return trackIDs?.[idx] || null;
};
export const clearTrackIds = async () => {
  await AsyncStorage.removeItem(TRACK_KEY);
};
