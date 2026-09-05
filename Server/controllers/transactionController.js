const Transaction = require("../models/Transaction");


// ==========================================
// CREATE TRANSACTION
// ==========================================
const createTransaction = async (req, res) => {
  try {
    const {
      customerId,
      customerName,
      customerEmail,
      amount,
      currency,
      status,
      failureReason,
      paymentType,
      razorpayPaymentId,
    } = req.body;

    if (
      !customerId ||
      !customerName ||
      !customerEmail ||
      amount === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Required transaction fields are missing",
      });
    }

    const transaction = await Transaction.create({
      userId: req.userId,
      customerId,
      customerName,
      customerEmail,
      amount,
      currency,
      status,
      failureReason,
      paymentType,
      razorpayPaymentId,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      transaction,
    });
  } catch (error) {
    console.error("Create transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==========================================
// GET ALL TRANSACTIONS
// ==========================================
const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get transactions error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==========================================
// GET SINGLE TRANSACTION
// ==========================================
const getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Get transaction error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// ==========================================
// DASHBOARD STATISTICS
// ==========================================
const getDashboardStats = async (req, res) => {
  try {
    const transactions = await Transaction.find({
      userId: req.userId,
    });

    // Total transactions
    const totalTransactions = transactions.length;

    // Successful transactions
    const successfulTransactions = transactions.filter(
      (transaction) => transaction.status === "paid"
    );

    // Failed transactions
    const failedTransactions = transactions.filter(
      (transaction) => transaction.status === "failed"
    );

    // Total revenue from successful payments
    const totalRevenue = successfulTransactions.reduce(
      (total, transaction) => {
        return total + transaction.amount;
      },
      0
    );

    // Revenue currently at risk
    const revenueAtRisk = failedTransactions.reduce(
      (total, transaction) => {
        return total + transaction.amount;
      },
      0
    );

    // Recovered revenue
    const recoveredRevenue = transactions.reduce(
      (total, transaction) => {
        return total + (transaction.recoveredAmount || 0);
      },
      0
    );

    // Number of recovered transactions
    const recoveredTransactions = transactions.filter(
      (transaction) => transaction.recovered === true
    ).length;

    // Recovery rate
    const recoveryRate =
      failedTransactions.length > 0
        ? (recoveredTransactions / failedTransactions.length) * 100
        : 0;

    res.status(200).json({
      success: true,

      stats: {
        totalTransactions,
        totalRevenue,
        revenueAtRisk,
        recoveredRevenue,
        failedTransactions: failedTransactions.length,
        recoveredTransactions,
        recoveryRate: Number(recoveryRate.toFixed(2)),
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  getDashboardStats,
};