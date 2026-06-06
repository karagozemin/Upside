import type { ProtectionOption } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ProtectionOptionCardProps {
  option: ProtectionOption;
  selected: boolean;
  onSelect: () => void;
}

export function ProtectionOptionCard({
  option,
  selected,
  onSelect,
}: ProtectionOptionCardProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "card w-full p-4 text-left transition-all hover:border-[#3b82f6]/50",
        selected && "border-[#3b82f6] ring-1 ring-[#3b82f6]/30",
        option.recommended && !selected && "border-[#22c55e]/30"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-semibold">{option.label}</h4>
        {option.recommended && (
          <span className="badge-safe rounded px-2 py-0.5 text-xs">Recommended</span>
        )}
        {!option.recommended && (
          <span className="rounded border border-[#2a3548] px-2 py-0.5 text-xs text-[#94a3b8]">
            Not recommended
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-[#94a3b8]">{option.description}</p>
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <div>
          <span className="text-[#94a3b8]">Risk after: </span>
          <span className="font-mono text-[#22c55e]">{option.expectedRiskScore}</span>
        </div>
        <div>
          <span className="text-[#94a3b8]">DD reduction: </span>
          <span className="font-mono">{option.expectedDrawdownReduction}%</span>
        </div>
        <div>
          <span className="text-[#94a3b8]">Complexity: </span>
          <span className="capitalize">{option.executionComplexity}</span>
        </div>
        <div>
          <span className="text-[#94a3b8]">Liq after: </span>
          <span className="font-mono">{option.liquidationDistanceAfter}%</span>
        </div>
      </div>
      <p className="mt-2 text-xs italic text-[#94a3b8]">{option.tradeoff}</p>
    </button>
  );
}
