import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";

const inr = (n) => "\u20B9" + Number(n).toLocaleString("en-IN");

export default function Payroll() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [rows, setRows] = useState([]);
  const [err, setErr] = useState("");
  useEffect(() => {
    setErr("");
    api.get("/hr/payroll", { params: { month } }).then((r) => setRows(r.data)).catch((e) => setErr(errMsg(e)));
  }, [month]);

  const csv = async () => {
    const r = await api.get("/hr/payroll/export", { params: { month }, responseType: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(r.data);
    a.download = "payroll-" + month + ".csv";
    a.click();
  };
  const total = rows.reduce((s, r) => s + r.netPay, 0);

  return (
    <div className="card">
      <h2>Payroll</h2>
      <div className="row">
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <button onClick={csv}>Download CSV</button>
        <span className="err">{err}</span>
      </div>
      <table>
        <thead>
          <tr><th>Employee</th><th>Base</th><th>Hours</th><th>Km</th><th>Travel</th><th>Deduction</th><th>Net pay</th><th>Visited / Missed</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.employee.id}>
              <td>{r.employee.name}</td>
              <td>{inr(r.baseSalary)}</td>
              <td>{r.hoursWorked} / {r.expectedHours}</td>
              <td>{r.km}</td>
              <td>{inr(r.travelAllowance)}</td>
              <td>{inr(r.deduction)}</td>
              <td><b>{inr(r.netPay)}</b></td>
              <td>{r.visits.visited} / {r.visits.missed}</td>
            </tr>
          ))}
          <tr><td colSpan="6"><b>Total payout</b></td><td colSpan="2"><b>{inr(total)}</b></td></tr>
        </tbody>
      </table>
    </div>
  );
}