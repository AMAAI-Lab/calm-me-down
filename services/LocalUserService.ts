import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserProfile } from "@/constants/appConstants";

const USER_KEY = "@user_profile";
const SESSION_KEY = "@session_id";
const TRACK_KEY = "@track_ids";
const FEEDBACK_KEY = "@feedback_submitted";
const SESSION_FEEDBACK_KEY = "@session_feedback";
const DEVICE_ID_KEY = "@ble_hr_device_id";


export interface FeedbackSubmittedStatus {
  pre: boolean;
  post: boolean;
}

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

// Methods to mutate feedback submission value
export const saveFeedbackSubmitted = async (
  type: "pre" | "post",
  sessionIdx: number,
): Promise<void> => {
  const feedbackSubmittedMap = (await getFeedbackSubmitted()) || {};
  const currFeedbackStatus = feedbackSubmittedMap?.[sessionIdx] || {
    pre: false,
    post: false,
  };
  currFeedbackStatus[type] = true;

  const newFeedbackMap = {
    ...feedbackSubmittedMap,
    [sessionIdx]: currFeedbackStatus,
  };
  await AsyncStorage.setItem(
    FEEDBACK_KEY,
    JSON.stringify({ ...newFeedbackMap }),
  );
};
export const getFeedbackSubmitted = async (): Promise<Record<
  number,
  FeedbackSubmittedStatus
> | null> => {
  const raw = await AsyncStorage.getItem(FEEDBACK_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const clearFeedbackSubmitted = async (): Promise<void> => {
  await AsyncStorage.removeItem(FEEDBACK_KEY);
};

// Methods to mutate Participants Music Sessions Feedback
export const saveSessionFeedback = async (feedback: object) => {
  await AsyncStorage.setItem(SESSION_FEEDBACK_KEY, JSON.stringify(feedback));
};
export const getSessionFeedback = async (): Promise<object | null> => {
  const raw = await AsyncStorage.getItem(SESSION_FEEDBACK_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const clearSessionFeedback = async () => {
  await AsyncStorage.removeItem(SESSION_FEEDBACK_KEY);
};

// Methods to mutate device id used in BLE
export const saveDeviceId = async (id: string) => {
  await AsyncStorage.setItem(DEVICE_ID_KEY, id);
};
export const getSavedDeviceId = async () => {
  return await AsyncStorage.getItem(DEVICE_ID_KEY);
};