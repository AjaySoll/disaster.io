import { callAgent } from "./client.js";

const SYSTEM_PROMPT = `You are the Route Planning Agent in a disaster response coordination system.
Your role: identify the best delivery routes given blocked roads, distances, and location coordinates.
You will receive the current emergency state as JSON.

For the most urgent location-warehouse pairings, suggest viable routes that avoid blocked roads.
Use the location coordinates to reason about distance and direction. When a direct route is blocked, propose a clear alternative.
If you don't know specific road names, describe the route by direction and approximate distance.

Respond concisely and practically. Focus only on your specialist domain.
Output plain text — no markdown, no bullet symbols, no headings, just clear sentences.
Keep your response under 250 words.`;

export async function runRoutePlanning(state) {
  const userContent = `Current emergency state:\n${JSON.stringify(
    state,
    null,
    2
  )}`;
  return callAgent({ systemPrompt: SYSTEM_PROMPT, userContent });
}
