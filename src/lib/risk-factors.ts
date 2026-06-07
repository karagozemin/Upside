import { RISK_WEIGHTS } from "./demo-data";
import type { PositionDetail, RiskBreakdown } from "./types";

export interface RiskFactor {
  id: string;
  label: string;
  weight: number;
  score: number;
  contribution: number;
  why: string;
}

const FACTOR_META: Record<keyof RiskBreakdown, { label: string; why: (p: PositionDetail) => string }> = {
  liquidityRisk: {
    label: "Liquidity / Slippage",
    why: (p) =>
      `SoDEX orderbook depth is $${(p.marketContext.liquidityDepthUsd / 1_000_000).toFixed(1)}M with ~${p.marketContext.slippageEstimate}% slippage for this size`,
  },
  volatilityRisk: {
    label: "Market Stress",
    why: (p) => `Regime: ${p.marketContext.regime} — elevated vol into ${p.marketContext.macroEvent}`,
  },
  positionSizeRisk: {
    label: "Position Exposure",
    why: (p) => `${p.leverage}x ${p.side} on ${p.asset} — stop distance too close to liquidation band (${p.liquidationDistance}%)`,
  },
  macroRisk: {
    label: "Macro Events",
    why: (p) => p.marketContext.macroEvent,
  },
  newsRisk: {
    label: "News / Narrative Shock",
    why: (p) =>
      `News sentiment ${p.marketContext.newsSentiment} — ${p.marketContext.relatedNews[0] ?? "negative catalyst detected"}`,
  },
  etfFlowRisk: {
    label: "ETF / Institutional Flow",
    why: (p) =>
      `ETF ${p.marketContext.etfFlowDirection} $${Math.abs(p.marketContext.etfFlowAmount / 1_000_000).toFixed(0)}M (SoSoValue)`,
  },
  narrativeRisk: {
    label: "Sector Narrative",
    why: (p) => p.marketContext.narrativeNote,
  },
};

const KEY_MAP: Record<keyof RiskBreakdown, keyof typeof RISK_WEIGHTS> = {
  liquidityRisk: "liquidity",
  volatilityRisk: "volatility",
  positionSizeRisk: "positionSize",
  macroRisk: "macro",
  newsRisk: "news",
  etfFlowRisk: "etfFlow",
  narrativeRisk: "narrative",
};

export function buildRiskFactors(position: PositionDetail): RiskFactor[] {
  const b = position.breakdown;
  return (Object.keys(FACTOR_META) as (keyof RiskBreakdown)[]).map((key) => {
    const weight = RISK_WEIGHTS[KEY_MAP[key]];
    const score = b[key];
    const contribution = Math.round(score * weight);
    return {
      id: key,
      label: FACTOR_META[key].label,
      weight,
      score,
      contribution,
      why: FACTOR_META[key].why(position),
    };
  }).sort((a, b) => b.contribution - a.contribution);
}

export function buildRiskWhyBullets(position: PositionDetail): string[] {
  return buildRiskFactors(position)
    .slice(0, 5)
    .map((f) => `${f.label} (${f.score}/100): ${f.why}`);
}
