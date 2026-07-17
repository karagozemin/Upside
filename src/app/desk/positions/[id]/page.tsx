"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ApiEvidencePanel } from "@/components/desk/ApiEvidencePanel";
import { BeforeAfterPanel } from "@/components/desk/BeforeAfterPanel";
import { ExecutionPreview } from "@/components/desk/ExecutionPreview";
import { ProtectionOptionCard } from "@/components/desk/ProtectionOptionCard";
import { RiskBadge } from "@/components/desk/RiskBadge";
import { RiskBreakdownChart } from "@/components/desk/RiskBreakdownChart";
import { RiskFactorBreakdown } from "@/components/desk/RiskFactorBreakdown";
import { RiskMemoCard } from "@/components/desk/RiskMemoCard";
import { SafetyControls } from "@/components/desk/SafetyControls";
import { TrackRecordPanel } from "@/components/desk/TrackRecordPanel";
import { OperationProgress } from "@/components/ui/OperationProgress";
import { useDataLoad } from "@/hooks/useDataLoad";
import { PLAN_SELECT_STEPS, POSITION_LOAD_STEPS } from "@/lib/operation-steps";
import { runOperation, type OperationStepState } from "@/lib/run-operation";
import type { PositionDetail, ProtectionOption, ProtectionSimulation, RiskMemo } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { RISK_WEIGHTS } from "@/lib/demo-data";

const STEPS = [
  { n: 1, title: "Risk Memo", sub: "Explain why", id: "memo" },
  { n: 2, title: "Protection Plan", sub: "Reduce/Hedge/Close", id: "plan" },
  { n: 3, title: "Impact Preview", sub: "84 → 43", id: "impact" },
  { n: 4, title: "SoDEX Action", sub: "Sign & audit", id: "exec" },
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
        <p className="label text-[#5e9eff]">Loading position desk</p>
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
      <Link href="/desk" className="cursor-pointer text-xs text-[#5e9eff] hover:underline">← Overview</Link>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="display text-3xl font-bold">{position.asset}</h1>
        <RiskBadge verdict={position.verdict} score={position.riskScore} pulse />
        <span className="badge badge-live text-[10px]">Live-priced · SoDEX + SoSoValue</span>
      </div>

      <div className="mt-4 grid grid-cols-4 gap-2">
        {[["Price", formatPrice(position.currentPrice)], ["Lev", `${position.leverage}x`], ["Liq", `${position.liquidationDistance}%`], ["Risk", `${position.riskScore}`]].map(([l,v]) => (
          <div key={l} className="rounded-xl border border-white/5 bg-white/3 px-3 py-2 text-center">
            <p className="text-[10px] text-[#767f8d]">{l}</p>
            <p className="mono text-sm font-bold">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((s) => (
          <button key={s.id} type="button" onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" })}
            className="shrink-0 rounded-xl border border-white/10 bg-white/3 px-4 py-2 text-left hover:border-[#5e9eff]/30">
            <p className="mono text-[10px] text-[#5e9eff]">Step {s.n}</p>
            <p className="text-xs font-semibold">{s.title}</p>
          </button>
        ))}
      </div>

      <div className="mt-6">
        <ApiEvidencePanel compact />
      </div>

      <div className="mt-8 space-y-10">
        <section id="memo" className="scroll-mt-24 step-line">
          <p className="label mb-3">Step 1 — Risk Memo</p>
          <RiskFactorBreakdown position={position} />
          <div className="mt-4">{memo && <RiskMemoCard memo={memo} />}</div>
        </section>

        <section id="plan" className="scroll-mt-24 step-line">
          <p className="label mb-3">Step 2 — Protection Plan (Reduce / Hedge / Close)</p>
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
            <p className="label mb-3">Step 3 — Impact Preview</p>
            <BeforeAfterPanel before={activeSimulation.before} after={activeSimulation.after} />
          </section>
        )}

        {activeSimulation && (
          <section id="exec" className="scroll-mt-24">
            <p className="label mb-3">Step 4 — SoDEX Action</p>
            <ExecutionPreview positionId={id} optionId={activeSelectedId} simulation={activeSimulation} memo={memo} />
          </section>
        )}

        <SafetyControls />
        <TrackRecordPanel />

        <div className="panel p-5">
          <p className="font-semibold">Audit Replay</p>
          <p className="mt-1 text-xs text-[#767f8d]">Verify the same inputs produce the same risk score and recommendation.</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <Link href="/desk/replay" className="btn btn-primary">Audit Replay →</Link>
            <Link href="/desk/audit" className="btn btn-secondary">Audit Log</Link>
            <Link href="/diag" className="btn btn-secondary">API Evidence</Link>
          </div>
        </div>

        <button type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="w-full cursor-pointer text-center text-xs text-[#767f8d] hover:text-[#eaecef]">
          {showAdvanced ? "Hide details" : "Detailed risk analysis (for judges)"}
        </button>
        {showAdvanced && (
          <div className="panel space-y-4 p-6">
            <RiskBreakdownChart breakdown={position.breakdown} />
            <p className="mono text-xs text-[#767f8d]">{position.marketContext.narrativeNote}</p>
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
