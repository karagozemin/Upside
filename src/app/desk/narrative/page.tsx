"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { NarrativeSector } from "@/lib/types";
import { cn } from "@/lib/utils";

const stateStyles: Record<string, string> = {
  rising: "badge-live",
  stable: "badge-safe",
  overheated: "badge-defensive",
  breaking_down: "badge-critical",
  high_volatility: "badge-watch",
  negative_flow: "badge-critical",
};

export default function NarrativePage() {
  const [sectors, setSectors] = useState<NarrativeSector[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/narrative")
      .then((r) => r.json())
      .then((json) => setSectors(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-[#94a3b8]">Loading narrative radar...</p>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Narrative Risk Radar</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          Sector and narrative momentum from SoSoValue indices — connected directly
          to position risk.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sectors.map((sector) => (
          <div key={sector.id} className="card p-5">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">{sector.name}</h3>
              <span
                className={cn(
                  "rounded px-2 py-0.5 text-xs font-medium",
                  stateStyles[sector.state] ?? "badge-demo"
                )}
              >
                {sector.stateLabel}
              </span>
            </div>
            <p className="mt-3 text-sm text-[#94a3b8]">{sector.connectionCopy}</p>
            {sector.affectedPositions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {sector.affectedPositions.map((posId) => (
                  <Link
                    key={posId}
                    href={`/desk/positions/${posId}`}
                    className="text-xs text-[#3b82f6] hover:underline"
                  >
                    View position →
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
