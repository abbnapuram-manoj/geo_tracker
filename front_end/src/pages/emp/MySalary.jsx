import { useEffect, useState } from "react";
import api, { errMsg } from "../../api";

const inr = (n) => "\u20B9" + Number(n).toLocaleString("en-IN");

export default function MySalary() {
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [slip, setSlip] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    setErr("");
    api.get("/emp/payslip", { params: { month } })
      .then((r) => setSlip(r.data))
      .catch((e) => setErr(errMsg(e)));
  }, [month]);

  return (
    <div className="card">
      <h2>My Salary / Payslip</h2>
      <div className="row" style={{ marginBottom: 20 }}>
        <input type="month" value={month} onChange={(e) => setMonth(e.target.value)} />
        <span className="err">{err}</span>
      </div>
      
      {slip ? (
        <table style={{ maxWidth: 600 }}>
          <tbody>
            <tr><td><b>Employee</b></td><td>{slip.employee.name}</td></tr>
            <tr><td><b>Base Salary</b></td><td>{inr(slip.baseSalary)}</td></tr>
            <tr><td><b>Logged Hours</b></td><td>{slip.hoursWorked} / {slip.expectedHours} (Expected)</td></tr>
            <tr><td><b>Shortfall Deduction</b></td><td className="err">-{inr(slip.deduction)}</td></tr>
            <tr><td><b>Travel Distance</b></td><td>{slip.km} km (@ Rs {slip.ratePerKm}/km)</td></tr>
            <tr><td><b>Travel Allowance</b></td><td className="ok">+{inr(slip.travelAllowance)}</td></tr>
            <tr><td><b>Visits</b></td><td>{slip.visits.visited} Verified, {slip.visits.missed} Missed</td></tr>
            <tr><td><h3>Net Pay</h3></td><td><h3>{inr(slip.netPay)}</h3></td></tr>
          </tbody>
        </table>
      ) : (
        <p>No payslip data found for this month.</p>
      )}
    </div>
  );
}