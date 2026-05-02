import { useEffect, useState } from "react";
import { useScenario } from "./hooks/useScenario";
import { useAgents } from "./hooks/useAgents";
import { ScenarioSelector } from "./components/ScenarioSelector";
import { LocationsPanel } from "./components/LocationsPanel";
import { AgentCards } from "./components/AgentCards";
import { ActionPlan } from "./components/ActionPlan";
import { InventoryTracker } from "./components/InventoryTracker";
import { SituationReport } from "./components/SituationReport";
import { EventLog } from "./components/EventLog";
import { AddUpdateModal } from "./components/AddUpdateModal";
import { ScenarioMap } from "./components/ScenarioMap";

export default function App() {
  const {
    presets,
    scenario,
    loading,
    error,
    start,
    update,
    deliver,
    replace,
  } = useScenario();
  const { statuses, errors, running, trigger } = useAgents(replace);
  const [showUpdate, setShowUpdate] = useState(false);

  const handleRunAgents = () => {
    if (!scenario) return;
    trigger(scenario._id);
  };

  return (
    <div className="h-full flex flex-col bg-bg-base text-ink overflow-hidden">
      <TopBar scenarioName={getScenarioName(scenario, presets)} />

      <main className="flex-1 grid grid-cols-12 gap-3 px-3 py-3 overflow-hidden min-h-0">
        {/* LEFT — situation overview + live map */}
        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          <div className="panel shrink-0">
            <ScenarioSelector
              presets={presets}
              loading={loading}
              onStart={start}
              activeScenarioName={getScenarioName(scenario, presets)}
            />
          </div>
          {scenario ? (
            <>
              <div className="flex-1 min-h-[260px]">
                <ScenarioMap scenario={scenario} />
              </div>
              <div className="h-64 shrink-0">
                <LocationsPanel
                  scenario={scenario}
                  onAddUpdate={() => setShowUpdate(true)}
                />
              </div>
            </>
          ) : (
            <PlaceholderPanel text="Select a scenario to begin." />
          )}
        </div>

        {/* CENTRE — agents */}
        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          {scenario ? (
            <AgentCards
              outputs={scenario.agentOutputs}
              statuses={statuses}
              errors={errors}
              running={running}
              onRun={handleRunAgents}
            />
          ) : (
            <PlaceholderPanel text="Agents will appear here once a scenario is loaded." />
          )}
        </div>

        {/* RIGHT — action plan + inventory + situation report */}
        <div className="col-span-4 flex flex-col gap-3 min-h-0">
          {scenario ? (
            <>
              <div className="flex-1 min-h-0">
                <ActionPlan scenario={scenario} onDeliver={deliver} />
              </div>
              <div className="h-56 shrink-0">
                <InventoryTracker scenario={scenario} />
              </div>
              <div className="h-44 shrink-0">
                <SituationReport scenario={scenario} />
              </div>
            </>
          ) : (
            <PlaceholderPanel text="Action plan, inventory and briefings will appear here." />
          )}
        </div>
      </main>

      {/* BOTTOM — event log */}
      <footer className="h-44 shrink-0 px-3 pb-3">
        {scenario ? (
          <EventLog history={scenario.history} />
        ) : (
          <PlaceholderPanel text="Event history will populate as the scenario evolves." />
        )}
      </footer>

      {error && (
        <div className="absolute bottom-4 right-4 max-w-xs rounded border border-critical/40 bg-critical-soft px-3 py-2 text-sm text-critical font-mono shadow-lg">
          {error}
        </div>
      )}

      {showUpdate && scenario && (
        <AddUpdateModal
          scenario={scenario}
          onClose={() => setShowUpdate(false)}
          onSubmit={update}
        />
      )}
    </div>
  );
}

function TopBar({ scenarioName }: { scenarioName?: string }) {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-4 border-b border-bg-line bg-bg-panel/80">
      <div className="flex items-center gap-3">
        <Logo />
        <div className="font-sans font-semibold tracking-tight text-ink">
          disaster.io
        </div>
      </div>
      <div className="flex items-center gap-3 font-mono text-[11px] text-ink-mute">
        {scenarioName && (
          <>
            <span className="hidden sm:inline">scenario:</span>
            <span className="text-ink">{scenarioName}</span>
            <span className="text-ink-mute">·</span>
          </>
        )}
        <Clock />
      </div>
    </header>
  );
}

function Logo() {
  return (
    <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
      <path
        d="M16 5 L27 26 L5 26 Z"
        fill="none"
        stroke="#ff8a3d"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      <rect x="15" y="12" width="2" height="7" fill="#ff8a3d" />
      <rect x="15" y="21" width="2" height="2" fill="#ff8a3d" />
    </svg>
  );
}

function Clock() {
  const [now, setNow] = useState(() => formatNow());
  useEffect(() => {
    const id = setInterval(() => setNow(formatNow()), 1000);
    return () => clearInterval(id);
  }, []);
  return <span>{now}</span>;
}

function formatNow(): string {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function PlaceholderPanel({ text }: { text: string }) {
  return (
    <div className="panel flex-1 min-h-0 flex items-center justify-center">
      <p className="font-sans text-sm text-ink-mute px-6 text-center">{text}</p>
    </div>
  );
}

function getScenarioName(
  scenario: ReturnType<typeof useScenario>["scenario"],
  presets: ReturnType<typeof useScenario>["presets"]
): string | undefined {
  if (!scenario) return undefined;
  return (
    presets.find((p) => p.id === scenario.scenarioId)?.name || scenario.scenarioId
  );
}
