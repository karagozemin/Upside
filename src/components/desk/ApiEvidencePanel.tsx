"use client";

import { useEffect, useState } from "react";
import type { DiagReport } from "@/lib/diag";
import { cn } from "@/lib/utils";

function StatusIcon({ status }: { status: string }) {
  const ok = status === "ok";
  return (
    <span className={cn("mono text-sm font-bold", ok ? "text-[#0ecb81]" : "text-[#f0b90b]")}>
      {ok ? "✓" : "○"}
    </span>
  );
}

function SourceList({ sources }: { sources: DiagReport["sosovalue"] }) {
  return (
    <div className="space-y-2">
      {sources.map((s) => (
        <div key={s.endpoint} className="flex items-start justify-between gap-3 rounded-lg bg-white/2 px-3 py-2 text-xs">
          <div className="flex gap-2">
            <StatusIcon status={s.status} />
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="mono text-[10px] text-[#767f8d]">{s.endpoint}</p>
              {s.note && <p className="mt-0.5 text-[10px] text-[#5e6673]">{s.note}</p>}
            </div>
          </div>
          <div className="shrink-0 text-right">
            <span className={cn("badge text-[9px]", s.live ? "badge-live" : "badge-demo")}>{s.live ? "live" : "fallback"}</span>
            {s.latencyMs != null && <p className="mono mt-1 text-[10px] text-[#767f8d]">{s.latencyMs}ms</p>}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ApiEvidencePanel({ compact }: { compact?: boolean }) {
  const [diag, setDiag] = useState<DiagReport | null>(null);

  useEffect(() => {
    fetch("/api/diag").then((r) => r.json()).then((j) => setDiag(j.data));
  }, []);

  if (!diag) return <div className="panel p-4 text-sm text-[#767f8d]">Loading API evidence…</div>;

  if (compact) {
    const liveCount = [...diag.sosovalue, ...diag.sodex, ...diag.ai].filter((s) => s.live).length;
    return (
      <div className="panel flex items-center justify-between p-4 text-sm">
        <span className="text-[#767f8d]">{liveCount} live sources · mode: {diag.dataMode}</span>
        <a href="/diag" className="text-xs text-[#5e9eff] hover:underline">Full evidence →</a>
      </div>
    );
  }

  return (
    <div className="panel overflow-hidden">
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div>
          <p className="label text-[#5e9eff]">API Evidence</p>
          <p className="mono mt-1 text-[10px] text-[#767f8d]">Last checked: {new Date(diag.timestamp).toLocaleString()}</p>
        </div>
        <a href="/diag" className="text-xs text-[#5e9eff] hover:underline">Open /diag →</a>
      </div>
      <div className="grid gap-4 p-5 md:grid-cols-2">
        <div>
          <p className="label mb-2">SoSoValue</p>
          <SourceList sources={diag.sosovalue} />
        </div>
        <div>
          <p className="label mb-2">SoDEX</p>
          <SourceList sources={diag.sodex} />
          <p className="label mb-2 mt-4">AI & Replay</p>
          <SourceList sources={diag.ai} />
        </div>
      </div>
      <div className="grid gap-3 border-t border-white/5 bg-[#0b0e11]/50 p-5 md:grid-cols-2">
        <div className="rounded-xl border border-[#0ecb81]/20 bg-[#0ecb81]/5 p-3 text-xs">
          <p className="font-semibold text-[#0ecb81]">Live</p>
          <p className="mt-1 text-[#848e9c]">{diag.realVsSimulated.live.join(" · ") || "—"}</p>
        </div>
        <div className="rounded-xl border border-[#f0b90b]/20 bg-[#f0b90b]/5 p-3 text-xs">
          <p className="font-semibold text-[#f0b90b]">Simulated / Fallback</p>
          <p className="mt-1 text-[#848e9c]">{diag.realVsSimulated.simulated.join(" · ")}</p>
        </div>
      </div>
    </div>
  );
}
