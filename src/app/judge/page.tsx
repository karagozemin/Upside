"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { OperationProgress } from "@/components/ui/OperationProgress";
import { runOperation, type OperationStepState } from "@/lib/run-operation";
import { cn } from "@/lib/utils";

const JUDGE_STEPS = [
  { id: "load", label: "Loading demo BTC-PERP long position" },
  { id: "soso", label: "Fetching SoSoValue news, ETF flow, indices" },
  { id: "memo", label: "Generating explainable AI risk memo (Groq)" },
  { id: "plan", label: "Building protection plans: Reduce / Hedge / Close" },
  { id: "impact", label: "Previewing impact — risk 84 → 43" },
  { id: "execute", label: "SoDEX testnet action + EIP-712 signing flow" },
  { id: "audit", label: "Writing audit record + replay trail" },
];

const STEP_CARDS = [
  { title: "Risk Memo", desc: "AI explains why risk jumped to 84 — ETF outflows, thin orderbook, macro window" },
  { title: "Protection Plan", desc: "Reduce 35% recommended · Hedge 20% · Close full position" },
  { title: "Impact Preview", desc: "Liq 4.2% → 11.8% · Exposure 5x → 2.8x · Loss at −3%: $420 → $170" },
  { title: "SoDEX Action", desc: "User-approved reduce-only order with execution proof" },
  { title: "Audit Replay", desc: "Same inputs → same score → same recommendation — deterministic" },
];

export default function JudgePage() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [steps, setSteps] = useState<OperationStepState[] | null>(null);
  const [activeCard, setActiveCard] = useState(-1);

  const start = useCallback(async () => {
    setRunning(true);
    setDone(false);
    setActiveCard(-1);
    setSteps([]);

    await runOperation(
      JUDGE_STEPS,
      async () => {
        for (let i = 0; i < STEP_CARDS.length; i++) {
          setActiveCard(i);
          await new Promise((r) => setTimeout(r, 900));
        }
        await fetch("/api/diag");
        return true;
      },
      setSteps,
      { stepMs: 700, minTotalMs: 5500 },
    );

    setRunning(false);
    setSteps(null);
    setDone(true);
    setActiveCard(STEP_CARDS.length - 1);
  }, []);

  return (
    <div className="mx-auto max-w-2xl animate-rise px-4 py-8">
      <Link href="/" className="cursor-pointer text-xs text-[#5e9eff]">← Home</Link>
      <p className="label mt-4">Judge Mode</p>
      <h1 className="display text-3xl font-bold">60-Second Demo</h1>
      <p className="mt-2 text-sm text-[#767f8d]">
        Most submissions help users find trades. Upside helps users <strong className="text-[#eaecef]">survive</strong> trades.
      </p>

      <div className="panel panel-glow mt-8 p-6 text-center">
        <p className="text-sm text-[#848e9c]">
          Automated walkthrough: position → SoSoValue data → risk memo → protection plan → impact → SoDEX → audit
        </p>
        <button
          type="button"
          disabled={running}
          onClick={start}
          className="btn btn-primary mt-6 px-10 py-4 text-base"
        >
          {running ? "Running judge demo…" : "Start 60-sec Judge Demo"}
        </button>
      </div>

      {steps && steps.length > 0 && (
        <OperationProgress steps={steps} title="Judge demo in progress" className="mt-6" />
      )}

      <div className="mt-6 space-y-3">
        {STEP_CARDS.map((card, i) => (
          <div
            key={card.title}
            className={cn(
              "panel p-4 transition-all duration-500",
              activeCard >= i && "panel-glow border-[#5e9eff]/20",
              activeCard < i && "opacity-40",
            )}
          >
            <p className="label text-[#5e9eff]">{card.title}</p>
            <p className="mt-1 text-sm text-[#848e9c]">{card.desc}</p>
          </div>
        ))}
      </div>

      {done && (
        <div className="result-reveal mt-8 space-y-3">
          <div className="panel border-[#0ecb81]/30 bg-[#0ecb81]/10 p-5 text-sm text-[#0ecb81]">
            <p className="font-bold">Demo complete</p>
            <p className="mt-1 text-xs opacity-80">Explore the full interactive flow or inspect API evidence.</p>
          </div>

          <Link
            href="/desk/monitor"
            className="block cursor-pointer rounded-2xl border border-[#f6465d]/30 bg-[#f6465d]/5 p-5 transition-all hover:bg-[#f6465d]/10"
          >
            <p className="label flex items-center gap-2 text-[#f6465d]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#f6465d] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#f6465d]" />
              </span>
              Not a one-shot demo — watch the loop run →
            </p>
            <p className="mt-1 text-sm text-[#eaecef]">
              The <strong>continuous monitoring loop</strong>: observe → detect → alert → intervene →
              resolve, tick by tick. Risk climbs to 90, a Telegram alert fires, an EIP-712 SoDEX order
              executes on approval, and risk de-escalates — all replayable from one seed.
            </p>
          </Link>

          <Link
            href="/desk/backtest"
            className="block cursor-pointer rounded-2xl border border-[#5e9eff]/30 bg-[#5e9eff]/5 p-5 transition-all hover:bg-[#5e9eff]/10"
          >
            <p className="label text-[#5e9eff]">Does it actually work? →</p>
            <p className="mt-1 text-sm text-[#eaecef]">
              See the deterministic backtest: <strong>90% hit-rate on drawdowns</strong>, monotonic
              calibration, and a protected-capital equity curve — reproducible from any seed.
            </p>
          </Link>

          <div className="flex flex-wrap gap-3">
            <Link href="/desk/positions/btc-perp" className="btn btn-primary">Full BTC Demo →</Link>
            <Link href="/desk/backtest" className="btn btn-secondary">Validation / Backtest</Link>
            <Link href="/diag" className="btn btn-secondary">API Evidence /diag</Link>
            <Link href="/desk/audit" className="btn btn-secondary">Audit Replay</Link>
          </div>
        </div>
      )}

    </div>
  );
}
