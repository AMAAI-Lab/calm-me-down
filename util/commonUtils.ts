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
  // if (!lower.endsWith("@gmail.com")) return false;

  // const prefix = lower.replace("@gmail.com", "");
  if (lower.startsWith("test")) {
    const num = Number(lower.replace("test", ""));
    return num >= 1 && num <= 5;
  }
  if (lower.startsWith("p")) {
    const num = Number(lower.slice(1));
    return (num >= 1 && num <= 40) || (num >= 101 && num <= 140);
  }

  return false;
};

export function formaTrackDuration(ms: number): string {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// "Country, R&B/Soul, EDM / Electronic" -> ["Country", "R&B/Soul", "EDM / Electronic"]
export function parseGenres(raw?: string): string[] {
  return (raw || "")
    .split(",")
    .map((g) => g.trim())
    .filter(Boolean);
}

export const getTimeOfDay = (
  date: Date = new Date(),
): { label: string; feel: string } => {
  const h = date.getHours(); // device local time

  if (h >= 5 && h < 8)
    return {
      label: "Early morning",
      feel: "quiet, first light, slow waking, fresh and unhurried, possibility",
    };
  if (h >= 8 && h < 12)
    return {
      label: "Morning",
      feel: "bright, in motion, routines starting, rising energy, clear-headed",
    };
  if (h >= 12 && h < 17)
    return {
      label: "Afternoon",
      feel: "full daylight, steady and busy, long stretch of the day, warm or restless",
    };
  if (h >= 17 && h < 21)
    return {
      label: "Evening",
      feel: "golden and fading light, winding down, reflection, returning home",
    };
  if (h >= 21 || h < 1)
    return {
      label: "Night",
      feel: "hushed, intimate, softened edges, the day settling",
    };
  return {
    label: "Late night",
    feel: "deep stillness, sleepless or dreamy, honest thoughts, very little noise",
  };
};
