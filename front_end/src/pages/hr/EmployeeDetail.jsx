import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../../api";
import { RouteMap } from "../../components/Map.jsx";

const today = () => new Date().toISOString().slice(0, 10);

export default function EmployeeDetail() {
  const { id } = useParams();
  const [d, setD] = useState(null);
  const [date, setDate] = useState(today());
  const [route, setRoute] = useState({ points: [], totalKm: 0, count: 0 });
  useEffect(() => { api.get("/hr/employees/" + id).then((r) => setD(r.data)); }, [id]);
  useEffect(() => { api.get("/hr/employees/" + id + "/route", { params: { date } }).then((r) => setRoute(r.data)); }, [id, date]);
  if (!d) return <p>Loading...</p>;
  const e = d.employee;
  return (
    <>
      <div className="card">
        <p><Link to="/hr/employees">&larr; Employees</Link></p>
        <h2>{e.name} {e.isFrozen && <span className="err">(frozen)</span>}</h2>
        <p>{e.email} | Base Rs {e.baseSalary} | Rs {e.ratePerKm} per km</p>
      </div>
      <div className="card">
        <div className="row">
          <b>Route on</b>
          <input type="date" value={date} onChange={(x) => setDate(x.target.value)} />
          <b>{route.totalKm} km, {route.count} GPS points</b>
        </div>
        <RouteMap points={route.points} visits={d.visits.filter((v) => v.date.slice(0, 10) === date)} />
      </div>
      <div className="card">
        <h2>Visits</h2>
        <table>
          <thead><tr><th>Client</th><th>Date</th><th>Radius</th><th>Status</th><th>Verified at</th></tr></thead>
          <tbody>
            {d.visits.map((v) => (
              <tr key={v._id}>
                <td>{v.clientName}</td>
                <td>{v.date.slice(0, 10)}</td>
                <td>{v.radius} m</td>
                <td>{v.status}</td>
                <td>{v.visitedAt ? new Date(v.visitedAt).toLocaleString() : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Recent shifts</h2>
        <table>
          <thead><tr><th>Start</th><th>End</th></tr></thead>
          <tbody>
            {d.shifts.map((s) => (
              <tr key={s._id}>
                <td>{new Date(s.startTime).toLocaleString()}</td>
                <td>{s.endTime ? new Date(s.endTime).toLocaleString() : "active"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}