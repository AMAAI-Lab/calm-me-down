import { MAX_LOG_FILE_SIZE } from "@/constants/appConstants";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

const LOG_FILE = (FileSystem.documentDirectory || "") + "app.log";

const SESSION_DIR = (FileSystem.documentDirectory || "") + "sessions/";

let activeSessionLogFile: string | null = null;
let lastSessionLogFile: string | null = null;

let writeQueue = Promise.resolve(); // 🔐 queue lock

const formatLog = (level: string, args: any[]) => {
  const timestamp = new Date().toLocaleString();

  const message = args
    .map((a) => {
      if (typeof a === "object" && a !== null) {
        try {
          return JSON.stringify(a);
        } catch {
          return "[Unserializable object]";
        }
      }

      return String(a);
    })
    .join(" ");

  return `[${timestamp}] [${level}] ${message}\n`;
};

const readLogs = async (filePath: string) => {
  // Can't add console warnings/errors in this function, as it can create infinite recursive calls
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);

    if (!fileInfo.exists) return "";

    return await FileSystem.readAsStringAsync(filePath);
  } catch {
    return "";
  }
};

const trimLogs = (logs: string) =>
  logs.length > MAX_LOG_FILE_SIZE ? logs.slice(-MAX_LOG_FILE_SIZE) : logs;

// Create the session log file and activate session logging
export const startSessionLogging = async (sessionId: string | null = null) => {
  try {
    await FileSystem.makeDirectoryAsync(SESSION_DIR, {
      intermediates: true,
    });

    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "-");

    const fileName = `p_session_${sessionId || timestamp}.log`;

    const filePath = SESSION_DIR + fileName;

    // Create a fresh file
    await FileSystem.writeAsStringAsync(filePath, "");

    // Switch subsequent console logs to this file
    activeSessionLogFile = filePath;
    lastSessionLogFile = filePath;

    console.log("================================");
    console.log("PARTICIPANT SESSION STARTED");
    console.log("Timestamp:", timestamp);
    console.log("Session ID:", sessionId);
    console.log("Log file path:", fileName);
    console.log("================================");

    return filePath;
  } catch (error) {
    activeSessionLogFile = null;
    console.error("Failed to create session log file:", error);

    return null;
  }
};

// Stop session logging and return to app.log
export const endSessionLogging = () => {
  console.log("================================");
  console.log("PARTICIPANT SESSION ENDED");
  console.log("================================");

  activeSessionLogFile = null;
};

// Get current session log path
export const getActiveSessionLogFile = () => activeSessionLogFile;

// Write logs to the appropriate destination
const writeLog = (text: string) => {
  // Capture destination when this write is queued
  // so logs don't move between files unexpectedly.
  const destination = activeSessionLogFile || LOG_FILE;
  const isSessionLog = destination !== LOG_FILE;

  writeQueue = writeQueue
    .then(async () => {
      const prev = await readLogs(destination);
      const updatedLogs = prev + text;

      await FileSystem.writeAsStringAsync(
        destination,
        isSessionLog ? updatedLogs : trimLogs(updatedLogs),
        {
          encoding: FileSystem.EncodingType.UTF8,
        },
      );
    })
    .catch(() => {
      // Avoid breaking the queue if a file operation fails.
    });
};

export const viewLogs = async () => {
  try {
    const logs = await readLogs(LOG_FILE);
    Alert.alert("App Logs (Last 4KB)", logs.slice(-4000) || "No logs yet");
  } catch {
    Alert.alert("Logs", "No log file found");
  }
};

export const shareLogs = async () => {
  if (!(await Sharing.isAvailableAsync())) {
    Alert.alert("Sharing not available");
    return;
  }

  const info = await FileSystem.getInfoAsync(LOG_FILE);
  if (!info.exists) {
    Alert.alert("Logs", "No app log file found");
    return;
  }

  await Sharing.shareAsync(LOG_FILE, {
    mimeType: "text/plain",
    dialogTitle: "Share app logs",
  });
};

export const viewSessionLogs = async () => {
  try {
    const filePath = activeSessionLogFile || lastSessionLogFile;
    if (!filePath) {
      Alert.alert("Logs", "No active participant session");
      return;
    }

    const logs = await readLogs(filePath);
    Alert.alert(
      "Participant session Logs (Last 4KB)",
      logs.slice(-4000) || "No logs yet",
    );
  } catch {
    Alert.alert("Logs", "No log file found");
  }
};

// Share active participant session logs
export const shareSessionLogs = async () => {
  const filePath = activeSessionLogFile || lastSessionLogFile;

  if (!filePath) {
    Alert.alert("Logs", "No active participant session");
    return;
  }

  // Wait for pending writes
  await writeQueue;

  if (!(await Sharing.isAvailableAsync())) {
    Alert.alert("Sharing not available");
    return;
  }

  await Sharing.shareAsync(filePath, {
    mimeType: "text/plain",
    dialogTitle: "Share participant session logs",
  });
};

// Preserve existing console methods
const originalConsole = {
  log: console.log,
  warn: console.warn,
  error: console.error,
};

console.log = (...args) => {
  originalConsole.log(...args);
  writeLog(formatLog("LOG", args));
};

console.warn = (...args) => {
  originalConsole.warn(...args);
  writeLog(formatLog("WARN", args));
};

console.error = (...args) => {
  originalConsole.error(...args);
  writeLog(formatLog("ERROR", args));
};
