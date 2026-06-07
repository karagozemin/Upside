import { cn } from "@/lib/utils";

export function MetricCard({ label, value, subtext, accent }: {
  label: string; value: string | number; subtext?: string; accent?: "cyan" | "rose" | "emerald";
}) {
  const colors = { cyan: "text-[#22d3ee]", rose: "text-[#fb7185]", emerald: "text-[#34d399]" };
  return (
    <div className="panel p-5">
      <p className="label">{label}</p>
      <p className={cn("display mono mt-2 text-3xl font-bold", accent ? colors[accent] : "text-[#f1f5f9]")}>{value}</p>
      {subtext && <p className="mt-1 text-xs text-[#64748b]">{subtext}</p>}
    </div>
  );
}
