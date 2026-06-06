"use client";

import { useState } from "react";
import type { ExecutionResult, OrderPreview, ProtectionSimulation, RiskMemo } from "@/lib/types";
import { formatPrice } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ExecutionPreviewProps {
  positionId: string;
  optionId: string;
  simulation: ProtectionSimulation;
  memo: RiskMemo | null;
  hasSigningKeys?: boolean;
}

export function ExecutionPreview({
  positionId,
  optionId,
  memo,
  hasSigningKeys = false,
}: ExecutionPreviewProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderPreview, setOrderPreview] = useState<OrderPreview | null>(null);
  const [result, setResult] = useState<ExecutionResult | null>(null);

  async function runAction(simulateOnly: boolean) {
    setLoading(true);
    try {
      const res = await fetch("/api/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          positionId,
          optionId,
          confirmed: !simulateOnly,
          simulateOnly,
        }),
      });
      const json = await res.json();
      setOrderPreview(json.data?.orderPreview ?? null);
      if (!simulateOnly) setResult(json.data?.result ?? null);
    } finally {
      setLoading(false);
    }
  }

  function exportMemo() {
    if (!memo) return;
    const blob = new Blob([JSON.stringify(memo, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `upside-memo-${memo.memoId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const preview = orderPreview ?? {
    orderType: "Reduce-Only Limit",
    asset: "BTC-USD",
    side: "sell",
    size: 0.4375,
    estimatedPrice: 60950,
    estimatedSlippage: 0.18,
    reduceOnly: true,
    expectedRiskReduction: 41,
  };

  return (
    <div className="card">
      <div className="border-b border-[#2a3548] px-6 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider">
          SoDEX Action Preview
        </h3>
        <p className="mt-1 text-xs text-[#94a3b8]">
          {hasSigningKeys
            ? "Testnet execution available with configured credentials"
            : "Simulated execution — testnet credentials not configured"}
        </p>
      </div>
      <div className="p-6">
        <table className="w-full text-sm">
          <tbody>
            {[
              ["Order Type", preview.orderType],
              ["Asset", preview.asset],
              ["Side", preview.side],
              ["Size", preview.size.toString()],
              ["Est. Price", formatPrice(preview.estimatedPrice)],
              ["Est. Slippage", `${preview.estimatedSlippage.toFixed(2)}%`],
              ["Reduce-Only", preview.reduceOnly ? "Yes" : "No"],
              ["Expected Risk Reduction", `${preview.expectedRiskReduction} pts`],
            ].map(([label, value]) => (
              <tr key={label} className="border-b border-[#2a3548]/50">
                <td className="py-2 text-[#94a3b8]">{label}</td>
                <td className="py-2 text-right font-mono">{value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <label className="mt-4 flex cursor-pointer items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
            className="rounded border-[#2a3548]"
          />
          I understand this protection action and approve execution
        </label>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={() => runAction(true)}
            className="rounded border border-[#2a3548] px-4 py-2 text-sm hover:bg-[#111827] disabled:opacity-50"
          >
            Simulate Protection
          </button>
          <button
            type="button"
            disabled={loading || !confirmed}
            onClick={() => runAction(false)}
            className={cn(
              "rounded px-4 py-2 text-sm font-medium text-white disabled:opacity-50",
              hasSigningKeys ? "bg-[#22c55e] hover:bg-[#16a34a]" : "bg-[#3b82f6] hover:bg-[#2563eb]"
            )}
          >
            {hasSigningKeys
              ? "Sign & Execute on SoDEX Testnet"
              : "Simulated Execution"}
          </button>
          <button
            type="button"
            onClick={exportMemo}
            disabled={!memo}
            className="rounded border border-[#2a3548] px-4 py-2 text-sm hover:bg-[#111827] disabled:opacity-50"
          >
            Export Risk Memo
          </button>
        </div>

        {result && (
          <div
            className={cn(
              "mt-4 rounded border p-3 text-sm",
              result.executionMode === "testnet"
                ? "border-[#22c55e]/30 bg-[#22c55e]/10 text-[#22c55e]"
                : "border-[#eab308]/30 bg-[#eab308]/10 text-[#eab308]"
            )}
          >
            <p className="font-medium">
              {result.executionMode === "testnet" ? "TESTNET EXECUTED" : "SIMULATED EXECUTION"}
            </p>
            <p className="mt-1 text-xs opacity-80">{result.message}</p>
            {result.orderId && (
              <p className="mt-1 font-mono text-xs">Order ID: {result.orderId}</p>
            )}
            <p className="mt-1 font-mono text-xs">
              Risk: {result.riskScoreBefore} → {result.riskScoreAfter}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
