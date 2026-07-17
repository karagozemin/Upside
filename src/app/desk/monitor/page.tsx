"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import type { MonitorSession, MonitorTick, TickEventType } from "@/lib/monitoring";

const EVENT_STYLE: Record<TickEventType, { color: string; ring: string; label: string }> = {
  observe: { color: "#64748b", ring: "ring-white/10", label: "OBSERVE" },
  risk_rising: { color: "#fbbf24", ring: "ring-[#fbbf24]/30", label: "RISK RISING" },
  alert: { color: "#fb7185", ring: "ring-[#fb7185]/40", label: "ALERT" },
  intervention_proposed: { color: "#f97316", ring: "ring-[#f97316]/40", label: "PROPOSED" },
  awaiting_approval: { color: "#f97316", ring: "ring-[#f97316]/30", label: "AWAITING" },
  executed: { color: "#22d3ee", ring: "ring-[#22d3ee]/40", label: "EXECUTED" },
  resolved: { color: "#34d399", ring: "ring-[#34d399]/40", label: "RESOLVED" },
};

function verdictColor(v: string): string {
  return v === "critical"
    ? "#fb7185"
    : v === "defensive"
      ? "#f97316"
      : v === "watch"
        ? "#fbbf24"
        : "#34d399";
}

export default function MonitorPage() {
  const [session, setSession] = useState<MonitorSession | null>(null);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/monitor?seed=42&position=btc-perp&ticks=24")
      .then((r) => r.json())
      .then((j) => {
        setSession(j.data);
        setCursor(0);
        setPlaying(true);
      });
  }, []);

  useEffect(() => {
    if (!session || !playing) return;
    if (cursor >= session.ticks.length - 1) {
      setPlaying(false);
      return;
    }
    timer.current = setTimeout(() => setCursor((c) => c + 1), 850 / speed);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [session, playing, cursor, speed]);

  if (!session) {
    return <p className="mt-10 animate-pulse text-sm text-[#64748b]">Booting monitor…</p>;
  }

  const shown = session.ticks.slice(0, cursor + 1);
  const current = session.ticks[cursor];
  const firedAlert = session.alerts.find((a) => a.tickIndex <= cursor);
  const intervention =
    session.intervention && session.intervention.executedAtTick <= cursor
      ? session.intervention
      : null;
  const es = EVENT_STYLE[current.event];

  return (
    <div className="mx-auto max-w-6xl animate-rise">
      <Link href="/desk" className="cursor-pointer text-xs text-[#22d3ee]">
        ← Back to Overview
      </Link>
      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34d399] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#34d399]" />
            </span>
            Live Monitoring Loop
          </p>
          <h1 className="display text-3xl font-bold">
            Continuous risk supervision — {session.asset}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-[#64748b]">
            One position, watched every {session.intervalSeconds}s. The system observes → detects a
            rising risk factor → fires a Telegram alert → proposes an intervention → executes a
            signed SoDEX order on approval → and keeps watching. Deterministic and replayable.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (cursor >= session.ticks.length - 1) setCursor(0);
              setPlaying((p) => !p);
            }}
            className="btn btn-primary px-4 py-2 text-xs"
          >
            {playing ? "❚❚ Pause" : cursor >= session.ticks.length - 1 ? "↻ Replay" : "▶ Play"}
          </button>
          {[1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => setSpeed(s)}
              className={`cursor-pointer rounded-lg px-2.5 py-2 text-xs transition-all ${
                speed === s
                  ? "bg-[#22d3ee]/15 text-[#22d3ee] ring-1 ring-[#22d3ee]/40"
                  : "bg-white/5 text-[#64748b] hover:text-[#f1f5f9]"
              }`}
            >
              {s}×
            </button>
          ))}
        </div>
      </div>

      {/* Live status band */}
      <div className={`glass mt-6 rounded-2xl p-5 ring-1 ${es.ring} transition-all`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className="rounded-lg px-2.5 py-1 text-[10px] font-bold tracking-wider"
              style={{ background: `${es.color}22`, color: es.color }}
            >
              {es.label}
            </span>
            <div>
              <p className="text-sm font-semibold text-[#f1f5f9]">{current.headline}</p>
              <p className="text-xs text-[#64748b]">{current.detail}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] uppercase text-[#64748b]">Clock</p>
              <p className="font-mono text-sm text-[#94a3b8]">{current.clock}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-[#64748b]">Price</p>
              <p className="font-mono text-sm text-[#94a3b8]">
                ${current.price.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase text-[#64748b]">Risk</p>
              <p
                className="font-mono text-2xl font-bold"
                style={{ color: verdictColor(current.verdict) }}
              >
                {current.riskScore}
                <span className="ml-1 text-xs">
                  {current.delta > 0 ? `▲${current.delta}` : current.delta < 0 ? `▼${Math.abs(current.delta)}` : "—"}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* Left: live risk chart + factor breakdown */}
        <div className="space-y-6">
          <section className="glass rounded-2xl p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Risk over time</h2>
              <span className="text-xs text-[#64748b]">
                peak {session.peakRisk} · now {current.riskScore}
              </span>
            </div>
            <RiskChart ticks={shown} full={session.ticks} intervention={session.intervention} />
          </section>

          <section className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Why — live factor breakdown</h2>
            <p className="mt-1 text-xs text-[#64748b]">
              Deterministic decision trail: source → raw value → normalized → weight → contribution.
              The score is the sum of the bars; nothing is a black box.
            </p>
            <div className="mt-4 space-y-2">
              {[...current.factors]
                .sort((a, b) => b.contribution - a.contribution)
                .map((f) => (
                  <div key={f.id} className="flex items-center gap-3">
                    <div className="w-36 shrink-0">
                      <p className="text-xs font-medium text-[#f1f5f9]">{f.label}</p>
                      <p className="text-[10px] text-[#475569]">{f.source}</p>
                    </div>
                    <div className="h-6 flex-1 overflow-hidden rounded bg-white/5">
                      <div
                        className="flex h-full items-center rounded bg-linear-to-r from-[#22d3ee]/70 to-[#fb7185]/70 px-2 transition-all duration-500"
                        style={{ width: `${Math.max(4, f.normalized)}%` }}
                      >
                        <span className="text-[10px] text-[#030508]">{f.raw}</span>
                      </div>
                    </div>
                    <div className="w-24 shrink-0 text-right">
                      <span className="font-mono text-xs text-[#94a3b8]">
                        {f.normalized}×{f.weight}
                      </span>
                      <span className="ml-1 font-mono text-xs font-bold text-[#f1f5f9]">
                        ={f.contribution}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </section>
        </div>

        {/* Right: loop lifecycle */}
        <div className="space-y-6">
          {/* Telegram alert card */}
          <section
            className={`glass rounded-2xl p-5 transition-all ${
              firedAlert ? "ring-1 ring-[#fb7185]/40" : "opacity-40"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">✈</span>
              <h3 className="text-sm font-semibold">Telegram Alert</h3>
              {firedAlert && (
                <span className="ml-auto rounded bg-[#fb7185]/15 px-2 py-0.5 text-[10px] font-bold text-[#fb7185]">
                  SENT · {firedAlert.clock}
                </span>
              )}
            </div>
            {firedAlert ? (
              <div className="mt-3 rounded-xl bg-[#030508]/60 p-3">
                <p className="text-xs leading-relaxed text-[#cbd5e1]">{firedAlert.message}</p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#475569]">
                No alert yet — risk below threshold (≥60).
              </p>
            )}
          </section>

          {/* Intervention card */}
          <section
            className={`glass rounded-2xl p-5 transition-all ${
              intervention ? "ring-1 ring-[#22d3ee]/40" : "opacity-40"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <h3 className="text-sm font-semibold">SoDEX Intervention</h3>
              {intervention && (
                <span className="ml-auto rounded bg-[#34d399]/15 px-2 py-0.5 text-[10px] font-bold text-[#34d399]">
                  {intervention.status.toUpperCase()}
                </span>
              )}
            </div>
            {intervention ? (
              <div className="mt-3 space-y-2 text-xs">
                <Row k="Action" v={intervention.action} />
                <Row k="Signing" v="EIP-712 signed payload" />
                <Row k="Order ID" v={intervention.orderId} mono />
                <div className="flex items-center justify-between rounded-lg bg-[#030508]/60 p-3">
                  <span className="text-[#64748b]">Risk before → after</span>
                  <span className="font-mono font-bold">
                    <span className="text-[#fb7185]">{intervention.riskBefore}</span>
                    <span className="mx-1 text-[#64748b]">→</span>
                    <span className="text-[#34d399]">{intervention.riskAfter}</span>
                  </span>
                </div>
                <p className="text-[10px] text-[#475569]">
                  Executed only after user approval (policy gate). The loop resumes monitoring
                  immediately after fill.
                </p>
              </div>
            ) : (
              <p className="mt-3 text-xs text-[#475569]">
                No intervention yet — awaiting action threshold (≥78) and user approval.
              </p>
            )}
          </section>

          {/* Event feed */}
          <section className="glass rounded-2xl p-5">
            <h3 className="text-sm font-semibold">Loop event feed</h3>
            <div className="mt-3 max-h-64 space-y-1.5 overflow-y-auto pr-1">
              {[...shown].reverse().map((t) => {
                const s = EVENT_STYLE[t.event];
                return (
                  <div key={t.index} className="flex items-start gap-2 text-xs">
                    <span className="mt-0.5 font-mono text-[10px] text-[#475569]">{t.clock}</span>
                    <span
                      className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: s.color }}
                    />
                    <span className="text-[#94a3b8]">{t.headline}</span>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>

      {/* Outcome strip */}
      {intervention && cursor >= session.ticks.length - 1 && (
        <div className="result-reveal glass mt-6 rounded-2xl p-6">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Outcome label="Peak risk reached" value={`${session.peakRisk}`} tone="warn" />
            <Outcome label="Resolved risk" value={`${session.resolvedRisk}`} tone="good" />
            <Outcome
              label="Est. drawdown avoided"
              value={`~${session.drawdownAvoidedPct}%`}
              tone="good"
            />
            <Outcome label="Alerts · interventions" value={`${session.alerts.length} · 1`} tone="neutral" />
          </div>
          <p className="mt-4 text-xs text-[#475569]">
            Full closed loop completed. Reproduce exactly:{" "}
            <code className="text-[#64748b]">GET /api/monitor?seed={session.seed}</code>
          </p>
        </div>
      )}
    </div>
  );
}

function Row({ k, v, mono }: { k: string; v: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[#64748b]">{k}</span>
      <span className={`text-[#cbd5e1] ${mono ? "font-mono" : ""}`}>{v}</span>
    </div>
  );
}

function Outcome({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "neutral";
}) {
  const color = tone === "good" ? "text-[#34d399]" : tone === "warn" ? "text-[#fbbf24]" : "text-[#f1f5f9]";
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-[#64748b]">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
    </div>
  );
}

function RiskChart({
  ticks,
  full,
  intervention,
}: {
  ticks: MonitorTick[];
  full: MonitorTick[];
  intervention: MonitorSession["intervention"];
}) {
  const W = 720;
  const H = 200;
  const n = full.length;
  const max = 100;

  const x = (i: number) => (i / (n - 1)) * W;
  const y = (v: number) => H - (v / max) * H;

  const path = ticks
    .map((t, i) => `${i === 0 ? "M" : "L"}${x(t.index).toFixed(1)},${y(t.riskScore).toFixed(1)}`)
    .join(" ");

  const last = ticks[ticks.length - 1];

  return (
    <div className="mt-4 overflow-hidden rounded-xl bg-[#030508]/60 p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full" preserveAspectRatio="none">
        {/* threshold lines */}
        <line x1="0" y1={y(60)} x2={W} y2={y(60)} stroke="#fb7185" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        <line x1="0" y1={y(78)} x2={W} y2={y(78)} stroke="#f97316" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
        {/* intervention marker */}
        {intervention && intervention.executedAtTick <= last.index && (
          <line
            x1={x(intervention.executedAtTick)}
            y1="0"
            x2={x(intervention.executedAtTick)}
            y2={H}
            stroke="#22d3ee"
            strokeWidth="1.5"
            opacity="0.6"
          />
        )}
        <path d={path} fill="none" stroke={verdictColor(last.verdict)} strokeWidth="2.5" />
        <circle cx={x(last.index)} cy={y(last.riskScore)} r="4" fill={verdictColor(last.verdict)} />
      </svg>
      <div className="flex justify-between px-1 text-[10px] text-[#475569]">
        <span>alert ≥60 · action ≥78</span>
        <span>{intervention ? "│ = SoDEX intervention" : ""}</span>
      </div>
    </div>
  );
}
