"use client";

import { useEffect, useState } from "react";

type Item = { k: string; v: string; tone: "good" | "neutral" | "accent" };

const FALLBACK: Item[] = [
  { k: "Backtest hit-rate", v: "…", tone: "good" },
  { k: "Alert precision", v: "…", tone: "good" },
  { k: "Windows tested", v: "180", tone: "neutral" },
  { k: "Reproducible", v: "seed=42", tone: "accent" },
];

/** Marquee strip fed by the real /api/backtest endpoint — live proof, not copy. */
export function LiveTicker() {
  const [items, setItems] = useState<Item[]>(FALLBACK);

  useEffect(() => {
    fetch("/api/backtest?seed=42&samples=180&window=3")
      .then((r) => r.json())
      .then((j) => {
        const d = j.data;
        if (!d) return;
        setItems([
          { k: "Backtest hit-rate", v: `${d.hitRate}%`, tone: "good" },
          { k: "Alert precision", v: `${d.precision}%`, tone: "good" },
          { k: "Protection edge", v: `+${d.netProtectionEdgePct}%`, tone: "good" },
          { k: "Windows tested", v: `${d.samples}`, tone: "neutral" },
          { k: "False alarms", v: `${d.falseAlarmRate}%`, tone: "neutral" },
          { k: "Reproducible", v: `seed=${d.seed}`, tone: "accent" },
          { k: "Data", v: "SoSoValue + SoDEX", tone: "accent" },
        ]);
      })
      .catch(() => {});
  }, []);

  const row = (key: string) => (
    <div key={key} className="flex shrink-0 items-center gap-10 pr-10">
      {items.map((it) => (
        <span key={it.k + key} className="flex items-center gap-2 text-xs whitespace-nowrap">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{
              background:
                it.tone === "good" ? "#34d399" : it.tone === "accent" ? "#22d3ee" : "#64748b",
            }}
          />
          <span className="text-[#64748b]">{it.k}</span>
          <span className="font-mono font-semibold text-[#f1f5f9]">{it.v}</span>
        </span>
      ))}
    </div>
  );

  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-[#05070c]/80 py-3">
      <div className="ticker-track flex w-max">
        {row("a")}
        {row("b")}
        {row("c")}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-[#030508] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-linear-to-l from-[#030508] to-transparent" />
    </div>
  );
}
