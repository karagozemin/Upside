import type { RiskVerdict } from "@/lib/types";
import { cn, verdictBadgeClass, verdictLabel } from "@/lib/utils";

export function RiskBadge({ verdict, score, pulse, className }: {
  verdict: RiskVerdict; score?: number; pulse?: boolean; className?: string;
}) {
  return (
    <span className={cn("badge badge-dot", verdictBadgeClass(verdict), pulse && verdict === "critical" && "pulse-critical", className)}>
      {verdictLabel(verdict)}
      {score !== undefined && <span className="mono ml-1 opacity-80">{score}</span>}
    </span>
  );
}
