const express = require("express");

const {
  getRecoveryLogs,
} = require("../controllers/recoveryLogController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", protect, getRecoveryLogs);

module.exports = router;