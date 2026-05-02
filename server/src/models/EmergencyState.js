import mongoose from "mongoose";

const { Schema } = mongoose;

const VulnerabilitySchema = new Schema(
  {
    childrenPresent: { type: Boolean, default: false },
    elderlyResidents: { type: Boolean, default: false },
    medicalEmergency: { type: Boolean, default: false },
    disabilityAccessNeeds: { type: Boolean, default: false },
    powerDependency: { type: Boolean, default: false },
    shelterCapacity: { type: Number, default: 0 },
    lastDeliveryTime: { type: Date, default: null },
  },
  { _id: false }
);

const LocationSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    status: {
      type: String,
      enum: ["open", "full", "critical", "closed", "new"],
      default: "open",
    },
    needs: { type: [String], default: [] },
    population: { type: Number, default: 0 },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    vulnerability: { type: VulnerabilitySchema, default: () => ({}) },
    priorityScore: { type: Number, default: 0 },
  },
  { _id: false }
);

const InventoryItemSchema = new Schema(
  {
    item: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    warehouseId: { type: String, required: true },
  },
  { _id: false }
);

const ActiveRequestSchema = new Schema(
  {
    locationId: { type: String, required: true },
    item: { type: String, required: true },
    urgency: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const CompletedDeliverySchema = new Schema(
  {
    locationId: { type: String, required: true },
    item: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0 },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ActionPlanItemSchema = new Schema(
  {
    priority: { type: Number, required: true },
    action: { type: String, required: true },
    reason: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "in_progress", "complete"],
      default: "pending",
    },
  },
  { _id: true }
);

const HistoryEventSchema = new Schema(
  {
    event: { type: String, required: true },
    type: {
      type: String,
      enum: ["scenario_start", "update", "delivery", "agent_run", "info"],
      default: "info",
    },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const AgentOutputsSchema = new Schema(
  {
    needsAssessment: { type: String, default: "" },
    inventory: { type: String, default: "" },
    routePlanning: { type: String, default: "" },
    priority: { type: String, default: "" },
    communication: { type: String, default: "" },
    coordinator: { type: String, default: "" },
  },
  { _id: false }
);

const EmergencyStateSchema = new Schema(
  {
    scenarioId: { type: String, required: true, index: true },
    timestamp: { type: Date, default: Date.now },
    locations: { type: [LocationSchema], default: [] },
    inventory: { type: [InventoryItemSchema], default: [] },
    blockedRoads: { type: [String], default: [] },
    activeRequests: { type: [ActiveRequestSchema], default: [] },
    completedDeliveries: { type: [CompletedDeliverySchema], default: [] },
    agentOutputs: { type: AgentOutputsSchema, default: () => ({}) },
    actionPlan: { type: [ActionPlanItemSchema], default: [] },
    history: { type: [HistoryEventSchema], default: [] },
  },
  { timestamps: true }
);

export const EmergencyState = mongoose.model(
  "EmergencyState",
  EmergencyStateSchema
);
