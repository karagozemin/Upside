import type {
  AuditEntry,
  MarketContext,
  NarrativeSector,
  Position,
  PositionDetail,
  ReplayEvent,
  RiskBreakdown,
} from "./types";
import { getVerdictFromScore } from "./utils";

export const RISK_WEIGHTS = {
  liquidity: 0.25,
  volatility: 0.2,
  positionSize: 0.2,
  macro: 0.15,
  news: 0.1,
  etfFlow: 0.05,
  narrative: 0.05,
} as const;

function computeTotalRisk(b: RiskBreakdown): number {
  return Math.round(
    b.liquidityRisk * RISK_WEIGHTS.liquidity +
      b.volatilityRisk * RISK_WEIGHTS.volatility +
      b.positionSizeRisk * RISK_WEIGHTS.positionSize +
      b.macroRisk * RISK_WEIGHTS.macro +
      b.newsRisk * RISK_WEIGHTS.news +
      b.etfFlowRisk * RISK_WEIGHTS.etfFlow +
      b.narrativeRisk * RISK_WEIGHTS.narrative
  );
}

const BTC_BREAKDOWN: RiskBreakdown = {
  liquidityRisk: 88,
  volatilityRisk: 82,
  positionSizeRisk: 85,
  macroRisk: 78,
  newsRisk: 72,
  etfFlowRisk: 91,
  narrativeRisk: 65,
};

const ETH_BREAKDOWN: RiskBreakdown = {
  liquidityRisk: 55,
  volatilityRisk: 68,
  positionSizeRisk: 72,
  macroRisk: 60,
  newsRisk: 58,
  etfFlowRisk: 45,
  narrativeRisk: 50,
};

const SOL_BREAKDOWN: RiskBreakdown = {
  liquidityRisk: 42,
  volatilityRisk: 55,
  positionSizeRisk: 38,
  macroRisk: 45,
  newsRisk: 52,
  etfFlowRisk: 30,
  narrativeRisk: 48,
};

const RWA_BREAKDOWN: RiskBreakdown = {
  liquidityRisk: 18,
  volatilityRisk: 22,
  positionSizeRisk: 15,
  macroRisk: 25,
  newsRisk: 20,
  etfFlowRisk: 10,
  narrativeRisk: 18,
};

const BTC_MARKET_CONTEXT: MarketContext = {
  regime: "Risk-Off Volatile",
  liquidityDepthUsd: 2_400_000,
  slippageEstimate: 0.42,
  newsSentiment: "negative",
  etfFlowDirection: "outflow",
  etfFlowAmount: -127_000_000,
  macroEvent: "FOMC rate decision in 48h",
  narrativeNote: "BTC ETF narrative weakening — outflows accelerating",
  relatedNews: [
    "BlackRock BTC ETF records 3rd consecutive outflow day",
    "BTC orderbook depth thins 18% on SoDEX perps",
    "Macro desk flags elevated vol into FOMC window",
  ],
};

const ETH_MARKET_CONTEXT: MarketContext = {
  regime: "Risk-Off Volatile",
  liquidityDepthUsd: 1_800_000,
  slippageEstimate: 0.28,
  newsSentiment: "neutral",
  etfFlowDirection: "outflow",
  etfFlowAmount: -42_000_000,
  macroEvent: "FOMC rate decision in 48h",
  narrativeNote: "ETH correlation to BTC elevated — defensive hedge warranted",
  relatedNews: [
    "ETH perp funding turns negative across majors",
    "L2 narrative stable but macro headwinds persist",
  ],
};

const SOL_MARKET_CONTEXT: MarketContext = {
  regime: "Mixed / Rotational",
  liquidityDepthUsd: 980_000,
  slippageEstimate: 0.35,
  newsSentiment: "neutral",
  etfFlowDirection: "neutral",
  etfFlowAmount: 0,
  macroEvent: "Solana ecosystem upgrade scheduled",
  narrativeNote: "Solana ecosystem news momentum weakened while liquidity thinned on SoDEX",
  relatedNews: [
    "SOL short position benefits from ecosystem sentiment fade",
    "DePIN sector showing mixed signals",
  ],
};

const RWA_MARKET_CONTEXT: MarketContext = {
  regime: "Stable / Low Vol",
  liquidityDepthUsd: 620_000,
  slippageEstimate: 0.12,
  newsSentiment: "positive",
  etfFlowDirection: "inflow",
  etfFlowAmount: 18_000_000,
  macroEvent: "No imminent macro catalyst",
  narrativeNote: "RWA sector narrative stable — tokenized treasury demand steady",
  relatedNews: ["RWA index constituents show steady inflows", "Treasury tokenization narrative intact"],
};

export const DEMO_POSITIONS: Position[] = [
  {
    id: "btc-perp",
    asset: "BTC-PERP",
    symbol: "BTC-USD",
    side: "long",
    size: 1.25,
    sizeUsd: 76_250,
    entryPrice: 58_400,
    currentPrice: 61_000,
    leverage: 8,
    liquidationPrice: 58_440,
    liquidationDistance: 4.2,
    riskScore: computeTotalRisk(BTC_BREAKDOWN),
    verdict: getVerdictFromScore(computeTotalRisk(BTC_BREAKDOWN)),
    recommendedAction: "Reduce 35% + protective stop",
    breakdown: BTC_BREAKDOWN,
    maxDrawdown: -18,
  },
  {
    id: "eth-perp",
    asset: "ETH-PERP",
    symbol: "ETH-USD",
    side: "long",
    size: 18.5,
    sizeUsd: 55_500,
    entryPrice: 2_850,
    currentPrice: 3_000,
    leverage: 6,
    liquidationPrice: 2_620,
    liquidationDistance: 12.7,
    riskScore: computeTotalRisk(ETH_BREAKDOWN),
    verdict: getVerdictFromScore(computeTotalRisk(ETH_BREAKDOWN)),
    recommendedAction: "Hedge 20%",
    breakdown: ETH_BREAKDOWN,
    maxDrawdown: -12,
  },
  {
    id: "sol-perp",
    asset: "SOL-PERP",
    symbol: "SOL-USD",
    side: "short",
    size: 420,
    sizeUsd: 63_000,
    entryPrice: 158,
    currentPrice: 150,
    leverage: 5,
    liquidationPrice: 172,
    liquidationDistance: 14.7,
    riskScore: computeTotalRisk(SOL_BREAKDOWN),
    verdict: getVerdictFromScore(computeTotalRisk(SOL_BREAKDOWN)),
    recommendedAction: "No action",
    breakdown: SOL_BREAKDOWN,
    maxDrawdown: -8,
  },
  {
    id: "rwa-basket",
    asset: "RWA Basket",
    symbol: "RWA-INDEX",
    side: "long",
    size: 1,
    sizeUsd: 25_000,
    entryPrice: 24_500,
    currentPrice: 25_000,
    leverage: 2,
    liquidationPrice: 18_000,
    liquidationDistance: 28.0,
    riskScore: computeTotalRisk(RWA_BREAKDOWN),
    verdict: getVerdictFromScore(computeTotalRisk(RWA_BREAKDOWN)),
    recommendedAction: "Monitor only",
    breakdown: RWA_BREAKDOWN,
    maxDrawdown: -4,
  },
];

const MARKET_CONTEXTS: Record<string, MarketContext> = {
  "btc-perp": BTC_MARKET_CONTEXT,
  "eth-perp": ETH_MARKET_CONTEXT,
  "sol-perp": SOL_MARKET_CONTEXT,
  "rwa-basket": RWA_MARKET_CONTEXT,
};

export function getDemoPosition(id: string): PositionDetail | null {
  const position = DEMO_POSITIONS.find((p) => p.id === id);
  if (!position) return null;
  return {
    ...position,
    marketContext: MARKET_CONTEXTS[id] ?? BTC_MARKET_CONTEXT,
  };
}

export const BTC_PROTECTION_AFTER = {
  riskScore: 43,
  liquidationDistance: 11.7,
  maxDrawdown: -7,
};

export const BTC_PROTECTION_BEFORE = {
  riskScore: 84,
  liquidationDistance: 4.2,
  maxDrawdown: -18,
};

export const DEMO_NARRATIVE_SECTORS: NarrativeSector[] = [
  {
    id: "ai-tokens",
    name: "AI Tokens",
    state: "overheated",
    stateLabel: "Overheated",
    affectedPositions: [],
    connectionCopy: "AI sector momentum elevated — watch for mean reversion risk on correlated longs",
  },
  {
    id: "rwa",
    name: "RWA",
    state: "stable",
    stateLabel: "Stable",
    affectedPositions: ["rwa-basket"],
    connectionCopy: "RWA narrative stable — your basket exposure remains within safe parameters",
  },
  {
    id: "depin",
    name: "DePIN",
    state: "rising",
    stateLabel: "Rising",
    affectedPositions: ["sol-perp"],
    connectionCopy: "DePIN narrative rising but SOL short benefits from ecosystem sentiment fade",
  },
  {
    id: "meme",
    name: "Meme",
    state: "high_volatility",
    stateLabel: "High Volatility",
    affectedPositions: [],
    connectionCopy: "Meme sector in high-vol regime — avoid adding correlated speculative exposure",
  },
  {
    id: "btc-etf",
    name: "BTC ETF",
    state: "negative_flow",
    stateLabel: "Negative Flow",
    affectedPositions: ["btc-perp", "eth-perp"],
    connectionCopy:
      "BTC ETF outflows accelerating — your BTC long risk increased because ETF flows weakened while SoDEX liquidity thinned",
  },
];

export const DEMO_REPLAY_EVENTS: ReplayEvent[] = [
  {
    id: "r1",
    timestamp: "2026-06-06T10:20:00Z",
    time: "10:20",
    title: "ETF outflow detected",
    description: "SoSoValue ETF flow API reports -$127M BTC spot ETF outflow",
    type: "data",
  },
  {
    id: "r2",
    timestamp: "2026-06-06T10:34:00Z",
    time: "10:34",
    title: "BTC liquidity thinned",
    description: "SoDEX orderbook depth dropped 18% — slippage estimate rising",
    type: "data",
  },
  {
    id: "r3",
    timestamp: "2026-06-06T10:51:00Z",
    time: "10:51",
    title: "Negative macro headline detected",
    description: "FOMC rate decision window flagged — macro risk score elevated",
    type: "data",
  },
  {
    id: "r4",
    timestamp: "2026-06-06T10:55:00Z",
    time: "10:55",
    title: "Risk score escalated",
    description: "Portfolio risk engine recalculated position risk",
    riskScoreBefore: 62,
    riskScoreAfter: 84,
    type: "risk",
  },
  {
    id: "r5",
    timestamp: "2026-06-06T10:56:00Z",
    time: "10:56",
    title: "AI memo generated",
    description: "Groq risk analyst memo: Critical verdict — reduce 35% + protective stop",
    type: "ai",
  },
  {
    id: "r6",
    timestamp: "2026-06-06T10:58:00Z",
    time: "10:58",
    title: "Protection plan simulated",
    description: "Option A selected: Reduce 35% — projected risk 84 → 43",
    type: "action",
  },
  {
    id: "r7",
    timestamp: "2026-06-06T11:01:00Z",
    time: "11:01",
    title: "User approved reduce-only order",
    description: "Trader confirmed protection plan via SoDEX action preview",
    type: "action",
  },
  {
    id: "r8",
    timestamp: "2026-06-06T11:02:00Z",
    time: "11:02",
    title: "Portfolio risk reduced",
    description: "Protection executed — portfolio risk dropped",
    riskScoreBefore: 84,
    riskScoreAfter: 43,
    type: "result",
  },
];

export const DEMO_AUDIT_ENTRIES: AuditEntry[] = [
  {
    id: "a1",
    timestamp: "2026-06-06T10:55:00Z",
    position: "BTC-PERP Long",
    positionId: "btc-perp",
    dataSources: ["SoSoValue ETF Flow", "SoSoValue News", "SoDEX Orderbook"],
    riskScoreBefore: 62,
    riskScoreAfter: 84,
    memoId: null,
    actionRecommended: "Monitor — risk escalating",
    actionStatus: "pending",
    executionStatus: "pending",
  },
  {
    id: "a2",
    timestamp: "2026-06-06T10:56:00Z",
    position: "BTC-PERP Long",
    positionId: "btc-perp",
    dataSources: ["SoSoValue ETF Flow", "SoSoValue News", "SoDEX Orderbook", "Groq AI"],
    riskScoreBefore: 84,
    riskScoreAfter: 84,
    memoId: "memo-btc-001",
    actionRecommended: "Reduce 35% + protective stop",
    actionStatus: "pending",
    executionStatus: "pending",
  },
  {
    id: "a3",
    timestamp: "2026-06-06T11:01:00Z",
    position: "BTC-PERP Long",
    positionId: "btc-perp",
    dataSources: ["SoSoValue ETF Flow", "SoSoValue News", "SoDEX Orderbook", "Groq AI", "SoDEX Execution"],
    riskScoreBefore: 84,
    riskScoreAfter: 43,
    memoId: "memo-btc-001",
    actionRecommended: "Reduce 35% + protective stop",
    actionStatus: "accepted",
    executionStatus: "simulated",
  },
];

export const DEMO_ORDERBOOK = {
  symbol: "BTC-USD",
  bids: [
    ["60950", "12.5"],
    ["60900", "8.3"],
    ["60850", "15.2"],
    ["60800", "22.1"],
    ["60750", "18.7"],
  ],
  asks: [
    ["61050", "10.2"],
    ["61100", "7.8"],
    ["61150", "14.5"],
    ["61200", "19.3"],
    ["61250", "16.1"],
  ],
  totalBidDepthUsd: 2_400_000,
  totalAskDepthUsd: 2_100_000,
};

export const DEMO_ETF_FLOW = {
  ticker: "us-btc-spot",
  totalNetInflow: -127_000_000,
  totalValueTraded: 1_200_000_000,
  trend: "outflow" as const,
  days: 3,
};

export const DEMO_NEWS = [
  {
    title: "BlackRock BTC ETF records 3rd consecutive outflow day",
    sentiment: "negative" as const,
    source: "SoSoValue Feeds",
  },
  {
    title: "BTC perp funding rates turn sharply negative",
    sentiment: "negative" as const,
    source: "SoSoValue Feeds",
  },
  {
    title: "FOMC preview: markets price 85% hold probability",
    sentiment: "neutral" as const,
    source: "SoSoValue Macro",
  },
];

export const DEMO_INDICES = [
  { ticker: "SOAI", name: "AI Tokens Index", change24h: 8.2 },
  { ticker: "SORWA", name: "RWA Index", change24h: 0.4 },
  { ticker: "SODEPIN", name: "DePIN Index", change24h: 3.1 },
  { ticker: "SOMEME", name: "Meme Index", change24h: -12.5 },
  { ticker: "SOBTC", name: "BTC Index", change24h: -2.8 },
];

export function getPortfolioRiskScore(): number {
  const scores = DEMO_POSITIONS.map((p) => p.riskScore);
  const weights = DEMO_POSITIONS.map((p) => p.sizeUsd);
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const weighted = scores.reduce((sum, score, i) => sum + score * weights[i], 0);
  return Math.round(weighted / totalWeight);
}
