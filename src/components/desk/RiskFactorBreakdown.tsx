import { buildRiskFactors } from "@/lib/risk-factors";
import type { PositionDetail } from "@/lib/types";

export function RiskFactorBreakdown({ position }: { position: PositionDetail }) {
  const factors = buildRiskFactors(position);

  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-white/5 bg-[#f6465d]/5 px-6 py-4">
        <p className="label text-[#f6465d]">Explainable risk engine</p>
        <div className="mt-1 flex items-baseline gap-3">
          <p className="display text-3xl font-extrabold text-[#f6465d]">{position.riskScore}</p>
          <p className="text-sm text-[#767f8d]">/ 100 composite score</p>
        </div>
      </div>
      <div className="space-y-3 p-6">
        {factors.map((f) => (
          <div key={f.id} className="rounded-xl border border-white/5 bg-white/2 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold">{f.label}</p>
              <p className="mono text-xs text-[#767f8d]">{(f.weight * 100).toFixed(0)}% weight · +{f.contribution} pts</p>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div className="h-full rounded-full bg-linear-to-r from-[#f6465d] to-[#f0883e]" style={{ width: `${f.score}%` }} />
            </div>
            <p className="mt-2 text-xs leading-relaxed text-[#848e9c]">{f.why}</p>
          </div>
        ))}
      </div>
      <div className="border-t border-white/5 px-6 py-3">
        <p className="mono text-[10px] text-[#767f8d]">
          Score = Σ(factor × weight) · Liquidity 25% · Volatility 20% · Exposure 20% · Macro 15% · News 10% · ETF 5% · Narrative 5%
        </p>
      </div>
    </div>
  );
}
