import { NextResponse } from "next/server";
import { getAuditLog } from "@/lib/audit-log";
import { getDataMode } from "@/lib/api-visibility";
import type { ApiResponse, AuditEntry } from "@/lib/types";

export async function GET() {
  const mode = getDataMode();

  const response: ApiResponse<AuditEntry[]> = {
    data: getAuditLog(),
    meta: { mode, timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response);
}
