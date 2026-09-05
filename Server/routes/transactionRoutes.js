const express = require("express");

const {
  createTransaction,
  getTransactions,
  getTransactionById,
  getDashboardStats,
} = require("../controllers/transactionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// Create transaction
router.post("/", protect, createTransaction);


// Dashboard statistics
router.get("/dashboard/stats", protect, getDashboardStats);


// Get all transactions
router.get("/", protect, getTransactions);


// Get transaction by ID
router.get("/:id", protect, getTransactionById);


module.exports = router;