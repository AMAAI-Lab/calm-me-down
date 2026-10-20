// utils/network.ts
import NetInfo from "@react-native-community/netinfo";
import { useEffect, useState } from "react";

const ok = (s: any) => !!s.isConnected && s.isInternetReachable !== false;

export function useIsOnline() {
  const [online, setOnline] = useState(true);

  // useEffect(() => NetInfo.addEventListener((s) => setOnline(ok(s))), []);
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((s) => setOnline(ok(s)));
    return () => unsubscribe();
  }, []);

  return online;
}

const waitForOnline = () =>
  new Promise<void>((resolve) => {
    const unsub = NetInfo.addEventListener((s) => {
      if (ok(s)) {
        setTimeout(() => unsub(), 0);
        resolve();
      }
    });
  });

// Waiting for network doesn't use up retries; only real failures do.
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  timeoutMs = 60_000,
): Promise<T> {
  for (let attempt = 0; ; attempt++) {
    await waitForOnline();
    try {
      return await Promise.race([
        fn(),
        new Promise<T>((_, rej) =>
          setTimeout(() => rej(new Error("TIMEOUT")), timeoutMs),
        ),
      ]);
    } catch (e) {
      if (attempt >= retries) throw e;
      await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt));
    }
  }
}
