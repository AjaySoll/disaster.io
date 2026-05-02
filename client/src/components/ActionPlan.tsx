import { useEffect, useRef, useState } from "react";
import clsx from "clsx";
import type {
  ActionPlanItem,
  ConflictResolution,
  EmergencyState,
  InventoryItem,
  Location,
} from "../types";

interface Props {
  scenario: EmergencyState;
  onDeliver: (payload: {
    actionId?: string;
    locationId: string;
    item: string;
    quantity: number;
  }) => Promise<unknown> | undefined;
}

export function ActionPlan({ scenario, onDeliver }: Props) {
  const { actionPlan, locations, inventory } = scenario;
  const previousIds = useRef<Set<string>>(new Set());
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set());

  // Highlight newly added rows briefly after each agent run.
  useEffect(() => {
    const currentIds = new Set(
      actionPlan.map((a) => a._id || `${a.priority}-${a.action}`)
    );
    const fresh = new Set<string>();
    currentIds.forEach((id) => {
      if (!previousIds.current.has(id)) fresh.add(id);
    });
    previousIds.current = currentIds;
    if (fresh.size > 0) {
      setHighlighted(fresh);
      const t = setTimeout(() => setHighlighted(new Set()), 1500);
      return () => clearTimeout(t);
    }
  }, [actionPlan]);

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-eyebrow">Plan</span>
          <h2 className="panel-title">Action plan</h2>
        </div>
        <span className="font-mono text-[11px] text-ink-mute">
          {actionPlan.length} actions
        </span>
      </header>

      <div className="overflow-auto">
        {actionPlan.length === 0 ? (
          <EmptyState />
        ) : (
          <table className="w-full">
            <thead className="bg-bg-raised/40 sticky top-0">
              <tr className="label-cell">
                <th className="px-3 py-2 w-10 text-right">#</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2 w-24">Status</th>
                <th className="px-3 py-2 w-28"></th>
              </tr>
            </thead>
            <tbody>
              {actionPlan.map((action) => {
                const id = action._id || `${action.priority}-${action.action}`;
                return (
                  <ActionRow
                    key={id}
                    action={action}
                    locations={locations}
                    inventory={inventory}
                    highlighted={highlighted.has(id)}
                    onDeliver={onDeliver}
                  />
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

function EmptyState() {
  return (
    <div className="px-4 py-10 text-center text-sm text-ink-dim font-sans">
      No action plan yet.
      <div className="mt-1 font-mono text-[11px] text-ink-mute">
        Run agents to generate one.
      </div>
    </div>
  );
}

interface ActionRowProps {
  action: ActionPlanItem;
  locations: Location[];
  inventory: InventoryItem[];
  highlighted: boolean;
  onDeliver: Props["onDeliver"];
}

function ActionRow({
  action,
  locations,
  inventory,
  highlighted,
  onDeliver,
}: ActionRowProps) {
  const guess = guessDelivery(action, locations, inventory);
  const isComplete = action.status === "complete";
  const arbitrated = Boolean(action.conflictResolved);
  const [showResolution, setShowResolution] = useState(false);

  return (
    <>
      <tr
        className={clsx(
          "border-t border-bg-line/70 align-top",
          highlighted && "animate-row-highlight",
          isComplete && "opacity-60"
        )}
      >
        <td className="px-3 py-2 text-right data-cell text-urgent font-semibold">
          {action.priority}
        </td>
        <td className="px-3 py-2">
          <div className="font-sans text-sm text-ink leading-snug flex items-start gap-2">
            <span className="flex-1">{action.action}</span>
            {arbitrated && (
              <button
                type="button"
                onClick={() => setShowResolution((s) => !s)}
                className="shrink-0 inline-flex items-center gap-1 font-mono text-[10px] text-urgent border border-urgent/40 bg-urgent-soft rounded px-1.5 py-0.5 hover:bg-urgent/20 transition-colors"
                title="This action resolved an inter-agent conflict"
              >
                ⚖ arbitrated
              </button>
            )}
          </div>
          {action.reason && (
            <div className="mt-1 font-mono text-[11px] text-ink-mute leading-snug">
              {action.reason}
            </div>
          )}
        </td>
        <td className="px-3 py-2">
          <StatusPill status={action.status} />
        </td>
        <td className="px-3 py-2 text-right">
          {isComplete ? (
            <span className="font-mono text-[11px] text-safe">✓ delivered</span>
          ) : guess ? (
            <button
              type="button"
              className="btn-safe text-xs"
              onClick={() =>
                onDeliver({
                  actionId: action._id,
                  locationId: guess.locationId,
                  item: guess.item,
                  quantity: guess.quantity,
                })
              }
            >
              Mark delivered
            </button>
          ) : (
            <span className="font-mono text-[10px] text-ink-mute">
              no auto-match
            </span>
          )}
        </td>
      </tr>
      {arbitrated && showResolution && action.conflictResolved && (
        <tr className="border-t border-bg-line/40 bg-bg-raised/30">
          <td></td>
          <td colSpan={3} className="px-3 py-2.5">
            <ArbitrationDetail resolved={action.conflictResolved} />
          </td>
        </tr>
      )}
    </>
  );
}

function ArbitrationDetail({ resolved }: { resolved: ConflictResolution }) {
  const [showReasoning, setShowReasoning] = useState(false);
  const hasReasoning = Boolean(resolved.reasoning && resolved.reasoning.trim());

  return (
    <div className="border-l-2 border-urgent/60 pl-3 space-y-1.5">
      <div className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
        Coordinator arbitration
      </div>
      {resolved.conflict && (
        <p className="font-sans text-[12px] text-ink-dim leading-snug">
          <span className="font-mono text-[9px] text-ink-mute uppercase tracking-[0.14em] mr-1.5">
            conflict
          </span>
          {resolved.conflict}
        </p>
      )}
      {resolved.decision && (
        <p className="font-sans text-[12px] text-ink leading-snug">
          <span className="font-mono text-[9px] text-safe uppercase tracking-[0.14em] mr-1.5">
            sided with
          </span>
          {resolved.decision}
        </p>
      )}
      {resolved.overruled && (
        <p className="font-sans text-[12px] text-ink-dim leading-snug">
          <span className="font-mono text-[9px] text-critical uppercase tracking-[0.14em] mr-1.5">
            overruled
          </span>
          {resolved.overruled}
        </p>
      )}

      {hasReasoning && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowReasoning((s) => !s)}
            className="inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim hover:text-urgent transition-colors"
          >
            <span>{showReasoning ? "▾" : "▸"}</span>
            {showReasoning ? "hide reasoning" : "show reasoning"}
          </button>
          {showReasoning && (
            <div className="mt-1.5 rounded border border-bg-line bg-bg-panel/60 px-2.5 py-2 animate-fade-in-up">
              <div className="font-mono text-[9px] uppercase tracking-[0.18em] text-ink-mute mb-1">
                why this side won
              </div>
              <p className="font-sans text-[12.5px] text-ink-dim leading-relaxed whitespace-pre-wrap">
                {resolved.reasoning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-bg-raised text-ink-dim border-bg-line",
    in_progress: "bg-urgent-soft text-urgent border-urgent/40",
    complete: "bg-safe-soft text-safe border-safe/40",
  };
  return (
    <span
      className={clsx(
        "inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-[10px] uppercase tracking-[0.14em]",
        styles[status] || styles.pending
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}

/**
 * Best-effort parse of an action sentence to extract an inventory item,
 * destination location, and quantity. Used to populate the "Mark delivered"
 * button without needing the user to fill a form.
 */
function guessDelivery(
  action: ActionPlanItem,
  locations: Location[],
  inventory: InventoryItem[]
): { locationId: string; item: string; quantity: number } | null {
  const text = action.action;

  // Find a location whose name appears in the action.
  const loc = locations.find((l) =>
    text.toLowerCase().includes(l.name.toLowerCase())
  ) || locations.find((l) =>
    text.toLowerCase().includes(l.id.toLowerCase())
  );
  if (!loc) return null;

  // Find an inventory item name that appears in the action.
  const item = inventory.find((i) =>
    text.toLowerCase().includes(i.item.toLowerCase())
  );
  if (!item) return null;

  // Pull the first integer in the action text as the quantity.
  const qtyMatch = text.match(/\b(\d{1,4})\b/);
  const qty = qtyMatch ? Number(qtyMatch[1]) : 1;

  return {
    locationId: loc.id,
    item: item.item,
    quantity: Math.max(1, Math.min(qty, item.quantity || qty)),
  };
}
