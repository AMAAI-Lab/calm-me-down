export const formatTime = (seconds: number) => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
};

export const checkForParticipantEmail = (str: string): boolean => {
  // const regex = /^(test[1-5]|p([1-9]|[1-3][0-9]|40))@gmail\.com$/i;
  // return regex.test(str);

  const lower = str.toLowerCase();
  if (!lower.endsWith("@gmail.com")) return false;

  const prefix = lower.replace("@gmail.com", "");
  if (prefix.startsWith("test")) {
    const num = Number(prefix.replace("test", ""));
    return num >= 1 && num <= 5;
  }
  if (prefix.startsWith("p")) {
    const num = Number(prefix.slice(1));
    return num >= 1 && num <= 40;
  }

  return false;
};

export function formaTrackDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
