import { useCallback, useEffect, useState } from "react";
import type { EmergencyState, PresetSummary } from "../types";
import {
  getScenario,
  listPresets,
  markDelivered,
  startScenario,
  type DeliverPayload,
} from "../api/scenarios";

const STORAGE_KEY = "disasterio.activeScenarioId";

export function useScenario() {
  const [presets, setPresets] = useState<PresetSummary[]>([]);
  const [scenario, setScenario] = useState<EmergencyState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load preset list once on mount.
  useEffect(() => {
    listPresets()
      .then(setPresets)
      .catch((err) => setError(err?.message || "Failed to load presets"));
  }, []);

  // Restore last active scenario from localStorage if present.
  useEffect(() => {
    const storedId = localStorage.getItem(STORAGE_KEY);
    if (!storedId) return;
    setLoading(true);
    getScenario(storedId)
      .then(setScenario)
      .catch(() => {
        localStorage.removeItem(STORAGE_KEY);
      })
      .finally(() => setLoading(false));
  }, []);

  const start = useCallback(async (scenarioId: string) => {
    setLoading(true);
    setError(null);
    try {
      const fresh = await startScenario(scenarioId);
      setScenario(fresh);
      localStorage.setItem(STORAGE_KEY, fresh._id);
      return fresh;
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Failed to start scenario");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deliver = useCallback(
    async (payload: DeliverPayload) => {
      if (!scenario) return;
      setError(null);
      try {
        const next = await markDelivered(scenario._id, payload);
        setScenario(next);
        return next;
      } catch (err: any) {
        setError(
          err?.response?.data?.error ||
            err?.message ||
            "Failed to record delivery"
        );
        throw err;
      }
    },
    [scenario]
  );

  const refresh = useCallback(async () => {
    if (!scenario) return;
    const fresh = await getScenario(scenario._id);
    setScenario(fresh);
    return fresh;
  }, [scenario]);

  // Allow the agents hook to push the post-run state back into this hook.
  const replace = useCallback((next: EmergencyState) => {
    setScenario(next);
  }, []);

  return {
    presets,
    scenario,
    loading,
    error,
    start,
    deliver,
    refresh,
    replace,
  };
}
