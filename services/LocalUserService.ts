import AsyncStorage from "@react-native-async-storage/async-storage";
import { AI_TRAJECTORY_LENGTH, UserProfile } from "@/constants/appConstants";

const USER_KEY = "@user_profile";
const SESSION_KEY = "@session_id";
const TRACK_KEY = "@track_ids";
const FEEDBACK_KEY = "@feedback_submitted";
const PLAYLIST_FEEDBACK_KEY = "@playlist_feedback";
const TRAJECTORY_ID_KEY = "@trajectory_id";
const PRE_GEN_PLAYLIST_KEY = "@pre_gen_playlist";
const VOCAL_GENDER_COUNTS_KEY = "@vocal_gender_counts";
const APPLE_HEALTH_AUTH_KEY = "@apple_health_authorized";

export interface FeedbackSubmittedStatus {
  pre: boolean;
  post: boolean;
}

interface PgPlaylistEmotionIds {
  calm: string[];
  joyful: string[];
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

// Methods for TrajectoryID
export const saveTrajectoryId = async (id: string | null) => {
  if (!id) return;
  await AsyncStorage.setItem(TRAJECTORY_ID_KEY, id);
};
export const getTrajectoryId = async (): Promise<string | null> => {
  const id = await AsyncStorage.getItem(TRAJECTORY_ID_KEY);
  return id || null;
};
export const clearTrajectoryId = async () => {
  await AsyncStorage.removeItem(TRAJECTORY_ID_KEY);
};

// Methods for TrackID
const getTrackIdsObject = async (): Promise<Record<string, string> | null> => {
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
  playlistIdx: number,
): Promise<void> => {
  const feedbackSubmittedMap = (await getFeedbackSubmitted()) || {};
  const currFeedbackStatus = feedbackSubmittedMap?.[playlistIdx] || {
    pre: false,
    post: false,
  };
  currFeedbackStatus[type] = true;

  const newFeedbackMap = {
    ...feedbackSubmittedMap,
    [playlistIdx]: currFeedbackStatus,
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

// Methods to mutate Participants Music Playlists Feedback
export const savePlaylistFeedback = async (feedback: object) => {
  await AsyncStorage.setItem(PLAYLIST_FEEDBACK_KEY, JSON.stringify(feedback));
};
export const getPlaylistFeedback = async (): Promise<object | null> => {
  const raw = await AsyncStorage.getItem(PLAYLIST_FEEDBACK_KEY);
  return raw ? JSON.parse(raw) : null;
};
export const clearPlaylistFeedback = async () => {
  await AsyncStorage.removeItem(PLAYLIST_FEEDBACK_KEY);
};

// Methods for mutating already played pre generated playlist songs IDs
const getPgpIds = async (): Promise<PgPlaylistEmotionIds> => {
  const raw = await AsyncStorage.getItem(PRE_GEN_PLAYLIST_KEY);
  return raw ? JSON.parse(raw) : { calm: [], joyful: [] };
};
export const savePgpIds = async (
  type: "calm" | "joyful",
  id: string,
): Promise<void> => {
  if (!id) return;
  const playedIds = await getPgpIds();
  const specificEmotionIds = [...playedIds[type], id];

  await AsyncStorage.setItem(
    PRE_GEN_PLAYLIST_KEY,
    JSON.stringify({ ...playedIds, [type]: [...specificEmotionIds] }),
  );
};
export const getPgpIdsOfEmotion = async (
  type: "calm" | "joyful",
): Promise<string[]> => {
  const playedIds = await getPgpIds();
  return playedIds?.[type] || [];
};
export const clearPgpIds = async () => {
  await AsyncStorage.removeItem(PRE_GEN_PLAYLIST_KEY);
};

// Methods for vocal gender counts
export const getVocalGender = async (): Promise<string> => {
  const raw = await AsyncStorage.getItem(VOCAL_GENDER_COUNTS_KEY);
  const counts = raw ? JSON.parse(raw) : {};

  const mCount = Number(counts?.m || "0");
  const fCount = Number(counts?.f || "0");

  let vocal;
  const limit = AI_TRAJECTORY_LENGTH / 2;
  if (mCount >= limit) {
    vocal = "f";
  } else if (fCount >= limit) {
    vocal = "m";
  } else {
    vocal = Math.random() < 0.5 ? "m" : "f";
  }

  const newCounts = {
    m: vocal === "m" ? mCount + 1 : mCount,
    f: vocal === "f" ? fCount + 1 : fCount,
  };
  await AsyncStorage.setItem(
    VOCAL_GENDER_COUNTS_KEY,
    JSON.stringify(newCounts),
  );

  return vocal;
};
export const clearVocalGenderCounts = async () => {
  await AsyncStorage.removeItem(VOCAL_GENDER_COUNTS_KEY);
};

// Methods for apple health auth status
export const saveAppleHealthAuthStatus = async (val: boolean) => {
  await AsyncStorage.setItem(APPLE_HEALTH_AUTH_KEY, String(val));
};
export const getAppleHealthAuthStatus = async (): Promise<boolean> => {
  const val = await AsyncStorage.getItem(APPLE_HEALTH_AUTH_KEY);
  return val === "true";
};
