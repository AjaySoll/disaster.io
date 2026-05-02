import { useEffect, useMemo } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { EmergencyState, Location, LocationStatus } from "../types";
import { StatusBadge } from "./StatusBadge";

interface Props {
  scenario: EmergencyState;
}

// Same palette tokens as tailwind.config.js — duplicated here because
// Leaflet markers are rendered outside React's normal class scope.
const STATUS_COLOR: Record<LocationStatus, string> = {
  critical: "#ff4d4d",
  full: "#9aa0b4",
  open: "#ff8a3d",
  closed: "#5e6478",
  new: "#3ed0c4",
};

export function ScenarioMap({ scenario }: Props) {
  const { locations } = scenario;

  // Auto-fit bounds whenever the location set changes.
  const bounds = useMemo<L.LatLngBoundsExpression | null>(() => {
    if (locations.length === 0) return null;
    if (locations.length === 1) {
      const { lat, lng } = locations[0].coordinates;
      // Single point — use a small synthetic bounding box around it.
      return [
        [lat - 0.05, lng - 0.05],
        [lat + 0.05, lng + 0.05],
      ];
    }
    return locations.map(
      (l) => [l.coordinates.lat, l.coordinates.lng] as [number, number]
    );
  }, [locations]);

  // Sensible default centre even when there are no locations yet
  // (it'll be replaced by FitBounds the moment any are added).
  const defaultCentre: [number, number] = [54.5, -2.5]; // roughly UK centre

  return (
    <section className="panel h-full">
      <header className="panel-header">
        <div className="flex items-center gap-3">
          <span className="panel-eyebrow">Map</span>
          <h2 className="panel-title">Live operations</h2>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-ink-mute">
          <Legend />
        </div>
      </header>

      <div className="flex-1 min-h-0 relative">
        <MapContainer
          center={defaultCentre}
          zoom={6}
          scrollWheelZoom
          className="h-full w-full"
          style={{ background: "#0f1117" }}
          attributionControl={false}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            subdomains="abcd"
            maxZoom={19}
          />
          <FitBounds bounds={bounds} />
          {locations.map((loc) => (
            <LocationMarker key={loc.id} location={loc} />
          ))}
        </MapContainer>
        <Attribution />
      </div>
    </section>
  );
}

function FitBounds({
  bounds,
}: {
  bounds: L.LatLngBoundsExpression | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!bounds) return;
    try {
      map.fitBounds(bounds, { padding: [28, 28], maxZoom: 11 });
    } catch {
      // ignore — bounds may be empty
    }
  }, [bounds, map]);
  return null;
}

function LocationMarker({ location }: { location: Location }) {
  const { lat, lng } = location.coordinates;
  const icon = useMemo(
    () => buildIcon(location.status),
    [location.status]
  );

  return (
    <Marker position={[lat, lng]} icon={icon}>
      <Popup className="dio-popup" closeButton={false}>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <strong className="font-sans text-sm text-ink">
              {location.name}
            </strong>
            <StatusBadge status={location.status} />
          </div>
          <div className="font-mono text-[10px] text-ink-mute">
            {lat.toFixed(4)}, {lng.toFixed(4)} · pop{" "}
            {location.population.toLocaleString()}
          </div>
          {location.needs.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {location.needs.map((n) => (
                <span
                  key={n}
                  className="font-mono text-[10px] text-ink bg-bg-raised border border-bg-line rounded px-1.5 py-0.5"
                >
                  {n}
                </span>
              ))}
            </div>
          )}
        </div>
      </Popup>
    </Marker>
  );
}

function Legend() {
  const items: { label: string; color: string }[] = [
    { label: "critical", color: STATUS_COLOR.critical },
    { label: "open", color: STATUS_COLOR.open },
    { label: "full", color: STATUS_COLOR.full },
    { label: "new", color: STATUS_COLOR.new },
  ];
  return (
    <div className="flex items-center gap-2">
      {items.map((it) => (
        <span key={it.label} className="inline-flex items-center gap-1">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: it.color }}
          />
          <span className="uppercase tracking-[0.14em]">{it.label}</span>
        </span>
      ))}
    </div>
  );
}

function Attribution() {
  return (
    <div className="absolute bottom-1 right-1 font-mono text-[9px] text-ink-mute/80 bg-bg-base/60 px-1.5 py-0.5 rounded">
      © OpenStreetMap · CARTO
    </div>
  );
}

function buildIcon(status: LocationStatus): L.DivIcon {
  const color = STATUS_COLOR[status];
  const pulse = status === "critical";
  const html = `
    <span class="dio-marker" style="--dio-color:${color}">
      ${pulse ? '<span class="dio-marker-pulse"></span>' : ""}
      <span class="dio-marker-dot"></span>
    </span>
  `;
  return L.divIcon({
    className: "dio-marker-wrapper",
    html,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
    popupAnchor: [0, -8],
  });
}
