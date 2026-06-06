import type { DataMode } from "@/lib/types";
import { cn } from "@/lib/utils";

interface DataModeBadgeProps {
  mode: DataMode;
  className?: string;
}

export function DataModeBadge({ mode, className }: DataModeBadgeProps) {
  const config = {
    live: { label: "LIVE", className: "badge-live" },
    demo: { label: "DEMO", className: "badge-demo" },
    mixed: { label: "MIXED", className: "badge-mixed" },
  };

  const { label, className: badgeClass } = config[mode];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wider",
        badgeClass,
        className
      )}
    >
      <span className="mr-1.5 inline-block h-1.5 w-1.5 rounded-full bg-current" />
      {label} DATA
    </span>
  );
}
