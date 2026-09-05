const express = require("express");
const cors = require("cors");


const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const recoveryRoutes = require("./routes/recoveryRoutes");
const recoveryLogRoutes = require("./routes/recoveryLogRoutes");
const app = express();

app.use(cors());
app.use(express.json());



app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "RecoverAI backend is running 🚀"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/recovery", recoveryRoutes);
app.use("/api/recovery/logs", recoveryLogRoutes);
module.exports = app;