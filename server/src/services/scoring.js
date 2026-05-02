/**
 * Vulnerability-Aware Priority Scoring
 *
 * Formula:
 *   priorityScore = statusScore + urgencyScore + populationScore
 *                 + vulnerabilityScore + timeWaitingScore - routeDifficulty
 *
 * Higher score = higher priority for resource allocation.
 */

const STATUS_SCORE = {
  critical: 40,
  full: 20,
  open: 5,
  new: 3,
  closed: 0,
};

const URGENCY_SCORE = {
  critical: 30,
  high: 20,
  medium: 10,
  low: 5,
};

const VULNERABILITY_WEIGHTS = {
  medicalEmergency: 30,
  childrenPresent: 25,
  powerDependency: 20,
  elderlyResidents: 20,
  disabilityAccessNeeds: 15,
};

/**
 * Compute a numeric priority score for a single location given the broader
 * scenario context (active requests, blocked roads, scenario start time).
 */
export function computePriorityScore(location, activeRequests = [], blockedRoads = [], scenarioTimestamp) {
  // 1. Status urgency (0–40)
  const statusScore = STATUS_SCORE[location.status] ?? 0;

  // 2. Highest active-request urgency for this location (0–30)
  const locRequests = activeRequests.filter((r) => r.locationId === location.id);
  const urgencyScore = locRequests.reduce(
    (max, r) => Math.max(max, URGENCY_SCORE[r.urgency] ?? 0),
    0
  );

  // 3. People affected — population / 10, capped at 50
  const populationScore = Math.min(Math.round((location.population || 0) / 10), 50);

  // 4. Vulnerability risk
  const v = location.vulnerability || {};
  let vulnerabilityScore = 0;
  for (const [key, weight] of Object.entries(VULNERABILITY_WEIGHTS)) {
    if (v[key]) vulnerabilityScore += weight;
  }
  // Overcrowding bonus: population exceeds stated shelter capacity
  if (v.shelterCapacity > 0 && (location.population || 0) > v.shelterCapacity) {
    vulnerabilityScore += 10;
  }

  // 5. Time waiting since last delivery (or scenario start) — capped at 24 pts
  const referenceMs = v.lastDeliveryTime
    ? new Date(v.lastDeliveryTime).getTime()
    : new Date(scenarioTimestamp || 0).getTime();
  const hoursWaiting = Math.max(0, (Date.now() - referenceMs) / (1000 * 3600));
  const timeScore = Math.min(Math.round(hoursWaiting), 24);

  // 6. Route difficulty penalty — any blocked roads reduce score slightly
  const routePenalty = (blockedRoads?.length || 0) > 0 ? 5 : 0;

  return (
    statusScore +
    urgencyScore +
    populationScore +
    vulnerabilityScore +
    timeScore -
    routePenalty
  );
}

/**
 * Return a human-readable priority tier for a given score.
 */
export function getPriorityTier(score) {
  if (score >= 90) return "critical";
  if (score >= 60) return "high";
  if (score >= 30) return "medium";
  return "low";
}

/**
 * Enrich all locations in a plain-object state with computed priorityScore,
 * then return locations sorted descending by score.
 */
export function withScores(state) {
  const enriched = state.locations.map((loc) => ({
    ...loc,
    priorityScore: computePriorityScore(
      loc,
      state.activeRequests,
      state.blockedRoads,
      state.timestamp
    ),
  }));
  enriched.sort((a, b) => b.priorityScore - a.priorityScore);
  return { ...state, locations: enriched };
}
