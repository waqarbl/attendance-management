
require('dotenv').config();
const express = require("express");
const authRoutes = require("./src/routes/authRoutes");
const attendanceRoutes = require("./src/routes/attendanceRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
