/**
 * Two-tier conflict detection.
 *
 * Tier 1 — self-reported signals: each specialist agent ends with a
 *   "CONFLICT_SIGNAL: {...json...}"  (or "CONFLICT_SIGNAL: null") line
 *   declaring a clash with another agent.
 *
 * Tier 2 — programmatic check: cross-reference the cleaned agent text
 *   against state.blockedRoads to catch obvious "send X via <blocked>" cases
 *   even when no agent flagged anything.
 *
 * Returns:
 *   { outputs: cleanedTextPerAgent, conflicts: [...] }
 *
 * The CONFLICT_SIGNAL line is stripped from each agent's text before being
 * stored or shown in the UI — the panel handles conflicts as first-class data.
 */

const AGENT_DISPLAY_NAME = {
  needsAssessment: "Needs Assessment Agent",
  inventory: "Inventory Agent",
  routePlanning: "Route Planning Agent",
  priority: "Priority Agent",
  communication: "Communication Agent",
};

export function detectConflicts(rawOutputs, state) {
  const outputs = {};
  const conflicts = [];
  let counter = 1;

  // Tier 1 — parse self-reported signals
  for (const [key, raw] of Object.entries(rawOutputs)) {
    const { body, signal } = extractSignal(raw || "");
    outputs[key] = body;
    if (signal) {
      conflicts.push({
        conflictId: `c${counter++}`,
        between: dedupeNames([
          AGENT_DISPLAY_NAME[key] || key,
          String(signal.with || "").trim(),
        ]),
        issue: String(signal.issue || "").trim() || "(no issue text)",
        locations: Array.isArray(signal.locations)
          ? signal.locations.map((s) => String(s).trim()).filter(Boolean)
          : [],
        resource: String(signal.resource || "").trim(),
        source: "self_reported",
      });
    }
  }

  // Tier 2 — programmatic blocked-road check
  const blocked = (state.blockedRoads || []).map((r) => String(r));
  if (blocked.length > 0) {
    for (const [key, body] of Object.entries(outputs)) {
      if (key === "routePlanning") continue; // route agent OWNS this concern
      const hits = findRouteOverBlockedRoad(body, blocked);
      for (const hit of hits) {
        // Skip if a self-reported conflict already pairs this agent with
        // the Route Planning Agent (the programmatic check is just a backup).
        const agentName = AGENT_DISPLAY_NAME[key] || key;
        const dup = conflicts.some(
          (c) =>
            c.source === "self_reported" &&
            c.between.includes(agentName) &&
            c.between.includes("Route Planning Agent")
        );
        if (dup) continue;
        conflicts.push({
          conflictId: `c${counter++}`,
          between: dedupeNames([
            AGENT_DISPLAY_NAME[key] || key,
            "Route Planning Agent",
          ]),
          issue: `${
            AGENT_DISPLAY_NAME[key] || key
          } references ${hit.road}, which is currently in blockedRoads.`,
          locations: hit.locations,
          resource: "",
          source: "programmatic",
        });
      }
    }
  }

  return { outputs, conflicts };
}

function extractSignal(raw) {
  const idx = raw.lastIndexOf("CONFLICT_SIGNAL:");
  if (idx === -1) return { body: raw.trim(), signal: null };

  const body = raw.slice(0, idx).trim();
  const tail = raw.slice(idx + "CONFLICT_SIGNAL:".length).trim();

  if (!tail || tail.toLowerCase().startsWith("null")) {
    return { body, signal: null };
  }

  // Strip code fences if present.
  const cleaned = tail
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  // Take only up through the closing brace of the first JSON object.
  const jsonEnd = cleaned.indexOf("}");
  const candidate = jsonEnd !== -1 ? cleaned.slice(0, jsonEnd + 1) : cleaned;

  try {
    const parsed = JSON.parse(candidate);
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      return { body, signal: parsed };
    }
  } catch {
    // fall through — treat as no signal rather than crash the whole run
  }

  return { body, signal: null };
}

function findRouteOverBlockedRoad(text, blockedRoads) {
  if (!text) return [];
  const lower = text.toLowerCase();
  const hits = [];
  // Only flag if the text reads like a routing recommendation.
  const routingVerbs = /\b(via|send|route|deliver|deploy|use|through|along)\b/i;
  if (!routingVerbs.test(lower)) return [];

  for (const road of blockedRoads) {
    // Take the first whitespace-separated token of the road label so e.g.
    // "A316" matches "A316 (closed)" in blockedRoads.
    const needle = String(road).split(/\s+/)[0];
    if (!needle || needle.length < 2) continue;
    const re = new RegExp(`\\b${escapeRegex(needle)}\\b`, "i");
    if (re.test(text)) hits.push({ road, locations: [] });
  }
  return hits;
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function dedupeNames(arr) {
  const seen = new Set();
  const out = [];
  for (const v of arr) {
    if (!v) continue;
    const k = v.toLowerCase();
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(v);
  }
  return out;
}
