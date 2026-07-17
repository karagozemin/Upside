import type { BeforeAfterMetrics } from "@/lib/types";
import { formatUsd } from "@/lib/utils";

function Metric({ label, before, after, suffix = "", lowerIsBetter = false, format }: {
  label: string; before: number; after: number; suffix?: string; lowerIsBetter?: boolean;
  format?: (n: number) => string;
}) {
  const improved = lowerIsBetter ? after < before : after > before;
  const fmt = format ?? ((n: number) => `${n}${suffix}`);
  return (
    <div className="rounded-xl border border-white/5 bg-[#0b0e11]/60 p-5">
      <p className="label">{label}</p>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[10px] text-[#767f8d]">Before</p>
          <p className="mono text-2xl font-bold text-[#f6465d]">{fmt(before)}</p>
        </div>
        <span className="text-[#5e6673]">→</span>
        <div className="text-right">
          <p className="text-[10px] text-[#767f8d]">After</p>
          <p className="mono text-2xl font-bold text-[#0ecb81]">{fmt(after)}</p>
        </div>
      </div>
      <p className={`mt-3 text-xs font-medium ${improved ? "text-[#0ecb81]" : "text-[#f6465d]"}`}>
        {improved ? "Improved" : "Changed"}
      </p>
    </div>
  );
}

export function BeforeAfterPanel({ before, after }: { before: BeforeAfterMetrics; after: BeforeAfterMetrics }) {
  return (
    <div className="panel panel-glow overflow-hidden">
      <div className="border-b border-white/5 bg-[#5e9eff]/5 px-6 py-5">
        <p className="label text-[#5e9eff]">Impact Preview</p>
        <h3 className="display mt-1 text-2xl font-bold">Before Upside → After Protection</h3>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-2 lg:grid-cols-3">
        <Metric label="Risk Score" before={before.riskScore} after={after.riskScore} lowerIsBetter />
        <Metric label="Liq. Distance" before={before.liquidationDistance} after={after.liquidationDistance} suffix="%" />
        <Metric label="Max Drawdown" before={before.maxDrawdown} after={after.maxDrawdown} suffix="%" lowerIsBetter />
        {before.exposure != null && after.exposure != null && (
          <Metric label="Net Exposure" before={before.exposure} after={after.exposure} suffix="x" lowerIsBetter />
        )}
        {before.estimatedLossAt3Pct != null && after.estimatedLossAt3Pct != null && (
          <Metric
            label="Est. loss at −3% BTC"
            before={before.estimatedLossAt3Pct}
            after={after.estimatedLossAt3Pct}
            lowerIsBetter
            format={(n) => formatUsd(Math.abs(n))}
          />
        )}
      </div>
      <div className="border-t border-white/5 bg-[#0b0e11]/80 px-6 py-3">
        <p className="mono text-center text-xs text-[#767f8d]">
          Risk {before.riskScore} → {after.riskScore} · Liq {before.liquidationDistance}% → {after.liquidationDistance}%
          {before.exposure != null && ` · Exposure ${before.exposure}x → ${after.exposure}x`}
        </p>
      </div>
    </div>
  );
}
