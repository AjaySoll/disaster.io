import { useEffect, useState } from "react";
import { useScenario } from "./hooks/useScenario";
import { useAgents } from "./hooks/useAgents";
import { Hero } from "./components/Hero";
import { ScenarioToolbar } from "./components/ScenarioToolbar";
import { LocationsPanel } from "./components/LocationsPanel";
import { AgentCards } from "./components/AgentCards";
import { ActionPlan } from "./components/ActionPlan";
import { InventoryTracker } from "./components/InventoryTracker";
import { SituationReport } from "./components/SituationReport";
import { EventLog } from "./components/EventLog";
import { AddUpdateModal } from "./components/AddUpdateModal";
import { ScenarioMap } from "./components/ScenarioMap";
import { VulnerabilityPanel } from "./components/VulnerabilityPanel";

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

  const scenarioName = getScenarioName(scenario, presets);

  const handleRunAgents = () => {
    if (!scenario) return;
    trigger(scenario._id);
  };

  return (
    <div className="min-h-full flex flex-col bg-bg-base text-ink">
      <TopBar />

      <Hero
        presets={presets}
        loading={loading}
        activeScenarioName={scenarioName}
        onStart={start}
      />

      {scenario ? (
        <Dashboard
          scenario={scenario}
          scenarioName={scenarioName || scenario.scenarioId}
          statuses={statuses}
          errors={errors}
          running={running}
          onRun={handleRunAgents}
          onAddUpdate={() => setShowUpdate(true)}
          onDeliver={deliver}
        />
      ) : (
        <EmptyState />
      )}

      <Footer />

      {error && (
        <div className="fixed bottom-4 right-4 max-w-xs rounded border border-critical/40 bg-critical-soft px-3 py-2 text-sm text-critical font-mono shadow-lg z-50">
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

interface DashboardProps {
  scenario: NonNullable<ReturnType<typeof useScenario>["scenario"]>;
  scenarioName: string;
  statuses: ReturnType<typeof useAgents>["statuses"];
  errors: ReturnType<typeof useAgents>["errors"];
  running: boolean;
  onRun: () => void;
  onAddUpdate: () => void;
  onDeliver: ReturnType<typeof useScenario>["deliver"];
}

function Dashboard({
  scenario,
  scenarioName,
  statuses,
  errors,
  running,
  onRun,
  onAddUpdate,
  onDeliver,
}: DashboardProps) {
  return (
    <main className="max-w-[1400px] mx-auto w-full px-6 py-8 space-y-6">
      <ScenarioToolbar
        scenario={scenario}
        scenarioName={scenarioName}
        running={running}
        onRun={onRun}
        onAddUpdate={onAddUpdate}
      />

      {/* Big centred live map */}
      <div className="h-[60vh] min-h-[460px]">
        <ScenarioMap scenario={scenario} />
      </div>

      {/* Agent activity — full width with 3-col grid of cards */}
      <AgentCards
        outputs={scenario.agentOutputs}
        statuses={statuses}
        errors={errors}
        running={running}
      />

      {/* Vulnerability priority scoring — full width */}
      <VulnerabilityPanel scenario={scenario} />

      {/* Three-column dashboard grid: locations / action plan / inventory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 min-h-[320px]">
          <LocationsPanel scenario={scenario} />
        </div>
        <div className="lg:col-span-5 min-h-[320px]">
          <ActionPlan scenario={scenario} onDeliver={onDeliver} />
        </div>
        <div className="lg:col-span-3 min-h-[320px]">
          <InventoryTracker scenario={scenario} />
        </div>
      </div>

      {/* Situation report + event log row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-7 min-h-[260px]">
          <SituationReport scenario={scenario} />
        </div>
        <div className="lg:col-span-5 min-h-[260px]">
          <EventLog history={scenario.history} />
        </div>
      </div>
    </main>
  );
}

function EmptyState() {
  return (
    <section className="max-w-3xl mx-auto w-full px-6 py-16 text-center">
      <p className="font-sans text-sm text-ink-mute">
        Choose a scenario above to spin up the operations centre.
      </p>
    </section>
  );
}

function TopBar() {
  return (
    <header className="h-12 shrink-0 flex items-center justify-between px-6 border-b border-bg-line bg-bg-panel/60 backdrop-blur sticky top-0 z-30">
      <div className="flex items-center gap-2.5">
        <Logo />
        <span className="font-sans font-semibold tracking-tight text-ink">
          disaster.io
        </span>
      </div>
      <div className="flex items-center gap-3 font-mono text-[11px] text-ink-mute">
        <Clock />
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="border-t border-bg-line mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex items-center justify-between font-mono text-[11px] text-ink-mute">
        <span>disaster.io · multi-agent disaster response coordinator</span>
        <span>claude-sonnet-4 · openstreetmap · carto</span>
      </div>
    </footer>
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

function getScenarioName(
  scenario: ReturnType<typeof useScenario>["scenario"],
  presets: ReturnType<typeof useScenario>["presets"]
): string | undefined {
  if (!scenario) return undefined;
  return (
    presets.find((p) => p.id === scenario.scenarioId)?.name || scenario.scenarioId
  );
}
