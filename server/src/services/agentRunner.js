import { runNeedsAssessment } from "../agents/needsAssessment.js";
import { runInventory } from "../agents/inventory.js";
import { runRoutePlanning } from "../agents/routePlanning.js";
import { runPriority } from "../agents/priority.js";
import { runCommunication } from "../agents/communication.js";
import { runCoordinator } from "../agents/coordinator.js";

/**
 * Run all 6 agents.
 * The first 5 run in parallel via Promise.all; the Coordinator waits for the
 * others, then synthesises the final action plan.
 *
 * Each agent is wrapped in a settle helper so a single failure doesn't kill
 * the whole run — failed agents return an empty string and the failure is
 * surfaced to the caller via the `errors` map.
 */
export async function runAllAgents(stateDoc) {
  // Mongoose doc -> plain object for the LLM context
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

  const outputs = {};
  const errors = {};
  for (const [key, result] of entries) {
    outputs[key] = result.value || "";
    if (result.error) errors[key] = result.error;
  }

  let coordinatorRaw = "";
  let actionPlan = [];
  try {
    const coord = await runCoordinator(state, outputs);
    coordinatorRaw = coord.raw;
    actionPlan = coord.plan;
  } catch (err) {
    errors.coordinator = err.message;
  }

  return {
    outputs: { ...outputs, coordinator: coordinatorRaw },
    actionPlan,
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
