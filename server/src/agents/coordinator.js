import { callAgent } from "./client.js";

const SYSTEM_PROMPT = `You are the Coordinator Agent in a disaster response coordination system.
You receive the outputs of five specialist agents (Needs Assessment, Inventory, Route Planning, Priority, Communication), the full emergency state as JSON, and a list of conflicts that have been detected between those agents.

Your job: synthesise everything into a single, executable action plan AND visibly arbitrate every conflict.

Output strictly a JSON array of objects, no preamble, no commentary, no markdown fences, no trailing text.
Each object must have exactly these keys:
- "priority": integer, starting at 1 for the most urgent
- "action": short imperative sentence describing the concrete action (e.g. "Send 20 medical kits from wh-southwark to Kingston Hospital Triage")
- "reason": one sentence justification grounded in the agents' analysis
- "conflictResolved": null OR an object with these keys when this action is the resolution of a flagged conflict:
    {
      "conflict":"<one short sentence describing the disagreement>",
      "decision":"<which agent's position you sided with — concise>",
      "overruled":"<which agent's recommendation you overruled — concise>",
      "reasoning":"<2 to 3 plain-English sentences explaining the underlying logic: what tradeoff you weighed, what evidence in the state pushed you one way, and why this side wins. Should be readable by a non-expert.>"
    }

Rules:
- Produce between 4 and 8 actions ordered from highest to lowest priority.
- Be specific with quantities, source warehouses, and destinations whenever the state supports it.
- For EVERY conflict in the conflicts list, attach a conflictResolved object to the most relevant action you produce. Address each conflict exactly once across the plan.
- For actions that are not resolving a flagged conflict, set "conflictResolved" to null.
- If the conflicts list is empty, every action's "conflictResolved" must be null.

Return ONLY the JSON array.`;

/**
 * @param {object} state - the EmergencyState document (plain JS object)
 * @param {object} otherOutputs - { needsAssessment, inventory, routePlanning, priority, communication }
 * @param {Array} conflicts - conflict objects from conflictDetector
 */
export async function runCoordinator(state, otherOutputs, conflicts = []) {
  const userContent = `Current emergency state:
${JSON.stringify(state, null, 2)}

Specialist agent outputs (the CONFLICT_SIGNAL trailing line has been stripped):

[Needs Assessment]
${otherOutputs.needsAssessment}

[Inventory]
${otherOutputs.inventory}

[Route Planning]
${otherOutputs.routePlanning}

[Priority]
${otherOutputs.priority}

[Communication]
${otherOutputs.communication}

Conflicts detected between agents (you must arbitrate each one):
${JSON.stringify(conflicts, null, 2)}

Now produce the JSON action plan as instructed. Remember: attach a conflictResolved object to the action that resolves each listed conflict, and set "conflictResolved" to null for the rest.`;

  const raw = await callAgent({
    systemPrompt: SYSTEM_PROMPT,
    userContent,
    maxTokens: 1800,
    temperature: 0.3,
  });

  const plan = parseActionPlan(raw);
  return { raw, plan };
}

function parseActionPlan(raw) {
  const trimmed = raw.trim();
  const candidates = [];

  candidates.push(trimmed);

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) candidates.push(fenced[1].trim());

  const arrayMatch = trimmed.match(/\[[\s\S]*\]/);
  if (arrayMatch) candidates.push(arrayMatch[0]);

  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item, idx) => ({
            priority: Number.isFinite(item.priority) ? item.priority : idx + 1,
            action: String(item.action || "").trim(),
            reason: String(item.reason || "").trim(),
            status: "pending",
            conflictResolved: normaliseConflictResolved(item.conflictResolved),
          }))
          .filter((item) => item.action.length > 0)
          .sort((a, b) => a.priority - b.priority);
      }
    } catch {
      // try next candidate
    }
  }

  return [];
}

function normaliseConflictResolved(value) {
  if (!value || typeof value !== "object") return null;
  const conflict = String(value.conflict || "").trim();
  const decision = String(value.decision || "").trim();
  const overruled = String(value.overruled || "").trim();
  const reasoning = String(value.reasoning || "").trim();
  if (!conflict && !decision && !overruled && !reasoning) return null;
  return { conflict, decision, overruled, reasoning };
}
