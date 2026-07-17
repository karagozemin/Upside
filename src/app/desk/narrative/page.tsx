"use client";

import Link from "next/link";
import { OperationProgress } from "@/components/ui/OperationProgress";
import { useDataLoad } from "@/hooks/useDataLoad";
import { NARRATIVE_LOAD_STEPS } from "@/lib/operation-steps";
import type { NarrativeSector } from "@/lib/types";
import { cn } from "@/lib/utils";

const STYLES: Record<string, string> = {
  rising: "badge-live", stable: "badge-safe", overheated: "badge-defensive",
  breaking_down: "badge-critical", high_volatility: "badge-watch", negative_flow: "badge-critical",
};

export default function NarrativePage() {
  const { data: sectors, loading, operationSteps } = useDataLoad<NarrativeSector[]>(
    NARRATIVE_LOAD_STEPS,
    async () => {
      const j = await fetch("/api/narrative").then((r) => r.json());
      return j.data ?? [];
    },
    [],
    { stepMs: 500, minTotalMs: 1200 },
  );

  return (
    <div className="mx-auto max-w-3xl animate-rise">
      <Link href="/desk" className="cursor-pointer text-xs text-[#5e9eff]">← Overview</Link>
      <p className="label mt-4">Narrative Radar</p>
      <h1 className="display text-3xl font-bold">Sector Momentum</h1>
      <p className="mt-2 text-sm text-[#767f8d]">Narrative risk connected to position exposure</p>

      {loading && operationSteps && (
        <OperationProgress steps={operationSteps} title="Scanning narrative risk" className="mt-8" />
      )}

      {!loading && (
        <div className="result-reveal mt-8 grid gap-4 sm:grid-cols-2">
          {(sectors ?? []).map((s) => (
            <div key={s.id} className="panel p-5">
              <div className="flex items-center justify-between">
                <h3 className="font-bold">{s.name}</h3>
                <span className={cn("badge", STYLES[s.state])}>{s.stateLabel}</span>
              </div>
              <p className="mt-3 text-sm text-[#767f8d]">{s.connectionCopy}</p>
              {s.affectedPositions.map((pid) => (
                <Link key={pid} href={`/desk/positions/${pid}`} className="mt-2 block cursor-pointer text-xs text-[#5e9eff]">View position →</Link>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
