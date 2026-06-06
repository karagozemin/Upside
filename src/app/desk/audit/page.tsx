"use client";

import { useEffect, useState } from "react";
import { AuditTable } from "@/components/desk/AuditTable";
import type { AuditEntry } from "@/lib/types";

export default function AuditPage() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((r) => r.json())
      .then((json) => setEntries(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-[#94a3b8]">Loading audit log...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Audit Log</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Every risk decision recorded — transparent, auditable, professional.
        </p>
      </div>
      <AuditTable entries={entries} />
    </div>
  );
}
