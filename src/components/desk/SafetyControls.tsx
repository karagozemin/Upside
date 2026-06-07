const CONTROLS = [
  { rule: "No auto-trade", detail: "Upside never executes without explicit user approval" },
  { rule: "Max action size", detail: "Single action capped at 40% of position size" },
  { rule: "Slippage cap", detail: "Orders blocked if estimated slippage exceeds 1.5%" },
  { rule: "User confirmation", detail: "Checkbox + sign required before SoDEX submission" },
  { rule: "Dry-run preview", detail: "Preview Protection validates params before signing" },
  { rule: "Circuit breaker", detail: "High-risk warnings block execution below liquidation buffer" },
  { rule: "Non-custodial", detail: "Upside never holds user funds — wallet signs directly" },
  { rule: "Testnet default", detail: "Execution targets SoDEX testnet unless mainnet configured" },
];

export function SafetyControls() {
  return (
    <div className="panel p-5">
      <p className="label text-[#22d3ee]">Safety controls</p>
      <p className="mt-1 text-sm text-[#94a3b8]">
        Upside is a risk copilot, not a black-box trading bot. Every protection action is user-approved, signed by the wallet, and auditable.
      </p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {CONTROLS.map((c) => (
          <div key={c.rule} className="rounded-lg border border-white/5 bg-white/[0.02] px-3 py-2">
            <p className="text-xs font-semibold">{c.rule}</p>
            <p className="mt-0.5 text-[10px] text-[#64748b]">{c.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
