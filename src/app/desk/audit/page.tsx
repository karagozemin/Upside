"use client";

import Link from "next/link";
import { AuditTable } from "@/components/desk/AuditTable";
import { OperationProgress } from "@/components/ui/OperationProgress";
import { useDataLoad } from "@/hooks/useDataLoad";
import { AUDIT_LOAD_STEPS } from "@/lib/operation-steps";
import type { AuditEntry } from "@/lib/types";

export default function AuditPage() {
  const { data: entries, loading, operationSteps } = useDataLoad<AuditEntry[]>(
    AUDIT_LOAD_STEPS,
    async () => {
      const j = await fetch("/api/audit").then((r) => r.json());
      return j.data ?? [];
    },
    [],
    { stepMs: 500, minTotalMs: 1200 },
  );

  return (
    <div className="mx-auto max-w-4xl animate-rise">
      <Link href="/desk/positions/btc-perp" className="cursor-pointer text-xs text-[#5e9eff]">← Back to Demo</Link>
      <p className="label mt-4">Audit Log</p>
      <h1 className="display text-3xl font-bold">Decision Trail</h1>
      <p className="mt-2 text-sm text-[#767f8d]">Every risk decision logged transparently</p>

      {loading && operationSteps && (
        <OperationProgress steps={operationSteps} title="Loading audit trail" className="mt-8" />
      )}

      {!loading && (
        <div className="result-reveal mt-8"><AuditTable entries={entries ?? []} /></div>
      )}
    </div>
  );
}
