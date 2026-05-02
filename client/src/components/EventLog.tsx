import clsx from "clsx";
import type { HistoryEvent, HistoryType } from "../types";

interface Props {
  history: HistoryEvent[];
}

const TYPE_COLOR: Record<HistoryType, string> = {
  scenario_start: "text-safe",
  update: "text-urgent",
  delivery: "text-safe",
  agent_run: "text-warn",
  info: "text-ink-dim",
};

const TYPE_LABEL: Record<HistoryType, string> = {
  scenario_start: "START",
  update: "UPD",
  delivery: "DELIV",
  agent_run: "AGENTS",
  info: "INFO",
};

export function EventLog({ history }: Props) {
  // Newest first
  const sorted = [...history].sort(
    (a, b) =>
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section className="panel h-full">
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-eyebrow">Log</span>
          <h2 className="panel-title">Event history</h2>
        </div>
        <span className="font-mono text-[11px] text-ink-mute">
          {history.length} events
        </span>
      </header>

      <div className="flex-1 overflow-auto px-3 py-2">
        {sorted.length === 0 ? (
          <p className="font-sans text-sm text-ink-mute py-4 text-center">
            No events yet.
          </p>
        ) : (
          <ol className="space-y-1">
            {sorted.map((evt, idx) => (
              <li
                key={`${evt.timestamp}-${idx}`}
                className="grid grid-cols-[110px_60px_1fr] gap-2 items-baseline font-mono text-[12px] py-0.5"
              >
                <time className="text-ink-mute">
                  {formatTime(evt.timestamp)}
                </time>
                <span
                  className={clsx(
                    "uppercase tracking-[0.16em] text-[10px]",
                    TYPE_COLOR[evt.type]
                  )}
                >
                  {TYPE_LABEL[evt.type]}
                </span>
                <span className="text-ink-dim">{evt.event}</span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </section>
  );
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return iso;
  }
}
