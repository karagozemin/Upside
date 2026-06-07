"use client";

import { useEffect, useState } from "react";
import { runOperation, type OperationStepDef, type OperationStepState } from "@/lib/run-operation";

export function useDataLoad<T>(
  steps: OperationStepDef[],
  loader: () => Promise<T>,
  deps: unknown[] = [],
  opts?: { stepMs?: number; minTotalMs?: number },
) {
  const [data, setData] = useState<T | null>(null);
  const [operationSteps, setOperationSteps] = useState<OperationStepState[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setData(null);

    (async () => {
      try {
        const result = await runOperation(
          steps,
          loader,
          (s) => { if (!cancelled) setOperationSteps(s); },
          opts,
        );
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) setData(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setOperationSteps(null);
        }
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return { data, loading, operationSteps };
}
