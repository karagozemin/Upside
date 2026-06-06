import { cn } from "@/lib/utils";

interface MetricCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: "default" | "critical" | "safe" | "accent";
  className?: string;
}

export function MetricCard({
  label,
  value,
  subtext,
  variant = "default",
  className,
}: MetricCardProps) {
  const valueColors = {
    default: "text-[#e2e8f0]",
    critical: "text-[#ef4444]",
    safe: "text-[#22c55e]",
    accent: "text-[#3b82f6]",
  };

  return (
    <div className={cn("card p-4 animate-fade-in", className)}>
      <p className="text-xs uppercase tracking-wider text-[#94a3b8]">{label}</p>
      <p className={cn("mt-1 font-mono text-2xl font-semibold", valueColors[variant])}>
        {value}
      </p>
      {subtext && (
        <p className="mt-1 text-xs text-[#94a3b8]">{subtext}</p>
      )}
    </div>
  );
}
