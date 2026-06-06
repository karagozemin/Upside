"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RiskBreakdown } from "@/lib/types";
import { RISK_WEIGHTS } from "@/lib/demo-data";

interface RiskBreakdownChartProps {
  breakdown: RiskBreakdown;
}

export function RiskBreakdownChart({ breakdown }: RiskBreakdownChartProps) {
  const data = [
    { name: "Liquidity", score: breakdown.liquidityRisk, weight: "25%" },
    { name: "Volatility", score: breakdown.volatilityRisk, weight: "20%" },
    { name: "Position Size", score: breakdown.positionSizeRisk, weight: "20%" },
    { name: "Macro", score: breakdown.macroRisk, weight: "15%" },
    { name: "News", score: breakdown.newsRisk, weight: "10%" },
    { name: "ETF Flow", score: breakdown.etfFlowRisk, weight: "5%" },
    { name: "Narrative", score: breakdown.narrativeRisk, weight: "5%" },
  ];

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2a3548" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#2a3548" }}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: "#94a3b8", fontSize: 11 }}
            axisLine={{ stroke: "#2a3548" }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#1a2235",
              border: "1px solid #2a3548",
              borderRadius: "4px",
              color: "#e2e8f0",
            }}
            formatter={(value: number, _name, props) => [
              `${value}/100 (weight ${(props.payload as { weight: string }).weight})`,
              "Score",
            ]}
          />
          <Bar dataKey="score" fill="#3b82f6" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 rounded border border-[#2a3548] bg-[#111827] p-3 font-mono text-xs text-[#94a3b8]">
        Total Risk = Liquidity×{RISK_WEIGHTS.liquidity} + Volatility×{RISK_WEIGHTS.volatility} +
        Position Size×{RISK_WEIGHTS.positionSize} + Macro×{RISK_WEIGHTS.macro} + News×
        {RISK_WEIGHTS.news} + ETF Flow×{RISK_WEIGHTS.etfFlow} + Narrative×{RISK_WEIGHTS.narrative}
      </div>
    </div>
  );
}
