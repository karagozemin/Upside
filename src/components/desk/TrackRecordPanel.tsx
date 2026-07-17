import { DEMO_TRACK_RECORD } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

const OUTCOME_STYLE = {
  PROTECTED: "badge-live",
  HIT: "badge-critical",
  DRIFT: "badge-watch",
  FALSE_ALARM: "badge-demo",
} as const;

export function TrackRecordPanel() {
  return (
    <div className="panel overflow-hidden">
      <div className="border-b border-white/5 px-5 py-4">
        <p className="label">Risk event track record</p>
        <p className="mt-1 text-xs text-[#767f8d]">Outcome tracking for protection recommendations</p>
      </div>
      <div className="divide-y divide-white/5">
        {DEMO_TRACK_RECORD.map((e) => (
          <div key={e.id} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
            <div>
              <p className="mono text-[10px] text-[#767f8d]">{e.id}</p>
              <p className="font-medium">{e.asset} · {e.riskBefore} → {e.riskAfter}</p>
              <p className="text-xs text-[#767f8d]">{e.action} — {e.note}</p>
            </div>
            <span className={cn("badge shrink-0 text-[10px]", OUTCOME_STYLE[e.outcome])}>{e.outcome}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
