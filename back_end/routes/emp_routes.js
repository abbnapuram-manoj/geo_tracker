const router = require("express").Router();
const Visit = require("../models/Visit");
const Shift = require("../models/Shift");
const { auth } = require("../middleware/auth");

router.use(auth);

router.get("/me", (req, res) => {
  const { _id, name, email, role, baseSalary, ratePerKm } = req.user;
  res.json({ id: _id, name, email, role, baseSalary, ratePerKm });
});

// ---------- visits ----------
router.get("/visits", async (req, res) => {
  res.json(await Visit.find({ employeeId: req.user._id }).sort({ date: -1 }));
});

// employee can only mark a visit as missed. "visited" is set automatically by the geofence (phase 3)
router.patch("/visits/:id/status", async (req, res) => {
  try {
    if (req.body.status !== "missed")
      return res.status(400).json({ error: "Only 'missed' can be set manually. 'visited' is auto-verified by GPS" });
    const v = await Visit.findOne({ _id: req.params.id, employeeId: req.user._id });
    if (!v) return res.status(404).json({ error: "Not found" });
    if (v.status === "visited") return res.status(400).json({ error: "Already verified as visited" });
    v.status = "missed";
    await v.save();
    res.json(v);
  } catch (e) {
    res.status(400).json({ error: "Invalid id" });
  }
});

// ---------- shift (tracking consent toggle) ----------
router.get("/shift/current", async (req, res) => {
  res.json(await Shift.findOne({ employeeId: req.user._id, active: true }));
});

router.post("/shift/start", async (req, res) => {
  const open = await Shift.findOne({ employeeId: req.user._id, active: true });
  if (open) return res.status(400).json({ error: "Shift already active", shift: open });
  res.status(201).json(await Shift.create({ employeeId: req.user._id }));
});

router.post("/shift/end", async (req, res) => {
  const shift = await Shift.findOne({ employeeId: req.user._id, active: true });
  if (!shift) return res.status(400).json({ error: "No active shift" });
  shift.active = false;
  shift.endTime = new Date();
  await shift.save();
  res.json(shift);
});

const Location = require("../models/Location");
const { isInside } = require("../utils/geo");

// employee app posts GPS here. Only accepted during an active shift (privacy rule)
router.post("/location", async (req, res) => {
  const lat = Number(req.body.lat), lng = Number(req.body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180)
    return res.status(400).json({ error: "Valid lat and lng required" });
  const shift = await Shift.findOne({ employeeId: req.user._id, active: true });
  if (!shift) return res.status(403).json({ error: "Start your shift first. Location is only recorded during active shifts" });

  await Location.create({ shiftId: shift._id, employeeId: req.user._id, lat, lng });

  // geofence: auto-verify assigned visits dated around now
  const now = Date.now();
  const open = await Visit.find({
    employeeId: req.user._id, status: "assigned",
    date: { $gte: new Date(now - 24 * 3600000), $lte: new Date(now + 12 * 3600000) },
  });
  const verified = [];
  for (const v of open) {
    if (isInside(lat, lng, v)) {
      v.status = "visited"; v.visitedAt = new Date(); await v.save();
      verified.push(v.clientName);
    }
  }
  res.status(201).json({ saved: true, verified });
});
const { payslipFor } = require("../utils/payslip");

// employee sees only their own payslip. ?month=YYYY-MM (default: this month)
router.get("/payslip", async (req, res) => {
  try {
    res.json(await payslipFor(req.user, req.query.month));
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});
module.exports = router;