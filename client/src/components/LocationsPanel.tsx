import type { EmergencyState } from "../types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  scenario: EmergencyState;
}

export function LocationsPanel({ scenario }: Props) {
  const { locations, blockedRoads } = scenario;

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-eyebrow">Sites</span>
          <h2 className="panel-title">Active locations</h2>
        </div>
        <span className="font-mono text-[11px] text-ink-mute">
          {locations.length} active
        </span>
      </header>

      <div className="overflow-auto">
        <table className="w-full text-left">
          <thead className="bg-bg-raised/40 sticky top-0">
            <tr className="label-cell">
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2 w-14">Status</th>
              <th className="px-3 py-2">Needs</th>
              <th className="px-3 py-2 w-16 text-right">Pop.</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr
                key={loc.id}
                className="border-t border-bg-line/70 hover:bg-bg-raised/40"
              >
                <td className="px-3 py-2 font-sans text-sm text-ink">
                  <div className="leading-tight">{loc.name}</div>
                  <div className="font-mono text-[10px] text-ink-mute">
                    {loc.coordinates.lat.toFixed(3)},{" "}
                    {loc.coordinates.lng.toFixed(3)}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={loc.status} />
                </td>
                <td className="px-3 py-2">
                  <div className="flex flex-wrap gap-1">
                    {loc.needs.length === 0 ? (
                      <span className="font-mono text-[11px] text-ink-mute">
                        —
                      </span>
                    ) : (
                      loc.needs.map((n) => (
                        <span
                          key={n}
                          className="font-mono text-[11px] text-ink bg-bg-raised border border-bg-line rounded px-1.5 py-0.5"
                        >
                          {n}
                        </span>
                      ))
                    )}
                  </div>
                </td>
                <td className="px-3 py-2 text-right data-cell text-ink">
                  {loc.population.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {blockedRoads.length > 0 && (
        <div className="border-t border-bg-line px-4 py-2.5 bg-bg-raised/40">
          <div className="panel-eyebrow mb-1">Blocked routes</div>
          <div className="flex flex-wrap gap-1.5">
            {blockedRoads.map((road) => (
              <span
                key={road}
                className="font-mono text-[11px] text-critical bg-critical-soft border border-critical/40 rounded px-1.5 py-0.5"
              >
                ⛔ {road}
              </span>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
