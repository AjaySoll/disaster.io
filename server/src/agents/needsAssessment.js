import { callAgent } from "./client.js";

const SYSTEM_PROMPT = `You are the Needs Assessment Agent in a disaster response coordination system.
Your role: analyse each location and determine what resources are most needed and why.
You will receive the current emergency state as JSON.

For every location, briefly identify the most pressing needs and justify them based on:
- the location's status (open, full, critical, closed, new)
- its declared needs and population
- any active requests targeting it
- any blocked roads that affect its access

Respond concisely and practically. Focus only on your specialist domain.
Output plain text — no markdown, no bullet symbols, no headings, just clear sentences grouped by location.
Keep your response under 250 words.

CONFLICT DETECTION:
After your analysis, check whether any need you are calling for is likely to clash with what another specialist will conclude. For example: you call for medical kits at a location whose only access road is in blockedRoads (Route Planning Agent will object), or you call for resources that don't exist in inventory (Inventory Agent will object), or you elevate a location that another agent will rank lower (Priority Agent will disagree).

End your response with EXACTLY ONE final line beginning with "CONFLICT_SIGNAL: " followed by either:
- the literal token null  (when you detect no conflict)
- a single-line JSON object: {"with":"<other agent name>","issue":"<short description>","locations":[<names>],"resource":"<item or capability>"}

Valid agent names you can flag: "Inventory Agent", "Route Planning Agent", "Priority Agent", "Communication Agent".
Do not output anything after the CONFLICT_SIGNAL line.`;

export async function runNeedsAssessment(state) {
  const userContent = `Current emergency state:\n${JSON.stringify(
    state,
    null,
    2
  )}`;
  return callAgent({ systemPrompt: SYSTEM_PROMPT, userContent });
}
