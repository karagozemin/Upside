import type { Position, PositionDetail, RiskBreakdown } from "./types";
import { getVerdictFromScore } from "./utils";
import { RISK_WEIGHTS } from "./demo-data";

function computeTotalRisk(b: RiskBreakdown): number {
  return Math.round(
    b.liquidityRisk * RISK_WEIGHTS.liquidity +
      b.volatilityRisk * RISK_WEIGHTS.volatility +
      b.positionSizeRisk * RISK_WEIGHTS.positionSize +
      b.macroRisk * RISK_WEIGHTS.macro +
      b.newsRisk * RISK_WEIGHTS.news +
      b.etfFlowRisk * RISK_WEIGHTS.etfFlow +
      b.narrativeRisk * RISK_WEIGHTS.narrative,
  );
}
import {
  buildMarketContext,
  computeLiveRiskBreakdown,
  fetchLiveMarketSnapshot,
  orderbookMidPrice,
} from "./live-market";

function getPerpsEndpoint(): string {
  const env = process.env.SODEX_ENV === "mainnet" ? "mainnet" : "testnet";
  return `https://${env}-gw.sodex.dev/api/v1/perps`;
}

export type SoDexRawPosition = {
  symbol?: string;
  symbolName?: string;
  side?: string;
  size?: string | number;
  entryPrice?: string | number;
  markPrice?: string | number;
  leverage?: string | number;
  liquidationPrice?: string | number;
  unrealizedPnl?: string | number;
};

export async function getAccountState(address?: string) {
  const userAddress = address ?? process.env.SODEX_USER_ADDRESS;
  if (!userAddress) return { state: null, live: false };

  const start = Date.now();
  try {
    const res = await fetch(`${getPerpsEndpoint()}/accounts/${userAddress}/state`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return { state: null, live: false };
    const json = await res.json();
    return { state: json.data ?? json, live: true, latencyMs: Date.now() - start };
  } catch {
    return { state: null, live: false };
  }
}

function slugFromSymbol(symbol: string): string {
  return symbol.toLowerCase().replace("-usd", "-perp").replace("/", "-");
}

function mapRawPosition(
  raw: SoDexRawPosition,
  market: Awaited<ReturnType<typeof fetchLiveMarketSnapshot>>,
  breakdown: RiskBreakdown,
): Position {
  const symbol = raw.symbolName ?? raw.symbol ?? "BTC-USD";
  const side = (raw.side?.toLowerCase() === "short" ? "short" : "long") as "long" | "short";
  const size = Math.abs(parseFloat(String(raw.size ?? "0")));
  const currentPrice = parseFloat(String(raw.markPrice ?? orderbookMidPrice(market.orderbook.orderbook)));
  const entryPrice = parseFloat(String(raw.entryPrice ?? currentPrice));
  const leverage = parseFloat(String(raw.leverage ?? "5")) || 5;
  const liqPrice = parseFloat(String(raw.liquidationPrice ?? "0"));
  const liquidationDistance =
    liqPrice > 0 && currentPrice > 0
      ? Math.abs(((currentPrice - liqPrice) / currentPrice) * 100)
      : 8;

  const riskScore = computeTotalRisk(breakdown);
  const verdict = getVerdictFromScore(riskScore);

  return {
    id: slugFromSymbol(symbol),
    asset: symbol.replace("-USD", "-PERP"),
    symbol,
    side,
    size,
    sizeUsd: Math.round(size * currentPrice),
    entryPrice,
    currentPrice,
    leverage,
    liquidationPrice: liqPrice || (side === "long" ? currentPrice * 0.92 : currentPrice * 1.08),
    liquidationDistance: Math.round(liquidationDistance * 10) / 10,
    riskScore,
    verdict,
    recommendedAction: verdict === "critical" ? "Reduce 35%" : verdict === "defensive" ? "Hedge 20%" : "Monitor",
    breakdown,
    maxDrawdown: -Math.round(riskScore / 5),
  };
}

/** Build live BTC position from wallet P[] or live orderbook when wallet is empty */
export async function buildLivePositions(): Promise<{
  positions: Position[];
  walletLive: boolean;
  usedMarketSnapshot: boolean;
}> {
  const address = process.env.SODEX_USER_ADDRESS;
  const market = await fetchLiveMarketSnapshot("BTC-USD");
  const ctx = buildMarketContext(market);

  const { state } = await getAccountState(address);
  const rawList: SoDexRawPosition[] = [];

  const stateP = (state as { P?: SoDexRawPosition[] } | null)?.P;
  if (Array.isArray(stateP) && stateP.length) {
    rawList.push(...stateP);
  }

  if (!rawList.length && address) {
    const { getPositions } = await import("./sodex");
    const { positions: posResp } = await getPositions(address);
    const list = (posResp as { positions?: SoDexRawPosition[] })?.positions
      ?? (Array.isArray(posResp) ? posResp : []);
    if (Array.isArray(list)) rawList.push(...list);
  }

  if (rawList.length) {
    const positions = rawList.map((raw) => {
      const leverage = parseFloat(String(raw.leverage ?? "5")) || 5;
      const liqDist = 8;
      const breakdown = computeLiveRiskBreakdown(leverage, liqDist, ctx);
      return mapRawPosition(raw, market, breakdown);
    });
    return { positions, walletLive: true, usedMarketSnapshot: false };
  }

  const mid = orderbookMidPrice(market.orderbook.orderbook);
  const showcaseSize = parseFloat(process.env.SODEX_SHOWCASE_BTC_SIZE ?? "0.01");
  const leverage = parseFloat(process.env.SODEX_SHOWCASE_LEVERAGE ?? "5");
  const entry = mid * 0.985;
  const liqPrice = entry * (1 - 0.12 / leverage);
  const liquidationDistance = ((mid - liqPrice) / mid) * 100;
  const breakdown = computeLiveRiskBreakdown(leverage, liquidationDistance, ctx);
  const riskScore = computeTotalRisk(breakdown);

  const btc: Position = {
    id: "btc-perp",
    asset: "BTC-PERP",
    symbol: "BTC-USD",
    side: "long",
    size: showcaseSize,
    sizeUsd: Math.round(showcaseSize * mid),
    entryPrice: Math.round(entry * 100) / 100,
    currentPrice: Math.round(mid * 100) / 100,
    leverage,
    liquidationPrice: Math.round(liqPrice * 100) / 100,
    liquidationDistance: Math.round(liquidationDistance * 10) / 10,
    riskScore,
    verdict: getVerdictFromScore(riskScore),
    recommendedAction: riskScore >= 80 ? "Reduce 35%" : riskScore >= 60 ? "Hedge 20%" : "Monitor",
    breakdown,
    maxDrawdown: -Math.round(riskScore / 4),
  };

  return { positions: [btc], walletLive: !!address, usedMarketSnapshot: true };
}

export async function buildLivePositionDetail(id: string): Promise<PositionDetail | null> {
  const { positions } = await buildLivePositions();
  const position = positions.find((p) => p.id === id);
  if (!position) return null;

  const market = await fetchLiveMarketSnapshot(position.symbol);
  const ctx = buildMarketContext(market);

  return { ...position, marketContext: ctx };
}
