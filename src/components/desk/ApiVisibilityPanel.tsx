"use client";

import { OperationProgress } from "@/components/ui/OperationProgress";
import { useDataLoad } from "@/hooks/useDataLoad";
import { VISIBILITY_LOAD_STEPS } from "@/lib/operation-steps";
import type { ApiSourceStatus, DataMode } from "@/lib/types";
import { DataModeBadge } from "./DataModeBadge";
import { cn } from "@/lib/utils";

type VisibilityLoad = { sources: ApiSourceStatus[]; mode: DataMode };

export function ApiVisibilityPanel({ compact }: { compact?: boolean }) {
  const { data, loading, operationSteps } = useDataLoad<VisibilityLoad>(
    VISIBILITY_LOAD_STEPS,
    async () => {
      const j = await fetch("/api/visibility").then((r) => r.json());
      return { sources: j.data ?? [], mode: j.meta?.mode ?? "demo" };
    },
    [],
    { stepMs: 450, minTotalMs: 1000 },
  );

  const sources = data?.sources ?? [];
  const mode = data?.mode ?? "demo";

  if (compact) {
    const live = sources.filter((s) => s.status === "live").length;
    return (
      <div className="panel flex items-center justify-between p-4">
        <span className="text-sm text-[#64748b]">{loading ? "Checking…" : `${live}/${sources.length} live`}</span>
        <DataModeBadge mode={mode} />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="panel p-5">
        {operationSteps && <OperationProgress steps={operationSteps} title="Checking API connectivity" />}
      </div>
    );
  }

  return (
    <div className="panel result-reveal overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <p className="text-sm font-semibold">API Visibility</p>
        <DataModeBadge mode={mode} />
      </div>
      <div className="divide-y divide-white/5">
        {sources.map((s) => (
          <div key={s.name} className="flex items-center justify-between px-5 py-3 text-sm">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="mono text-[10px] text-[#64748b]">{s.endpoint}</p>
            </div>
            <div className="text-right">
              <span className={cn("badge", s.status === "live" ? "badge-live" : "badge-demo")}>{s.status}</span>
              {s.latencyMs != null && <p className="mono mt-1 text-[10px] text-[#64748b]">{s.latencyMs}ms</p>}
              {s.error && <p className="mt-1 text-[10px] text-[#fb7185]">{s.error}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
