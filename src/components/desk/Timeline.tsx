import type { ReplayEvent } from "@/lib/types";

const COLORS = { data: "#22d3ee", risk: "#fb7185", ai: "#a78bfa", action: "#fb923c", result: "#34d399" };

export function Timeline({ events }: { events: ReplayEvent[] }) {
  return (
    <div className="space-y-0">
      {events.map((e, i) => (
        <div key={e.id} className="relative flex gap-4 pb-6">
          {i < events.length - 1 && <div className="absolute left-[11px] top-8 h-full w-px bg-white/10" />}
          <div className="relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full" style={{ background: COLORS[e.type] }} />
          <div className="panel flex-1 p-4">
            <div className="flex items-center gap-2">
              <span className="mono text-xs text-[#22d3ee]">{e.time}</span>
              <span className="label">{e.type}</span>
            </div>
            <p className="mt-1 font-semibold">{e.title}</p>
            <p className="mt-1 text-sm text-[#64748b]">{e.description}</p>
            {e.riskScoreBefore != null && (
              <p className="mono mt-2 text-sm">
                <span className="text-[#fb7185]">{e.riskScoreBefore}</span> → <span className="text-[#34d399]">{e.riskScoreAfter}</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
