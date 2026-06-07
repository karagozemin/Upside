import type { BeforeAfterMetrics } from "@/lib/types";

function Metric({ label, before, after, suffix = "", lowerIsBetter = false }: {
  label: string; before: number; after: number; suffix?: string; lowerIsBetter?: boolean;
}) {
  const improved = lowerIsBetter ? after < before : after > before;
  return (
    <div className="rounded-xl border border-white/5 bg-[#030508]/60 p-5">
      <p className="label">{label}</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] text-[#64748b]">Before</p>
          <p className="mono text-2xl font-bold text-[#fb7185]">{before}{suffix}</p>
        </div>
        <span className="text-[#475569]">→</span>
        <div className="text-right">
          <p className="text-[10px] text-[#64748b]">After</p>
          <p className="mono text-2xl font-bold text-[#34d399]">{after}{suffix}</p>
        </div>
      </div>
      <p className={`mt-3 text-xs font-medium ${improved ? "text-[#34d399]" : "text-[#fb7185]"}`}>
        {after - before > 0 ? "+" : ""}{after - before}{suffix}
      </p>
    </div>
  );
}

export function BeforeAfterPanel({ before, after }: { before: BeforeAfterMetrics; after: BeforeAfterMetrics }) {
  return (
    <div className="panel panel-glow overflow-hidden">
      <div className="border-b border-white/5 bg-[#22d3ee]/5 px-6 py-5">
        <p className="label text-[#22d3ee]">Protection impact</p>
        <h3 className="display mt-1 text-2xl font-bold">Before → After</h3>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-3">
        <Metric label="Risk Score" before={before.riskScore} after={after.riskScore} lowerIsBetter />
        <Metric label="Liq. Distance" before={before.liquidationDistance} after={after.liquidationDistance} suffix="%" />
        <Metric label="Max Drawdown" before={before.maxDrawdown} after={after.maxDrawdown} suffix="%" lowerIsBetter />
      </div>
      <div className="border-t border-white/5 bg-[#030508]/80 px-6 py-3">
        <p className="mono text-center text-xs text-[#64748b]">
          {before.riskScore} → {after.riskScore} risk · {before.liquidationDistance}% → {after.liquidationDistance}% liq
        </p>
      </div>
    </div>
  );
}
