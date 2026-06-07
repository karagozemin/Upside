import type { DataMode } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DataModeBadge({ mode, className }: { mode: DataMode; className?: string }) {
  const cfg = { live: ["badge-live", "Live"], demo: ["badge-demo", "Demo"], mixed: ["badge-mixed", "Mixed"] } as const;
  const [cls, label] = cfg[mode];
  return <span className={cn("badge badge-dot", cls, className)}>{label} Data</span>;
}
