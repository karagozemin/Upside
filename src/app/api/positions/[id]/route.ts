import { NextResponse } from "next/server";
import { getDataMode } from "@/lib/api-visibility";
import { getPositionDetail } from "@/lib/risk-engine";
import type { ApiResponse, PositionDetail } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const position = await getPositionDetail(id);

  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const mode = getDataMode();
  const response: ApiResponse<PositionDetail> = {
    data: position,
    meta: { mode, timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response);
}
