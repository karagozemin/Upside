import { NextResponse } from "next/server";
import { getDataMode } from "@/lib/api-visibility";
import { getPortfolioData } from "@/lib/risk-engine";
import type { ApiResponse, PortfolioSummary } from "@/lib/types";

export async function GET() {
  const data = await getPortfolioData();
  const mode = getDataMode();

  const summary: PortfolioSummary = {
    ...data,
    dataMode: mode,
  };

  const response: ApiResponse<PortfolioSummary> = {
    data: summary,
    meta: { mode, timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response);
}
