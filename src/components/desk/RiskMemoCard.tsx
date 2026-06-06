import type { RiskMemo } from "@/lib/types";
import { format } from "date-fns";

interface RiskMemoCardProps {
  memo: RiskMemo;
}

export function RiskMemoCard({ memo }: RiskMemoCardProps) {
  return (
    <div className="card">
      <div className="flex items-center justify-between border-b border-[#2a3548] px-6 py-4">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider">AI Risk Memo</h3>
          <p className="mt-1 font-mono text-xs text-[#94a3b8]">
            ID: {memo.memoId} · {format(new Date(memo.generatedAt), "HH:mm:ss")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={
              memo.source === "groq" ? "badge-live rounded px-2 py-0.5 text-xs" : "badge-demo rounded px-2 py-0.5 text-xs"
            }
          >
            {memo.source === "groq" ? "Groq Live" : "Template Fallback"}
          </span>
          <span className="font-mono text-sm">
            Confidence: <span className="text-[#3b82f6]">{memo.confidence}%</span>
          </span>
        </div>
      </div>
      <div className="space-y-4 p-6">
        <div>
          <span className="text-xs uppercase tracking-wider text-[#94a3b8]">Verdict</span>
          <p className="mt-1 text-lg font-semibold text-[#ef4444]">{memo.verdict}</p>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-[#94a3b8]">Summary</span>
          <p className="mt-1 leading-relaxed text-[#e2e8f0]">{memo.summary}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#94a3b8]">Reasons</span>
            <ul className="mt-2 space-y-1">
              {memo.reasons.map((r, i) => (
                <li key={i} className="text-sm text-[#e2e8f0] before:mr-2 before:text-[#3b82f6] before:content-['→']">
                  {r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[#94a3b8]">Evidence</span>
            <ul className="mt-2 space-y-1">
              {memo.evidence.map((e, i) => (
                <li key={i} className="font-mono text-xs text-[#94a3b8]">
                  {e}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-[#94a3b8]">
            Recommended Protection
          </span>
          <p className="mt-1 font-medium text-[#3b82f6]">{memo.recommendedAction}</p>
        </div>
        <div>
          <span className="text-xs uppercase tracking-wider text-[#94a3b8]">
            Would Invalidate Warning
          </span>
          <ul className="mt-2 space-y-1">
            {memo.invalidationTriggers.map((t, i) => (
              <li key={i} className="text-sm text-[#94a3b8]">
                • {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
