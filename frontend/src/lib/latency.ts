const PUBLIC_API_URL = import.meta.env.VITE_API_URL || "";
const DEFAULT_DEV_API_URL = "http://localhost:3000";
const SAMPLE_INTERVAL_MS = 10000;
const ROLLING_WINDOW = 3;

function apiBaseUrl(): string {
  return PUBLIC_API_URL || (import.meta.env.DEV ? DEFAULT_DEV_API_URL : "");
}

export async function measureLatency(): Promise<number | null> {
  const baseUrl = apiBaseUrl();
  if (!baseUrl) return null;

  const start = performance.now();
  try {
    const res = await fetch(`${baseUrl}/ping?t=${Date.now()}`, {
      method: "HEAD",
      cache: "no-store",
    });
    if (!res.ok && res.status !== 204) return null;
    return Math.round(performance.now() - start);
  } catch {
    return null;
  }
}

export function getPageLoadMs(): number | null {
  try {
    const [nav] = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (!nav || nav.loadEventEnd <= 0) return null;
    return Math.round(nav.loadEventEnd);
  } catch {
    return null;
  }
}

export function subscribeToLatency(
  onReading: (ms: number) => void,
): () => void {
  const readings: number[] = [];
  let timer: ReturnType<typeof setInterval> | null = null;
  let inFlight = false;
  let stopped = false;

  async function tick() {
    if (inFlight || stopped || document.hidden) return;
    inFlight = true;
    try {
      const ms = await measureLatency();
      if (stopped || ms === null) return;
      readings.push(ms);
      if (readings.length > ROLLING_WINDOW) readings.shift();
      onReading(
        Math.round(readings.reduce((sum, n) => sum + n, 0) / readings.length),
      );
    } finally {
      inFlight = false;
    }
  }

  function start() {
    if (timer || stopped) return;
    void tick();
    timer = setInterval(() => void tick(), SAMPLE_INTERVAL_MS);
  }

  function pause() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  function onVisibility() {
    if (document.hidden) pause();
    else start();
  }

  document.addEventListener("visibilitychange", onVisibility);
  start();

  return () => {
    stopped = true;
    pause();
    document.removeEventListener("visibilitychange", onVisibility);
  };
}
