import {
  DEMO_ETF_FLOW,
  DEMO_INDICES,
  DEMO_NEWS,
} from "./demo-data";
import { updateApiStatus } from "./api-visibility";

const BASE_URL = "https://openapi.sosovalue.com/openapi/v1";
const CACHE_TTL_MS = 60_000;

const cache = new Map<string, { data: unknown; live: boolean; expiresAt: number }>();

function getApiKey(): string | undefined {
  return process.env.SOSOVALUE_API_KEY;
}

function forceDemo(): boolean {
  return process.env.NEXT_PUBLIC_FORCE_DEMO === "true";
}

async function fetchSoSoValue<T>(
  sourceName: string,
  endpoint: string,
  path: string
): Promise<{ data: T | null; live: boolean }> {
  const apiKey = getApiKey();
  if (!apiKey || forceDemo()) {
    updateApiStatus(sourceName, {
      status: "fallback",
      lastFetch: new Date().toISOString(),
      latencyMs: 0,
      error: apiKey ? "Forced demo mode" : "Missing SOSOVALUE_API_KEY",
      endpoint,
    });
    return { data: null, live: false };
  }

  const cached = cache.get(path);
  if (cached && cached.expiresAt > Date.now()) {
    updateApiStatus(sourceName, {
      status: cached.live ? "live" : "fallback",
      lastFetch: new Date().toISOString(),
      latencyMs: 0,
      error: cached.live ? undefined : "Cached fallback",
      endpoint,
    });
    return { data: cached.data as T, live: cached.live };
  }

  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "x-soso-api-key": apiKey,
        Accept: "application/json",
      },
      cache: "no-store",
    });

    const latencyMs = Date.now() - start;

    if (res.status === 429) {
      updateApiStatus(sourceName, {
        status: "fallback",
        lastFetch: new Date().toISOString(),
        latencyMs,
        error: "Rate limit exceeded — wait 1–2 min, then refresh",
        endpoint,
      });
      return { data: null, live: false };
    }

    if (!res.ok) {
      updateApiStatus(sourceName, {
        status: "fallback",
        lastFetch: new Date().toISOString(),
        latencyMs,
        error: `HTTP ${res.status}`,
        endpoint,
      });
      return { data: null, live: false };
    }

    const data = (await res.json()) as T;
    cache.set(path, { data, live: true, expiresAt: Date.now() + CACHE_TTL_MS });
    updateApiStatus(sourceName, {
      status: "live",
      lastFetch: new Date().toISOString(),
      latencyMs,
      error: undefined,
      endpoint,
    });
    return { data, live: true };
  } catch (err) {
    updateApiStatus(sourceName, {
      status: "fallback",
      lastFetch: new Date().toISOString(),
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
      endpoint,
    });
    return { data: null, live: false };
  }
}

export async function getNewsFeed() {
  const { data, live } = await fetchSoSoValue<unknown>(
    "SoSoValue News API",
    "/feeds/hot",
    "/feeds/hot"
  );

  if (live && data) {
    return { items: data, live: true };
  }

  return { items: DEMO_NEWS, live: false };
}

export async function getEtfFlow(ticker = "us-btc-spot") {
  const { data, live } = await fetchSoSoValue<unknown>(
    "SoSoValue ETF Flow API",
    `/etf/${ticker}/inflow-chart`,
    `/etf/${ticker}/inflow-chart`
  );

  if (live && data) {
    return { flow: data, live: true };
  }

  return { flow: { ...DEMO_ETF_FLOW, ticker }, live: false };
}

export async function getIndices() {
  const { data, live } = await fetchSoSoValue<unknown>(
    "SoSoValue Sector/Index API",
    "/indices",
    "/indices"
  );

  if (live && data) {
    return { indices: data, live: true };
  }

  return { indices: DEMO_INDICES, live: false };
}

export async function getMacroEvents() {
  const { data, live } = await fetchSoSoValue<unknown>(
    "SoSoValue News API",
    "/macro/events",
    "/macro/events"
  );

  if (live && data) {
    return { events: data, live: true };
  }

  return {
    events: [{ title: "FOMC rate decision in 48h", impact: "high" }],
    live: false,
  };
}
