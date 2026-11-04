require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/auth_routes"));
app.use("/api/hr", require("./routes/hr_routes"));
app.use("/api/emp", require("./routes/emp_routes"));

mongoose.connect(process.env.MONGO_URI).then(async () => {
  if (!(await User.findOne({ role: "hr" }))) {
    await User.create({ name: "HR Admin", email: "hr@geo.com", password: await bcrypt.hash("admin123", 10), role: "hr" });
    console.log("Seeded HR: hr@geo.com / admin123");
  }
  app.listen(process.env.PORT || 5000, () => console.log("Server running on", process.env.PORT || 5000));
}).catch((e) => console.log("Mongo error:", e.message));