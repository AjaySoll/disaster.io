import type { PresetSummary } from "../types";

interface Props {
  presets: PresetSummary[];
  loading: boolean;
  activeScenarioName?: string;
  onStart: (scenarioId: string) => Promise<unknown>;
}

export function Hero({ presets, loading, activeScenarioName, onStart }: Props) {
  return (
    <section className="relative overflow-hidden border-b border-bg-line">
      {/* Subtle radial glow background */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(900px 380px at 50% 0%, rgba(255,138,61,0.10), transparent 60%), radial-gradient(700px 320px at 90% 110%, rgba(62,208,196,0.07), transparent 60%)",
        }}
      />

      <div className="max-w-5xl mx-auto px-6 pt-16 pb-12 text-center">
        <h1 className="font-sans text-5xl md:text-6xl font-semibold tracking-tight text-ink leading-[1.05]">
          Disaster<span className="text-urgent">.io</span>
        </h1>

        <p className="mt-5 text-xl md:text-2xl font-sans text-ink leading-snug">
          Stay ahead of disasters around you.
        </p>

        <p className="mt-4 text-[15px] font-sans text-ink-dim max-w-2xl mx-auto leading-relaxed">
          A live coordination centre for emergency response. Six specialist
          Claude agents work in parallel — assessing needs, tracking inventory,
          planning routes around blocked roads, and producing an executable
          action plan that updates in real time as the situation evolves.
        </p>

        <div className="mt-10 max-w-xl mx-auto">
          <ScenarioPicker
            presets={presets}
            loading={loading}
            activeScenarioName={activeScenarioName}
            onStart={onStart}
          />
        </div>
      </div>
    </section>
  );
}

const TYPE_COLOR: Record<string, string> = {
  FLOOD: "text-safe border-safe/40 bg-safe-soft",
  FIRE: "text-urgent border-urgent/40 bg-urgent-soft",
  STORM: "text-ink border-bg-line bg-bg-raised",
  QUAKE: "text-warn border-warn/40 bg-warn-soft",
  HAZMAT: "text-warn border-warn/40 bg-warn-soft",
  HEAT: "text-critical border-critical/40 bg-critical-soft",
  EVENT: "text-ink-dim border-bg-line bg-bg-raised",
};

function ScenarioPicker({
  presets,
  loading,
  activeScenarioName,
  onStart,
}: Props) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-mute">
          choose a scenario
        </span>
        {activeScenarioName && (
          <span className="font-mono text-[11px] text-safe">
            ● {activeScenarioName}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {presets.map((p) => {
          const tone = TYPE_COLOR[p.type] || TYPE_COLOR.EVENT;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onStart(p.id)}
              disabled={loading}
              className="group text-left rounded-lg border border-bg-line bg-bg-panel/60 hover:bg-bg-raised hover:border-urgent/50 transition-colors px-3 py-3 disabled:opacity-50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="font-sans text-sm font-medium text-ink leading-tight group-hover:text-urgent transition-colors">
                  {p.name}
                </div>
                <span
                  className={`shrink-0 font-mono text-[9px] uppercase tracking-[0.16em] border rounded px-1.5 py-0.5 ${tone}`}
                >
                  {p.type}
                </span>
              </div>
              <div className="mt-1.5 font-mono text-[10px] text-ink-mute leading-snug line-clamp-2">
                {p.summary}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
