import { NextResponse } from "next/server";
import { runBacktest } from "@/lib/risk-validation";

/**
 * GET /api/backtest?seed=42&samples=180&window=3
 *
 * Deterministic validation of the Upside risk engine. Same inputs always
 * return the same evidence numbers, so a judge can reproduce every figure.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const seed = clampInt(searchParams.get("seed"), 42, 1, 999_999);
  const samples = clampInt(searchParams.get("samples"), 180, 30, 1000);
  const windowDays = clampInt(searchParams.get("window"), 3, 1, 30);

  const result = runBacktest(seed, samples, windowDays);

  return NextResponse.json({
    data: result,
    meta: {
      mode: "deterministic",
      reproducible: true,
      timestamp: result.generatedAt,
    },
  });
}

function clampInt(raw: string | null, fallback: number, min: number, max: number): number {
  const n = raw == null ? NaN : parseInt(raw, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
