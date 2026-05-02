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
Keep your response under 250 words.`;

export async function runNeedsAssessment(state) {
  const userContent = `Current emergency state:\n${JSON.stringify(
    state,
    null,
    2
  )}`;
  return callAgent({ systemPrompt: SYSTEM_PROMPT, userContent });
}
