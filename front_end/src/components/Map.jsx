import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Circle, Polyline, Popup, useMap, useMapEvents } from "react-leaflet";

const HYD = [17.385, 78.4867];

function Fit({ points }) {
  const map = useMap();
  const key = JSON.stringify(points);
  useEffect(() => {
    if (points.length) map.fitBounds(points, { padding: [40, 40], maxZoom: 16 });
  }, [key]);
  return null;
}

const Base = ({ children, points = [] }) => (
  <MapContainer center={HYD} zoom={12} className="map">
    <TileLayer attribution="&copy; OpenStreetMap" url="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
    <Fit points={points} />
    {children}
  </MapContainer>
);

export function LiveMap({ people }) {
  const on = people.filter((p) => p.lat != null);
  return (
    <Base points={on.map((p) => [p.lat, p.lng])}>
      {on.map((p) => (
        <CircleMarker key={p.employeeId} center={[p.lat, p.lng]} radius={10} pathOptions={{ color: "#2563eb", fillOpacity: 0.8 }}>
          <Popup>{p.name}<br />{new Date(p.lastSeen).toLocaleTimeString()}</Popup>
        </CircleMarker>
      ))}
    </Base>
  );
}

export function RouteMap({ points = [], visits = [], liveTarget = null }) {
  const line = points.map((p) => [p.lat, p.lng]);
  const col = { assigned: "#f59e0b", visited: "#16a34a", missed: "#dc2626" };
  const all = [...line, ...visits.map((v) => [v.lat, v.lng])];
  
  const lastPoint = line.length > 0 ? line[line.length - 1] : null;

  return (
    <Base points={all}>
      {visits.map((v) => (
        <Circle key={v._id} center={[v.lat, v.lng]} radius={v.radius} pathOptions={{ color: col[v.status] }}>
          <Popup>{v.clientName} ({v.status})</Popup>
        </Circle>
      ))}
      {line.length > 1 && <Polyline positions={line} pathOptions={{ color: "#2563eb", weight: 4 }} />}
      
      {lastPoint && liveTarget && (
        <Polyline positions={[lastPoint, [liveTarget.lat, liveTarget.lng]]} pathOptions={{ color: "#f59e0b", dashArray: "5, 10", weight: 3 }} />
      )}

      {line.length > 0 && <CircleMarker center={line[0]} radius={7} pathOptions={{ color: "#16a34a" }}><Popup>Shift Started</Popup></CircleMarker>}
      {lastPoint && <CircleMarker center={lastPoint} radius={8} pathOptions={{ color: "#2563eb", fillOpacity: 1 }}><Popup>You are here</Popup></CircleMarker>}
    </Base>
  );
}

function Click({ onPick }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

export function PickMap({ lat, lng, radius, onPick }) {
  const has = lat !== "" && lng !== "" && !isNaN(lat) && !isNaN(lng);
  const pt = has ? [Number(lat), Number(lng)] : null;
  return (
    <Base>
      <Click onPick={onPick} />
      {pt && <Circle center={pt} radius={Number(radius) || 100} />}
    </Base>
  );
}