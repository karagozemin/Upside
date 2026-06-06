import Groq from "groq-sdk";
import { z } from "zod";
import { updateApiStatus } from "./api-visibility";
import type { PositionDetail, RiskMemo } from "./types";
import { generateId } from "./utils";

const MemoSchema = z.object({
  verdict: z.string(),
  summary: z.string(),
  reasons: z.array(z.string()),
  evidence: z.array(z.string()),
  recommendedAction: z.string(),
  confidence: z.number().min(0).max(100),
  invalidationTriggers: z.array(z.string()),
});

function forceDemo(): boolean {
  return process.env.NEXT_PUBLIC_FORCE_DEMO === "true";
}

function generateFallbackMemo(position: PositionDetail): RiskMemo {
  const ctx = position.marketContext;

  if (position.id === "btc-perp") {
    return {
      memoId: `memo-${position.id}-${generateId()}`,
      positionId: position.id,
      generatedAt: new Date().toISOString(),
      verdict: "Critical",
      summary:
        "Your BTC long is currently exposed to a critical risk regime. ETF flows have weakened, BTC-related news sentiment has turned negative, and SoDEX liquidity depth is thinner than normal. The position is not invalid yet, but the liquidation distance is too narrow for the current volatility. Upside recommends reducing 35% of the position and placing a protective stop until the macro event window passes.",
      reasons: [
        "ETF outflows accelerating (-$127M over 3 days)",
        "SoDEX orderbook depth thinned 18% — elevated slippage risk",
        "FOMC rate decision in 48h — macro vol window active",
        "Liquidation distance at 4.2% — insufficient buffer for current vol regime",
      ],
      evidence: [
        `SoSoValue ETF Flow: ${ctx.etfFlowDirection} $${Math.abs(ctx.etfFlowAmount).toLocaleString()}`,
        `SoDEX liquidity depth: $${ctx.liquidityDepthUsd.toLocaleString()} (below 30d avg)`,
        `News sentiment: ${ctx.newsSentiment}`,
        `Liquidation distance: ${position.liquidationDistance}% at ${position.leverage}x leverage`,
      ],
      recommendedAction: "Reduce 35% + place protective stop at $59,800",
      confidence: 87,
      invalidationTriggers: [
        "BTC ETF flows reverse to 2+ consecutive inflow days",
        "Liquidation distance widens above 8% without size reduction",
        "SoDEX orderbook depth recovers above $4M",
        "VIX-equivalent crypto vol index drops below 45",
      ],
      source: "fallback",
    };
  }

  const verdictMap = {
    safe: "Safe",
    watch: "Watch",
    defensive: "Defensive",
    critical: "Critical",
  };

  return {
    memoId: `memo-${position.id}-${generateId()}`,
    positionId: position.id,
    generatedAt: new Date().toISOString(),
    verdict: verdictMap[position.verdict],
    summary: `Your ${position.asset} ${position.side} position is in ${verdictMap[position.verdict].toLowerCase()} territory. ${ctx.narrativeNote}. Upside recommends: ${position.recommendedAction}.`,
    reasons: [
      `Risk score at ${position.riskScore}/100`,
      `Market regime: ${ctx.regime}`,
      `ETF flow: ${ctx.etfFlowDirection}`,
      ctx.macroEvent,
    ],
    evidence: ctx.relatedNews,
    recommendedAction: position.recommendedAction,
    confidence: position.verdict === "critical" ? 85 : position.verdict === "defensive" ? 72 : 60,
    invalidationTriggers: [
      "Risk score drops below 50 for 24h",
      "Liquidation distance widens above 10%",
      "Macro catalyst passes without vol expansion",
    ],
    source: "fallback",
  };
}

export async function generateRiskMemo(position: PositionDetail): Promise<RiskMemo> {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || forceDemo()) {
    updateApiStatus("AI Provider (Groq)", {
      status: "fallback",
      lastFetch: new Date().toISOString(),
      latencyMs: 0,
      error: apiKey ? "Forced demo mode" : "Missing GROQ_API_KEY",
    });
    return generateFallbackMemo(position);
  }

  const start = Date.now();
  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile";

  try {
    const groq = new Groq({ apiKey });
    const ctx = position.marketContext;

    const completion = await groq.chat.completions.create({
      model,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a professional crypto risk analyst at Upside, an AI risk desk for on-chain traders. 
Write concise, evidence-backed risk memos. No hype, no trading signals. Focus on capital protection.
Respond in JSON with fields: verdict, summary, reasons (array), evidence (array), recommendedAction, confidence (0-100), invalidationTriggers (array).`,
        },
        {
          role: "user",
          content: `Analyze this position and generate a risk memo:
Asset: ${position.asset} ${position.side}
Size: ${position.size} ($${position.sizeUsd})
Entry: $${position.entryPrice} | Current: $${position.currentPrice}
Leverage: ${position.leverage}x | Liquidation distance: ${position.liquidationDistance}%
Risk Score: ${position.riskScore}/100
Breakdown: Liquidity ${position.breakdown.liquidityRisk}, Volatility ${position.breakdown.volatilityRisk}, Position Size ${position.breakdown.positionSizeRisk}, Macro ${position.breakdown.macroRisk}, News ${position.breakdown.newsRisk}, ETF Flow ${position.breakdown.etfFlowRisk}, Narrative ${position.breakdown.narrativeRisk}
Market Regime: ${ctx.regime}
ETF Flow: ${ctx.etfFlowDirection} $${Math.abs(ctx.etfFlowAmount)}
News: ${ctx.relatedNews.join("; ")}
Macro: ${ctx.macroEvent}`,
        },
      ],
    });

    const latencyMs = Date.now() - start;
    const content = completion.choices[0]?.message?.content;

    if (!content) throw new Error("Empty response");

    const parsed = MemoSchema.parse(JSON.parse(content));

    updateApiStatus("AI Provider (Groq)", {
      status: "live",
      lastFetch: new Date().toISOString(),
      latencyMs,
      error: undefined,
    });

    return {
      memoId: `memo-${position.id}-${generateId()}`,
      positionId: position.id,
      generatedAt: new Date().toISOString(),
      ...parsed,
      source: "groq",
    };
  } catch (err) {
    updateApiStatus("AI Provider (Groq)", {
      status: "fallback",
      lastFetch: new Date().toISOString(),
      latencyMs: Date.now() - start,
      error: err instanceof Error ? err.message : "Unknown error",
    });
    return generateFallbackMemo(position);
  }
}
