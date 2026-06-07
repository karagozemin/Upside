import type { AuditEntry } from "@/lib/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export function AuditTable({ entries }: { entries: AuditEntry[] }) {
  return (
    <div className="panel overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left text-[10px] uppercase tracking-wider text-[#64748b]">
              <th className="px-5 py-3">Time</th>
              <th className="px-5 py-3">Position</th>
              <th className="px-5 py-3">Risk</th>
              <th className="px-5 py-3">Action</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="border-b border-white/5 hover:bg-white/[0.02]">
                <td className="mono px-5 py-3 text-xs">{format(new Date(e.timestamp), "HH:mm")}</td>
                <td className="px-5 py-3 font-medium">{e.position}</td>
                <td className="mono px-5 py-3 text-xs">
                  <span className="text-[#fb7185]">{e.riskScoreBefore}</span> → <span className="text-[#34d399]">{e.riskScoreAfter}</span>
                </td>
                <td className="max-w-[200px] truncate px-5 py-3 text-xs text-[#64748b]">{e.actionRecommended}</td>
                <td className="px-5 py-3">
                  <span className={cn("badge text-[10px]", e.executionStatus === "executed" || e.executionStatus === "simulated" ? "badge-live" : "badge-demo")}>
                    {e.executionStatus === "simulated" ? "executed" : e.executionStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
