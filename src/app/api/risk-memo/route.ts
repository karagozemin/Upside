import { NextResponse } from "next/server";
import { generateRiskMemo } from "@/lib/ai-risk-memo";
import { getDataMode } from "@/lib/api-visibility";
import { getPositionDetail } from "@/lib/risk-engine";
import type { ApiResponse, RiskMemo } from "@/lib/types";

export async function POST(request: Request) {
  const body = await request.json();
  const { positionId } = body as { positionId: string };

  if (!positionId) {
    return NextResponse.json({ error: "positionId required" }, { status: 400 });
  }

  const position = await getPositionDetail(positionId);
  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const memo = await generateRiskMemo(position);
  const mode = getDataMode();

  const response: ApiResponse<RiskMemo> = {
    data: memo,
    meta: { mode, timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response);
}
