import { useCallback, useState } from "react";
import { runAgents } from "../api/scenarios";
import type { AgentKey, EmergencyState } from "../types";

export type AgentStatus = "idle" | "running" | "complete" | "error";

export type AgentStatusMap = Record<AgentKey, AgentStatus>;

const ALL_KEYS: AgentKey[] = [
  "needsAssessment",
  "inventory",
  "routePlanning",
  "priority",
  "communication",
  "coordinator",
];

function blankStatuses(value: AgentStatus): AgentStatusMap {
  return ALL_KEYS.reduce((acc, key) => {
    acc[key] = value;
    return acc;
  }, {} as AgentStatusMap);
}

/**
 * Drives the agent panel. The actual API call is a single round-trip that
 * returns once all agents finish; we simulate per-agent "running" -> "complete"
 * transitions client-side so the cards animate independently.
 */
export function useAgents(onScenarioReplace?: (next: EmergencyState) => void) {
  const [statuses, setStatuses] = useState<AgentStatusMap>(
    blankStatuses("idle")
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [running, setRunning] = useState(false);

  const trigger = useCallback(
    async (scenarioId: string) => {
      setRunning(true);
      setErrors({});
      setStatuses(blankStatuses("running"));

      const start = Date.now();
      try {
        const { scenario, errors: agentErrors } = await runAgents(scenarioId);

        // Stagger the "complete" reveals so the UI feels alive even though
        // all agents really finished together server-side.
        const elapsed = Date.now() - start;
        const minStaggerMs = Math.max(0, 300 - elapsed / ALL_KEYS.length);
        for (let i = 0; i < ALL_KEYS.length; i++) {
          const key = ALL_KEYS[i];
          await new Promise((r) => setTimeout(r, minStaggerMs));
          setStatuses((prev) => ({
            ...prev,
            [key]: agentErrors[key] ? "error" : "complete",
          }));
        }

        setErrors(agentErrors || {});
        onScenarioReplace?.(scenario);
      } catch (err: any) {
        setStatuses(blankStatuses("error"));
        setErrors({ all: err?.response?.data?.error || err?.message || "Agent run failed" });
      } finally {
        setRunning(false);
      }
    },
    [onScenarioReplace]
  );

  const reset = useCallback(() => {
    setStatuses(blankStatuses("idle"));
    setErrors({});
  }, []);

  return { statuses, errors, running, trigger, reset };
}
