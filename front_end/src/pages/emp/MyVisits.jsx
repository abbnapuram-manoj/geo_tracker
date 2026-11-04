import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";
import { RouteMap } from "../../components/Map.jsx";

const getDist = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180, dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

export default function MyVisits() {
  const [visits, setVisits] = useState([]);
  const [route, setRoute] = useState({ points: [], totalKm: 0 });
  const [msg, setMsg] = useState("");
  const [userLoc, setUserLoc] = useState(null);

  const load = () => {
    api.get("/emp/visits").then(r => setVisits(r.data)).catch(e => setMsg(errMsg(e)));
    api.get("/emp/route").then(r => {
      setRoute(r.data);
      if (r.data.points.length > 0) {
        const last = r.data.points[r.data.points.length - 1];
        setUserLoc([last.lat, last.lng]);
      }
    }).catch(() => {});
  };
  
  useEffect(() => {
    load();
    const t = setInterval(load, 5000); 
    return () => clearInterval(t);
  }, []);

  const markMissed = async (id) => {
    try { await api.patch("/emp/visits/" + id + "/status", { status: "missed" }); load(); } 
    catch (e) { setMsg(errMsg(e)); }
  };

  const notifyClient = (clientName) => {
    alert(`SMS/Email sent to ${clientName}: "Your representative is on the way!"`);
  };

  const today = new Date().toISOString().slice(0, 10);
  const todaysVisits = visits.filter(v => v.date.slice(0, 10) === today);
  const activeTarget = todaysVisits.find(v => v.status === "assigned");
  
  let remainingKm = 0;
  if (userLoc && activeTarget) {
    remainingKm = getDist(userLoc[0], userLoc[1], activeTarget.lat, activeTarget.lng);
  }

  return (
    <>
      <div className="card">
        <h2>My Dashboard</h2>
        <div className="row" style={{ justifyContent: "space-between", background: "#f8fafc", padding: 15, borderRadius: 8, marginBottom: 15 }}>
          <div>
            <p style={{ margin: "0 0 5px 0", color: "#64748b" }}>Distance Traveled</p>
            <h3 style={{ margin: 0, color: "#2563eb" }}>{route.totalKm.toFixed(2)} km</h3>
          </div>
          <div>
            <p style={{ margin: "0 0 5px 0", color: "#64748b" }}>Remaining to Target</p>
            <h3 style={{ margin: 0, color: activeTarget ? "#f59e0b" : "#16a34a" }}>
              {activeTarget ? `${remainingKm.toFixed(2)} km` : "No active targets"}
            </h3>
          </div>
        </div>
        <p className="err">{msg}</p>
        <RouteMap points={route.points} visits={todaysVisits} liveTarget={activeTarget} />
      </div>
      <div className="card">
        <h2>All Visits</h2>
        <table>
          <thead><tr><th>Client</th><th>Date</th><th>Status</th><th>Verified</th><th>Action</th></tr></thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v._id}>
                <td>{v.clientName}</td>
                <td>{v.date.slice(0, 10)}</td>
                <td className={v.status === "visited" ? "ok" : v.status === "missed" ? "err" : ""}>{v.status}</td>
                <td>{v.visitedAt ? new Date(v.visitedAt).toLocaleTimeString() : "-"}</td>
                <td style={{ display: "flex", gap: 5 }}>
                  {v.status === "assigned" && (
                    <>
                      <button onClick={() => notifyClient(v.clientName)}>Notify</button>
                      <button className="red" onClick={() => markMissed(v._id)}>Missed</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}