import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { RiskVerdict } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatPercent(value: number, decimals = 1): string {
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function verdictLabel(verdict: RiskVerdict): string {
  const labels: Record<RiskVerdict, string> = {
    safe: "Safe",
    watch: "Watch",
    defensive: "Defensive",
    critical: "Critical",
  };
  return labels[verdict];
}

export function verdictBadgeClass(verdict: RiskVerdict): string {
  const classes: Record<RiskVerdict, string> = {
    safe: "badge-safe",
    watch: "badge-watch",
    defensive: "badge-defensive",
    critical: "badge-critical",
  };
  return classes[verdict];
}

export function getVerdictFromScore(score: number): RiskVerdict {
  if (score <= 30) return "safe";
  if (score <= 60) return "watch";
  if (score <= 80) return "defensive";
  return "critical";
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
