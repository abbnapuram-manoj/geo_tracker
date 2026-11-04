const { routeDistance } = require("./geo");

const HOURS_PER_DAY = 8;
const round2 = (n) => Math.round(n * 100) / 100;

// "2026-11" -> { month, start, end } in UTC. Defaults to the current month
function monthRange(month) {
  const m = month || new Date().toISOString().slice(0, 7);
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(m)) throw new Error("month must be YYYY-MM");
  const [y, mo] = m.split("-").map(Number);
  return { month: m, start: new Date(Date.UTC(y, mo - 1, 1)), end: new Date(Date.UTC(y, mo, 1)) };
}

// Mon-Sat days from start up to `limit` (Sundays off)
function workingDays(start, end, limit) {
  let n = 0;
  for (let d = new Date(start); d < end && d <= limit; d = new Date(d.getTime() + 86400000)) {
    if (d.getUTCDay() !== 0) n++;
  }
  return n;
}

// Pure function: no database. Teammates can test it with fake data.
// emp: { _id, name, email, baseSalary, ratePerKm }
// shifts: [{ _id, startTime, endTime }]   pointsByShift: { shiftId: [{lat,lng}] }   visits: [{ status }]
function calculatePayroll(emp, shifts, pointsByShift, visits, range, now = new Date()) {
  let hours = 0, meters = 0;
  for (const s of shifts) {
    const end = s.endTime || now;
    hours += Math.max(0, end - s.startTime) / 3600000;
    meters += routeDistance(pointsByShift[String(s._id)] || []);
  }
  const km = meters / 1000;

  const fullDays = workingDays(range.start, range.end, range.end);
  const elapsedDays = workingDays(range.start, range.end, now);
  const expectedHours = elapsedDays * HOURS_PER_DAY;
  const hourlyRate = emp.baseSalary / (fullDays * HOURS_PER_DAY);
  const shortfall = Math.max(0, expectedHours - hours);
  const deduction = Math.min(emp.baseSalary, shortfall * hourlyRate);
  const travelAllowance = km * emp.ratePerKm;
  const netPay = emp.baseSalary + travelAllowance - deduction;

  const count = (st) => visits.filter((v) => v.status === st).length;
  return {
    month: range.month,
    employee: { id: emp._id, name: emp.name, email: emp.email },
    baseSalary: round2(emp.baseSalary),
    ratePerKm: emp.ratePerKm,
    shifts: shifts.length,
    hoursWorked: round2(hours),
    expectedHours,
    shortfallHours: round2(shortfall),
    hourlyRate: round2(hourlyRate),
    km: +km.toFixed(3),
    travelAllowance: round2(travelAllowance),
    deduction: round2(deduction),
    netPay: round2(netPay),
    visits: { assigned: count("assigned"), visited: count("visited"), missed: count("missed") },
  };
}

module.exports = { calculatePayroll, monthRange, workingDays };