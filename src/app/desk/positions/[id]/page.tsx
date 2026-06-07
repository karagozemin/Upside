"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BeforeAfterPanel } from "@/components/desk/BeforeAfterPanel";
import { ExecutionPreview } from "@/components/desk/ExecutionPreview";
import { ProtectionOptionCard } from "@/components/desk/ProtectionOptionCard";
import { RiskBadge } from "@/components/desk/RiskBadge";
import { RiskBreakdownChart } from "@/components/desk/RiskBreakdownChart";
import { RiskMemoCard } from "@/components/desk/RiskMemoCard";
import { OperationProgress } from "@/components/ui/OperationProgress";
import { useDataLoad } from "@/hooks/useDataLoad";
import { PLAN_SELECT_STEPS, POSITION_LOAD_STEPS } from "@/lib/operation-steps";
import { runOperation, type OperationStepState } from "@/lib/run-operation";
import type { PositionDetail, ProtectionOption, ProtectionSimulation, RiskMemo } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { RISK_WEIGHTS } from "@/lib/demo-data";

const STEPS = [
  { n: 1, title: "Risk Memo", sub: "Why risky?", id: "memo" },
  { n: 2, title: "Pick Plan", sub: "Reduce 35%", id: "plan" },
  { n: 3, title: "Impact", sub: "84 → 43", id: "impact" },
  { n: 4, title: "Execute", sub: "SoDEX Testnet", id: "exec" },
];

type PositionLoad = {
  position: PositionDetail;
  memo: RiskMemo;
  options: ProtectionOption[];
  simulation: ProtectionSimulation | null;
  selectedId: string;
};

export default function PositionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [selectedId, setSelectedId] = useState("");
  const [options, setOptions] = useState<ProtectionOption[]>([]);
  const [simulation, setSimulation] = useState<ProtectionSimulation | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [planSteps, setPlanSteps] = useState<OperationStepState[] | null>(null);
  const [planLoading, setPlanLoading] = useState(false);

  const { data, loading, operationSteps } = useDataLoad<PositionLoad>(
    POSITION_LOAD_STEPS,
    async () => {
      const [p, m, pl] = await Promise.all([
        fetch(`/api/positions/${id}`).then((r) => r.json()),
        fetch("/api/risk-memo", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ positionId: id }) }).then((r) => r.json()),
        fetch("/api/protection-plans", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ positionId: id }) }).then((r) => r.json()),
      ]);
      const opts = pl.data?.options ?? [];
      const rec = opts.find((o: ProtectionOption) => o.recommended);
      const sid = rec?.id ?? opts[0]?.id ?? "";
      setOptions(opts);
      setSimulation(pl.data?.simulation ?? null);
      setSelectedId(sid);
      return {
        position: p.data,
        memo: m.data,
        options: opts,
        simulation: pl.data?.simulation ?? null,
        selectedId: sid,
      };
    },
    [id],
    { stepMs: 550, minTotalMs: 2200 },
  );

  async function selectOption(oid: string) {
    setSelectedId(oid);
    setPlanLoading(true);
    try {
      const j = await runOperation(
        PLAN_SELECT_STEPS,
        async () => fetch("/api/protection-plans", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ positionId: id, optionId: oid }),
        }).then((r) => r.json()),
        setPlanSteps,
        { stepMs: 450, minTotalMs: 1400 },
      );
      setSimulation(j.data?.simulation ?? null);
      setTimeout(() => document.getElementById("impact")?.scrollIntoView({ behavior: "smooth" }), 150);
    } finally {
      setPlanLoading(false);
      setPlanSteps(null);
    }
  }

  if (loading || !data) {
    return (
      <div className="mx-auto max-w-2xl panel p-8">
        <p className="label text-[#22d3ee]">Loading position desk</p>
        {operationSteps && <OperationProgress steps={operationSteps} title="Preparing risk analysis" className="mt-4" />}
      </div>
    );
  }

  const { position, memo } = data;
  const activeOptions = options.length ? options : data.options;
  const activeSimulation = simulation ?? data.simulation;
  const activeSelectedId = selectedId || data.selectedId;

  return (
    <div className="mx-auto max-w-2xl animate-rise">
      <Link href="/desk" className="cursor-pointer text-xs text-[#22d3ee] hover:underline">← Overview</Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="display text-3xl font-bold">{position.asset}</h1>
        <RiskBadge verdict={position.verdict} score={position.riskScore} pulse />
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[["Price", formatPrice(position.currentPrice)], ["Lev", `${position.leverage}x`], ["Liq", `${position.liquidationDistance}%`], ["Risk", `${position.riskScore}`]].map(([l,v]) => (
          <div key={l} className="rounded-xl border border-white/5 bg-white/[0.03] px-3 py-2 text-center">
            <p className="text-[10px] text-[#64748b]">{l}</p>
            <p className="mono text-sm font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((s) => (
          <button key={s.id} type="button" onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
            className="shrink-0 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-left hover:border-[#22d3ee]/30">
            <p className="mono text-[10px] text-[#22d3ee]">Step {s.n}</p>
            <p className="text-xs font-semibold">{s.title}</p>
          </button>
        ))}
      </div>

      <div className="mt-8 space-y-10">
        <section id="memo" className="scroll-mt-24 step-line">
          <p className="label mb-3">Step 1 — Read the AI memo</p>
          {memo && <RiskMemoCard memo={memo} />}
        </section>

        <section id="plan" className="scroll-mt-24 step-line">
          <p className="label mb-3">Step 2 — Select the recommended plan</p>
          <div className="space-y-3">
            {activeOptions.map((o) => (
              <ProtectionOptionCard
                key={o.id}
                option={o}
                selected={activeSelectedId === o.id}
                onSelect={() => selectOption(o.id)}
                disabled={planLoading}
              />
            ))}
          </div>
          {planSteps && <OperationProgress steps={planSteps} title="Updating protection simulation" className="mt-4" />}
        </section>

        {activeSimulation && (
          <section id="impact" className="scroll-mt-24 step-line">
            <p className="label mb-3">Step 3 — See the impact</p>
            <BeforeAfterPanel before={activeSimulation.before} after={activeSimulation.after} />
          </section>
        )}

        {activeSimulation && (
          <section id="exec" className="scroll-mt-24">
            <p className="label mb-3">Step 4 — Preview and execute on SoDEX</p>
            <ExecutionPreview positionId={id} optionId={activeSelectedId} simulation={activeSimulation} memo={memo} />
          </section>
        )}

        <div className="panel p-5">
          <p className="font-semibold">Demo complete?</p>
          <div className="mt-3 flex gap-3">
            <Link href="/desk/replay" className="btn btn-primary">Risk Replay →</Link>
            <Link href="/desk/audit" className="btn btn-secondary">Audit Log →</Link>
          </div>
        </div>

        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full cursor-pointer text-center text-xs text-[#64748b] hover:text-[#f1f5f9]">
          {showAdvanced ? "Hide details" : "Detailed risk analysis (for judges)"}
        </button>
        {showAdvanced && (
          <div className="panel space-y-4 p-6">
            <RiskBreakdownChart breakdown={position.breakdown} />
            <p className="mono text-xs text-[#64748b]">{position.marketContext.narrativeNote}</p>
            <table className="w-full text-xs">
              <tbody>
                {Object.entries(RISK_WEIGHTS).map(([k, w]) => (
                  <tr key={k} className="border-t border-white/5">
                    <td className="py-2 capitalize">{k}</td>
                    <td className="mono py-2 text-right">{w * 100}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
