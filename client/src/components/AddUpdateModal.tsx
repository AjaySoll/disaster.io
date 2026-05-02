import { useState } from "react";
import type { EmergencyState } from "../types";
import type { ScenarioUpdate } from "../api/scenarios";

interface Props {
  scenario: EmergencyState;
  onClose: () => void;
  onSubmit: (payload: ScenarioUpdate) => Promise<unknown>;
}

type UpdateKind =
  | "block_road"
  | "unblock_road"
  | "location_status"
  | "add_request"
  | "add_location"
  | "note";

export function AddUpdateModal({ scenario, onClose, onSubmit }: Props) {
  const [kind, setKind] = useState<UpdateKind>("block_road");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async (payload: ScenarioUpdate) => {
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit(payload);
      onClose();
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md panel"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="panel-header">
          <div className="flex items-center gap-3">
            <span className="panel-eyebrow">Inject</span>
            <h2 className="panel-title">Situational update</h2>
          </div>
          <button
            type="button"
            className="font-mono text-sm text-ink-dim hover:text-ink"
            onClick={onClose}
          >
            ✕
          </button>
        </header>

        <div className="px-4 py-3 space-y-3">
          <div>
            <label className="label-cell block mb-1">Update type</label>
            <select
              className="input"
              value={kind}
              onChange={(e) => setKind(e.target.value as UpdateKind)}
            >
              <option value="block_road">Block road</option>
              <option value="unblock_road">Reopen road</option>
              <option value="location_status">Change location status</option>
              <option value="add_request">Add resource request</option>
              <option value="add_location">Open new location</option>
              <option value="note">Free-form note</option>
            </select>
          </div>

          {kind === "block_road" && (
            <RoadForm
              label="Road or route to block"
              submitting={submitting}
              onSubmit={(road) => handle({ type: "block_road", road })}
            />
          )}
          {kind === "unblock_road" && (
            <RoadForm
              label="Road or route to reopen"
              submitting={submitting}
              presets={scenario.blockedRoads}
              onSubmit={(road) => handle({ type: "unblock_road", road })}
            />
          )}
          {kind === "location_status" && (
            <LocationStatusForm
              scenario={scenario}
              submitting={submitting}
              onSubmit={(locationId, status) =>
                handle({ type: "location_status", locationId, status })
              }
            />
          )}
          {kind === "add_request" && (
            <AddRequestForm
              scenario={scenario}
              submitting={submitting}
              onSubmit={(request) => handle({ type: "add_request", request })}
            />
          )}
          {kind === "add_location" && (
            <AddLocationForm
              submitting={submitting}
              onSubmit={(location) =>
                handle({ type: "add_location", location })
              }
            />
          )}
          {kind === "note" && (
            <NoteForm
              submitting={submitting}
              onSubmit={(text) => handle({ type: "note", text })}
            />
          )}

          {error && (
            <div className="text-xs text-critical font-mono">{error}</div>
          )}
        </div>
      </div>
    </div>
  );
}

interface RoadFormProps {
  label: string;
  submitting: boolean;
  presets?: string[];
  onSubmit: (road: string) => void;
}

function RoadForm({ label, submitting, presets, onSubmit }: RoadFormProps) {
  const [road, setRoad] = useState("");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (road.trim()) onSubmit(road.trim());
      }}
    >
      <label className="label-cell block">{label}</label>
      {presets && presets.length > 0 ? (
        <select
          className="input"
          value={road}
          onChange={(e) => setRoad(e.target.value)}
        >
          <option value="">Select…</option>
          {presets.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      ) : (
        <input
          className="input"
          value={road}
          placeholder="e.g. A316"
          onChange={(e) => setRoad(e.target.value)}
        />
      )}
      <SubmitRow submitting={submitting} disabled={!road.trim()} />
    </form>
  );
}

function LocationStatusForm({
  scenario,
  submitting,
  onSubmit,
}: {
  scenario: EmergencyState;
  submitting: boolean;
  onSubmit: (locationId: string, status: string) => void;
}) {
  const [locationId, setLocationId] = useState("");
  const [status, setStatus] = useState("full");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (locationId) onSubmit(locationId, status);
      }}
    >
      <label className="label-cell block">Location</label>
      <select
        className="input"
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
      >
        <option value="">Select…</option>
        {scenario.locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <label className="label-cell block">New status</label>
      <select
        className="input"
        value={status}
        onChange={(e) => setStatus(e.target.value)}
      >
        <option value="open">open</option>
        <option value="full">full</option>
        <option value="critical">critical</option>
        <option value="closed">closed</option>
        <option value="new">new</option>
      </select>
      <SubmitRow submitting={submitting} disabled={!locationId} />
    </form>
  );
}

function AddRequestForm({
  scenario,
  submitting,
  onSubmit,
}: {
  scenario: EmergencyState;
  submitting: boolean;
  onSubmit: (req: {
    locationId: string;
    item: string;
    urgency: string;
  }) => void;
}) {
  const [locationId, setLocationId] = useState("");
  const [item, setItem] = useState("");
  const [urgency, setUrgency] = useState("high");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (locationId && item.trim()) {
          onSubmit({ locationId, item: item.trim(), urgency });
        }
      }}
    >
      <label className="label-cell block">Location</label>
      <select
        className="input"
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
      >
        <option value="">Select…</option>
        {scenario.locations.map((l) => (
          <option key={l.id} value={l.id}>
            {l.name}
          </option>
        ))}
      </select>
      <label className="label-cell block">Item requested</label>
      <input
        className="input"
        value={item}
        placeholder="e.g. Medical kits"
        onChange={(e) => setItem(e.target.value)}
      />
      <label className="label-cell block">Urgency</label>
      <select
        className="input"
        value={urgency}
        onChange={(e) => setUrgency(e.target.value)}
      >
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>
      <SubmitRow submitting={submitting} disabled={!locationId || !item.trim()} />
    </form>
  );
}

function AddLocationForm({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (location: {
    id: string;
    name: string;
    status: string;
    needs: string[];
    population: number;
    coordinates: { lat: number; lng: number };
  }) => void;
}) {
  const [name, setName] = useState("");
  const [needs, setNeeds] = useState("");
  const [population, setPopulation] = useState("0");
  const [lat, setLat] = useState("51.5");
  const [lng, setLng] = useState("-0.1");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSubmit({
          id: name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
          name: name.trim(),
          status: "new",
          needs: needs.split(",").map((s) => s.trim()).filter(Boolean),
          population: Number(population) || 0,
          coordinates: {
            lat: Number(lat) || 0,
            lng: Number(lng) || 0,
          },
        });
      }}
    >
      <label className="label-cell block">Name</label>
      <input
        className="input"
        value={name}
        placeholder="e.g. Twickenham Sports Hall"
        onChange={(e) => setName(e.target.value)}
      />
      <label className="label-cell block">Initial needs (comma-separated)</label>
      <input
        className="input"
        value={needs}
        placeholder="staffing, supplies"
        onChange={(e) => setNeeds(e.target.value)}
      />
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="label-cell block">Pop.</label>
          <input
            className="input"
            value={population}
            onChange={(e) => setPopulation(e.target.value)}
          />
        </div>
        <div>
          <label className="label-cell block">Lat</label>
          <input
            className="input"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
        </div>
        <div>
          <label className="label-cell block">Lng</label>
          <input
            className="input"
            value={lng}
            onChange={(e) => setLng(e.target.value)}
          />
        </div>
      </div>
      <SubmitRow submitting={submitting} disabled={!name.trim()} />
    </form>
  );
}

function NoteForm({
  submitting,
  onSubmit,
}: {
  submitting: boolean;
  onSubmit: (text: string) => void;
}) {
  const [text, setText] = useState("");
  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (text.trim()) onSubmit(text.trim());
      }}
    >
      <label className="label-cell block">Description</label>
      <textarea
        className="input min-h-[80px]"
        value={text}
        placeholder="e.g. Backup power restored at Croydon"
        onChange={(e) => setText(e.target.value)}
      />
      <SubmitRow submitting={submitting} disabled={!text.trim()} />
    </form>
  );
}

function SubmitRow({
  submitting,
  disabled,
}: {
  submitting: boolean;
  disabled: boolean;
}) {
  return (
    <div className="flex justify-end pt-1">
      <button
        type="submit"
        className="btn-primary"
        disabled={submitting || disabled}
      >
        {submitting ? "Submitting…" : "Inject update"}
      </button>
    </div>
  );
}
