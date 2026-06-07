import type { OperationStepDef } from "./run-operation";

export const PORTFOLIO_LOAD_STEPS: OperationStepDef[] = [
  { id: "positions", label: "Loading open positions from SoDEX" },
  { id: "risk", label: "Computing portfolio risk scores" },
  { id: "connectivity", label: "Checking SoSoValue API connectivity" },
];

export const POSITION_LOAD_STEPS: OperationStepDef[] = [
  { id: "position", label: "Loading position from SoDEX testnet" },
  { id: "market", label: "Fetching SoSoValue market context" },
  { id: "memo", label: "Generating AI risk memo with Groq" },
  { id: "plans", label: "Building protection plan options" },
];

export const PLAN_SELECT_STEPS: OperationStepDef[] = [
  { id: "recalc", label: "Recalculating position exposure" },
  { id: "simulate", label: "Simulating protection impact" },
  { id: "risk", label: "Updating before/after risk scores" },
];

export const REPLAY_LOAD_STEPS: OperationStepDef[] = [
  { id: "events", label: "Reconstructing risk event timeline" },
  { id: "scores", label: "Loading historical risk score changes" },
];

export const AUDIT_LOAD_STEPS: OperationStepDef[] = [
  { id: "trail", label: "Loading decision audit trail" },
  { id: "verify", label: "Verifying execution records" },
];

export const NARRATIVE_LOAD_STEPS: OperationStepDef[] = [
  { id: "sectors", label: "Scanning sector narrative momentum" },
  { id: "exposure", label: "Mapping narrative risk to positions" },
];

export const VISIBILITY_LOAD_STEPS: OperationStepDef[] = [
  { id: "ping", label: "Pinging SoSoValue and SoDEX endpoints" },
  { id: "status", label: "Checking live vs fallback data modes" },
];
