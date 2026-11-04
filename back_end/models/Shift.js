const mongoose = require("mongoose");

module.exports = mongoose.model("Shift", new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  startTime: { type: Date, default: Date.now },
  endTime: Date,
  active: { type: Boolean, default: true },
}));