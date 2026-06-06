"use client";

import { useEffect, useState } from "react";
import type { ApiSourceStatus, DataMode } from "@/lib/types";
import { DataModeBadge } from "./DataModeBadge";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface ApiVisibilityPanelProps {
  compact?: boolean;
  className?: string;
}

export function ApiVisibilityPanel({ compact, className }: ApiVisibilityPanelProps) {
  const [sources, setSources] = useState<ApiSourceStatus[]>([]);
  const [mode, setMode] = useState<DataMode>("demo");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/visibility")
      .then((r) => r.json())
      .then((json) => {
        setSources(json.data ?? []);
        setMode(json.meta?.mode ?? "demo");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={cn("card p-4", className)}>
        <p className="text-sm text-[#94a3b8]">Loading API status...</p>
      </div>
    );
  }

  if (compact) {
    const live = sources.filter((s) => s.status === "live").length;
    const fallback = sources.filter((s) => s.status === "fallback").length;
    return (
      <div className={cn("card p-4", className)}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-[#94a3b8]">
              Live Data & API Visibility
            </p>
            <p className="mt-1 text-sm text-[#e2e8f0]">
              {live} live · {fallback} fallback · {sources.length} sources
            </p>
          </div>
          <DataModeBadge mode={mode} />
        </div>
      </div>
    );
  }

  return (
    <div className={cn("card", className)}>
      <div className="flex items-center justify-between border-b border-[#2a3548] px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">
            Live Data & API Visibility
          </h3>
          <p className="mt-1 text-xs text-[#94a3b8]">
            Judge-facing panel — never hides mock data
          </p>
        </div>
        <DataModeBadge mode={mode} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3548] text-left text-xs uppercase tracking-wider text-[#94a3b8]">
              <th className="px-6 py-3">Source</th>
              <th className="px-6 py-3">Endpoint</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Latency</th>
              <th className="px-6 py-3">Last Fetch</th>
              <th className="px-6 py-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {sources.map((source) => (
              <tr
                key={source.name}
                className="border-b border-[#2a3548]/50 hover:bg-[#111827]/50"
              >
                <td className="px-6 py-3 font-medium">{source.name}</td>
                <td className="px-6 py-3 font-mono text-xs text-[#94a3b8]">
                  {source.endpoint}
                </td>
                <td className="px-6 py-3">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs font-medium uppercase",
                      source.status === "live" ? "badge-live" : "badge-demo"
                    )}
                  >
                    {source.status === "live" ? "Live" : "Fallback"}
                  </span>
                </td>
                <td className="px-6 py-3 font-mono text-xs">
                  {source.latencyMs !== null ? `${source.latencyMs}ms` : "—"}
                </td>
                <td className="px-6 py-3 font-mono text-xs text-[#94a3b8]">
                  {source.lastFetch
                    ? format(new Date(source.lastFetch), "HH:mm:ss")
                    : "—"}
                </td>
                <td className="px-6 py-3 text-xs text-[#ef4444]">
                  {source.error ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
