import { NextResponse } from "next/server";
import { getDataMode } from "@/lib/api-visibility";
import {
  generateProtectionOptions,
  getPositionDetail,
  simulateProtection,
} from "@/lib/risk-engine";
import type { ApiResponse, ProtectionOption, ProtectionSimulation } from "@/lib/types";

interface ProtectionPlansData {
  options: ProtectionOption[];
  simulation: ProtectionSimulation | null;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { positionId, optionId } = body as { positionId: string; optionId?: string };

  if (!positionId) {
    return NextResponse.json({ error: "positionId required" }, { status: 400 });
  }

  const position = await getPositionDetail(positionId);
  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const options = generateProtectionOptions(position);
  const selected = optionId
    ? options.find((o) => o.id === optionId) ?? options.find((o) => o.recommended) ?? options[0]
    : options.find((o) => o.recommended) ?? options[0];

  const simulation = selected ? simulateProtection(position, selected) : null;
  const mode = getDataMode();

  const response: ApiResponse<ProtectionPlansData> = {
    data: { options, simulation },
    meta: { mode, timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response);
}
