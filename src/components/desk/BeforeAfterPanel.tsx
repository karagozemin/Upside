import type { BeforeAfterMetrics } from "@/lib/types";
import { cn } from "@/lib/utils";

interface BeforeAfterPanelProps {
  before: BeforeAfterMetrics;
  after: BeforeAfterMetrics;
  className?: string;
}

function MetricBlock({
  label,
  before,
  after,
  suffix = "",
  invert = false,
}: {
  label: string;
  before: number;
  after: number;
  suffix?: string;
  invert?: boolean;
}) {
  const improved = invert ? after < before : after > before;
  const delta = after - before;

  return (
    <div className="flex-1 rounded border border-[#2a3548] bg-[#111827] p-4">
      <p className="text-xs uppercase tracking-wider text-[#94a3b8]">{label}</p>
      <div className="mt-3 flex items-end justify-between gap-4">
        <div>
          <p className="text-xs text-[#94a3b8]">Before</p>
          <p className="font-mono text-xl text-[#ef4444]">
            {before}
            {suffix}
          </p>
        </div>
        <div className="text-[#94a3b8]">→</div>
        <div>
          <p className="text-xs text-[#94a3b8]">After</p>
          <p className="font-mono text-xl text-[#22c55e]">
            {after}
            {suffix}
          </p>
        </div>
      </div>
      <p
        className={cn(
          "mt-2 text-xs font-medium",
          improved ? "text-[#22c55e]" : "text-[#ef4444]"
        )}
      >
        {delta > 0 ? "+" : ""}
        {delta}
        {suffix} change
      </p>
    </div>
  );
}

export function BeforeAfterPanel({ before, after, className }: BeforeAfterPanelProps) {
  return (
    <div className={cn("card overflow-hidden", className)}>
      <div className="border-b border-[#2a3548] bg-[#1a2235] px-6 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-[#e2e8f0]">
          Protection Impact — Before / After
        </h3>
        <p className="mt-1 text-xs text-[#94a3b8]">
          Protect the downside before risk becomes a loss.
        </p>
      </div>
      <div className="grid gap-4 p-6 md:grid-cols-3">
        <MetricBlock label="Risk Score" before={before.riskScore} after={after.riskScore} invert />
        <MetricBlock
          label="Liquidation Distance"
          before={before.liquidationDistance}
          after={after.liquidationDistance}
          suffix="%"
        />
        <MetricBlock
          label="Est. Max Drawdown"
          before={before.maxDrawdown}
          after={after.maxDrawdown}
          suffix="%"
          invert
        />
      </div>
      <div className="border-t border-[#2a3548] bg-[#0a0e17] px-6 py-3">
        <p className="font-mono text-xs text-[#94a3b8]">
          BEFORE: Risk {before.riskScore}/100 | Liq {before.liquidationDistance}% | Max DD {before.maxDrawdown}%
          {" → "}
          AFTER: Risk {after.riskScore}/100 | Liq {after.liquidationDistance}% | Max DD {after.maxDrawdown}%
        </p>
      </div>
    </div>
  );
}
