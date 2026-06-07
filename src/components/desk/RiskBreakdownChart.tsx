"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { RiskBreakdown } from "@/lib/types";
import { RISK_WEIGHTS } from "@/lib/demo-data";

export function RiskBreakdownChart({ breakdown }: { breakdown: RiskBreakdown }) {
  const data = [
    { name: "Liq", score: breakdown.liquidityRisk },
    { name: "Vol", score: breakdown.volatilityRisk },
    { name: "Size", score: breakdown.positionSizeRisk },
    { name: "Macro", score: breakdown.macroRisk },
    { name: "News", score: breakdown.newsRisk },
    { name: "ETF", score: breakdown.etfFlowRisk },
    { name: "Narr", score: breakdown.narrativeRisk },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis dataKey="name" tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ background: "#111827", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
          <Bar dataKey="score" fill="#22d3ee" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <p className="mono mt-3 text-[10px] text-[#475569]">
        Total = L×{RISK_WEIGHTS.liquidity} + V×{RISK_WEIGHTS.volatility} + P×{RISK_WEIGHTS.positionSize} + ...
      </p>
    </div>
  );
}
