"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { BeforeAfterPanel } from "@/components/desk/BeforeAfterPanel";
import { ExecutionPreview } from "@/components/desk/ExecutionPreview";
import { ProtectionOptionCard } from "@/components/desk/ProtectionOptionCard";
import { RiskBadge } from "@/components/desk/RiskBadge";
import { RiskBreakdownChart } from "@/components/desk/RiskBreakdownChart";
import { RiskMemoCard } from "@/components/desk/RiskMemoCard";
import type {
  PositionDetail,
  ProtectionOption,
  ProtectionSimulation,
  RiskMemo,
} from "@/lib/types";
import { formatPrice, formatUsd } from "@/lib/utils";
import { RISK_WEIGHTS } from "@/lib/demo-data";

export default function PositionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [position, setPosition] = useState<PositionDetail | null>(null);
  const [memo, setMemo] = useState<RiskMemo | null>(null);
  const [options, setOptions] = useState<ProtectionOption[]>([]);
  const [simulation, setSimulation] = useState<ProtectionSimulation | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [posRes, memoRes, plansRes] = await Promise.all([
        fetch(`/api/positions/${id}`),
        fetch("/api/risk-memo", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ positionId: id }),
        }),
        fetch("/api/protection-plans", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ positionId: id }),
        }),
      ]);

      const posJson = await posRes.json();
      const memoJson = await memoRes.json();
      const plansJson = await plansRes.json();

      setPosition(posJson.data);
      setMemo(memoJson.data);
      setOptions(plansJson.data?.options ?? []);
      setSimulation(plansJson.data?.simulation ?? null);
      const recommended = plansJson.data?.options?.find(
        (o: ProtectionOption) => o.recommended
      );
      setSelectedOptionId(recommended?.id ?? plansJson.data?.options?.[0]?.id ?? "");
      setLoading(false);
    }
    load();
  }, [id]);

  async function selectOption(optionId: string) {
    setSelectedOptionId(optionId);
    const res = await fetch("/api/protection-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ positionId: id, optionId }),
    });
    const json = await res.json();
    setSimulation(json.data?.simulation ?? null);
  }

  if (loading) {
    return <p className="text-[#94a3b8]">Loading position risk detail...</p>;
  }

  if (!position) {
    return (
      <div>
        <p className="text-[#ef4444]">Position not found.</p>
        <Link href="/desk" className="text-[#3b82f6] hover:underline">
          ← Back to Command Center
        </Link>
      </div>
    );
  }

  const ctx = position.marketContext;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <Link href="/desk" className="text-xs text-[#3b82f6] hover:underline">
          ← Command Center
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-4">
          <h1 className="text-2xl font-semibold">
            {position.asset}{" "}
            <span className="capitalize text-[#94a3b8]">{position.side}</span>
          </h1>
          <RiskBadge verdict={position.verdict} score={position.riskScore} pulse />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ["Entry", formatPrice(position.entryPrice)],
          ["Current", formatPrice(position.currentPrice)],
          ["Size", `${position.size} (${formatUsd(position.sizeUsd)})`],
          ["Leverage", `${position.leverage}x`],
          ["Liquidation Est.", formatPrice(position.liquidationPrice)],
          ["Liq. Distance", `${position.liquidationDistance}%`],
          ["SoDEX Liquidity", `$${(ctx.liquidityDepthUsd / 1e6).toFixed(1)}M`],
          ["Slippage Est.", `${ctx.slippageEstimate}%`],
        ].map(([label, value]) => (
          <div key={label} className="card p-3">
            <p className="text-xs text-[#94a3b8]">{label}</p>
            <p className="mt-1 font-mono text-sm">{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Market Context
        </h3>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="badge-demo rounded px-2 py-1 text-xs">
            Regime: {ctx.regime}
          </span>
          <span className="badge-demo rounded px-2 py-1 text-xs">
            News: {ctx.newsSentiment}
          </span>
          <span className="badge-demo rounded px-2 py-1 text-xs">
            ETF: {ctx.etfFlowDirection}
          </span>
          <span className="badge-demo rounded px-2 py-1 text-xs">
            Macro: {ctx.macroEvent}
          </span>
        </div>
        <p className="mt-3 text-sm text-[#94a3b8]">{ctx.narrativeNote}</p>
      </div>

      <div className="card p-6">
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          Risk Breakdown
        </h3>
        <RiskBreakdownChart breakdown={position.breakdown} />
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-[#94a3b8]">
              <th className="pb-2">Factor</th>
              <th className="pb-2">Score</th>
              <th className="pb-2">Weight</th>
              <th className="pb-2">Contribution</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["Liquidity Risk", position.breakdown.liquidityRisk, RISK_WEIGHTS.liquidity],
                ["Volatility Risk", position.breakdown.volatilityRisk, RISK_WEIGHTS.volatility],
                ["Position Size Risk", position.breakdown.positionSizeRisk, RISK_WEIGHTS.positionSize],
                ["Macro Risk", position.breakdown.macroRisk, RISK_WEIGHTS.macro],
                ["News Risk", position.breakdown.newsRisk, RISK_WEIGHTS.news],
                ["ETF Flow Risk", position.breakdown.etfFlowRisk, RISK_WEIGHTS.etfFlow],
                ["Narrative Risk", position.breakdown.narrativeRisk, RISK_WEIGHTS.narrative],
              ] as const
            ).map(([name, score, weight]) => (
              <tr key={name} className="border-t border-[#2a3548]/50">
                <td className="py-2">{name}</td>
                <td className="py-2 font-mono">{score}</td>
                <td className="py-2 font-mono">{weight * 100}%</td>
                <td className="py-2 font-mono">{(score * weight).toFixed(1)}</td>
              </tr>
            ))}
            <tr className="border-t border-[#2a3548] font-semibold">
              <td className="py-2">Total Risk</td>
              <td className="py-2 font-mono text-[#ef4444]" colSpan={3}>
                {position.riskScore} / 100
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {memo && <RiskMemoCard memo={memo} />}

      <div>
        <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider">
          Protection Plan Simulator
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
          {options.map((opt) => (
            <ProtectionOptionCard
              key={opt.id}
              option={opt}
              selected={selectedOptionId === opt.id}
              onSelect={() => selectOption(opt.id)}
            />
          ))}
        </div>
      </div>

      {simulation && <BeforeAfterPanel before={simulation.before} after={simulation.after} />}

      {simulation && (
        <ExecutionPreview
          positionId={id}
          optionId={selectedOptionId}
          simulation={simulation}
          memo={memo}
        />
      )}
    </div>
  );
}
