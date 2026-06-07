"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DiagReport } from "@/lib/diag";
import { cn } from "@/lib/utils";

function Section({ title, sources }: { title: string; sources: DiagReport["sosovalue"] }) {
  return (
    <div className="panel p-5">
      <p className="label mb-4">{title}</p>
      <div className="space-y-2">
        {sources.map((s) => (
          <div key={s.endpoint} className="flex items-center justify-between rounded-lg border border-white/5 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{s.name}</p>
              <p className="mono text-[10px] text-[#64748b]">{s.endpoint}</p>
            </div>
            <div className="text-right">
              <span className={cn("badge text-[10px]", s.live ? "badge-live" : "badge-demo")}>
                {s.status === "ok" ? "200 OK" : "fallback"}
              </span>
              {s.latencyMs != null && <p className="mono mt-1 text-[10px] text-[#64748b]">{s.latencyMs}ms</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DiagPage() {
  const [diag, setDiag] = useState<DiagReport | null>(null);

  useEffect(() => {
    fetch("/api/diag").then((r) => r.json()).then((j) => setDiag(j.data));
  }, []);

  return (
    <div className="mx-auto max-w-3xl animate-rise px-4 py-8">
      <Link href="/desk" className="cursor-pointer text-xs text-[#22d3ee]">← Risk Desk</Link>
      <p className="label mt-4">API Evidence</p>
      <h1 className="display text-3xl font-bold">System Diagnostics</h1>
      <p className="mt-2 text-sm text-[#64748b]">
        Live vs simulated data sources — judges see what is real in under 10 seconds.
      </p>

      {diag && (
        <div className="mt-8 space-y-6">
          <div className="panel panel-glow p-5">
            <p className="label">Execution mode</p>
            <p className="mt-2 text-sm">
              Mode: <span className="font-semibold text-[#22d3ee]">{diag.execution.mode}</span>
              {" · "}Signing: {diag.execution.signingAvailable ? "available" : "not configured"}
              {" · "}Wallet: {diag.execution.walletConnected ? "connected" : "demo"}
            </p>
            <p className="mt-2 text-xs text-[#64748b]">{diag.execution.note}</p>
          </div>

          <Section title="SoSoValue API Calls" sources={diag.sosovalue} />
          <Section title="SoDEX API Calls" sources={diag.sodex} />
          <Section title="AI & Replay" sources={diag.ai} />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="panel border-[#34d399]/20 p-5">
              <p className="font-semibold text-[#34d399]">✓ Live</p>
              <ul className="mt-2 space-y-1 text-xs text-[#94a3b8]">
                {diag.realVsSimulated.live.map((l) => <li key={l}>· {l}</li>)}
              </ul>
            </div>
            <div className="panel border-[#fbbf24]/20 p-5">
              <p className="font-semibold text-[#fbbf24]">○ Simulated / Fallback</p>
              <ul className="mt-2 space-y-1 text-xs text-[#94a3b8]">
                {diag.realVsSimulated.simulated.map((l) => <li key={l}>· {l}</li>)}
              </ul>
            </div>
          </div>

          <p className="mono text-center text-[10px] text-[#475569]">
            Last fetched: {new Date(diag.timestamp).toLocaleString()} · Data mode: {diag.dataMode}
          </p>
        </div>
      )}
    </div>
  );
}
