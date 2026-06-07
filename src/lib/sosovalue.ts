import { DEMO_ETF_FLOW, DEMO_INDICES, DEMO_NEWS } from "./demo-data";
import { updateApiStatus } from "./api-visibility";

const BASE_URL = "https://openapi.sosovalue.com/openapi/v1";
const CACHE_TTL_MS = 300_000;
const MIN_REQUEST_GAP_MS = 900;

const cache = new Map<string, { data: unknown; live: boolean; expiresAt: number }>();
let lastRequestAt = 0;
let requestChain: Promise<unknown> = Promise.resolve();

function getApiKey(): string | undefined {
  return process.env.SOSOVALUE_API_KEY;
}

function forceDemo(): boolean {
  return process.env.NEXT_PUBLIC_FORCE_DEMO === "true";
}

async function throttle(): Promise<void> {
  const wait = MIN_REQUEST_GAP_MS - (Date.now() - lastRequestAt);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  lastRequestAt = Date.now();
}

function enqueueSoSoValue<T>(task: () => Promise<T>): Promise<T> {
  const run = requestChain.then(task);
  requestChain = run.catch(() => undefined);
  return run;
}

function getStale(path: string) {
  const entry = cache.get(path);
  if (entry) return { data: entry.data, live: entry.live };
  return null;
}

function inferSentiment(title: string): "positive" | "neutral" | "negative" {
  const t = title.toLowerCase();
  if (/outflow|drop|fall|crash|fear|negative|thin|weak|liquidat|down|loss|sell/.test(t)) return "negative";
  if (/inflow|surge|rally|gain|positive|up|bull|record high/.test(t)) return "positive";
  return "neutral";
}

export function parseNewsResponse(data: unknown): Array<{ title: string; sentiment: "positive" | "neutral" | "negative"; source: string }> {
  const root = data as { data?: { list?: Array<{ title?: string }> }; list?: Array<{ title?: string }> };
  const list = root?.data?.list ?? root?.list ?? [];
  if (!list.length) return DEMO_NEWS;

  return list.slice(0, 6).map((item) => ({
    title: item.title ?? "SoSoValue headline",
    sentiment: inferSentiment(item.title ?? ""),
    source: "SoSoValue Live",
  }));
}

export function parseEtfFlowResponse(data: unknown, ticker: string) {
  const root = data as {
    data?: {
      totalNetInflow?: number;
      netInflow?: number;
      trend?: string;
      days?: number;
      chart?: Array<{ netInflow?: number; value?: number; inflow?: number }>;
      list?: Array<{ netInflow?: number; value?: number; inflow?: number }>;
    };
    totalNetInflow?: number;
    netInflow?: number;
    chart?: Array<{ netInflow?: number; value?: number; inflow?: number }>;
    list?: Array<{ netInflow?: number; value?: number; inflow?: number }>;
  };

  const series = root?.data?.chart ?? root?.chart ?? root?.list ?? root?.data?.list;
  let net = root?.data?.totalNetInflow ?? root?.data?.netInflow ?? root?.totalNetInflow ?? root?.netInflow;

  if (net == null && Array.isArray(series) && series.length) {
    const last = series[series.length - 1] as { netInflow?: number; value?: number; inflow?: number };
    net = last.netInflow ?? last.inflow ?? last.value ?? 0;
  }

  const amount = typeof net === "number" ? net : 0;
  return {
    ticker,
    totalNetInflow: amount,
    totalValueTraded: Math.abs(amount) * 10,
    trend: amount < 0 ? ("outflow" as const) : amount > 0 ? ("inflow" as const) : ("neutral" as const),
    days: root?.data?.days ?? 3,
  };
}

async function fetchSoSoValue<T>(
  sourceName: string,
  endpoint: string,
  path: string,
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

  const fresh = cache.get(path);
  if (fresh && fresh.expiresAt > Date.now()) {
    updateApiStatus(sourceName, {
      status: fresh.live ? "live" : "fallback",
      lastFetch: new Date().toISOString(),
      latencyMs: 0,
      endpoint,
    });
    return { data: fresh.data as T, live: fresh.live };
  }

  return enqueueSoSoValue(async () => {
  await throttle();
  const start = Date.now();

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { "x-soso-api-key": apiKey, Accept: "application/json" },
      cache: "no-store",
    });
    const latencyMs = Date.now() - start;

    if (res.status === 429) {
      const stale = getStale(path);
      updateApiStatus(sourceName, {
        status: stale?.live ? "live" : "fallback",
        lastFetch: new Date().toISOString(),
        latencyMs,
        error: stale ? "Rate limited — serving cached live data" : "Rate limit exceeded",
        endpoint,
      });
      if (stale) return stale as { data: T | null; live: boolean };
      return { data: null, live: false };
    }

    if (!res.ok) {
      const stale = getStale(path);
      updateApiStatus(sourceName, {
        status: "fallback",
        lastFetch: new Date().toISOString(),
        latencyMs,
        error: `HTTP ${res.status}`,
        endpoint,
      });
      if (stale?.live) return stale as { data: T | null; live: boolean };
      return { data: null, live: false };
    }

    const data = (await res.json()) as T;
    cache.set(path, { data, live: true, expiresAt: Date.now() + CACHE_TTL_MS });
    updateApiStatus(sourceName, {
      status: "live",
      lastFetch: new Date().toISOString(),
      latencyMs,
      endpoint,
    });
    return { data, live: true };
  } catch (err) {
    const stale = getStale(path);
    updateApiStatus(sourceName, {
      status: "fallback",
      lastFetch: new Date().toISOString(),
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
      endpoint,
    });
    if (stale?.live) return stale as { data: T | null; live: boolean };
    return { data: null, live: false };
  }
  });
}

export async function getNewsFeed() {
  const { data, live } = await fetchSoSoValue<unknown>(
    "SoSoValue News API",
    "/news/hot",
    "/news/hot",
  );

  if (live && data) {
    return { items: parseNewsResponse(data), live: true, raw: data };
  }

  return { items: DEMO_NEWS, live: false, raw: null };
}

export async function getEtfFlow(ticker = "us-btc-spot") {
  const path = `/etf/${ticker}/inflow-chart`;
  const { data, live } = await fetchSoSoValue<unknown>(
    "SoSoValue ETF Flow API",
    path,
    path,
  );

  if (live && data) {
    return { flow: parseEtfFlowResponse(data, ticker), live: true, raw: data };
  }

  return { flow: { ...DEMO_ETF_FLOW, ticker }, live: false, raw: null };
}

export async function getIndices() {
  const { data, live } = await fetchSoSoValue<unknown>(
    "SoSoValue Sector/Index API",
    "/indices",
    "/indices",
  );

  if (live && data) {
    return { indices: data, live: true };
  }

  return { indices: DEMO_INDICES, live: false };
}

export async function getMacroEvents() {
  const { data, live } = await fetchSoSoValue<unknown>(
    "SoSoValue Macro API",
    "/macro/events",
    "/macro/events",
  );

  if (live && data) {
    return { events: data, live: true };
  }

  return {
    events: [{ title: "FOMC rate decision in 48h", impact: "high" }],
    live: false,
  };
}

/** Prefetch SoSoValue sequentially to reduce 429s */
export async function prefetchSoSoValue() {
  await getNewsFeed();
  await getEtfFlow();
  await getIndices();
  await getMacroEvents();
}
