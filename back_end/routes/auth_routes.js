const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

router.post("/hr-login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: "hr" });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Wrong HR email or password" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
});

router.post("/emp-login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, role: "employee" });
  if (!user || !(await bcrypt.compare(password, user.password))) return res.status(400).json({ error: "Wrong Employee email or password" });
  if (user.isFrozen) return res.status(403).json({ error: "Account frozen" });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user._id, name: user.name, role: user.role } });
});

module.exports = router;