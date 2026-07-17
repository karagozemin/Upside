"use client";

import { cn } from "@/lib/utils";
import type { OperationStepState } from "@/lib/run-operation";

function StepIcon({ status }: { status: OperationStepState["status"] }) {
  if (status === "done") {
    return (
      <span className="op-check flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0ecb81]/20 text-[#0ecb81]">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
          <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    );
  }

  if (status === "active") {
    return <span className="op-spinner h-5 w-5 shrink-0 rounded-full border-2 border-[#5e9eff]/20 border-t-[#5e9eff]" />;
  }

  return <span className="h-5 w-5 shrink-0 rounded-full border border-white/10" />;
}

export function OperationProgress({
  steps,
  title = "Processing",
  className,
}: {
  steps: OperationStepState[];
  title?: string;
  className?: string;
}) {
  const active = steps.find((s) => s.status === "active");

  return (
    <div className={cn("op-panel rounded-xl border border-[#5e9eff]/20 bg-[#5e9eff]/5 p-4", className)}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="label text-[#5e9eff]">{title}</p>
        {active && <p className="mono text-[10px] text-[#767f8d] animate-pulse">live</p>}
      </div>
      <ul className="space-y-2.5">
        {steps.map((step) => (
          <li
            key={step.id}
            className={cn(
              "flex items-center gap-3 text-sm transition-colors duration-300",
              step.status === "active" && "text-[#eaecef]",
              step.status === "done" && "text-[#0ecb81]",
              step.status === "pending" && "text-[#767f8d]",
            )}
          >
            <StepIcon status={step.status} />
            <span>{step.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function OperationResult({
  title,
  message,
  detail,
  className,
}: {
  title: string;
  message?: string;
  detail?: string;
  className?: string;
}) {
  return (
    <div className={cn("result-reveal rounded-xl border border-[#0ecb81]/30 bg-[#0ecb81]/10 p-4 text-sm text-[#0ecb81]", className)}>
      <div className="flex items-start gap-3">
        <span className="op-check mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0ecb81]/20">
          <svg width="14" height="14" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <p className="font-bold">{title}</p>
          {message && <p className="mt-1 text-xs opacity-80">{message}</p>}
          {detail && <p className="mono mt-1 text-xs">{detail}</p>}
        </div>
      </div>
    </div>
  );
}
