import {
  BTC_PROTECTION_AFTER,
  BTC_PROTECTION_BEFORE,
  DEMO_POSITIONS,
  getDemoPosition,
  RISK_WEIGHTS,
} from "./demo-data";
import type {
  BeforeAfterMetrics,
  MarketContext,
  Position,
  PositionDetail,
  ProtectionOption,
  ProtectionSimulation,
  RiskBreakdown,
  RiskVerdict,
} from "./types";
import { getVerdictFromScore } from "./utils";

export { RISK_WEIGHTS };

export function computeTotalRisk(breakdown: RiskBreakdown): number {
  return Math.round(
    breakdown.liquidityRisk * RISK_WEIGHTS.liquidity +
      breakdown.volatilityRisk * RISK_WEIGHTS.volatility +
      breakdown.positionSizeRisk * RISK_WEIGHTS.positionSize +
      breakdown.macroRisk * RISK_WEIGHTS.macro +
      breakdown.newsRisk * RISK_WEIGHTS.news +
      breakdown.etfFlowRisk * RISK_WEIGHTS.etfFlow +
      breakdown.narrativeRisk * RISK_WEIGHTS.narrative
  );
}

export function getVerdict(score: number): RiskVerdict {
  return getVerdictFromScore(score);
}

export function detectMarketRegime(context: MarketContext): string {
  return context.regime;
}

export function computeRiskBreakdown(position: Position): RiskBreakdown {
  return position.breakdown;
}

export function generateProtectionOptions(position: Position): ProtectionOption[] {
  const isBtc = position.id === "btc-perp";
  const isEth = position.id === "eth-perp";

  if (isBtc) {
    return [
      {
        id: "reduce-35",
        label: "Option A — Reduce",
        type: "reduce",
        description: "Reduce position by 35% and maintain protective stop",
        reducePercent: 35,
        expectedRiskScore: BTC_PROTECTION_AFTER.riskScore,
        expectedDrawdownReduction: 11,
        liquidationDistanceAfter: BTC_PROTECTION_AFTER.liquidationDistance,
        executionComplexity: "low",
        tradeoff: "Locks in partial gains but preserves upside exposure on remaining 65%",
        recommended: true,
      },
      {
        id: "hedge-20",
        label: "Option B — Hedge",
        type: "hedge",
        description: "Open 20% correlated short hedge via BTC perp",
        hedgePercent: 20,
        expectedRiskScore: 58,
        expectedDrawdownReduction: 8,
        liquidationDistanceAfter: 8.5,
        executionComplexity: "medium",
        tradeoff: "Maintains full long exposure but adds funding cost on hedge leg",
        recommended: false,
      },
      {
        id: "close-full",
        label: "Option C — Close",
        type: "stop",
        description: "Close full BTC-PERP long position (reduce-only market exit)",
        expectedRiskScore: 28,
        expectedDrawdownReduction: 14,
        liquidationDistanceAfter: 99,
        executionComplexity: "low",
        tradeoff: "Eliminates exposure entirely but forfeits upside if BTC reverses",
        recommended: false,
      },
    ];
  }

  if (isEth) {
    return [
      {
        id: "hedge-20",
        label: "Option A — Hedge",
        type: "hedge",
        description: "Open 20% ETH short hedge",
        hedgePercent: 20,
        expectedRiskScore: 48,
        expectedDrawdownReduction: 6,
        liquidationDistanceAfter: 18.0,
        executionComplexity: "medium",
        tradeoff: "Reduces directional exposure while maintaining core long thesis",
        recommended: true,
      },
      {
        id: "reduce-25",
        label: "Option B — Reduce",
        type: "reduce",
        description: "Reduce position by 25%",
        reducePercent: 25,
        expectedRiskScore: 52,
        expectedDrawdownReduction: 5,
        liquidationDistanceAfter: 16.5,
        executionComplexity: "low",
        tradeoff: "Simpler execution but gives up more upside than hedge",
        recommended: false,
      },
      {
        id: "stop-protective",
        label: "Option C — Stop",
        type: "stop",
        description: "Place protective stop at $2,780",
        stopPrice: 2_780,
        expectedRiskScore: 55,
        expectedDrawdownReduction: 4,
        liquidationDistanceAfter: 15.0,
        executionComplexity: "low",
        tradeoff: "Passive protection — may not trigger before gap risk",
        recommended: false,
      },
    ];
  }

  const baseAfter = Math.max(15, position.riskScore - 20);
  return [
    {
      id: "reduce-15",
      label: "Option A — Reduce",
      type: "reduce",
      description: "Reduce position by 15%",
      reducePercent: 15,
      expectedRiskScore: baseAfter,
      expectedDrawdownReduction: 3,
      liquidationDistanceAfter: position.liquidationDistance + 3,
      executionComplexity: "low",
      tradeoff: "Minimal intervention for watch-level positions",
      recommended: position.verdict !== "safe",
    },
    {
      id: "hedge-10",
      label: "Option B — Hedge",
      type: "hedge",
      description: "Open 10% hedge",
      hedgePercent: 10,
      expectedRiskScore: baseAfter + 5,
      expectedDrawdownReduction: 2,
      liquidationDistanceAfter: position.liquidationDistance + 2,
      executionComplexity: "medium",
      tradeoff: "Adds complexity for marginal risk reduction",
      recommended: false,
    },
    {
      id: "wait",
      label: "Option C — Wait",
      type: "stop",
      description: "No action — continue monitoring",
      expectedRiskScore: position.riskScore,
      expectedDrawdownReduction: 0,
      liquidationDistanceAfter: position.liquidationDistance,
      executionComplexity: "low",
      tradeoff: "No execution cost but no protection if risk escalates",
      recommended: position.verdict === "safe" || position.verdict === "watch",
    },
  ];
}

export function simulateProtection(
  position: Position,
  option: ProtectionOption
): ProtectionSimulation {
  const before: BeforeAfterMetrics = position.id === "btc-perp"
    ? BTC_PROTECTION_BEFORE
    : {
        riskScore: position.riskScore,
        liquidationDistance: position.liquidationDistance,
        maxDrawdown: position.maxDrawdown,
      };

  const after: BeforeAfterMetrics = {
    riskScore: option.expectedRiskScore,
    liquidationDistance: option.liquidationDistanceAfter,
    maxDrawdown:
      position.maxDrawdown + option.expectedDrawdownReduction * (position.maxDrawdown < 0 ? 1 : -1) * 0.01 * 10,
  };

  if (position.id === "btc-perp" && option.recommended) {
    const before = {
      riskScore: position.riskScore,
      liquidationDistance: position.liquidationDistance,
      maxDrawdown: position.maxDrawdown,
      exposure: position.leverage,
      estimatedLossAt3Pct: -Math.round(position.sizeUsd * 0.03 * position.leverage / position.leverage),
    };
    return {
      before,
      after: {
        ...BTC_PROTECTION_AFTER,
        riskScore: option.expectedRiskScore,
        liquidationDistance: option.liquidationDistanceAfter,
      },
      selectedOption: option,
    };
  }

  after.maxDrawdown = Math.round(
    position.maxDrawdown * (1 - option.expectedDrawdownReduction / 100) * 10
  ) / 10;

  return { before, after, selectedOption: option };
}

export async function getPortfolioData() {
  const { buildLivePositions } = await import("./sodex-account");
  const { buildMarketContext, fetchLiveMarketSnapshot } = await import("./live-market");
  const market = await fetchLiveMarketSnapshot("BTC-USD");
  const ctx = buildMarketContext(market);
  const { positions } = await buildLivePositions();
  const portfolioRiskScore = Math.round(
    positions.reduce((sum, p) => sum + p.riskScore * p.sizeUsd, 0) /
      positions.reduce((sum, p) => sum + p.sizeUsd, 0)
  );

  const positionsAtRisk = positions.filter(
    (p) => p.verdict === "defensive" || p.verdict === "critical"
  ).length;

  const recommendedActions = positions.filter(
    (p) => p.recommendedAction !== "No action" && p.recommendedAction !== "Monitor only"
  ).length;

  return {
    portfolioRiskScore,
    marketRegime: ctx.regime,
    positionsAtRisk,
    recommendedActions,
    positions,
  };
}

export async function getPositionDetail(id: string): Promise<PositionDetail | null> {
  const { buildLivePositionDetail } = await import("./sodex-account");
  const live = await buildLivePositionDetail(id);
  if (live) return live;
  return getDemoPosition(id);
}
