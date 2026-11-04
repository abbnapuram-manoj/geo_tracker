const mongoose = require("mongoose");

module.exports = mongoose.model("Location", new mongoose.Schema({
  shiftId: { type: mongoose.Schema.Types.ObjectId, ref: "Shift", required: true },
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
}));