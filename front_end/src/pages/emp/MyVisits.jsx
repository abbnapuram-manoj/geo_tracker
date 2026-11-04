import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";
import { RouteMap } from "../../components/Map.jsx";

export default function MyVisits() {
  const [visits, setVisits] = useState([]);
  const [msg, setMsg] = useState("");
  
  const load = () => api.get("/emp/visits").then((r) => setVisits(r.data)).catch((e) => setMsg(errMsg(e)));
  useEffect(() => { load(); }, []);

  const markMissed = async (id) => {
    try {
      await api.patch("/emp/visits/" + id + "/status", { status: "missed" });
      load();
    } catch (e) {
      setMsg(errMsg(e));
    }
  };

  const today = new Date().toISOString().slice(0, 10);
  const todaysVisits = visits.filter(v => v.date.slice(0, 10) === today);

  return (
    <>
      <div className="card">
        <h2>My Visits Today</h2>
        <p className="err">{msg}</p>
        <RouteMap points={[]} visits={todaysVisits} />
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
                <td>
                  {v.status === "assigned" && (
                    <button className="red" onClick={() => markMissed(v._id)}>Mark Missed</button>
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