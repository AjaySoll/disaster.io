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
import { ScenarioMap } from "./components/ScenarioMap";
import { ConflictPanel } from "./components/ConflictPanel";

export default function App() {
  const { presets, scenario, loading, error, start, deliver, replace } =
    useScenario();
  const { statuses, errors, running, trigger } = useAgents(replace);

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
  onDeliver: ReturnType<typeof useScenario>["deliver"];
}

function Dashboard({
  scenario,
  scenarioName,
  statuses,
  errors,
  running,
  onRun,
  onDeliver,
}: DashboardProps) {
  return (
    <main className="max-w-[1400px] mx-auto w-full px-6 py-8 space-y-6">
      <ScenarioToolbar
        scenario={scenario}
        scenarioName={scenarioName}
        running={running}
        onRun={onRun}
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

      {/* Inter-agent arbitration — the differentiating feature */}
      <ConflictPanel
        scenario={scenario}
        agentsHaveRun={Boolean(scenario.agentOutputs?.coordinator)}
      />

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
  const credits = [
    { handle: "aarondoesnotcode", url: "https://github.com/aarondoesnotcode" },
    { handle: "ajaysoll", url: "https://github.com/ajaysoll" },
    { handle: "kae9", url: "https://github.com/kae9" },
  ];

  return (
    <footer className="border-t border-bg-line mt-auto">
      <div className="max-w-[1400px] mx-auto px-6 py-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[11px] text-ink-mute">
        <span>disaster.io · multi-agent disaster response coordinator</span>
        <div className="flex items-center gap-2">
          <span className="text-ink-mute">built by</span>
          {credits.map((c) => (
            <a
              key={c.handle}
              href={c.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-1 text-ink-dim hover:text-urgent transition-colors"
            >
              <GithubIcon />@{c.handle}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}

function GithubIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="currentColor"
      aria-hidden
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
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
