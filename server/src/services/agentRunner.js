import { runNeedsAssessment } from "../agents/needsAssessment.js";
import { runInventory } from "../agents/inventory.js";
import { runRoutePlanning } from "../agents/routePlanning.js";
import { runPriority } from "../agents/priority.js";
import { runCommunication } from "../agents/communication.js";
import { runCoordinator } from "../agents/coordinator.js";
import { detectConflicts } from "./conflictDetector.js";

/**
 * Run all 6 agents.
 *
 * Flow:
 *   1. The five specialists run in parallel via Promise.all.
 *   2. Their raw outputs go through conflictDetector — self-reported
 *      CONFLICT_SIGNAL lines are parsed out and a programmatic blocked-road
 *      check runs as backup.
 *   3. The cleaned outputs + the conflict list are handed to the Coordinator,
 *      which must arbitrate each conflict and emit an extended action plan.
 *
 * Each specialist call is wrapped in a settle helper so a single failure
 * doesn't kill the whole run — failed agents return an empty string and the
 * failure is surfaced to the caller via the `errors` map.
 */
export async function runAllAgents(stateDoc) {
  const state = stateDoc.toObject ? stateDoc.toObject() : stateDoc;

  const tasks = {
    needsAssessment: settle(() => runNeedsAssessment(state)),
    inventory: settle(() => runInventory(state)),
    routePlanning: settle(() => runRoutePlanning(state)),
    priority: settle(() => runPriority(state)),
    communication: settle(() => runCommunication(state)),
  };

  const entries = await Promise.all(
    Object.entries(tasks).map(async ([key, p]) => [key, await p])
  );

  const rawOutputs = {};
  const errors = {};
  for (const [key, result] of entries) {
    rawOutputs[key] = result.value || "";
    if (result.error) errors[key] = result.error;
  }

  // Strip CONFLICT_SIGNAL lines and detect conflicts.
  const { outputs: cleanedOutputs, conflicts } = detectConflicts(
    rawOutputs,
    state
  );

  let coordinatorRaw = "";
  let actionPlan = [];
  try {
    const coord = await runCoordinator(state, cleanedOutputs, conflicts);
    coordinatorRaw = coord.raw;
    actionPlan = coord.plan;
  } catch (err) {
    errors.coordinator = err.message;
  }

  return {
    outputs: { ...cleanedOutputs, coordinator: coordinatorRaw },
    actionPlan,
    conflicts,
    errors,
  };
}

function settle(fn) {
  return Promise.resolve()
    .then(fn)
    .then(
      (value) => ({ value, error: null }),
      (err) => ({ value: "", error: err?.message || String(err) })
    );
}
