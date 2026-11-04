import { useEffect, useState } from "react";
import api from "../../api";
import { LiveMap } from "../../components/Map.jsx";

export default function Dashboard() {
  const [people, setPeople] = useState([]);
  useEffect(() => {
    const load = () => api.get("/hr/live").then((r) => setPeople(r.data)).catch(() => {});
    load();
    const t = setInterval(load, 10000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="card">
      <h2>Live employees ({people.length} on shift)</h2>
      <LiveMap people={people} />
      {people.length === 0 && <p>Nobody is on an active shift right now.</p>}
      {people.length > 0 && (
        <table>
          <thead><tr><th>Name</th><th>Shift started</th><th>Last seen</th></tr></thead>
          <tbody>
            {people.map((p) => (
              <tr key={p.employeeId}>
                <td>{p.name}</td>
                <td>{new Date(p.shiftStart).toLocaleTimeString()}</td>
                <td>{p.lastSeen ? new Date(p.lastSeen).toLocaleTimeString() : "no GPS yet"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}