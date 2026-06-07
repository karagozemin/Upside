import { NextResponse } from "next/server";
import { getDiagReport } from "@/lib/diag";
import type { ApiResponse } from "@/lib/types";
import type { DiagReport } from "@/lib/diag";

export async function GET() {
  const data = await getDiagReport();
  const response: ApiResponse<DiagReport> = {
    data,
    meta: { mode: data.dataMode as "live" | "demo" | "mixed", timestamp: data.timestamp },
  };
  return NextResponse.json(response);
}
