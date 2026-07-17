"use client";

import Link from "next/link";
import type { Position } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";
import { RiskBadge } from "./RiskBadge";

export function PositionsTable({ positions }: { positions: Position[] }) {
  const btc = positions.find((p) => p.id === "btc-perp");

  return (
    <div className="space-y-4">
      {btc && (
        <Link href="/desk/positions/btc-perp" className="group block cursor-pointer">
          <div className="panel panel-glow overflow-hidden transition-transform group-hover:scale-[1.01]">
            <div className="flex flex-wrap items-center justify-between gap-4 p-6">
              <div>
                <p className="label text-[#f6465d]">Start demo here — click</p>
                <h3 className="display mt-1 text-2xl font-bold">{btc.asset} Long</h3>
                <p className="mt-1 text-sm text-[#767f8d]">Risk {btc.riskScore} · {btc.recommendedAction}</p>
              </div>
              <div className="flex items-center gap-4">
                <RiskBadge verdict={btc.verdict} pulse />
                <span className="btn btn-primary px-6 py-3">Open →</span>
              </div>
            </div>
          </div>
        </Link>
      )}

      <div className="panel overflow-hidden">
        <div className="border-b border-white/5 px-5 py-4">
          <p className="text-sm font-semibold">All Positions</p>
        </div>
        <div className="divide-y divide-white/5">
          {positions.map((pos) => (
            <Link key={pos.id} href={`/desk/positions/${pos.id}`}
              className="flex cursor-pointer items-center justify-between px-5 py-4 transition hover:bg-white/[0.03]">
              <div>
                <span className="font-medium">{pos.asset}</span>
                <span className="ml-2 text-xs capitalize text-[#767f8d]">{pos.side}</span>
                <p className="mono mt-0.5 text-xs text-[#767f8d]">{formatPrice(pos.currentPrice)} · {pos.riskScore}/100</p>
              </div>
              <div className="flex items-center gap-3">
                <RiskBadge verdict={pos.verdict} />
                <span className={cn("text-sm", pos.id === "btc-perp" ? "text-[#5e9eff]" : "text-[#767f8d]")}>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
