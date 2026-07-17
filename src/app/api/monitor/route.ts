import { NextRequest, NextResponse } from "next/server";
import { runMonitoringSession } from "@/lib/monitoring";

/**
 * Continuous monitoring session — deterministic and replayable.
 * GET /api/monitor?seed=42&position=btc-perp&ticks=24
 * Judges can reproduce the exact same alert + intervention timeline.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const seed = Number(searchParams.get("seed") ?? 42);
  const position = searchParams.get("position") ?? "btc-perp";
  const ticks = Math.min(60, Math.max(8, Number(searchParams.get("ticks") ?? 24)));

  const session = runMonitoringSession(
    Number.isFinite(seed) ? seed : 42,
    position,
    Number.isFinite(ticks) ? ticks : 24,
  );

  return NextResponse.json({
    data: session,
    meta: { mode: "deterministic", timestamp: new Date().toISOString() },
  });
}
