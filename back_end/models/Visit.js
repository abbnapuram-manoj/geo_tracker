const mongoose = require("mongoose");

module.exports = mongoose.model("Visit", new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  clientName: { type: String, required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  radius: { type: Number, default: 100 },
  date: { type: Date, required: true },
  status: { type: String, enum: ["assigned", "visited", "missed"], default: "assigned" },
  visitedAt: Date,
}, { timestamps: true }));