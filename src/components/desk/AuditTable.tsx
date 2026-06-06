import type { AuditEntry } from "@/lib/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface AuditTableProps {
  entries: AuditEntry[];
}

export function AuditTable({ entries }: AuditTableProps) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3548] text-left text-xs uppercase tracking-wider text-[#94a3b8]">
              <th className="px-6 py-3">Timestamp</th>
              <th className="px-6 py-3">Position</th>
              <th className="px-6 py-3">Sources</th>
              <th className="px-6 py-3">Risk Before</th>
              <th className="px-6 py-3">Risk After</th>
              <th className="px-6 py-3">Memo ID</th>
              <th className="px-6 py-3">Action</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3">Execution</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.id}
                className="border-b border-[#2a3548]/50 hover:bg-[#111827]/50"
              >
                <td className="px-6 py-3 font-mono text-xs">
                  {format(new Date(entry.timestamp), "HH:mm:ss")}
                </td>
                <td className="px-6 py-3 font-medium">{entry.position}</td>
                <td className="px-6 py-3 text-xs text-[#94a3b8]">
                  {entry.dataSources.join(", ")}
                </td>
                <td className="px-6 py-3 font-mono text-[#ef4444]">
                  {entry.riskScoreBefore}
                </td>
                <td className="px-6 py-3 font-mono text-[#22c55e]">
                  {entry.riskScoreAfter}
                </td>
                <td className="px-6 py-3 font-mono text-xs text-[#94a3b8]">
                  {entry.memoId ?? "—"}
                </td>
                <td className="px-6 py-3 text-xs">{entry.actionRecommended}</td>
                <td className="px-6 py-3">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs capitalize",
                      entry.actionStatus === "accepted"
                        ? "badge-safe"
                        : entry.actionStatus === "rejected"
                          ? "badge-critical"
                          : "badge-demo"
                    )}
                  >
                    {entry.actionStatus}
                  </span>
                </td>
                <td className="px-6 py-3">
                  <span
                    className={cn(
                      "rounded px-2 py-0.5 text-xs capitalize",
                      entry.executionStatus === "executed"
                        ? "badge-live"
                        : entry.executionStatus === "simulated"
                          ? "badge-demo"
                          : "badge-demo"
                    )}
                  >
                    {entry.executionStatus}
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
