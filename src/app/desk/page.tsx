"use client";

import { useState } from "react";
import Link from "next/link";
import { ApiVisibilityPanel } from "@/components/desk/ApiVisibilityPanel";
import { DataModeBadge } from "@/components/desk/DataModeBadge";
import { MetricCard } from "@/components/desk/MetricCard";
import { PositionsTable } from "@/components/desk/PositionsTable";
import { OperationProgress } from "@/components/ui/OperationProgress";
import { useDataLoad } from "@/hooks/useDataLoad";
import { PORTFOLIO_LOAD_STEPS } from "@/lib/operation-steps";
import type { DataMode, PortfolioSummary } from "@/lib/types";

type DeskLoad = { portfolio: PortfolioSummary; mode: DataMode };

export default function DeskPage() {
  const [showApi, setShowApi] = useState(false);

  const { data, loading, operationSteps } = useDataLoad<DeskLoad>(
    PORTFOLIO_LOAD_STEPS,
    async () => {
      const j = await fetch("/api/portfolio").then((r) => r.json());
      return { portfolio: j.data, mode: j.meta?.mode ?? "demo" };
    },
    [],
    { stepMs: 500, minTotalMs: 1500 },
  );

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-3xl panel p-8">
        <p className="label text-[#22d3ee]">Command Center</p>
        <p className="mt-2 text-sm text-[#64748b]">Initializing risk desk…</p>
        {operationSteps && <OperationProgress steps={operationSteps} title="Loading portfolio" className="mt-6" />}
      </div>
    );
  }

  const { portfolio, mode } = data;

  return (
    <div className="mx-auto max-w-3xl space-y-8 animate-rise">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="label">Command Center</p>
          <h1 className="display mt-1 text-3xl font-bold">Risk Desk</h1>
          <p className="mt-2 text-sm text-[#64748b]">Click the card below to start the demo</p>
        </div>
        <DataModeBadge mode={mode} />
      </div>

      <Link href="/desk/positions/btc-perp" className="block cursor-pointer">
        <div className="panel panel-glow relative overflow-hidden p-8 transition hover:scale-[1.01]">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-[#22d3ee]/10 blur-3xl" />
          <p className="label text-[#22d3ee]">Click to start</p>
          <h2 className="display mt-2 text-3xl font-bold">BTC-PERP Demo</h2>
          <p className="mt-2 text-[#64748b]">Risk 84 → 43 · Reduce 35% · 4 steps</p>
          <span className="btn btn-primary mt-6 inline-flex">Start Demo →</span>
        </div>
      </Link>

      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Portfolio Risk" value={`${portfolio.portfolioRiskScore}`} accent="rose" />
        <MetricCard label="At Risk" value={portfolio.positionsAtRisk} subtext="positions" accent="rose" />
        <MetricCard label="Actions" value={portfolio.recommendedActions} accent="cyan" />
      </div>

      <PositionsTable positions={portfolio.positions} />

      <div className="flex flex-wrap gap-3">
        <Link href="/desk/replay" className="btn btn-secondary">Risk Replay</Link>
        <Link href="/desk/audit" className="btn btn-secondary">Audit Log</Link>
        <button type="button" onClick={() => setShowApi(!showApi)} className="btn btn-ghost">
          {showApi ? "Hide API panel" : "API Visibility"}
        </button>
      </div>
      {showApi && <ApiVisibilityPanel />}
    </div>
  );
}
