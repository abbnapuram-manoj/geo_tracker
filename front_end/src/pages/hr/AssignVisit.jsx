import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";
import { PickMap } from "../../components/Map.jsx";

export default function AssignVisit() {
  const [emps, setEmps] = useState([]);
  const [visits, setVisits] = useState([]);
  const [f, setF] = useState({ employeeId: "", clientName: "", lat: "", lng: "", radius: 100, date: new Date().toISOString().slice(0, 10) });
  const [msg, setMsg] = useState("");
  const load = () => api.get("/hr/visits").then((r) => setVisits(r.data));
  useEffect(() => { api.get("/hr/employees").then((r) => setEmps(r.data)); load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async () => {
    setMsg("");
    try {
      await api.post("/hr/visits", { ...f, lat: Number(f.lat), lng: Number(f.lng), radius: Number(f.radius) });
      setMsg("Visit assigned");
      load();
    } catch (x) {
      setMsg(errMsg(x));
    }
  };
  const del = (id) => api.delete("/hr/visits/" + id).then(load).catch((x) => alert(errMsg(x)));

  return (
    <>
      <div className="card">
        <h2>Assign visit</h2>
        <div className="row">
          <select value={f.employeeId} onChange={set("employeeId")}>
            <option value="">Select employee</option>
            {emps.map((e) => <option key={e._id} value={e._id}>{e.name}</option>)}
          </select>
          <input placeholder="Client name" value={f.clientName} onChange={set("clientName")} />
          <input type="date" value={f.date} onChange={set("date")} />
          <input type="number" style={{ width: 90 }} value={f.radius} onChange={set("radius")} title="Radius in metres" />
        </div>
        <p>Click the map to choose the client location (or type lat/lng).</p>
        <div className="row">
          <input placeholder="Latitude" value={f.lat} onChange={set("lat")} />
          <input placeholder="Longitude" value={f.lng} onChange={set("lng")} />
          <button onClick={save}>Assign</button>
          <span className={msg === "Visit assigned" ? "ok" : "err"}>{msg}</span>
        </div>
        <PickMap lat={f.lat} lng={f.lng} radius={f.radius} onPick={(la, ln) => setF({ ...f, lat: la.toFixed(6), lng: ln.toFixed(6) })} />
      </div>
      <div className="card">
        <h2>All visits</h2>
        <table>
          <thead><tr><th>Employee</th><th>Client</th><th>Date</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {visits.map((v) => (
              <tr key={v._id}>
                <td>{v.employeeId ? v.employeeId.name : "-"}</td>
                <td>{v.clientName}</td>
                <td>{v.date.slice(0, 10)}</td>
                <td>{v.status}</td>
                <td>{v.status === "assigned" && <button className="red" onClick={() => del(v._id)}>Delete</button>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}