"use client";

import { useState } from "react";
import { OperationProgress, OperationResult } from "@/components/ui/OperationProgress";
import { runOperation, type OperationStepState } from "@/lib/run-operation";
import { ExecutionProof } from "@/components/desk/ExecutionProof";
import type { ExecutionResult, OrderPreview, ProtectionSimulation, RiskMemo } from "@/lib/types";
import { formatPrice, cn } from "@/lib/utils";

const PREVIEW_STEPS = [
  { id: "validate", label: "Validating reduce-only order parameters" },
  { id: "orderbook", label: "Fetching SoDEX testnet orderbook" },
  { id: "slippage", label: "Estimating slippage and fill price" },
];

const EXECUTE_STEPS = [
  { id: "payload", label: "Building EIP-712 signature payload" },
  { id: "sign", label: "Signing order with SoDEX credentials" },
  { id: "submit", label: "Submitting to SoDEX testnet gateway" },
  { id: "audit", label: "Confirming execution and writing audit log" },
];

export function ExecutionPreview({ positionId, optionId, memo }: {
  positionId: string; optionId: string; simulation: ProtectionSimulation; memo: RiskMemo | null;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [operationSteps, setOperationSteps] = useState<OperationStepState[] | null>(null);
  const [operationKind, setOperationKind] = useState<"preview" | "execute" | null>(null);
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);
  const [previewResult, setPreviewResult] = useState<string | null>(null);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  async function run(simulateOnly: boolean) {
    setLoading(true);
    setResult(null);
    setPreviewResult(null);
    setOperationKind(simulateOnly ? "preview" : "execute");
    setOperationSteps([]);

    try {
      const json = await runOperation(
        simulateOnly ? PREVIEW_STEPS : EXECUTE_STEPS,
        async () => {
          const res = await fetch("/api/execute", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ positionId, optionId, confirmed: !simulateOnly, simulateOnly }),
          });
          return res.json();
        },
        setOperationSteps,
        { stepMs: simulateOnly ? 500 : 650, minTotalMs: simulateOnly ? 1600 : 2600 },
      );

      setOrderPreview(json.data?.orderPreview ?? null);
      if (simulateOnly) {
        setPreviewResult(json.data?.result?.message ?? "Order parameters validated.");
      } else {
        setResult(json.data?.result ?? null);
      }
    } finally {
      setLoading(false);
      setOperationSteps(null);
    }
  }

  const preview = orderPreview ?? {
    orderType: "Reduce-Only", asset: "BTC-USD", side: "sell", size: 0.4375,
    estimatedPrice: 60950, estimatedSlippage: 0.18, reduceOnly: true, expectedRiskReduction: 41,
  };

  return (
    <div className="panel panel-glow">
      <div className="border-b border-white/5 bg-[#22d3ee]/5 px-6 py-4">
        <p className="label text-[#22d3ee]">SoDEX Action</p>
        <p className="text-sm">① Approve → ② Preview → ③ Sign & Execute on testnet</p>
      </div>
      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          {[["Type", preview.orderType], ["Size", preview.size], ["Price", formatPrice(preview.estimatedPrice)], ["Slippage", `${preview.estimatedSlippage}%`]].map(([k,v]) => (
            <div key={k} className="rounded-lg bg-white/5 px-3 py-2">
              <p className="text-[10px] text-[#64748b]">{k}</p>
              <p className="mono text-xs font-medium">{v}</p>
            </div>
          ))}
        </div>

        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} className="h-4 w-4 accent-[#22d3ee]" />
          <span className="text-sm">I approve this protection plan</span>
        </label>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button type="button" disabled={loading} onClick={() => run(true)} className="btn btn-secondary flex-1 py-3">
            {loading && operationKind === "preview" ? "Previewing…" : "Preview Protection"}
          </button>
          <button type="button" disabled={loading || !confirmed} onClick={() => run(false)}
            className={cn("btn btn-primary flex-1 py-3", !confirmed && "opacity-40")}>
            {loading && operationKind === "execute" ? "Executing…" : "Sign & Execute on SoDEX Testnet"}
          </button>
        </div>

        {operationSteps && operationSteps.length > 0 && (
          <OperationProgress
            steps={operationSteps}
            title={operationKind === "preview" ? "Previewing protection order" : "Executing on SoDEX testnet"}
            className="mt-4"
          />
        )}

        {previewResult && !loading && (
          <OperationResult
            className="mt-4"
            title="Protection preview ready"
            message={previewResult}
          />
        )}

        {result && !loading && (
          <>
            <OperationResult
              className="mt-4"
              title="Protection Executed on SoDEX Testnet"
              message={result.message}
              detail={`Risk ${result.riskScoreBefore} → ${result.riskScoreAfter}`}
            />
            <ExecutionProof result={result} />
          </>
        )}

        {memo && (
          <button type="button" onClick={() => {
            const b = new Blob([JSON.stringify(memo, null, 2)], { type: "application/json" });
            const a = document.createElement("a"); a.href = URL.createObjectURL(b);
            a.download = `memo-${memo.memoId}.json`; a.click();
          }} className="mt-3 w-full cursor-pointer text-center text-xs text-[#64748b] hover:text-[#f1f5f9]">
            Download memo
          </button>
        )}
      </div>
    </div>
  );
}
