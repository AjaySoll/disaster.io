import { useState } from "react";
import clsx from "clsx";
import type { ActionPlanItem, Conflict, EmergencyState } from "../types";

interface Props {
  scenario: EmergencyState;
  agentsHaveRun: boolean;
}

/**
 * The arbitration panel — the single most important visual differentiator
 * of this system. Shows every detected disagreement between specialist
 * agents and how the Coordinator chose to resolve it.
 */
export function ConflictPanel({ scenario, agentsHaveRun }: Props) {
  const conflicts = scenario.conflicts || [];
  const actionPlan = scenario.actionPlan || [];

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-eyebrow">Arbitration</span>
          <h2 className="panel-title">Agent conflicts &amp; resolution</h2>
        </div>
        <ConflictHeaderBadge
          agentsHaveRun={agentsHaveRun}
          conflictCount={conflicts.length}
        />
      </header>

      <div className="px-5 py-4">
        {!agentsHaveRun ? (
          <Placeholder />
        ) : conflicts.length === 0 ? (
          <AllAgreeBanner />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            {conflicts.map((c, i) => (
              <ConflictCard
                key={c.conflictId}
                index={i}
                conflict={c}
                resolvingAction={findResolvingAction(c, actionPlan)}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function ConflictHeaderBadge({
  agentsHaveRun,
  conflictCount,
}: {
  agentsHaveRun: boolean;
  conflictCount: number;
}) {
  if (!agentsHaveRun) {
    return (
      <span className="font-mono text-[11px] text-ink-mute">awaiting run</span>
    );
  }
  if (conflictCount === 0) {
    return (
      <span className="font-mono text-[11px] text-safe inline-flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-safe animate-pulse" />
        consensus
      </span>
    );
  }
  return (
    <span className="font-mono text-[11px] text-urgent inline-flex items-center gap-1.5">
      <span className="h-1.5 w-1.5 rounded-full bg-urgent animate-pulse" />
      {conflictCount} arbitrated
    </span>
  );
}

function Placeholder() {
  return (
    <p className="font-sans text-sm text-ink-mute py-4 text-center">
      Run the agents to surface any disagreements between specialists.
    </p>
  );
}

function AllAgreeBanner() {
  return (
    <div className="flex items-center justify-center gap-3 py-4 px-4 rounded-md border border-safe/30 bg-safe-soft">
      <span className="h-2 w-2 rounded-full bg-safe animate-pulse" />
      <span className="font-sans text-sm text-safe font-medium">
        All agents in agreement
      </span>
      <span className="font-mono text-[11px] text-safe/70">
        no arbitration required
      </span>
    </div>
  );
}

interface ConflictCardProps {
  index: number;
  conflict: Conflict;
  resolvingAction: ActionPlanItem | null;
}

function ConflictCard({ index, conflict, resolvingAction }: ConflictCardProps) {
  const resolved = Boolean(resolvingAction?.conflictResolved);
  const sourceLabel =
    conflict.source === "self_reported" ? "self-reported" : "auto-detected";

  return (
    <article
      className={clsx(
        "rounded-md border bg-bg-raised animate-fade-in-up",
        resolved
          ? "border-urgent/40"
          : "border-critical/50 ring-1 ring-critical/20"
      )}
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <header className="flex items-start justify-between gap-2 px-3.5 py-2.5 border-b border-bg-line">
        <div className="flex items-center gap-2 min-w-0">
          <span className="font-mono text-[10px] text-ink-mute uppercase tracking-[0.18em]">
            ⚖ Conflict {index + 1}
          </span>
          <span className="font-mono text-[10px] text-urgent border border-urgent/40 bg-urgent-soft rounded px-1.5 py-0.5">
            {sourceLabel}
          </span>
        </div>
        {!resolved && (
          <span className="font-mono text-[10px] text-critical uppercase tracking-[0.16em]">
            unresolved
          </span>
        )}
      </header>

      <div className="px-3.5 py-3 space-y-2.5">
        {/* Who vs who */}
        <div className="flex flex-wrap items-center gap-1.5">
          {conflict.between.map((name, i) => (
            <span key={`${conflict.conflictId}-${i}`} className="contents">
              <span className="font-sans text-[13px] text-ink font-medium">
                {name}
              </span>
              {i < conflict.between.length - 1 && (
                <span className="font-mono text-urgent">↔</span>
              )}
            </span>
          ))}
        </div>

        {/* The disagreement */}
        <p className="font-sans text-[13px] text-ink-dim leading-snug">
          {conflict.issue}
        </p>

        {/* Affected scope */}
        {(conflict.locations.length > 0 || conflict.resource) && (
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            {conflict.resource && (
              <span className="font-mono text-[10px] text-ink bg-bg-panel border border-bg-line rounded px-1.5 py-0.5">
                resource: {conflict.resource}
              </span>
            )}
            {conflict.locations.map((loc) => (
              <span
                key={loc}
                className="font-mono text-[10px] text-ink bg-bg-panel border border-bg-line rounded px-1.5 py-0.5"
              >
                @ {loc}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Coordinator arbitration */}
      <div
        className={clsx(
          "mx-3.5 mb-3 rounded border-l-2 px-3 py-2.5",
          resolved
            ? "border-safe bg-safe-soft/60"
            : "border-critical/60 bg-critical-soft/40"
        )}
      >
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink-dim">
            Coordinator arbitration
          </span>
          {resolvingAction && (
            <span className="font-mono text-[10px] text-safe">
              → action #{resolvingAction.priority}
            </span>
          )}
        </div>

        {resolved && resolvingAction?.conflictResolved ? (
          <ResolvedBlock
            decision={resolvingAction.conflictResolved.decision}
            overruled={resolvingAction.conflictResolved.overruled}
            reasoning={resolvingAction.conflictResolved.reasoning}
          />
        ) : (
          <p className="font-sans text-[12.5px] text-critical leading-snug">
            Coordinator did not address this conflict in the current plan.
          </p>
        )}
      </div>
    </article>
  );
}

function ResolvedBlock({
  decision,
  overruled,
  reasoning,
}: {
  decision: string;
  overruled: string;
  reasoning?: string;
}) {
  const [showReasoning, setShowReasoning] = useState(false);
  const hasReasoning = Boolean(reasoning && reasoning.trim());

  return (
    <div className="space-y-1.5">
      {decision && (
        <p className="font-sans text-[12.5px] text-ink leading-snug">
          <span className="font-mono text-[10px] text-safe uppercase tracking-[0.14em] mr-1.5">
            sided with
          </span>
          {decision}
        </p>
      )}
      {overruled && (
        <p className="font-sans text-[12.5px] text-ink-dim leading-snug">
          <span className="font-mono text-[10px] text-critical uppercase tracking-[0.14em] mr-1.5">
            overruled
          </span>
          {overruled}
        </p>
      )}

      {hasReasoning && (
        <div className="pt-1.5">
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
                {reasoning}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Loose match between a detected conflict and the action that resolved it.
 * The Coordinator doesn't echo our conflictId, so we score by overlap of
 * agent names + locations + resource keywords across the action's
 * conflictResolved fields.
 */
function findResolvingAction(
  conflict: Conflict,
  plan: ActionPlanItem[]
): ActionPlanItem | null {
  let best: { item: ActionPlanItem; score: number } | null = null;

  for (const item of plan) {
    if (!item.conflictResolved) continue;
    const haystack = `${item.conflictResolved.conflict} ${item.conflictResolved.decision} ${item.conflictResolved.overruled} ${item.action}`.toLowerCase();

    let score = 0;
    for (const name of conflict.between) {
      if (haystack.includes(name.toLowerCase())) score += 2;
    }
    for (const loc of conflict.locations) {
      if (loc && haystack.includes(loc.toLowerCase())) score += 2;
    }
    if (
      conflict.resource &&
      haystack.includes(conflict.resource.toLowerCase())
    ) {
      score += 1;
    }

    if (score > 0 && (!best || score > best.score)) {
      best = { item, score };
    }
  }

  return best?.item ?? null;
}
