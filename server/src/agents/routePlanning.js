import { callAgent } from "./client.js";

const SYSTEM_PROMPT = `You are the Route Planning Agent in a disaster response coordination system.
Your role: identify the best delivery routes given blocked roads, distances, and location coordinates.
You will receive the current emergency state as JSON.

For the most urgent location-warehouse pairings, suggest viable routes that avoid blocked roads.
Use the location coordinates to reason about distance and direction. When a direct route is blocked, propose a clear alternative.
If you don't know specific road names, describe the route by direction and approximate distance.

Respond concisely and practically. Focus only on your specialist domain.
Output plain text — no markdown, no bullet symbols, no headings, just clear sentences.
Keep your response under 250 words.

CONFLICT DETECTION:
After laying out your routes, check whether they clash with what another specialist will conclude. For example: a destination has all plausible routes blocked but the Priority Agent will likely insist on it, or your re-route is materially slower than the urgency level the Priority Agent will assign, or the Inventory Agent's preferred warehouse is on the wrong side of a blockage.

End your response with EXACTLY ONE final line beginning with "CONFLICT_SIGNAL: " followed by either:
- the literal token null  (when you detect no conflict)
- a single-line JSON object: {"with":"<other agent name>","issue":"<short description>","locations":[<names>],"resource":"<item or capability>"}

Valid agent names you can flag: "Needs Assessment Agent", "Inventory Agent", "Priority Agent", "Communication Agent".
Do not output anything after the CONFLICT_SIGNAL line.`;

export async function runRoutePlanning(state) {
  const userContent = `Current emergency state:\n${JSON.stringify(
    state,
    null,
    2
  )}`;
  return callAgent({ systemPrompt: SYSTEM_PROMPT, userContent });
}
