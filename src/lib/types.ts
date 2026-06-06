export type RiskVerdict = "safe" | "watch" | "defensive" | "critical";
export type DataMode = "live" | "demo" | "mixed";
export type ApiStatus = "live" | "fallback" | "pending";
export type ExecutionMode = "testnet" | "simulated";
export type NarrativeState =
  | "rising"
  | "stable"
  | "overheated"
  | "breaking_down"
  | "high_volatility"
  | "negative_flow";

export interface RiskBreakdown {
  liquidityRisk: number;
  volatilityRisk: number;
  positionSizeRisk: number;
  macroRisk: number;
  newsRisk: number;
  etfFlowRisk: number;
  narrativeRisk: number;
}

export interface RiskWeights {
  liquidity: 0.25;
  volatility: 0.2;
  positionSize: 0.2;
  macro: 0.15;
  news: 0.1;
  etfFlow: 0.05;
  narrative: 0.05;
}

export interface Position {
  id: string;
  asset: string;
  symbol: string;
  side: "long" | "short";
  size: number;
  sizeUsd: number;
  entryPrice: number;
  currentPrice: number;
  leverage: number;
  liquidationPrice: number;
  liquidationDistance: number;
  riskScore: number;
  verdict: RiskVerdict;
  recommendedAction: string;
  breakdown: RiskBreakdown;
  maxDrawdown: number;
}

export interface MarketContext {
  regime: string;
  liquidityDepthUsd: number;
  slippageEstimate: number;
  newsSentiment: "positive" | "neutral" | "negative";
  etfFlowDirection: "inflow" | "outflow" | "neutral";
  etfFlowAmount: number;
  macroEvent: string;
  narrativeNote: string;
  relatedNews: string[];
}

export interface PositionDetail extends Position {
  marketContext: MarketContext;
}

export interface ProtectionOption {
  id: string;
  label: string;
  type: "reduce" | "hedge" | "stop";
  description: string;
  reducePercent?: number;
  hedgePercent?: number;
  stopPrice?: number;
  expectedRiskScore: number;
  expectedDrawdownReduction: number;
  liquidationDistanceAfter: number;
  executionComplexity: "low" | "medium" | "high";
  tradeoff: string;
  recommended: boolean;
}

export interface BeforeAfterMetrics {
  riskScore: number;
  liquidationDistance: number;
  maxDrawdown: number;
}

export interface ProtectionSimulation {
  before: BeforeAfterMetrics;
  after: BeforeAfterMetrics;
  selectedOption: ProtectionOption;
}

export interface RiskMemo {
  memoId: string;
  positionId: string;
  generatedAt: string;
  verdict: string;
  summary: string;
  reasons: string[];
  evidence: string[];
  recommendedAction: string;
  confidence: number;
  invalidationTriggers: string[];
  source: "groq" | "fallback";
}

export interface NarrativeSector {
  id: string;
  name: string;
  state: NarrativeState;
  stateLabel: string;
  affectedPositions: string[];
  connectionCopy: string;
}

export interface ReplayEvent {
  id: string;
  timestamp: string;
  time: string;
  title: string;
  description: string;
  riskScoreBefore?: number;
  riskScoreAfter?: number;
  type: "data" | "risk" | "ai" | "action" | "result";
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  position: string;
  positionId: string;
  dataSources: string[];
  riskScoreBefore: number;
  riskScoreAfter: number;
  memoId: string | null;
  actionRecommended: string;
  actionStatus: "accepted" | "rejected" | "pending" | "simulated";
  executionStatus: "executed" | "simulated" | "failed" | "pending";
}

export interface ApiSourceStatus {
  name: string;
  endpoint: string;
  status: ApiStatus;
  lastFetch: string | null;
  latencyMs: number | null;
  error?: string;
}

export interface OrderPreview {
  orderType: string;
  asset: string;
  side: string;
  size: number;
  estimatedPrice: number;
  estimatedSlippage: number;
  reduceOnly: boolean;
  expectedRiskReduction: number;
}

export interface ExecutionResult {
  success: boolean;
  executionMode: ExecutionMode;
  orderId?: string;
  message: string;
  riskScoreBefore: number;
  riskScoreAfter: number;
}

export interface PortfolioSummary {
  portfolioRiskScore: number;
  marketRegime: string;
  positionsAtRisk: number;
  recommendedActions: number;
  dataMode: DataMode;
  positions: Position[];
}

export interface ApiResponse<T> {
  data: T;
  meta: {
    mode: DataMode;
    timestamp: string;
  };
}
