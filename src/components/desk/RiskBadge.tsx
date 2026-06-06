import type { RiskVerdict } from "@/lib/types";
import { cn, verdictBadgeClass, verdictLabel } from "@/lib/utils";

interface RiskBadgeProps {
  verdict: RiskVerdict;
  score?: number;
  pulse?: boolean;
  className?: string;
}

export function RiskBadge({ verdict, score, pulse, className }: RiskBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
        verdictBadgeClass(verdict),
        pulse && verdict === "critical" && "animate-pulse-critical",
        className
      )}
    >
      {verdictLabel(verdict)}
      {score !== undefined && (
        <span className="font-mono opacity-80">{score}</span>
      )}
    </span>
  );
}
