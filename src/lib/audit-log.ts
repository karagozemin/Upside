import { DEMO_AUDIT_ENTRIES } from "./demo-data";
import type { AuditEntry } from "./types";
import { generateId } from "./utils";

let entries: AuditEntry[] = [...DEMO_AUDIT_ENTRIES];

export function getAuditLog(): AuditEntry[] {
  return [...entries].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
}

export function appendAuditEntry(
  entry: Omit<AuditEntry, "id" | "timestamp"> & { timestamp?: string }
): AuditEntry {
  const newEntry: AuditEntry = {
    id: generateId(),
    timestamp: entry.timestamp ?? new Date().toISOString(),
    ...entry,
  };
  entries = [newEntry, ...entries];
  return newEntry;
}

export function resetAuditLog(): void {
  entries = [...DEMO_AUDIT_ENTRIES];
}
