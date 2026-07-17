import { cn } from "@/lib/utils";

export function MetricCard({ label, value, subtext, accent }: {
  label: string; value: string | number; subtext?: string; accent?: "cyan" | "rose" | "emerald";
}) {
  const colors = { cyan: "text-[#5e9eff]", rose: "text-[#f6465d]", emerald: "text-[#0ecb81]" };
  return (
    <div className="panel p-5">
      <p className="label">{label}</p>
      <p className={cn("display mono mt-2 text-3xl font-bold", accent ? colors[accent] : "text-[#eaecef]")}>{value}</p>
      {subtext && <p className="mt-1 text-xs text-[#767f8d]">{subtext}</p>}
    </div>
  );
}
