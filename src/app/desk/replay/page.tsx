"use client";

import { useEffect, useState } from "react";
import { Timeline } from "@/components/desk/Timeline";
import type { ReplayEvent } from "@/lib/types";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const sparkData = [
  { time: "10:20", score: 62 },
  { time: "10:34", score: 68 },
  { time: "10:51", score: 76 },
  { time: "10:55", score: 84 },
  { time: "10:58", score: 84 },
  { time: "11:02", score: 43 },
];

export default function ReplayPage() {
  const [events, setEvents] = useState<ReplayEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/replay")
      .then((r) => r.json())
      .then((json) => setEvents(json.data ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-[#94a3b8]">Loading risk replay...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Risk Replay</h1>
        <p className="mt-1 text-sm text-[#94a3b8]">
          BTC-PERP timeline — how risk evolved from 62 → 84 → 43 after protection.
        </p>
      </div>

      <div className="card p-4">
        <p className="mb-2 text-xs uppercase tracking-wider text-[#94a3b8]">
          Risk Score Evolution
        </p>
        <ResponsiveContainer width="100%" height={120}>
          <LineChart data={sparkData}>
            <XAxis dataKey="time" tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <YAxis domain={[0, 100]} tick={{ fill: "#94a3b8", fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                background: "#1a2235",
                border: "1px solid #2a3548",
                borderRadius: "4px",
              }}
            />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: "#3b82f6", r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <Timeline events={events} />
    </div>
  );
}
