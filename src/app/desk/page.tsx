"use client";

import { useEffect, useState } from "react";
import { ApiVisibilityPanel } from "@/components/desk/ApiVisibilityPanel";
import { DataModeBadge } from "@/components/desk/DataModeBadge";
import { MetricCard } from "@/components/desk/MetricCard";
import { PositionsTable } from "@/components/desk/PositionsTable";
import type { DataMode, PortfolioSummary } from "@/lib/types";

export default function CommandCenterPage() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [mode, setMode] = useState<DataMode>("demo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/portfolio")
      .then((r) => r.json())
      .then((json) => {
        setPortfolio(json.data);
        setMode(json.meta?.mode ?? json.data?.dataMode ?? "demo");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-[#94a3b8]">Loading command center...</p>;
  }

  if (!portfolio) {
    return <p className="text-[#ef4444]">Failed to load portfolio.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Command Center</h1>
          <p className="mt-1 text-sm text-[#94a3b8]">
            Upside watches your positions, detects risk early, explains why, and
            helps you protect capital through SoDEX.
          </p>
        </div>
        <DataModeBadge mode={mode} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <MetricCard
          label="Portfolio Risk Score"
          value={`${portfolio.portfolioRiskScore}/100`}
          variant={portfolio.portfolioRiskScore > 80 ? "critical" : "default"}
        />
        <MetricCard
          label="Market Regime"
          value={portfolio.marketRegime}
          variant="accent"
        />
        <MetricCard
          label="Positions at Risk"
          value={portfolio.positionsAtRisk}
          subtext="Defensive + Critical"
          variant={portfolio.positionsAtRisk > 0 ? "critical" : "safe"}
        />
        <MetricCard
          label="Protection Actions"
          value={portfolio.recommendedActions}
          subtext="Recommended now"
        />
        <MetricCard
          label="Data Status"
          value={mode.toUpperCase()}
          subtext="See API Visibility below"
          variant="accent"
        />
      </div>

      <PositionsTable positions={portfolio.positions} />

      <ApiVisibilityPanel compact />
      <ApiVisibilityPanel />
    </div>
  );
}
