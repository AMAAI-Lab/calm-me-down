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
  //   playlistType: trajectory | savedPlaylist,
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

// export const updateMusicSession = async (
//   userId: string | null,
//   sessionId: string | null,
//   updates: any,
//   isParticipant: boolean = false,
// ) => {
//   try {
//     if (!userId || !sessionId) {
//       const missingFields = [
//         !userId && "User-ID",
//         !sessionId && "Session-ID",
//       ].filter(Boolean);
//       console.log(
//         `Missing ${missingFields.join(", ")} while updating music session!`,
//       );
//       return;
//     }

//     const rootCollection = !isParticipant
//       ? "musicSessions"
//       : "testMusicSessions";
//     const sessionRef = doc(db, rootCollection, userId, "sessions", sessionId);

//     const updatedDocument = {
//       ...updates,
//       updatedAt: serverTimestamp(),
//     };

//     await updateDoc(sessionRef, { ...updatedDocument });
//     console.log("Successfully updated music session in DB");
//   } catch (err) {
//     console.error("Update music session in DB failed:", err);
//   }
// };

export const createMusicTrajectory = async (
  userId: string | null,
  sessionId: string | null,
  info: object,
) => {
  try {
    if (!userId || !sessionId) {
      const missingFields = [
        !userId && "User-ID",
        !sessionId && "Session-ID",
      ].filter(Boolean);
      console.log(
        `Missing ${missingFields.join(", ")} while creating music trajectory!`,
      );
      return null;
    }

    const trajectoryRef = collection(
      db,
      "testMusicSessions",
      userId,
      "sessions",
      sessionId,
      "trajectories",
    );
    const docRef = await addDoc(trajectoryRef, {
      ...info,
      createdAt: serverTimestamp(),
    });

    console.log("Successfully created trajectory in DB");
    return docRef.id;
  } catch (err) {
    console.error("Failed to create music trajectory:", err);
    return null;
  }
};

export const updateMusicTrajectory = async (
  userId: string | null,
  sessionId: string | null,
  trajectoryId: string | null,
  updates: any,
) => {
  try {
    if (!userId || !sessionId || !trajectoryId) {
      const missingFields = [
        !userId && "User-ID",
        !sessionId && "Session-ID",
        !trajectoryId && "Trajectory-ID",
      ].filter(Boolean);
      console.log(
        `Missing ${missingFields.join(", ")} while updating music trajectory!`,
      );
      return;
    }

    const trajectoryRef = doc(
      db,
      "testMusicSessions",
      userId,
      "sessions",
      sessionId,
      "trajectories",
      trajectoryId,
    );

    const updatedDocument = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(trajectoryRef, { ...updatedDocument });
    console.log("Successfully updated music trajectory in DB");
  } catch (err) {
    console.error("Update music trajectory in DB failed:", err);
  }
};

export const addTrackToSession = async (
  userId: string | null,
  sessionId: string | null,
  songIdx: number,
  track: object,
  isParticipant: boolean = false,
  trajectoryId: string | null = null,
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
        `Missing ${missingFields.join(", ")} while adding track in ${isParticipant ? "trajectory" : "session"}!`,
      );
      return null;
    }
    if (isParticipant && !trajectoryId) {
      console.log(`Missing Trajectory-Id while adding track in trajectory!`);
      return null;
    }

    let tracksRef = collection(
      db,
      "musicSessions",
      userId,
      "sessions",
      sessionId,
      "tracks",
    );
    if (isParticipant && trajectoryId) {
      tracksRef = collection(
        db,
        "testMusicSessions",
        userId,
        "sessions",
        sessionId,
        "trajectories",
        trajectoryId,
        "tracks",
      );
    }

    const docRef = await addDoc(tracksRef, {
      ...track,
      createdAt: serverTimestamp(),
    });

    console.log(
      `Successfully added track in a ${isParticipant ? "trajectory" : "session"} in DB`,
    );
    return { id: docRef.id, songIdx };
  } catch (err) {
    console.error(
      `Add ${isParticipant ? "trajectory" : "session"} track failed:`,
      err,
    );
    return null;
  }
};

export const updateTrackFields = async (
  userId: string | null,
  sessionId: string | null,
  trackId: string | null,
  updates: any,
  isParticipant: boolean = false,
  trajectoryId: string | null = null,
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
    if (isParticipant && !trajectoryId) {
      console.log(`Missing Trajectory-Id while updating track fields!`);
      return;
    }

    let trackRef = doc(
      db,
      "musicSessions",
      userId,
      "sessions",
      sessionId,
      "tracks",
      trackId,
    );
    if (isParticipant && trajectoryId) {
      trackRef = doc(
        db,
        "testMusicSessions",
        userId,
        "sessions",
        sessionId,
        "trajectories",
        trajectoryId,
        "tracks",
        trackId,
      );
    }

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

// export const storeFeedback = async (userId: string | null, info: object) => {
//   try {
//     if (!userId) {
//       console.log(`Missing User ID while updating track fields!`);
//       return;
//     }

//     const feedbackRef = collection(db, "userFeedback", userId, "feedbacks");
//     await addDoc(feedbackRef, { ...info, createdAt: serverTimestamp() });
//     console.log("Successfully added Feedback!");
//   } catch (err) {
//     console.error("Add feedback error:", err);
//   }
// };
