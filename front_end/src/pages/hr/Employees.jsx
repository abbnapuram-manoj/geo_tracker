import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { errMsg } from "../../api";

const empty = { name: "", email: "", password: "", baseSalary: "", ratePerKm: "" };

export default function Employees() {
  const [list, setList] = useState([]);
  const [f, setF] = useState(empty);
  const [msg, setMsg] = useState("");
  const load = () => api.get("/hr/employees").then((r) => setList(r.data));
  useEffect(() => { load(); }, []);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const add = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      await api.post("/hr/employees", { ...f, baseSalary: Number(f.baseSalary), ratePerKm: Number(f.ratePerKm) });
      setF(empty);
      load();
    } catch (x) {
      setMsg(errMsg(x));
    }
  };
  const freeze = async (id) => { await api.patch("/hr/employees/" + id + "/freeze"); load(); };

  return (
    <>
      <div className="card">
        <h2>Add employee</h2>
        <form onSubmit={add} className="row">
          <input placeholder="Name" value={f.name} onChange={set("name")} />
          <input placeholder="Email" value={f.email} onChange={set("email")} />
          <input placeholder="Password" value={f.password} onChange={set("password")} />
          <input placeholder="Base salary" type="number" value={f.baseSalary} onChange={set("baseSalary")} />
          <input placeholder="Rate per km" type="number" value={f.ratePerKm} onChange={set("ratePerKm")} />
          <button type="submit">Add</button>
        </form>
        <p className="err">{msg}</p>
      </div>
      <div className="card">
        <h2>Employees</h2>
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Base</th><th>Rs/km</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map((e) => (
              <tr key={e._id}>
                <td><Link to={"/hr/employees/" + e._id}>{e.name}</Link></td>
                <td>{e.email}</td>
                <td>{e.baseSalary}</td>
                <td>{e.ratePerKm}</td>
                <td className={e.isFrozen ? "err" : "ok"}>{e.isFrozen ? "Frozen" : "Active"}</td>
                <td><button className={e.isFrozen ? "" : "red"} onClick={() => freeze(e._id)}>{e.isFrozen ? "Unfreeze" : "Freeze"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}