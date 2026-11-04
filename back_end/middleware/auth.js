const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.auth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || "").replace("Bearer ", "");
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id);
    if (!user) return res.status(401).json({ error: "User not found" });
    if (user.isFrozen) return res.status(403).json({ error: "Account frozen" });
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or missing token" });
  }
};

exports.onlyHR = (req, res, next) =>
  req.user.role === "hr" ? next() : res.status(403).json({ error: "HR only" });