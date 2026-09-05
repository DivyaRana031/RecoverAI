const express = require("express");

const {
  createRecoveryCase,
  getRecoveryCases,
  analyzeRecovery,
} = require("../controllers/recoveryController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create recovery case
router.post(
  "/",
  protect,
  createRecoveryCase
);


// Get recovery cases
router.get(
  "/",
  protect,
  getRecoveryCases
);


// AI recovery analysis
router.post(
  "/analyze/:transactionId",
  protect,
  analyzeRecovery
);


module.exports = router;