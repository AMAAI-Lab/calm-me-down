const URLS = [
  "https://api.sunoapi.org",
  "https://api.anthropic.com",
  "https://api.openai.com",
  "https://api.x.ai",
  "https://generativelanguage.googleapis.com",
  "https://tempfile.aiquickdraw.com",
];

async function checkOne(url: string): Promise<string> {
  const host = url.replace("https://", "");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 15000);
  try {
    const r = await fetch(url, { signal: ctrl.signal });
    return `OK   ${host} -> ${r.status}`;
  } catch (e: any) {
    return `FAIL ${host} -> ${e?.name}: ${e?.message}`;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkConnectivity(): Promise<string> {
  const results = await Promise.all(URLS.map(checkOne));
  console.log("connectivity check")
  return results.join("\n\n");
}