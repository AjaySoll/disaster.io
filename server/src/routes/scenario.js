import { Router } from "express";
import { EmergencyState } from "../models/EmergencyState.js";
import { runAllAgents } from "../services/agentRunner.js";
import { buildScenarioState, listPresets } from "../services/scenarios.js";

const router = Router();

// List preset scenarios — handy for the frontend dropdown.
router.get("/presets", (_req, res) => {
  res.json(listPresets());
});

/**
 * POST /api/scenario/start
 * Body: { scenarioId: string, custom?: { ...overrides } }
 * Creates a fresh EmergencyState document for the chosen preset.
 */
router.post("/start", async (req, res, next) => {
  try {
    const { scenarioId, custom } = req.body || {};
    if (!scenarioId) {
      return res.status(400).json({ error: "scenarioId is required" });
    }
    const initial = buildScenarioState(scenarioId, custom);
    const doc = await EmergencyState.create(initial);
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
});

// GET /api/scenario/:id - fetch the current emergency state
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await EmergencyState.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Scenario not found" });
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/scenario/:id/update
 * Body: one of:
 *   { type: "block_road", road: "A316" }
 *   { type: "unblock_road", road: "A316" }
 *   { type: "location_status", locationId: "richmond", status: "full" }
 *   { type: "add_location", location: { id, name, status, needs, population, coordinates } }
 *   { type: "add_request", request: { locationId, item, urgency } }
 *   { type: "note", text: "free-form event description" }
 */
router.post("/:id/update", async (req, res, next) => {
  try {
    const doc = await EmergencyState.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Scenario not found" });

    const update = req.body || {};
    const event = applyUpdate(doc, update);
    if (!event) {
      return res.status(400).json({ error: "Invalid update payload" });
    }

    doc.history.push({ event, type: "update", timestamp: new Date() });
    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/scenario/:id/run-agents
 * Triggers all 6 agents in parallel, saves outputs + action plan + history.
 */
router.post("/:id/run-agents", async (req, res, next) => {
  try {
    const doc = await EmergencyState.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Scenario not found" });

    const { outputs, actionPlan, errors } = await runAllAgents(doc);

    doc.agentOutputs = outputs;
    doc.actionPlan = actionPlan;
    doc.history.push({
      event: `Agent run complete (${actionPlan.length} actions planned${
        Object.keys(errors).length ? `, ${Object.keys(errors).length} agent errors` : ""
      })`,
      type: "agent_run",
      timestamp: new Date(),
    });
    await doc.save();

    res.json({ scenario: doc, errors });
  } catch (err) {
    next(err);
  }
});

// GET /api/scenario/:id/history
router.get("/:id/history", async (req, res, next) => {
  try {
    const doc = await EmergencyState.findById(req.params.id, { history: 1 });
    if (!doc) return res.status(404).json({ error: "Scenario not found" });
    res.json(doc.history);
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/scenario/:id/deliver
 * Body: { actionId?: string, locationId: string, item: string, quantity: number }
 * Marks an action plan item complete (if actionId given) and deducts inventory.
 */
router.post("/:id/deliver", async (req, res, next) => {
  try {
    const doc = await EmergencyState.findById(req.params.id);
    if (!doc) return res.status(404).json({ error: "Scenario not found" });

    const { actionId, locationId, item, quantity } = req.body || {};
    if (!locationId || !item || !Number.isFinite(quantity) || quantity <= 0) {
      return res
        .status(400)
        .json({ error: "locationId, item, and positive quantity are required" });
    }

    // Deduct from the first warehouse that has the item, oldest-first.
    let remaining = quantity;
    for (const stock of doc.inventory) {
      if (stock.item.toLowerCase() === item.toLowerCase() && remaining > 0) {
        const take = Math.min(stock.quantity, remaining);
        stock.quantity -= take;
        remaining -= take;
      }
    }
    const delivered = quantity - remaining;

    doc.completedDeliveries.push({
      locationId,
      item,
      quantity: delivered,
      timestamp: new Date(),
    });

    if (actionId) {
      const action = doc.actionPlan.id(actionId);
      if (action) action.status = "complete";
    }

    const location = doc.locations.find((l) => l.id === locationId);
    const locName = location ? location.name : locationId;
    doc.history.push({
      event: `Delivered ${delivered} × ${item} to ${locName}${
        remaining > 0 ? ` (short by ${remaining})` : ""
      }`,
      type: "delivery",
      timestamp: new Date(),
    });

    await doc.save();
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

function applyUpdate(doc, update) {
  switch (update.type) {
    case "block_road": {
      if (!update.road) return null;
      if (!doc.blockedRoads.includes(update.road)) {
        doc.blockedRoads.push(update.road);
      }
      return `Road blocked: ${update.road}`;
    }
    case "unblock_road": {
      if (!update.road) return null;
      doc.blockedRoads = doc.blockedRoads.filter((r) => r !== update.road);
      return `Road reopened: ${update.road}`;
    }
    case "location_status": {
      const loc = doc.locations.find((l) => l.id === update.locationId);
      if (!loc || !update.status) return null;
      loc.status = update.status;
      return `${loc.name} status changed to ${update.status}`;
    }
    case "add_location": {
      const loc = update.location;
      if (!loc || !loc.id || !loc.name || !loc.coordinates) return null;
      if (doc.locations.some((l) => l.id === loc.id)) return null;
      doc.locations.push({
        id: loc.id,
        name: loc.name,
        status: loc.status || "new",
        needs: loc.needs || [],
        population: loc.population || 0,
        coordinates: loc.coordinates,
      });
      return `New location opened: ${loc.name}`;
    }
    case "add_request": {
      const r = update.request;
      if (!r || !r.locationId || !r.item) return null;
      doc.activeRequests.push({
        locationId: r.locationId,
        item: r.item,
        urgency: r.urgency || "medium",
        timestamp: new Date(),
      });
      const loc = doc.locations.find((l) => l.id === r.locationId);
      return `New request: ${r.item} for ${loc ? loc.name : r.locationId} (${
        r.urgency || "medium"
      })`;
    }
    case "note": {
      if (!update.text) return null;
      return update.text;
    }
    default:
      return null;
  }
}

export default router;
