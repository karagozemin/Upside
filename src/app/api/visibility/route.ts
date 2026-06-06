import { NextResponse } from "next/server";
import { getApiVisibility, getDataMode } from "@/lib/api-visibility";
import { getEtfFlow, getNewsFeed } from "@/lib/sosovalue";
import { getOrderbook } from "@/lib/sodex";
import type { ApiResponse, ApiSourceStatus } from "@/lib/types";

export async function GET() {
  await Promise.all([
    getNewsFeed(),
    getEtfFlow(),
    getOrderbook("BTC-USD"),
  ]);

  const mode = getDataMode();

  const response: ApiResponse<ApiSourceStatus[]> = {
    data: getApiVisibility(),
    meta: { mode, timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response);
}
