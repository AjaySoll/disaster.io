import { api } from "./client";
import type { EmergencyState, HistoryEvent, PresetSummary } from "../types";

export async function listPresets(): Promise<PresetSummary[]> {
  const { data } = await api.get<PresetSummary[]>("/api/scenario/presets");
  return data;
}

export async function startScenario(
  scenarioId: string
): Promise<EmergencyState> {
  const { data } = await api.post<EmergencyState>("/api/scenario/start", {
    scenarioId,
  });
  return data;
}

export async function getScenario(id: string): Promise<EmergencyState> {
  const { data } = await api.get<EmergencyState>(`/api/scenario/${id}`);
  return data;
}

export type ScenarioUpdate =
  | { type: "block_road"; road: string }
  | { type: "unblock_road"; road: string }
  | { type: "location_status"; locationId: string; status: string }
  | {
      type: "add_location";
      location: {
        id: string;
        name: string;
        status: string;
        needs: string[];
        population: number;
        coordinates: { lat: number; lng: number };
      };
    }
  | {
      type: "add_request";
      request: {
        locationId: string;
        item: string;
        urgency: string;
      };
    }
  | { type: "note"; text: string };

export async function pushUpdate(
  id: string,
  update: ScenarioUpdate
): Promise<EmergencyState> {
  const { data } = await api.post<EmergencyState>(
    `/api/scenario/${id}/update`,
    update
  );
  return data;
}

export interface RunAgentsResponse {
  scenario: EmergencyState;
  errors: Record<string, string>;
}

export async function runAgents(id: string): Promise<RunAgentsResponse> {
  const { data } = await api.post<RunAgentsResponse>(
    `/api/scenario/${id}/run-agents`
  );
  return data;
}

export async function getHistory(id: string): Promise<HistoryEvent[]> {
  const { data } = await api.get<HistoryEvent[]>(
    `/api/scenario/${id}/history`
  );
  return data;
}

export interface DeliverPayload {
  actionId?: string;
  locationId: string;
  item: string;
  quantity: number;
}

export async function markDelivered(
  id: string,
  payload: DeliverPayload
): Promise<EmergencyState> {
  const { data } = await api.post<EmergencyState>(
    `/api/scenario/${id}/deliver`,
    payload
  );
  return data;
}
