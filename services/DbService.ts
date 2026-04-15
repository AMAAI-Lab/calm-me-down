import { db } from "@/config/firebase";
import { UserProfile } from "@/constants/appConstants";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";

export const saveUserInDB = async (user: UserProfile) => {
  try {
    await setDoc(
      doc(db, "users", user.email),
      {
        ...user,
        createdAt: serverTimestamp(),
      },
      { merge: true },
    );
    console.log("User profile stored successfully in DB:", user);
  } catch (err) {
    console.error("Failed to save user in DB", err);
  }
};

export const createMusicSession = async (
  userId: string | null,
  info: object,
  isParticipant: boolean = false,
) => {
  // info: {
  //   emotionPath: [],
  //   userDetails: {},
  //   lyricPrompt: '',
  //   songPrompt: '',
  //   hrvUtilized: true,
  // }

  try {
    if (!userId) {
      console.log("Missing User-ID while creating session!");
      return null;
    }

    const rootCollection = !isParticipant
      ? "musicSessions"
      : "testMusicSessions";
    const sessionRef = collection(db, rootCollection, userId, "sessions");
    const docRef = await addDoc(sessionRef, {
      ...info,
      createdAt: serverTimestamp(),
    });

    console.log("Successfully created session in DB");
    return docRef.id;
  } catch (err) {
    console.error("Failed to create music session:", err);
    return null;
  }
};

export const addTrackToSession = async (
  userId: string | null,
  sessionId: string | null,
  songIdx: number,
  track: object,
  isParticipant: boolean = false,
) => {
  // track: {
  //   mood: '',
  //   streamUrl: '',
  //   lyrics: '',
  //   lyricsPrompt: '',
  //   heartRate: '',
  //   steps: '',
  //   hrvMetrics: '',
  // }
  try {
    if (!userId || !sessionId) {
      const missingFields = [
        !userId && "User-ID",
        !sessionId && "Session-ID",
      ].filter(Boolean);
      console.log(
        `Missing ${missingFields.join(", ")} while adding track in session!`,
      );
      return null;
    }

    const rootCollection = !isParticipant
      ? "musicSessions"
      : "testMusicSessions";
    const tracksRef = collection(
      db,
      rootCollection,
      userId,
      "sessions",
      sessionId,
      "tracks",
    );
    const docRef = await addDoc(tracksRef, {
      ...track,
      createdAt: serverTimestamp(),
    });

    console.log("Successfully added track in a session in DB");
    return { id: docRef.id, songIdx };
  } catch (err) {
    console.error("Add session track failed:", err);
    return null;
  }
};

export const updateTrackFields = async (
  userId: string | null,
  sessionId: string | null,
  trackId: string | null,
  updates: any,
  isParticipant: boolean = false,
) => {
  // updates: {
  //   finalAudioUrl: "",
  //   downloadedUrl: "",
  //   listendTime: "",
  //   completed: true,
  // }
  try {
    if (!userId || !sessionId || !trackId) {
      const missingFields = [
        !userId && "User-ID",
        !sessionId && "Session-ID",
        !trackId && "Track-ID",
      ].filter(Boolean);
      console.log(
        `Missing ${missingFields.join(", ")} while updating track fields!`,
      );
      return;
    }

    const rootCollection = !isParticipant
      ? "musicSessions"
      : "testMusicSessions";
    const trackRef = doc(
      db,
      rootCollection,
      userId,
      "sessions",
      sessionId,
      "tracks",
      trackId,
    );

    const updatedDocument = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    if (updates?.listendTime) {
      updatedDocument.listendTime = increment(updates.listendTime);
    }

    await updateDoc(trackRef, { ...updatedDocument });
    console.log("Successfully updated track fields in DB");
  } catch (err) {
    console.error("Update track fields failed:", err);
  }
};

export const storeFeedback = async (userId: string | null, info: object) => {
  try {
    if (!userId) {
      console.log(`Missing User ID while updating track fields!`);
      return;
    }

    const feedbackRef = collection(db, "userFeedback", userId, "feedbacks");
    await addDoc(feedbackRef, { ...info, createdAt: serverTimestamp() });
    console.log("Successfully added Feedback!");
  } catch (err) {
    console.error("Add feedback error:", err);
  }
};
