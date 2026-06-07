import { getOrderbook } from "./sodex";
import { getEtfFlow, getIndices, getMacroEvents, getNewsFeed } from "./sosovalue";
import type { MarketContext, RiskBreakdown } from "./types";

export type LiveMarketSnapshot = {
  news: Awaited<ReturnType<typeof getNewsFeed>>;
  etf: Awaited<ReturnType<typeof getEtfFlow>>;
  indices: Awaited<ReturnType<typeof getIndices>>;
  macro: Awaited<ReturnType<typeof getMacroEvents>>;
  orderbook: Awaited<ReturnType<typeof getOrderbook>>;
};

export async function fetchLiveMarketSnapshot(symbol = "BTC-USD"): Promise<LiveMarketSnapshot> {
  const news = await getNewsFeed();
  const etf = await getEtfFlow();
  const indices = await getIndices();
  const macro = await getMacroEvents();
  const orderbook = await getOrderbook(symbol);
  return { news, etf, indices, macro, orderbook };
}

export function orderbookMidPrice(orderbook: unknown): number {
  const ob = orderbook as {
    bids?: Array<[string, string]>;
    asks?: Array<[string, string]>;
  };
  const bid = parseFloat(ob?.bids?.[0]?.[0] ?? "0");
  const ask = parseFloat(ob?.asks?.[0]?.[0] ?? "0");
  if (bid && ask) return (bid + ask) / 2;
  return bid || ask || 61_000;
}

export function orderbookDepthUsd(orderbook: unknown): number {
  const ob = orderbook as { bids?: Array<[string, string]>; asks?: Array<[string, string]> };
  const sum = (side?: Array<[string, string]>) =>
    (side ?? []).reduce((acc, [p, s]) => acc + parseFloat(p) * parseFloat(s), 0);
  const depth = sum(ob.bids) + sum(ob.asks);
  return depth > 0 ? depth : 2_400_000;
}

export function buildMarketContext(snapshot: LiveMarketSnapshot): MarketContext {
  const negativeNews = snapshot.news.items.filter((n) => n.sentiment === "negative").length;
  const sentiment =
    negativeNews >= 2 ? "negative" : negativeNews === 0 ? "positive" : "neutral";

  const etfAmount = snapshot.etf.flow.totalNetInflow ?? 0;
  const etfDir = snapshot.etf.flow.trend ?? "neutral";

  const macroList = snapshot.macro.events as Array<{ title?: string }> | { data?: Array<{ title?: string }> };
  const macroEvents = Array.isArray(macroList) ? macroList : (macroList as { data?: Array<{ title?: string }> })?.data ?? [];
  const macroEvent = macroEvents[0]?.title ?? "Macro event window active";

  const depth = orderbookDepthUsd(snapshot.orderbook.orderbook);
  const slippage = depth < 1_500_000 ? 0.45 : depth < 3_000_000 ? 0.28 : 0.15;

  const idxRoot = snapshot.indices.indices as { data?: Array<{ name?: string; change24h?: number }> };
  const idxList = Array.isArray(snapshot.indices.indices)
    ? (snapshot.indices.indices as Array<{ name?: string; change24h?: number }>)
    : idxRoot?.data ?? [];
  const btcIdx = idxList.find((i) => /btc/i.test(i.name ?? ""));
  const narrativeNote = btcIdx
    ? `BTC index ${btcIdx.change24h ?? 0}% 24h — live SoSoValue sector data`
    : "Sector indices monitored via live SoSoValue feed";

  return {
    regime: etfDir === "outflow" || sentiment === "negative" ? "Risk-Off Volatile" : "Mixed / Rotational",
    liquidityDepthUsd: Math.round(depth),
    slippageEstimate: slippage,
    newsSentiment: sentiment,
    etfFlowDirection: etfDir as MarketContext["etfFlowDirection"],
    etfFlowAmount: etfAmount,
    macroEvent,
    narrativeNote,
    relatedNews: snapshot.news.items.map((n) => n.title),
  };
}

export function computeLiveRiskBreakdown(
  leverage: number,
  liquidationDistance: number,
  ctx: MarketContext,
): RiskBreakdown {
  const liquidityRisk = Math.min(100, Math.round(40 + ctx.slippageEstimate * 80 + (ctx.liquidityDepthUsd < 2_000_000 ? 25 : 0)));
  const volatilityRisk = Math.min(100, Math.round(ctx.regime.includes("Risk-Off") ? 78 : 55));
  const positionSizeRisk = Math.min(100, Math.round(35 + leverage * 6 + (liquidationDistance < 6 ? 25 : 0)));
  const macroRisk = Math.min(100, Math.round(55 + (ctx.macroEvent.toLowerCase().includes("fomc") ? 20 : 10)));
  const newsRisk = Math.min(100, Math.round(ctx.newsSentiment === "negative" ? 75 : ctx.newsSentiment === "positive" ? 30 : 50));
  const etfFlowRisk = Math.min(100, Math.round(ctx.etfFlowDirection === "outflow" ? 85 : ctx.etfFlowDirection === "inflow" ? 25 : 45));
  const narrativeRisk = Math.min(100, Math.round(ctx.newsSentiment === "negative" ? 68 : 42));

  return { liquidityRisk, volatilityRisk, positionSizeRisk, macroRisk, newsRisk, etfFlowRisk, narrativeRisk };
}
