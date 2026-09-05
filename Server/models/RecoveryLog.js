const mongoose = require("mongoose");

const recoveryLogSchema = new mongoose.Schema(
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

    recoveryCaseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecoveryCase",
      default: null,
    },

    aiAction: {
      type: String,
      required: true,
    },

    aiReason: {
      type: String,
      default: "",
    },

    riskLevel: {
      type: String,
      default: null,
    },

    guardrailAllowed: {
      type: Boolean,
      required: true,
    },

    finalAction: {
      type: String,
      required: true,
    },

    actionExecuted: {
      type: Boolean,
      default: false,
    },

    executionResult: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RecoveryLog", recoveryLogSchema);