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
        selected && "panel-glow ring-2 ring-[#5e9eff]/40",
        option.recommended && !selected && "border-[#0ecb81]/30",
        disabled && "pointer-events-none opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <h4 className="display text-lg font-bold">{option.label}</h4>
        {option.recommended ? (
          <span className="badge badge-safe shrink-0">★ Recommended</span>
        ) : (
          <span className="badge text-[#767f8d]" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Alternative</span>
        )}
      </div>
      <p className="mt-2 text-sm text-[#767f8d]">{option.description}</p>
      <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div><span className="text-[#767f8d]">Risk after </span><span className="mono font-bold text-[#0ecb81]">{option.expectedRiskScore}</span></div>
        <div><span className="text-[#767f8d]">Liq after </span><span className="mono font-bold">{option.liquidationDistanceAfter}%</span></div>
      </div>
      <p className="mt-3 text-xs italic text-[#5e6673]">{option.tradeoff}</p>
    </button>
  );
}
