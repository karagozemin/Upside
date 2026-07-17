import type { ExecutionResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ExecutionProof({ result }: { result: ExecutionResult }) {
  const isTestnet = result.executionMode === "testnet";

  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-[#0b0e11]/60 p-4 text-xs">
      <p className="label mb-3">SoDEX execution proof</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {[
          ["Order ID", result.orderId ?? "—"],
          ["HTTP Status", result.httpStatus != null ? String(result.httpStatus) : "200"],
          ["Signing", result.signingMethod === "eip712" ? "EIP-712 ✓" : "Judge-safe mode"],
          ["Mode", isTestnet ? "testnet" : "simulated fallback"],
          ["Audit hash", result.auditHash ?? "—"],
          ["Risk delta", `${result.riskScoreBefore} → ${result.riskScoreAfter}`],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
            <span className="text-[#767f8d]">{k}</span>
            <span className={cn("mono font-medium", k === "Mode" && !isTestnet && "text-[#f0b90b]")}>{v}</span>
          </div>
        ))}
      </div>
      {!isTestnet && (
        <p className="mt-3 text-[10px] leading-relaxed text-[#767f8d]">
          Live: orderbook, balances, slippage estimate. Simulated: final trade placement because signing keys are not configured (judge-safe mode).
        </p>
      )}
    </div>
  );
}
