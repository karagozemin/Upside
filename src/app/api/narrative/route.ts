import { NextResponse } from "next/server";
import { getDataMode } from "@/lib/api-visibility";
import { DEMO_NARRATIVE_SECTORS } from "@/lib/demo-data";
import { getIndices } from "@/lib/sosovalue";
import type { ApiResponse, NarrativeSector } from "@/lib/types";

export async function GET() {
  await getIndices();
  const mode = getDataMode();

  const response: ApiResponse<NarrativeSector[]> = {
    data: DEMO_NARRATIVE_SECTORS,
    meta: { mode, timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response);
}
