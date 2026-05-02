import { useState } from "react";
import clsx from "clsx";
import { AGENT_META, type AgentKey, type AgentOutputs } from "../types";
import type { AgentStatus, AgentStatusMap } from "../hooks/useAgents";

interface Props {
  outputs: AgentOutputs;
  statuses: AgentStatusMap;
  errors: Record<string, string>;
  running: boolean;
}

const STATUS_LABEL: Record<AgentStatus, string> = {
  idle: "Idle",
  running: "Running",
  complete: "Complete",
  error: "Error",
};

const STATUS_DOT: Record<AgentStatus, string> = {
  idle: "bg-ink-mute",
  running: "bg-urgent animate-pulse",
  complete: "bg-safe",
  error: "bg-critical",
};

export function AgentCards({ outputs, statuses, errors, running }: Props) {
  const completed = Object.values(statuses).filter((s) => s === "complete").length;

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-eyebrow">Agents</span>
          <h2 className="panel-title">Specialist activity</h2>
        </div>
        <div className="font-mono text-[11px] text-ink-mute">
          {running
            ? "running…"
            : completed > 0
            ? `${completed} / 6 complete`
            : "idle"}
        </div>
      </header>

      <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {AGENT_META.map((meta, idx) => (
          <AgentCard
            key={meta.key}
            index={idx}
            agentKey={meta.key}
            name={meta.name}
            role={meta.role}
            status={statuses[meta.key]}
            output={outputs[meta.key]}
            error={errors[meta.key]}
          />
        ))}
      </div>

      {errors.all && (
        <div className="mx-4 mb-4 rounded border border-critical/50 bg-critical-soft px-3 py-2 text-sm text-critical">
          {errors.all}
        </div>
      )}
    </section>
  );
}

interface AgentCardProps {
  index: number;
  agentKey: AgentKey;
  name: string;
  role: string;
  status: AgentStatus;
  output: string;
  error?: string;
}

function AgentCard({
  index,
  name,
  role,
  status,
  output,
  error,
}: AgentCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasOutput = Boolean(output);

  return (
    <article
      className={clsx(
        "relative bg-bg-raised border border-bg-line rounded-md overflow-hidden flex flex-col",
        status === "complete" && "animate-fade-in-up",
        status === "running" && "scanline"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <header className="flex items-center justify-between gap-2 px-3 py-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={clsx("h-2 w-2 rounded-full shrink-0", STATUS_DOT[status])} />
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-sans text-sm font-medium text-ink truncate">
              {name}
            </span>
            <span className="font-mono text-[10px] text-ink-mute truncate">
              {role}
            </span>
          </div>
        </div>
        <span
          className={clsx(
            "font-mono text-[10px] uppercase tracking-[0.16em] shrink-0",
            status === "complete" && "text-safe",
            status === "running" && "text-urgent",
            status === "error" && "text-critical",
            status === "idle" && "text-ink-mute"
          )}
        >
          {STATUS_LABEL[status]}
        </span>
      </header>

      {hasOutput && (
        <button
          type="button"
          onClick={() => setExpanded((s) => !s)}
          className="border-t border-bg-line px-3 py-1.5 text-left text-[11px] font-mono text-ink-dim hover:text-ink hover:bg-bg-panel/40 transition-colors"
        >
          {expanded ? "− hide output" : "+ show output"}
        </button>
      )}

      {expanded && hasOutput && (
        <div className="border-t border-bg-line px-3 py-2.5 max-h-72 overflow-auto bg-bg-panel/30">
          <pre className="font-mono text-[12px] text-ink-dim whitespace-pre-wrap leading-relaxed">
            {output}
          </pre>
        </div>
      )}

      {error && (
        <div className="border-t border-critical/30 px-3 py-2 bg-critical-soft text-critical text-xs">
          {error}
        </div>
      )}
    </article>
  );
}
