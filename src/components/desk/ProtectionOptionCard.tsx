import type { ProtectionOption } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProtectionOptionCard({ option, selected, onSelect, disabled }: {
  option: ProtectionOption; selected: boolean; onSelect: () => void; disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      className={cn(
        "panel w-full p-5 text-left transition-all",
        selected && "panel-glow ring-2 ring-[#22d3ee]/40",
        option.recommended && !selected && "border-[#34d399]/30",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="display text-lg font-bold">{option.label}</h4>
        {option.recommended ? (
          <span className="badge badge-safe shrink-0">★ Recommended</span>
        ) : (
          <span className="badge text-[#64748b]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Alternative</span>
        )}
      </div>
      <p className="mt-2 text-sm text-[#64748b]">{option.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div><span className="text-[#64748b]">Risk after </span><span className="mono font-bold text-[#34d399]">{option.expectedRiskScore}</span></div>
        <div><span className="text-[#64748b]">Liq after </span><span className="mono font-bold">{option.liquidationDistanceAfter}%</span></div>
      </div>
      <p className="mt-3 text-xs italic text-[#475569]">{option.tradeoff}</p>
    </button>
  );
}
