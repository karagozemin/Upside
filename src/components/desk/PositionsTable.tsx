"use client";

import Link from "next/link";
import type { Position } from "@/lib/types";
import { formatPrice, formatUsd } from "@/lib/utils";
import { RiskBadge } from "./RiskBadge";
import { cn } from "@/lib/utils";

interface PositionsTableProps {
  positions: Position[];
}

export function PositionsTable({ positions }: PositionsTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="border-b border-[#2a3548] px-6 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider">Open Positions</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3548] text-left text-xs uppercase tracking-wider text-[#94a3b8]">
              <th className="px-6 py-3">Asset</th>
              <th className="px-6 py-3">Side</th>
              <th className="px-6 py-3">Size</th>
              <th className="px-6 py-3">Entry</th>
              <th className="px-6 py-3">Current</th>
              <th className="px-6 py-3">Liq. Dist.</th>
              <th className="px-6 py-3">Risk Score</th>
              <th className="px-6 py-3">Verdict</th>
              <th className="px-6 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos) => (
              <tr
                key={pos.id}
                className={cn(
                  "border-b border-[#2a3548]/50 transition-colors hover:bg-[#111827]/80",
                  pos.id === "btc-perp" && "bg-[#ef4444]/5"
                )}
              >
                <td className="px-6 py-3">
                  <Link
                    href={`/desk/positions/${pos.id}`}
                    className="font-medium text-[#3b82f6] hover:underline"
                  >
                    {pos.asset}
                  </Link>
                </td>
                <td className="px-6 py-3 capitalize">{pos.side}</td>
                <td className="px-6 py-3 font-mono text-xs">
                  {pos.size} ({formatUsd(pos.sizeUsd)})
                </td>
                <td className="px-6 py-3 font-mono text-xs">{formatPrice(pos.entryPrice)}</td>
                <td className="px-6 py-3 font-mono text-xs">{formatPrice(pos.currentPrice)}</td>
                <td className="px-6 py-3 font-mono text-xs">{pos.liquidationDistance}%</td>
                <td className="px-6 py-3 font-mono font-semibold">{pos.riskScore}</td>
                <td className="px-6 py-3">
                  <RiskBadge
                    verdict={pos.verdict}
                    pulse={pos.verdict === "critical"}
                  />
                </td>
                <td className="px-6 py-3 text-xs text-[#94a3b8]">{pos.recommendedAction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
