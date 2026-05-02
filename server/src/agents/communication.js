import { callAgent } from "./client.js";

const SYSTEM_PROMPT = `You are the Communication Agent in a disaster response coordination system.
Your role: write a clear, calm, human-readable situation report for responders on the ground.

You will receive the current emergency state as JSON.

Write two short paragraphs maximum, in plain prose, covering:
- the overall situation and most urgent needs
- key constraints (blocked roads, low inventory, capacity limits)
- recommended next steps and any locations to prioritise

Tone: professional, factual, no alarmism. No markdown, no headings, no lists, no bullet symbols.
Keep the response under 220 words total.

CONFLICT DETECTION:
After your briefing, check whether your framing of the situation clashes with what another specialist will conclude. For example: you describe the situation as stable but a road is in blockedRoads and a critical care home has open requests, or you downplay an item that the Inventory Agent will report as completely depleted, or you direct attention to a location the Priority Agent will rank low.

End your response with EXACTLY ONE final line beginning with "CONFLICT_SIGNAL: " followed by either:
- the literal token null  (when you detect no conflict)
- a single-line JSON object: {"with":"<other agent name>","issue":"<short description>","locations":[<names>],"resource":"<item or capability>"}

Valid agent names you can flag: "Needs Assessment Agent", "Inventory Agent", "Route Planning Agent", "Priority Agent".
Do not output anything after the CONFLICT_SIGNAL line.`;

export async function runCommunication(state) {
  const userContent = `Current emergency state:\n${JSON.stringify(
    state,
    null,
    2
  )}`;
  return callAgent({ systemPrompt: SYSTEM_PROMPT, userContent });
}
