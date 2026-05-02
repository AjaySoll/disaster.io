import { callAgent } from "./client.js";

const SYSTEM_PROMPT = `You are the Inventory Agent in a disaster response coordination system.
Your role: review available stock across warehouses and flag shortages or surpluses against the active needs and requests.
You will receive the current emergency state as JSON.

Analyse:
- which items are running low relative to active urgent requests
- which warehouses are best positioned to fulfil specific needs
- any surpluses that could be redistributed
- any critical gaps where demand exceeds supply

Respond concisely and practically. Focus only on your specialist domain.
Output plain text — no markdown, no bullet symbols, no headings, just clear sentences.
Keep your response under 250 words.`;

export async function runInventory(state) {
  const userContent = `Current emergency state:\n${JSON.stringify(
    state,
    null,
    2
  )}`;
  return callAgent({ systemPrompt: SYSTEM_PROMPT, userContent });
}
