import clsx from "clsx";
import type { LocationStatus } from "../types";

const STYLES: Record<LocationStatus, string> = {
  critical:
    "bg-critical-soft text-critical border-critical/40 animate-pulse-urgent",
  full: "bg-bg-raised text-ink-dim border-bg-line",
  open: "bg-urgent-soft text-urgent border-urgent/40",
  closed: "bg-bg-raised text-ink-mute border-bg-line line-through",
  new: "bg-safe-soft text-safe border-safe/40",
};

const LABELS: Record<LocationStatus, string> = {
  critical: "CRIT",
  full: "FULL",
  open: "OPEN",
  closed: "CLSD",
  new: "NEW",
};

export function StatusBadge({ status }: { status: LocationStatus }) {
  return (
    <span
      className={clsx(
        "inline-flex items-center justify-center px-1.5 py-0.5 rounded border font-mono text-[10px] tracking-[0.16em]",
        STYLES[status]
      )}
    >
      {LABELS[status]}
    </span>
  );
}
