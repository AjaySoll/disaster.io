import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-sonnet-4-20250514";

let _client = null;

function getClient() {
  if (_client) return _client;
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Add it to .env to enable agent calls."
    );
  }
  _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return _client;
}

/**
 * Run a single agent. Each call is independent — agents are intentionally
 * stateless so they can be fired in parallel via Promise.all.
 *
 * @param {object} opts
 * @param {string} opts.systemPrompt - The agent's system prompt.
 * @param {string} opts.userContent - The user message (usually JSON state).
 * @param {number} [opts.maxTokens=1024]
 * @param {number} [opts.temperature=0.4]
 * @returns {Promise<string>} The agent's plain-text response.
 */
export async function callAgent({
  systemPrompt,
  userContent,
  maxTokens = 1024,
  temperature = 0.4,
}) {
  const client = getClient();
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    temperature,
    system: systemPrompt,
    messages: [{ role: "user", content: userContent }],
  });

  // Concatenate all text blocks from the response.
  const text = message.content
    .filter((block) => block.type === "text")
    .map((block) => block.text)
    .join("\n")
    .trim();

  return text;
}
