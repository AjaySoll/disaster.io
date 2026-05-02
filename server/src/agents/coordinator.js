import { callAgent } from "./client.js";

const SYSTEM_PROMPT = `You are the Coordinator Agent in a disaster response coordination system.
You receive the outputs of five specialist agents (Needs Assessment, Inventory, Route Planning, Priority, Communication) plus the full emergency state as JSON.

Your job: synthesise everything into a single, executable action plan.

Output strictly a JSON array of objects, no preamble, no commentary, no markdown fences, no trailing text.
Each object must have exactly these keys:
- "priority": integer, starting at 1 for the most urgent
- "action": short imperative sentence describing the concrete action (e.g. "Send 20 medical kits from wh-southwark to Kingston Hospital Triage")
- "reason": one sentence justification grounded in the agents' analysis

Produce between 4 and 8 actions, ordered from highest to lowest priority. Be specific with quantities, source warehouses, and destinations whenever the state supports it.

Return ONLY the JSON array.`;

/**
 * @param {object} state - the EmergencyState document (plain JS object)
 * @param {object} otherOutputs - { needsAssessment, inventory, routePlanning, priority, communication }
 * @returns {Promise<{ raw: string, plan: Array<{priority:number,action:string,reason:string,status:string}> }>}
 */
export async function runCoordinator(state, otherOutputs) {
  const userContent = `Current emergency state:
${JSON.stringify(state, null, 2)}

Specialist agent outputs:

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

Now produce the JSON action plan as instructed.`;

  const raw = await callAgent({
    systemPrompt: SYSTEM_PROMPT,
    userContent,
    maxTokens: 1500,
    temperature: 0.3,
  });

  const plan = parseActionPlan(raw);
  return { raw, plan };
}

function parseActionPlan(raw) {
  // Try to extract a JSON array even if the model added stray text.
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
