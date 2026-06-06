import type { ReplayEvent } from "@/lib/types";
import { cn } from "@/lib/utils";

interface TimelineProps {
  events: ReplayEvent[];
}

const typeColors = {
  data: "bg-[#3b82f6]",
  risk: "bg-[#ef4444]",
  ai: "bg-[#a855f7]",
  action: "bg-[#f97316]",
  result: "bg-[#22c55e]",
};

export function Timeline({ events }: TimelineProps) {
  return (
    <div className="relative space-y-0">
      {events.map((event, i) => (
        <div key={event.id} className="relative flex gap-4 pb-8">
          {i < events.length - 1 && (
            <div className="absolute left-[11px] top-6 h-full w-px bg-[#2a3548]" />
          )}
          <div
            className={cn(
              "relative z-10 mt-1 h-6 w-6 shrink-0 rounded-full",
              typeColors[event.type]
            )}
          />
          <div className="flex-1 card p-4">
            <div className="flex items-center gap-3">
              <span className="font-mono text-xs text-[#3b82f6]">{event.time}</span>
              <span className="text-xs uppercase tracking-wider text-[#94a3b8]">
                {event.type}
              </span>
            </div>
            <h4 className="mt-1 font-medium">{event.title}</h4>
            <p className="mt-1 text-sm text-[#94a3b8]">{event.description}</p>
            {event.riskScoreBefore !== undefined && event.riskScoreAfter !== undefined && (
              <p className="mt-2 font-mono text-sm">
                <span className="text-[#ef4444]">{event.riskScoreBefore}</span>
                {" → "}
                <span className="text-[#22c55e]">{event.riskScoreAfter}</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
