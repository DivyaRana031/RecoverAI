const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerId: {
      type: String,
      required: true,
      trim: true,
    },

    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    customerEmail: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      default: "INR",
    },

    status: {
      type: String,
      enum: [
        "created",
        "pending",
        "paid",
        "failed",
        "abandoned",
        "overdue",
      ],
      default: "created",
    },

    failureReason: {
      type: String,
      default: null,
    },

    paymentType: {
      type: String,
      enum: ["one_time", "subscription", "invoice"],
      default: "one_time",
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    retryCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    recovered: {
      type: Boolean,
      default: false,
    },

    recoveredAmount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);