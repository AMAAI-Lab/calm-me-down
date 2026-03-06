import { UserProfile } from "@/constants/appConstants";
import { db } from "@/config/firebase";
import {
  doc,
  setDoc,
  serverTimestamp,
  collection,
  addDoc,
  updateDoc,
  increment,
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
) => {
  // info: {
  //   emotionPath: [],
  //   userDetails: {},
  //   lyricPrompt: '',
  //   songPrompt: '',
  // }

  try {
    if (!userId) {
      console.warn("Missing User-ID while creating session!");
      return null;
    }

    const sessionRef = collection(db, "musicSessions", userId, "sessions");
    const docRef = await addDoc(sessionRef, {
      ...info,
      createdAt: serverTimestamp(),
    });

    console.log("Successfully created session in DB: ", info);
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
) => {
  // track: {
  //   mood: '',
  //   streamUrl: '',
  // }
  try {
    if (!userId || !sessionId) {
      const missingFields = [
        !userId && "User-ID",
        !sessionId && "Session-ID",
      ].filter(Boolean);
      console.warn(
        `Missing ${missingFields.join(", ")} while updating adding track in session!`,
      );
      return null;
    }

    const tracksRef = collection(
      db,
      "musicSessions",
      userId,
      "sessions",
      sessionId,
      "tracks",
    );
    const docRef = await addDoc(tracksRef, {
      ...track,
      createdAt: serverTimestamp(),
    });

    console.log("Successfully added track in DB: ", track);
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
      console.warn(
        `Missing ${missingFields.join(", ")} while updating track fields!`,
      );
      return;
    }

    const trackRef = doc(
      db,
      "musicSessions",
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
    console.log("Successfully updated track with fields: ", updates);
  } catch (err) {
    console.error("Update session track failed:", err);
  }
};
