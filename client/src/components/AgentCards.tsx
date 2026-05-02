import { useState } from "react";
import clsx from "clsx";
import { AGENT_META, type AgentKey, type AgentOutputs } from "../types";
import type { AgentStatus, AgentStatusMap } from "../hooks/useAgents";

interface Props {
  outputs: AgentOutputs;
  statuses: AgentStatusMap;
  errors: Record<string, string>;
  running: boolean;
  onRun: () => void;
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

export function AgentCards({
  outputs,
  statuses,
  errors,
  running,
  onRun,
}: Props) {
  return (
    <section className="panel">
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-eyebrow">02</span>
          <h2 className="panel-title">Agent activity</h2>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={onRun}
          disabled={running}
        >
          {running ? "Running…" : "Run all agents"}
        </button>
      </header>

      <div className="flex-1 overflow-auto p-3 space-y-2">
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
        {errors.all && (
          <div className="rounded border border-critical/50 bg-critical-soft px-3 py-2 text-sm text-critical">
            {errors.all}
          </div>
        )}
      </div>
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
        "relative bg-bg-raised border border-bg-line rounded-md overflow-hidden",
        status === "complete" && "animate-fade-in-up",
        status === "running" && "scanline"
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <header className="flex items-center justify-between px-3 py-2">
        <div className="flex items-center gap-3">
          <span
            className={clsx(
              "h-2 w-2 rounded-full",
              STATUS_DOT[status]
            )}
          />
          <div className="flex flex-col leading-tight">
            <span className="font-sans text-sm font-medium text-ink">
              {name}
            </span>
            <span className="font-mono text-[10px] text-ink-mute">{role}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={clsx(
              "font-mono text-[10px] uppercase tracking-[0.16em]",
              status === "complete" && "text-safe",
              status === "running" && "text-urgent",
              status === "error" && "text-critical",
              status === "idle" && "text-ink-mute"
            )}
          >
            {STATUS_LABEL[status]}
          </span>
          {hasOutput && (
            <button
              type="button"
              className="font-mono text-[11px] text-ink-dim hover:text-ink px-1"
              onClick={() => setExpanded((s) => !s)}
            >
              {expanded ? "−" : "+"}
            </button>
          )}
        </div>
      </header>

      {expanded && hasOutput && (
        <div className="border-t border-bg-line px-3 py-2 max-h-72 overflow-auto">
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
