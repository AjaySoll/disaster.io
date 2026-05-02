import type { EmergencyState } from "../types";

interface Props {
  scenario: EmergencyState;
}

export function SituationReport({ scenario }: Props) {
  const text = scenario.agentOutputs?.communication;
  return (
    <section className="panel">
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-eyebrow">Brief</span>
          <h2 className="panel-title">Situation report</h2>
        </div>
        <span className="font-mono text-[10px] text-ink-mute">
          comms agent
        </span>
      </header>
      <div className="px-5 py-4 flex-1 overflow-auto">
        {text ? (
          <p className="font-sans text-[15px] leading-relaxed text-ink-dim whitespace-pre-wrap">
            {text}
          </p>
        ) : (
          <p className="font-sans text-sm text-ink-mute">
            No briefing yet. Run agents to generate a situation report.
          </p>
        )}
      </div>
    </section>
  );
}
