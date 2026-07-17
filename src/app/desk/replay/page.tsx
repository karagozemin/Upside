"use client";

import Link from "next/link";
import { Timeline } from "@/components/desk/Timeline";
import { OperationProgress } from "@/components/ui/OperationProgress";
import { useDataLoad } from "@/hooks/useDataLoad";
import { REPLAY_LOAD_STEPS } from "@/lib/operation-steps";
import type { ReplayEvent } from "@/lib/types";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const CHART = [
  { t: "10:20", s: 62 }, { t: "10:34", s: 68 }, { t: "10:51", s: 76 },
  { t: "10:55", s: 84 }, { t: "11:02", s: 43 },
];

export default function ReplayPage() {
  const { data: events, loading, operationSteps } = useDataLoad<ReplayEvent[]>(
    REPLAY_LOAD_STEPS,
    async () => {
      const j = await fetch("/api/replay").then((r) => r.json());
      return j.data ?? [];
    },
    [],
    { stepMs: 500, minTotalMs: 1200 },
  );

  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <Link href="/desk/positions/btc-perp" className="cursor-pointer text-xs text-[#5e9eff]">← Back to Demo</Link>
      <p className="label mt-4">Risk Replay</p>
      <h1 className="display text-3xl font-bold">62 → 84 → 43</h1>
      <p className="mt-2 text-sm text-[#767f8d]">How BTC risk evolved over time</p>

      {loading && operationSteps && (
        <OperationProgress steps={operationSteps} title="Building risk replay" className="mt-8" />
      )}

      {!loading && (
        <>
          <div className="panel result-reveal mt-8 p-4">
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={CHART}>
                <XAxis dataKey="t" tick={{ fill: "#767f8d", fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fill: "#767f8d", fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: "#161a20", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8 }} />
                <Line type="monotone" dataKey="s" stroke="#5e9eff" strokeWidth={2} dot={{ fill: "#5e9eff", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="result-reveal mt-8"><Timeline events={events ?? []} /></div>
        </>
      )}
    </div>
  );
}
