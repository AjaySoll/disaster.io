import type { EmergencyState } from "../types";

interface Props {
  scenario: EmergencyState;
  scenarioName: string;
  running: boolean;
  onRun: () => void;
  onAddUpdate: () => void;
}

export function ScenarioToolbar({
  scenario,
  scenarioName,
  running,
  onRun,
  onAddUpdate,
}: Props) {
  const critical = scenario.locations.filter((l) => l.status === "critical").length;
  const open = scenario.locations.filter((l) => l.status === "open").length;
  const requests = scenario.activeRequests.length;
  const blocked = scenario.blockedRoads.length;

  return (
    <div className="panel">
      <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-3.5">
        <div className="flex items-center gap-5">
          <div className="leading-tight">
            <div className="panel-eyebrow">Active scenario</div>
            <div className="font-sans text-base font-semibold text-ink">
              {scenarioName}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-4 pl-5 border-l border-bg-line">
            <Stat label="critical" value={critical} tone="critical" />
            <Stat label="open" value={open} tone="urgent" />
            <Stat label="requests" value={requests} />
            <Stat label="blocked" value={blocked} tone="critical" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-ghost text-sm"
            onClick={onAddUpdate}
          >
            + Add update
          </button>
          <button
            type="button"
            className="btn-primary text-sm"
            onClick={onRun}
            disabled={running}
          >
            {running ? "Running…" : "Run all agents"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "critical" | "urgent";
}) {
  const color =
    tone === "critical"
      ? value > 0
        ? "text-critical"
        : "text-ink-dim"
      : tone === "urgent"
      ? value > 0
        ? "text-urgent"
        : "text-ink-dim"
      : "text-ink";
  return (
    <div className="leading-tight">
      <div className={`font-mono text-lg font-semibold ${color}`}>{value}</div>
      <div className="panel-eyebrow">{label}</div>
    </div>
  );
}
