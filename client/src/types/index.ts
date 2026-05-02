export type LocationStatus = "open" | "full" | "critical" | "closed" | "new";
export type Urgency = "low" | "medium" | "high" | "critical";
export type ActionStatus = "pending" | "in_progress" | "complete";
export type HistoryType =
  | "scenario_start"
  | "update"
  | "delivery"
  | "agent_run"
  | "info";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Vulnerability {
  childrenPresent: boolean;
  elderlyResidents: boolean;
  medicalEmergency: boolean;
  disabilityAccessNeeds: boolean;
  powerDependency: boolean;
  shelterCapacity: number;
  lastDeliveryTime?: string | null;
}

export type PriorityTier = "critical" | "high" | "medium" | "low";

export interface Location {
  id: string;
  name: string;
  status: LocationStatus;
  needs: string[];
  population: number;
  coordinates: Coordinates;
  vulnerability: Vulnerability;
  priorityScore: number;
}

export interface InventoryItem {
  item: string;
  quantity: number;
  warehouseId: string;
}

export interface ActiveRequest {
  locationId: string;
  item: string;
  urgency: Urgency;
  timestamp: string;
}

export interface CompletedDelivery {
  locationId: string;
  item: string;
  quantity: number;
  timestamp: string;
}

export interface ActionPlanItem {
  _id?: string;
  priority: number;
  action: string;
  reason: string;
  status: ActionStatus;
}

export interface AgentOutputs {
  needsAssessment: string;
  inventory: string;
  routePlanning: string;
  priority: string;
  communication: string;
  coordinator: string;
}

export interface HistoryEvent {
  event: string;
  type: HistoryType;
  timestamp: string;
}

export interface EmergencyState {
  _id: string;
  scenarioId: string;
  timestamp: string;
  locations: Location[];
  inventory: InventoryItem[];
  blockedRoads: string[];
  activeRequests: ActiveRequest[];
  completedDeliveries: CompletedDelivery[];
  agentOutputs: AgentOutputs;
  actionPlan: ActionPlanItem[];
  history: HistoryEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface PresetSummary {
  id: string;
  name: string;
  summary: string;
}

export type AgentKey =
  | "needsAssessment"
  | "inventory"
  | "routePlanning"
  | "priority"
  | "communication"
  | "coordinator";

export interface AgentMeta {
  key: AgentKey;
  name: string;
  role: string;
  icon: string;
}

export const AGENT_META: AgentMeta[] = [
  {
    key: "needsAssessment",
    name: "Needs Assessment",
    role: "What does each location require, and why?",
    icon: "scope",
  },
  {
    key: "inventory",
    name: "Inventory",
    role: "Stock levels, shortages, redistribution.",
    icon: "boxes",
  },
  {
    key: "routePlanning",
    name: "Route Planning",
    role: "Best paths around blocked roads.",
    icon: "route",
  },
  {
    key: "priority",
    name: "Priority",
    role: "Urgency ranking across all needs.",
    icon: "rank",
  },
  {
    key: "communication",
    name: "Communication",
    role: "Plain-language situation report.",
    icon: "comms",
  },
  {
    key: "coordinator",
    name: "Coordinator",
    role: "Final synthesised action plan.",
    icon: "coord",
  },
];
