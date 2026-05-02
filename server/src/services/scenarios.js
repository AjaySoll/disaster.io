// Preset scenarios. Coordinates are real UK locations so the route
// planning agent has something realistic to reason about.

export const PRESET_SCENARIOS = {
  "london-flooding": {
    name: "London Flooding",
    summary:
      "Severe Thames flooding across SW/W London. Multiple boroughs affected, A316 and A307 cut.",
    locations: [
      {
        id: "hounslow",
        name: "Hounslow Relief Centre",
        status: "critical",
        needs: ["water"],
        population: 420,
        coordinates: { lat: 51.4663, lng: -0.3661 },
      },
      {
        id: "richmond",
        name: "Richmond Shelter",
        status: "full",
        needs: ["shelter", "blankets"],
        population: 310,
        coordinates: { lat: 51.4613, lng: -0.3037 },
      },
      {
        id: "kingston",
        name: "Kingston Hospital Triage",
        status: "critical",
        needs: ["medical"],
        population: 180,
        coordinates: { lat: 51.4123, lng: -0.2871 },
      },
      {
        id: "croydon",
        name: "Croydon Care Home",
        status: "critical",
        needs: ["power", "generator"],
        population: 95,
        coordinates: { lat: 51.3762, lng: -0.0982 },
      },
      {
        id: "ealing",
        name: "Ealing Town Hall (new relief centre)",
        status: "new",
        needs: ["staffing", "supplies"],
        population: 0,
        coordinates: { lat: 51.5131, lng: -0.3046 },
      },
    ],
    inventory: [
      { item: "Blankets", quantity: 200, warehouseId: "wh-park-royal" },
      { item: "Water packs", quantity: 100, warehouseId: "wh-park-royal" },
      { item: "Medical kits", quantity: 30, warehouseId: "wh-southwark" },
      { item: "Generators", quantity: 2, warehouseId: "wh-southwark" },
    ],
    blockedRoads: ["A316", "A307"],
    activeRequests: [
      { locationId: "hounslow", item: "Water packs", urgency: "critical" },
      { locationId: "kingston", item: "Medical kits", urgency: "critical" },
      { locationId: "croydon", item: "Generators", urgency: "high" },
      { locationId: "richmond", item: "Blankets", urgency: "medium" },
    ],
  },

  "wildfire-evacuation": {
    name: "Wildfire Evacuation — Surrey Heath",
    summary:
      "Heath fires spreading east from Frensham toward Hindhead. Four evacuation centres open, two filling fast.",
    locations: [
      {
        id: "frensham",
        name: "Frensham Evacuation Centre",
        status: "full",
        needs: ["transport", "medical"],
        population: 540,
        coordinates: { lat: 51.169, lng: -0.799 },
      },
      {
        id: "hindhead",
        name: "Hindhead Community Hall",
        status: "critical",
        needs: ["water", "evacuation kits"],
        population: 380,
        coordinates: { lat: 51.115, lng: -0.735 },
      },
      {
        id: "farnham",
        name: "Farnham Medical Triage",
        status: "critical",
        needs: ["oxygen", "first aid"],
        population: 220,
        coordinates: { lat: 51.215, lng: -0.799 },
      },
      {
        id: "haslemere",
        name: "Haslemere School Shelter",
        status: "full",
        needs: ["shelter", "food"],
        population: 470,
        coordinates: { lat: 51.0884, lng: -0.7117 },
      },
      {
        id: "guildford",
        name: "Guildford Reception Hub",
        status: "open",
        needs: ["staffing"],
        population: 60,
        coordinates: { lat: 51.2362, lng: -0.5704 },
      },
    ],
    inventory: [
      { item: "Evacuation kits", quantity: 80, warehouseId: "wh-aldershot" },
      { item: "First aid kits", quantity: 50, warehouseId: "wh-aldershot" },
      { item: "Oxygen tanks", quantity: 20, warehouseId: "wh-guildford" },
      { item: "Water packs", quantity: 300, warehouseId: "wh-guildford" },
      { item: "Buses", quantity: 5, warehouseId: "wh-aldershot" },
    ],
    blockedRoads: ["A3 northbound", "B3001", "A287 (smoke)"],
    activeRequests: [
      { locationId: "hindhead", item: "Evacuation kits", urgency: "critical" },
      { locationId: "farnham", item: "Oxygen tanks", urgency: "critical" },
      { locationId: "frensham", item: "Buses", urgency: "high" },
      { locationId: "haslemere", item: "Water packs", urgency: "high" },
    ],
  },

  "winter-storm": {
    name: "Winter Storm — North Pennines",
    summary:
      "Severe winter storm across Cumbria/Northumberland. Power down across rural villages, A69 and A686 impassable, hospitals on backup.",
    locations: [
      {
        id: "alston",
        name: "Alston Village (cut off)",
        status: "critical",
        needs: ["food", "heating", "evacuation"],
        population: 1100,
        coordinates: { lat: 54.811, lng: -2.439 },
      },
      {
        id: "carlisle",
        name: "Carlisle Hospital",
        status: "critical",
        needs: ["generator", "medical fuel"],
        population: 280,
        coordinates: { lat: 54.8951, lng: -2.9382 },
      },
      {
        id: "newcastle-care",
        name: "Newcastle Riverside Care Home",
        status: "critical",
        needs: ["generator", "thermal blankets"],
        population: 80,
        coordinates: { lat: 54.9714, lng: -1.6174 },
      },
      {
        id: "hexham",
        name: "Hexham Community Centre",
        status: "open",
        needs: ["blankets", "hot meals"],
        population: 240,
        coordinates: { lat: 54.971, lng: -2.103 },
      },
      {
        id: "penrith",
        name: "Penrith Care Home",
        status: "full",
        needs: ["thermal blankets", "medical staff"],
        population: 130,
        coordinates: { lat: 54.6644, lng: -2.7527 },
      },
    ],
    inventory: [
      { item: "Generators", quantity: 4, warehouseId: "wh-newcastle" },
      { item: "Blankets", quantity: 500, warehouseId: "wh-newcastle" },
      { item: "Thermal blankets", quantity: 100, warehouseId: "wh-carlisle" },
      { item: "Medical kits", quantity: 80, warehouseId: "wh-carlisle" },
      { item: "4x4 vehicles", quantity: 3, warehouseId: "wh-newcastle" },
    ],
    blockedRoads: ["A69", "A686 (icy)", "M6 J40-J41 partial"],
    activeRequests: [
      {
        locationId: "newcastle-care",
        item: "Generators",
        urgency: "critical",
      },
      { locationId: "carlisle", item: "Generators", urgency: "critical" },
      { locationId: "alston", item: "4x4 vehicles", urgency: "critical" },
      { locationId: "penrith", item: "Thermal blankets", urgency: "high" },
    ],
  },
};

export function buildScenarioState(scenarioId, overrides = {}) {
  const preset = PRESET_SCENARIOS[scenarioId];
  if (!preset && !overrides.locations) {
    throw new Error(`Unknown scenario: ${scenarioId}`);
  }

  const base = preset
    ? {
        scenarioId,
        timestamp: new Date(),
        locations: preset.locations,
        inventory: preset.inventory,
        blockedRoads: preset.blockedRoads,
        activeRequests: preset.activeRequests.map((req) => ({
          ...req,
          timestamp: new Date(),
        })),
        completedDeliveries: [],
        agentOutputs: {
          needsAssessment: "",
          inventory: "",
          routePlanning: "",
          priority: "",
          communication: "",
          coordinator: "",
        },
        actionPlan: [],
        history: [
          {
            event: `Scenario started: ${preset.name}`,
            type: "scenario_start",
            timestamp: new Date(),
          },
        ],
      }
    : {
        scenarioId,
        timestamp: new Date(),
        locations: [],
        inventory: [],
        blockedRoads: [],
        activeRequests: [],
        completedDeliveries: [],
        agentOutputs: {},
        actionPlan: [],
        history: [
          {
            event: `Custom scenario started`,
            type: "scenario_start",
            timestamp: new Date(),
          },
        ],
      };

  return { ...base, ...overrides };
}

export function listPresets() {
  return Object.entries(PRESET_SCENARIOS).map(([id, preset]) => ({
    id,
    name: preset.name,
    summary: preset.summary,
  }));
}
