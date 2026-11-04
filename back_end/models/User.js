const mongoose = require("mongoose");

module.exports = mongoose.model("User", new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["hr", "employee"], default: "employee" },
  baseSalary: { type: Number, default: 0 },
  ratePerKm: { type: Number, default: 0 },
  isFrozen: { type: Boolean, default: false },
}, { timestamps: true }));