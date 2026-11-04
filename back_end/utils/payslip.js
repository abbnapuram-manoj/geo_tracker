const Shift = require("../models/Shift");
const Location = require("../models/Location");
const Visit = require("../models/Visit");
const { calculatePayroll, monthRange } = require("./payroll");

// loads one employee's month of data from MongoDB and returns the payslip
async function payslipFor(emp, month) {
  const range = monthRange(month);
  const shifts = await Shift.find({ employeeId: emp._id, startTime: { $gte: range.start, $lt: range.end } });
  const locs = await Location.find({ shiftId: { $in: shifts.map((s) => s._id) } }).sort({ timestamp: 1, _id: 1 });
  const pointsByShift = {};
  locs.forEach((p) => (pointsByShift[String(p.shiftId)] = pointsByShift[String(p.shiftId)] || []).push(p));
  const visits = await Visit.find({ employeeId: emp._id, date: { $gte: range.start, $lt: range.end } });
  return calculatePayroll(emp, shifts, pointsByShift, visits, range);
}

module.exports = { payslipFor };