export type OperationStepDef = { id: string; label: string };
export type OperationStepState = OperationStepDef & {
  status: "pending" | "active" | "done";
};

export function buildStepStates(
  defs: OperationStepDef[],
  activeIndex: number,
  allDone = false,
): OperationStepState[] {
  return defs.map((step, i) => ({
    ...step,
    status: allDone ? "done" : i < activeIndex ? "done" : i === activeIndex ? "active" : "pending",
  }));
}

export async function runOperation<T>(
  stepDefs: OperationStepDef[],
  fn: () => Promise<T>,
  onUpdate: (steps: OperationStepState[]) => void,
  opts: { stepMs?: number; minTotalMs?: number } = {},
): Promise<T> {
  const stepMs = opts.stepMs ?? 600;
  const minTotalMs = opts.minTotalMs ?? 2000;
  const start = Date.now();
  let activeIndex = 0;

  onUpdate(buildStepStates(stepDefs, activeIndex));

  const advance = setInterval(() => {
    if (activeIndex < stepDefs.length - 1) {
      activeIndex += 1;
      onUpdate(buildStepStates(stepDefs, activeIndex));
    }
  }, stepMs);

  try {
    const result = await fn();
    clearInterval(advance);
    onUpdate(buildStepStates(stepDefs, stepDefs.length, true));

    const remaining = minTotalMs - (Date.now() - start);
    if (remaining > 0) await new Promise((r) => setTimeout(r, remaining));

    return result;
  } catch (error) {
    clearInterval(advance);
    throw error;
  }
}
