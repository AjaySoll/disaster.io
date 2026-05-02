import clsx from "clsx";
import type { EmergencyState } from "../types";

interface Props {
  scenario: EmergencyState;
}

const LOW_STOCK_THRESHOLD = 20;

export function InventoryTracker({ scenario }: Props) {
  const { inventory } = scenario;

  return (
    <section className="panel">
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-eyebrow">Stock</span>
          <h2 className="panel-title">Inventory</h2>
        </div>
        <span className="font-mono text-[11px] text-ink-mute">
          {inventory.length} skus
        </span>
      </header>

      <div className="overflow-auto">
        <table className="w-full">
          <thead className="bg-bg-raised/40 sticky top-0">
            <tr className="label-cell">
              <th className="px-3 py-2">Item</th>
              <th className="px-3 py-2">Warehouse</th>
              <th className="px-3 py-2 text-right w-20">Qty</th>
            </tr>
          </thead>
          <tbody>
            {inventory.map((row, idx) => {
              const low = row.quantity <= LOW_STOCK_THRESHOLD;
              const out = row.quantity === 0;
              return (
                <tr
                  key={`${row.item}-${row.warehouseId}-${idx}`}
                  className="border-t border-bg-line/70"
                >
                  <td className="px-3 py-2 font-sans text-sm text-ink">
                    {row.item}
                  </td>
                  <td className="px-3 py-2 data-cell text-ink-dim">
                    {row.warehouseId}
                  </td>
                  <td
                    className={clsx(
                      "px-3 py-2 text-right data-cell font-semibold",
                      out
                        ? "text-critical"
                        : low
                        ? "text-urgent"
                        : "text-ink"
                    )}
                  >
                    <div className="inline-flex items-center gap-1">
                      {row.quantity}
                      {out && (
                        <span className="font-mono text-[10px] text-critical">
                          OUT
                        </span>
                      )}
                      {!out && low && (
                        <span className="font-mono text-[10px] text-urgent">
                          LOW
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
