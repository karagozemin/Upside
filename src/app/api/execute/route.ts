import { NextResponse } from "next/server";
import { appendAuditEntry } from "@/lib/audit-log";
import { getDataMode } from "@/lib/api-visibility";
import {
  generateProtectionOptions,
  getPositionDetail,
  simulateProtection,
} from "@/lib/risk-engine";
import { executeReduceOnlyOrder, simulateProtectionOrder } from "@/lib/sodex";
import type { ApiResponse, ExecutionResult, OrderPreview } from "@/lib/types";

interface ExecuteData {
  result: ExecutionResult;
  orderPreview: OrderPreview;
}

export async function POST(request: Request) {
  const body = await request.json();
  const { positionId, optionId, confirmed, simulateOnly } = body as {
    positionId: string;
    optionId?: string;
    confirmed?: boolean;
    simulateOnly?: boolean;
  };

  if (!positionId) {
    return NextResponse.json({ error: "positionId required" }, { status: 400 });
  }

  const position = await getPositionDetail(positionId);
  if (!position) {
    return NextResponse.json({ error: "Position not found" }, { status: 404 });
  }

  const options = generateProtectionOptions(position);
  const selected =
    options.find((o) => o.id === optionId) ??
    options.find((o) => o.recommended) ??
    options[0];

  const simulation = simulateProtection(position, selected);
  const reducePercent = selected.reducePercent ?? 35;
  const reduceSize = position.size * (reducePercent / 100);

  const orderPreview = simulateProtectionOrder({
    symbol: position.symbol,
    side: position.side === "long" ? "sell" : "buy",
    size: reduceSize,
    currentPrice: position.currentPrice,
    reduceOnly: true,
  });

  if (simulateOnly) {
    const result: ExecutionResult = {
      success: true,
      executionMode: "simulated",
      message: "Protection simulated — no order submitted.",
      riskScoreBefore: simulation.before.riskScore,
      riskScoreAfter: simulation.after.riskScore,
    };

    return NextResponse.json({
      data: { result, orderPreview },
      meta: { mode: getDataMode(), timestamp: new Date().toISOString() },
    } satisfies ApiResponse<ExecuteData>);
  }

  if (!confirmed) {
    return NextResponse.json(
      { error: "User confirmation required" },
      { status: 400 }
    );
  }

  const result = await executeReduceOnlyOrder({
    symbol: position.symbol,
    symbolId: 1,
    side: position.side === "long" ? "sell" : "buy",
    size: reduceSize,
    price: orderPreview.estimatedPrice,
    riskScoreBefore: simulation.before.riskScore,
    riskScoreAfter: simulation.after.riskScore,
  });

  appendAuditEntry({
    position: `${position.asset} ${position.side === "long" ? "Long" : "Short"}`,
    positionId: position.id,
    dataSources: [
      "SoSoValue ETF Flow",
      "SoSoValue News",
      "SoDEX Orderbook",
      "Groq AI",
      "SoDEX Execution",
    ],
    riskScoreBefore: simulation.before.riskScore,
    riskScoreAfter: simulation.after.riskScore,
    memoId: `memo-${position.id}`,
    actionRecommended: selected.description,
    actionStatus: "accepted",
    executionStatus: result.executionMode === "testnet" ? "executed" : "simulated",
  });

  const response: ApiResponse<ExecuteData> = {
    data: { result, orderPreview },
    meta: { mode: getDataMode(), timestamp: new Date().toISOString() },
  };

  return NextResponse.json(response);
}
