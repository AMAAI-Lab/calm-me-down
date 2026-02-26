import { MAX_LOG_FILE_SIZE } from "@/constants/appConstants";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import { Alert } from "react-native";

const LOG_FILE = (FileSystem.documentDirectory || "") + "app.log";
let writeQueue = Promise.resolve(); // 🔐 queue lock

const formatLog = (level: string, args: any[]) => {
  const timestamp = new Date().toLocaleString();
  const message = args
    .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
    .join(" ");

  return `[${timestamp}] [${level}] ${message}\n`;
};

const readLogs = async () => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(LOG_FILE);
    if (!fileInfo.exists){
      console.log("Log file doesnt exist yet, returning empty");
      return "";
    }
    return await FileSystem.readAsStringAsync(LOG_FILE);
  } catch (e: any) {
    console.error("Read Logs file Failed! ", e?.message);
    return "";
  }
};

const clearLogs = async () => await FileSystem.writeAsStringAsync(LOG_FILE, "");

const trimLogs = (logs: string) =>
  logs.length > MAX_LOG_FILE_SIZE ? logs.slice(-MAX_LOG_FILE_SIZE) : logs;

const writeLog = (text: string) => {
  // clearLogs()
  writeQueue = writeQueue.then(async () => {
    const prev = await readLogs();
    await FileSystem.writeAsStringAsync(LOG_FILE, trimLogs(prev + text), {
      encoding: FileSystem.EncodingType.UTF8,
    });
  });
};

export const viewLogs = async () => {
  try {
    const logs = await readLogs();
    Alert.alert(
      "App Logs (Last 4KB)",
      logs.slice(-4000) || "No logs yet"
    );
  } catch {
    Alert.alert("Logs", "No log file found");
  }
};

export const shareLogs = async () => {
  if (!(await Sharing.isAvailableAsync())) {
    Alert.alert("Sharing not available");
    return;
  }

  await Sharing.shareAsync(LOG_FILE, {
    mimeType: "text/plain",
    dialogTitle: "Share app logs",
  });
};

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
// if (!__DEV__) {
//   console.log = () => {};
//   console.warn = () => {};
//   console.error = () => {};
// }


//  SPECIFIC LOGS ONLY
// type LogLevel = "INFO" | "DEBUG" | "WARN" | "ERROR";
// const ENABLED_LEVELS: LogLevel[] = ["INFO", "WARN", "ERROR"]; 

// const format = (level: LogLevel, message: string) =>
//   `[${new Date().toLocaleString()}] [${level}] ${message}\n`;

// const log = (level: LogLevel, ...args: any[]) => {
//   if (!ENABLED_LEVELS.includes(level)) return;

//   const msg = args
//     .map((a) => (typeof a === "object" ? JSON.stringify(a) : String(a)))
//     .join(" ");

//   writeLog(format(level, msg));
// };

// export const AppLogger = {
//   info: (...args: any[]) => log("INFO", ...args),
//   debug: (...args: any[]) => log("DEBUG", ...args),
//   warn: (...args: any[]) => log("WARN", ...args),
//   error: (...args: any[]) => log("ERROR", ...args),
// };
