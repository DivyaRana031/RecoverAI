const mongoose = require("mongoose");

const recoveryCaseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
    },

    riskLevel: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },

    revenueAtRisk: {
      type: Number,
      required: true,
      min: 0,
    },

    recommendedAction: {
      type: String,
      enum: [
        "RETRY_PAYMENT",
        "SEND_REMINDER",
        "CREATE_PAYMENT_LINK",
        "ESCALATE",
        "NO_ACTION",
      ],
      default: "NO_ACTION",
    },

    status: {
      type: String,
      enum: [
        "PENDING",
        "IN_PROGRESS",
        "RECOVERED",
        "FAILED",
        "ESCALATED",
      ],
      default: "PENDING",
    },

    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },

    maxAttempts: {
      type: Number,
      default: 2,
      min: 0,
    },

    recoveredAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RecoveryCase", recoveryCaseSchema);