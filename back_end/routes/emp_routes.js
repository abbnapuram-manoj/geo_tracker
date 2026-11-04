const router = require("express").Router();
const Visit = require("../models/Visit");
const Shift = require("../models/Shift");
const Location = require("../models/Location");
const { isInside, routeDistance } = require("../utils/geo");
const { auth } = require("../middleware/auth");
const { payslipFor } = require("../utils/payslip");

router.use(auth);

router.get("/me", (req, res) => res.json(req.user));

router.get("/visits", async (req, res) => {
  res.json(await Visit.find({ employeeId: req.user._id }).sort({ date: -1 }));
});

router.patch("/visits/:id/status", async (req, res) => {
  try {
    if (req.body.status !== "missed") return res.status(400).json({ error: "Only 'missed' can be set manually." });
    const v = await Visit.findOne({ _id: req.params.id, employeeId: req.user._id });
    if (!v) return res.status(404).json({ error: "Not found" });
    v.status = "missed"; await v.save(); res.json(v);
  } catch (e) { res.status(400).json({ error: "Invalid id" }); }
});

router.get("/shift/current", async (req, res) => {
  res.json(await Shift.findOne({ employeeId: req.user._id, active: true }));
});

router.post("/shift/start", async (req, res) => {
  const open = await Shift.findOne({ employeeId: req.user._id, active: true });
  if (open) return res.status(400).json({ error: "Shift already active" });
  res.status(201).json(await Shift.create({ employeeId: req.user._id }));
});

router.post("/shift/end", async (req, res) => {
  const shift = await Shift.findOne({ employeeId: req.user._id, active: true });
  if (!shift) return res.status(400).json({ error: "No active shift" });
  shift.active = false; shift.endTime = new Date(); await shift.save(); res.json(shift);
});

router.post("/location", async (req, res) => {
  const lat = Number(req.body.lat), lng = Number(req.body.lng);
  const shift = await Shift.findOne({ employeeId: req.user._id, active: true });
  if (!shift) return res.status(403).json({ error: "Shift inactive" });
  await Location.create({ shiftId: shift._id, employeeId: req.user._id, lat, lng });
  const now = Date.now();
  const open = await Visit.find({ employeeId: req.user._id, status: "assigned", date: { $gte: new Date(now - 24 * 3600000), $lte: new Date(now + 12 * 3600000) } });
  const verified = [];
  for (const v of open) {
    if (isInside(lat, lng, v)) { v.status = "visited"; v.visitedAt = new Date(); await v.save(); verified.push(v.clientName); }
  }
  res.status(201).json({ saved: true, verified });
});

router.get("/route", async (req, res) => {
  try {
    const shift = await Shift.findOne({ employeeId: req.user._id, active: true });
    if (!shift) return res.json({ points: [], totalKm: 0 });
    const points = await Location.find({ shiftId: shift._id }).sort({ timestamp: 1 });
    const meters = routeDistance(points);
    res.json({ points, totalKm: +(meters / 1000).toFixed(3) });
  } catch (e) { res.status(400).json({ error: e.message }); }
});

router.get("/payslip", async (req, res) => {
  try { res.json(await payslipFor(req.user, req.query.month)); }
  catch (e) { res.status(400).json({ error: e.message }); }
});

module.exports = router;