import { callAgent } from "./client.js";

const SYSTEM_PROMPT = `You are the Communication Agent in a disaster response coordination system.
Your role: write a clear, calm, human-readable situation report for responders on the ground.

You will receive the current emergency state as JSON.

Write two short paragraphs maximum, in plain prose, covering:
- the overall situation and most urgent needs
- key constraints (blocked roads, low inventory, capacity limits)
- recommended next steps and any locations to prioritise

Tone: professional, factual, no alarmism. No markdown, no headings, no lists, no bullet symbols.
Keep the response under 220 words total.`;

export async function runCommunication(state) {
  const userContent = `Current emergency state:\n${JSON.stringify(
    state,
    null,
    2
  )}`;
  return callAgent({ systemPrompt: SYSTEM_PROMPT, userContent });
}
