import type { RiskMemo } from "@/lib/types";
export function RiskMemoCard({ memo }: { memo: RiskMemo }) {
  return (
    <div className="panel overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-6 py-4">
        <div>
          <p className="label">AI Risk Memo</p>
          <p className="mono mt-1 text-[10px] text-[#64748b]">{memo.memoId}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={memo.source === "groq" ? "badge badge-live" : "badge badge-demo"}>
            {memo.source === "groq" ? "Groq Live" : "Fallback"}
          </span>
          <span className="mono text-sm text-[#22d3ee]">{memo.confidence}%</span>
        </div>
      </div>
      <div className="space-y-5 p-6">
        <div>
          <p className="label">Verdict</p>
          <p className="display mt-1 text-2xl font-bold text-[#fb7185]">{memo.verdict}</p>
        </div>
        <p className="leading-relaxed text-[#cbd5e1]">{memo.summary}</p>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <p className="label mb-2">Reasons</p>
            <ul className="space-y-2">
              {memo.reasons.map((r, i) => (
                <li key={i} className="flex gap-2 text-sm text-[#94a3b8]">
                  <span className="text-[#22d3ee]">→</span>{r}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="label mb-2">Evidence</p>
            <ul className="space-y-1">
              {memo.evidence.map((e, i) => (
                <li key={i} className="mono text-xs text-[#64748b]">{e}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="rounded-xl border border-[#22d3ee]/20 bg-[#22d3ee]/5 p-4">
          <p className="label text-[#22d3ee]">Recommended action</p>
          <p className="mt-1 font-semibold">{memo.recommendedAction}</p>
        </div>
      </div>
    </div>
  );
}
