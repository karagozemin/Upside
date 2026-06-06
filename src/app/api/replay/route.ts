import { NextResponse } from "next/server";
import { getDataMode } from "@/lib/api-visibility";
import { DEMO_REPLAY_EVENTS } from "@/lib/demo-data";
import type { ApiResponse, ReplayEvent } from "@/lib/types";

export async function GET() {
  const mode = getDataMode();

  const response: ApiResponse<ReplayEvent[]> = {
    data: DEMO_REPLAY_EVENTS,
    meta: { mode, timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response);
}
