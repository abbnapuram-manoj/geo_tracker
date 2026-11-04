const router = require("express").Router();
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Visit = require("../models/Visit");
const Shift = require("../models/Shift");
const { auth, onlyHR } = require("../middleware/auth");

router.use(auth, onlyHR);

// ---------- employees ----------
router.post("/employees", async (req, res) => {
  try {
    const { name, email, password, baseSalary, ratePerKm } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const emp = await User.create({ name, email, password: hash, role: "employee", baseSalary, ratePerKm });
    res.status(201).json({ id: emp._id, name: emp.name, email: emp.email });
  } catch (e) {
    res.status(400).json({ error: e.code === 11000 ? "Email already exists" : e.message });
  }
});

router.get("/employees", async (req, res) => {
  res.json(await User.find({ role: "employee" }).select("-password"));
});

// one employee + their visits + recent shifts
router.get("/employees/:id", async (req, res) => {
  try {
    const emp = await User.findOne({ _id: req.params.id, role: "employee" }).select("-password");
    if (!emp) return res.status(404).json({ error: "Not found" });
    const visits = await Visit.find({ employeeId: emp._id }).sort({ date: -1 });
    const shifts = await Shift.find({ employeeId: emp._id }).sort({ startTime: -1 }).limit(30);
    res.json({ employee: emp, visits, shifts });
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

router.patch("/employees/:id/freeze", async (req, res) => {
  try {
    const emp = await User.findById(req.params.id);
    if (!emp) return res.status(404).json({ error: "Not found" });
    emp.isFrozen = !emp.isFrozen;
    await emp.save();
    res.json({ id: emp._id, isFrozen: emp.isFrozen });
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// ---------- visits ----------
router.post("/visits", async (req, res) => {
  try {
    const { employeeId, clientName, lat, lng, radius, date } = req.body;
    const emp = await User.findOne({ _id: employeeId, role: "employee" });
    if (!emp) return res.status(404).json({ error: "Employee not found" });
    if (emp.isFrozen) return res.status(400).json({ error: "Employee is frozen" });
    const visit = await Visit.create({ employeeId, clientName, lat, lng, radius, date });
    res.status(201).json(visit);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// all visits, optional ?employeeId= & ?status=
router.get("/visits", async (req, res) => {
  try {
    const q = {};
    if (req.query.employeeId) q.employeeId = req.query.employeeId;
    if (req.query.status) q.status = req.query.status;
    res.json(await Visit.find(q).populate("employeeId", "name email").sort({ date: -1 }));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

router.delete("/visits/:id", async (req, res) => {
  try {
    const v = await Visit.findById(req.params.id);
    if (!v) return res.status(404).json({ error: "Not found" });
    if (v.status !== "assigned") return res.status(400).json({ error: "Only assigned visits can be deleted" });
    await v.deleteOne();
    res.json({ deleted: true });
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

const Location = require("../models/Location");
const { routeDistance } = require("../utils/geo");

// last known position of every employee on an active shift
router.get("/live", async (req, res) => {
  const shifts = await Shift.find({ active: true }).populate("employeeId", "name email");
  const out = [];
  for (const s of shifts) {
    const last = await Location.findOne({ shiftId: s._id }).sort({ timestamp: -1, _id: -1 });
    out.push({
      employeeId: s.employeeId._id, name: s.employeeId.name, shiftStart: s.startTime,
      lat: last ? last.lat : null, lng: last ? last.lng : null, lastSeen: last ? last.timestamp : null,
    });
  }
  res.json(out);
});

// route points + total km. Use ?shiftId=... or ?date=YYYY-MM-DD (default: today, UTC)
router.get("/employees/:id/route", async (req, res) => {
  try {
    const q = { employeeId: req.params.id };
    if (req.query.shiftId) q.shiftId = req.query.shiftId;
    else {
      const day = req.query.date || new Date().toISOString().slice(0, 10);
      const start = new Date(day + "T00:00:00.000Z");
      q.timestamp = { $gte: start, $lt: new Date(start.getTime() + 86400000) };
    }
    const points = await Location.find(q).sort({ timestamp: 1, _id: 1 });
    const byShift = {};
    points.forEach((p) => (byShift[p.shiftId] = byShift[p.shiftId] || []).push(p));
    let meters = 0;
    Object.values(byShift).forEach((arr) => (meters += routeDistance(arr)));
    res.json({ totalKm: +(meters / 1000).toFixed(3), count: points.length, points });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
const { payslipFor } = require("../utils/payslip");

// payslips for all employees. ?month=YYYY-MM (default: this month)
router.get("/payroll", async (req, res) => {
  try {
    const emps = await User.find({ role: "employee" }).select("-password");
    const slips = [];
    for (const e of emps) slips.push(await payslipFor(e, req.query.month));
    res.json(slips);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// same data as a CSV download
router.get("/payroll/export", async (req, res) => {
  try {
    const emps = await User.find({ role: "employee" }).select("-password");
    const rows = [];
    for (const e of emps) rows.push(await payslipFor(e, req.query.month));
    const cols = ["month", "name", "email", "baseSalary", "hoursWorked", "expectedHours", "km", "travelAllowance", "deduction", "netPay", "visited", "missed"];
    const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
    const lines = [cols.join(",")];
    rows.forEach((r) => lines.push([r.month, r.employee.name, r.employee.email, r.baseSalary, r.hoursWorked, r.expectedHours, r.km, r.travelAllowance, r.deduction, r.netPay, r.visits.visited, r.visits.missed].map(q).join(",")));
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", 'attachment; filename="payroll-' + (rows[0] ? rows[0].month : "export") + '.csv"');
    res.send(lines.join("\n"));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
module.exports = router;