import { useState } from "react";
import type { PresetSummary } from "../types";

interface Props {
  presets: PresetSummary[];
  loading: boolean;
  onStart: (scenarioId: string) => Promise<unknown>;
  activeScenarioName?: string;
}

export function ScenarioSelector({
  presets,
  loading,
  onStart,
  activeScenarioName,
}: Props) {
  const [selected, setSelected] = useState<string>("");

  const handleStart = async () => {
    if (!selected) return;
    await onStart(selected);
  };

  return (
    <div className="flex flex-col gap-2 px-4 py-3 border-b border-bg-line bg-bg-raised/40">
      <div className="flex items-center gap-2">
        <span className="panel-eyebrow">Scenario</span>
        {activeScenarioName && (
          <span className="font-mono text-[11px] text-safe">
            ● {activeScenarioName}
          </span>
        )}
      </div>
      <div className="flex gap-2">
        <select
          className="input flex-1"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
        >
          <option value="">Select preset…</option>
          {presets.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="btn-primary"
          onClick={handleStart}
          disabled={!selected || loading}
        >
          {loading ? "Loading…" : "Start"}
        </button>
      </div>
      {selected && (
        <p className="font-sans text-xs text-ink-dim leading-snug">
          {presets.find((p) => p.id === selected)?.summary}
        </p>
      )}
    </div>
  );
}
