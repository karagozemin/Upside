import {
  DEMO_ETF_FLOW,
  DEMO_INDICES,
  DEMO_NEWS,
} from "./demo-data";
import { updateApiStatus } from "./api-visibility";

const BASE_URL = "https://openapi.sosovalue.com/openapi/v1";

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

  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: {
        "x-soso-api-key": apiKey,
        Accept: "application/json",
      },
      next: { revalidate: 60 },
    });

    const latencyMs = Date.now() - start;

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
    "/feeds/hot-news",
    "/feeds/hot-news"
  );

  if (live && data) {
    return { items: data, live: true };
  }

  return { items: DEMO_NEWS, live: false };
}

export async function getEtfFlow(ticker = "us-btc-spot") {
  const { data, live } = await fetchSoSoValue<unknown>(
    "SoSoValue ETF Flow API",
    `/etf/historical-inflow-chart/${ticker}`,
    `/etf/historical-inflow-chart/${ticker}`
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
