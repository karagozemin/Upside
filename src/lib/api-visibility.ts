import type { ApiSourceStatus, DataMode } from "./types";

const SOURCES: ApiSourceStatus[] = [
  {
    name: "SoSoValue News API",
    endpoint: "/news/hot",
    status: "pending",
    lastFetch: null,
    latencyMs: null,
  },
  {
    name: "SoSoValue ETF Flow API",
    endpoint: "POST /v2/etf/historicalInflowChart",
    status: "pending",
    lastFetch: null,
    latencyMs: null,
  },
  {
    name: "SoSoValue Sector/Index API",
    endpoint: "/indices",
    status: "pending",
    lastFetch: null,
    latencyMs: null,
  },
  {
    name: "SoDEX Orderbook API",
    endpoint: "/markets/{symbol}/orderbook",
    status: "pending",
    lastFetch: null,
    latencyMs: null,
  },
  {
    name: "SoDEX Position/Balance API",
    endpoint: "/accounts/{address}/positions",
    status: "pending",
    lastFetch: null,
    latencyMs: null,
  },
  {
    name: "AI Provider (Groq)",
    endpoint: "/openai/v1/chat/completions",
    status: "pending",
    lastFetch: null,
    latencyMs: null,
  },
];

let registry: ApiSourceStatus[] = SOURCES.map((s) => ({ ...s }));

export function updateApiStatus(
  name: string,
  update: Partial<Pick<ApiSourceStatus, "status" | "lastFetch" | "latencyMs" | "error" | "endpoint">>
): void {
  registry = registry.map((s) => (s.name === name ? { ...s, ...update } : s));
}

export function getApiVisibility(): ApiSourceStatus[] {
  return registry.map((s) => ({ ...s }));
}

export function getDataMode(): DataMode {
  const statuses = registry.map((s) => s.status);
  const live = statuses.filter((s) => s === "live").length;
  const fallback = statuses.filter((s) => s === "fallback").length;
  const resolved = live + fallback;

  if (resolved === 0) return "demo";
  if (live === resolved) return "live";
  if (fallback === resolved) return "demo";
  return "mixed";
}

export function resetApiVisibility(): void {
  registry = SOURCES.map((s) => ({ ...s }));
}
