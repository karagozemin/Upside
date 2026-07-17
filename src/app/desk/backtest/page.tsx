"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { BacktestResult } from "@/lib/risk-validation";

const SEEDS = [42, 7, 123, 2025];

export default function BacktestPage() {
  const [seed, setSeed] = useState(42);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/backtest?seed=${seed}&samples=180&window=3`)
      .then((r) => r.json())
      .then((j) => {
        if (alive) {
          setResult(j.data);
          setLoading(false);
        }
      })
      .catch(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [seed]);

  return (
    <div className="mx-auto max-w-5xl animate-rise">
      <Link href="/desk" className="cursor-pointer text-xs text-[#5e9eff]">
        ← Back to Overview
      </Link>
      <p className="label mt-4">Validation</p>
      <h1 className="display text-3xl font-bold">Does the risk score actually prevent losses?</h1>
      <p className="mt-2 max-w-2xl text-sm text-[#767f8d]">
        A deterministic backtest of the Upside multi-factor engine over {result?.samples ?? 180}{" "}
        reproducible market windows. Every number below is regenerated live from{" "}
        <code className="text-[#5e9eff]">/api/backtest</code> and is identical on every run — no
        cherry-picking, fully auditable.
      </p>

      {/* Seed selector — proves robustness, not a single lucky path */}
      <div className="mt-6 flex flex-wrap items-center gap-2">
        <span className="text-xs text-[#767f8d]">Reproduce with seed:</span>
        {SEEDS.map((s) => (
          <button
            key={s}
            onClick={() => setSeed(s)}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs transition-all ${
              seed === s
                ? "bg-[#5e9eff]/15 text-[#5e9eff] ring-1 ring-[#5e9eff]/40"
                : "bg-white/5 text-[#767f8d] hover:text-[#eaecef]"
            }`}
          >
            seed={s}
          </button>
        ))}
      </div>

      {loading && (
        <p className="mt-10 animate-pulse text-sm text-[#767f8d]">Running backtest…</p>
      )}

      {!loading && result && (
        <div className="result-reveal mt-8 space-y-8">
          {/* Headline KPIs */}
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi
              label="Hit-rate on drawdowns"
              value={`${result.hitRate}%`}
              sub="Real loss events we flagged early"
              tone="good"
            />
            <Kpi
              label="Alert precision"
              value={`${result.precision}%`}
              sub="Of our alerts, share that were right"
              tone="good"
            />
            <Kpi
              label="False-alarm rate"
              value={`${result.falseAlarmRate}%`}
              sub="Calm bars we wrongly flagged"
              tone={result.falseAlarmRate <= 30 ? "good" : "warn"}
            />
            <Kpi
              label="Net protection edge"
              value={`+${result.netProtectionEdgePct}%`}
              sub="Avoided loss minus opportunity cost"
              tone="good"
            />
          </div>

          {/* Equity curve comparison */}
          <section className="glass rounded-2xl p-6">
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold">Protected vs. unprotected capital</h2>
              <span
                className={`text-sm font-semibold ${
                  result.outperformancePct >= 0 ? "text-[#0ecb81]" : "text-[#f6465d]"
                }`}
              >
                {result.outperformancePct >= 0 ? "+" : ""}
                {result.outperformancePct}% outperformance
              </span>
            </div>
            <p className="mt-1 text-xs text-[#767f8d]">
              Starting capital 100. Acting on Upside verdicts (reduce 35% when flagged) vs. holding
              through every drawdown.
            </p>
            <EquityChart
              protectedCurve={result.equityProtected}
              unprotectedCurve={result.equityUnprotected}
            />
            <div className="mt-4 flex gap-6 text-sm">
              <Legend color="#0ecb81" label={`Protected · ${result.finalProtected}`} />
              <Legend color="#767f8d" label={`Unprotected · ${result.finalUnprotected}`} />
            </div>
          </section>

          {/* Calibration */}
          <section className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Calibration — higher score, higher real risk</h2>
            <p className="mt-1 text-xs text-[#767f8d]">
              For a score to be trustworthy, higher predicted risk buckets must contain more actual
              drawdown events. A monotonic rise here is the proof the score carries signal.
            </p>
            <div className="mt-5 flex items-end gap-3">
              {result.calibration.map((b) => (
                <div key={b.bucket} className="flex flex-1 flex-col items-center gap-2">
                  <span className="text-xs font-medium text-[#eaecef]">
                    {b.realizedDrawdownRate}%
                  </span>
                  <div className="flex h-40 w-full items-end rounded-lg bg-white/5">
                    <div
                      className="w-full rounded-lg bg-linear-to-t from-[#5e9eff] to-[#0ecb81] transition-all"
                      style={{ height: `${Math.max(3, b.realizedDrawdownRate)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-[#767f8d]">score {b.bucket}</span>
                  <span className="text-[10px] text-[#5e6673]">n={b.sampleCount}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Confusion matrix */}
          <section className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold">Confusion matrix</h2>
            <p className="mt-1 text-xs text-[#767f8d]">
              Threshold: score ≥ {result.actionThreshold} triggers action · drawdown event ={" "}
              {result.drawdownThresholdPct}% forward return.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3 text-center sm:max-w-md">
              <MatrixCell
                label="True positive"
                value={result.confusion.truePositive}
                tone="good"
                hint="Flagged & drawdown hit"
              />
              <MatrixCell
                label="False positive"
                value={result.confusion.falsePositive}
                tone="warn"
                hint="Flagged, no drawdown"
              />
              <MatrixCell
                label="False negative"
                value={result.confusion.falseNegative}
                tone="bad"
                hint="Missed a drawdown"
              />
              <MatrixCell
                label="True negative"
                value={result.confusion.trueNegative}
                tone="neutral"
                hint="Calm & correctly quiet"
              />
            </div>
          </section>

          <p className="text-xs text-[#5e6673]">
            Deterministic seed {result.seed} · {result.samples} windows ·{" "}
            {result.windowDays}-day horizon · generated {new Date(result.generatedAt).toISOString()}.
            Reproduce: <code className="text-[#767f8d]">GET /api/backtest?seed={result.seed}</code>
          </p>
        </div>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "good" | "warn" | "bad";
}) {
  const color =
    tone === "good" ? "text-[#0ecb81]" : tone === "warn" ? "text-[#f0b90b]" : "text-[#f6465d]";
  return (
    <div className="glass rounded-2xl p-5">
      <p className="text-[11px] uppercase tracking-wide text-[#767f8d]">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${color}`}>{value}</p>
      <p className="mt-1 text-[11px] text-[#5e6673]">{sub}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-2 text-[#848e9c]">
      <span className="h-2 w-4 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function MatrixCell({
  label,
  value,
  tone,
  hint,
}: {
  label: string;
  value: number;
  tone: "good" | "warn" | "bad" | "neutral";
  hint: string;
}) {
  const ring =
    tone === "good"
      ? "ring-[#0ecb81]/30"
      : tone === "warn"
        ? "ring-[#f0b90b]/30"
        : tone === "bad"
          ? "ring-[#f6465d]/30"
          : "ring-white/10";
  return (
    <div className={`rounded-xl bg-white/5 p-4 ring-1 ${ring}`}>
      <p className="text-2xl font-bold text-[#eaecef]">{value}</p>
      <p className="mt-1 text-xs font-medium text-[#848e9c]">{label}</p>
      <p className="text-[10px] text-[#5e6673]">{hint}</p>
    </div>
  );
}

function EquityChart({
  protectedCurve,
  unprotectedCurve,
}: {
  protectedCurve: number[];
  unprotectedCurve: number[];
}) {
  const all = [...protectedCurve, ...unprotectedCurve];
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const W = 760;
  const H = 200;

  const toPath = (curve: number[]) =>
    curve
      .map((v, i) => {
        const x = (i / (curve.length - 1)) * W;
        const y = H - ((v - min) / range) * H;
        return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  return (
    <div className="mt-5 overflow-hidden rounded-xl bg-[#0b0e11]/60 p-2">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-52 w-full" preserveAspectRatio="none">
        <path d={toPath(unprotectedCurve)} fill="none" stroke="#767f8d" strokeWidth="2" />
        <path d={toPath(protectedCurve)} fill="none" stroke="#0ecb81" strokeWidth="2.5" />
      </svg>
    </div>
  );
}
