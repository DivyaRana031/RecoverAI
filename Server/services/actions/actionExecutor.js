const {
  createRazorpayOrder,
} = require("./razorpayService");

const executeAction = async (action, transaction) => {
  switch (action) {
    // =====================================================
    // RETRY PAYMENT
    // =====================================================

    case "RETRY_PAYMENT": {
      // ---------------------------------------------
      // HARD SAFETY LIMIT
      // ---------------------------------------------

      if (transaction.retryCount >= 2) {
        return {
          success: false,
          action: "RETRY_PAYMENT",
          message:
            "Maximum retry limit reached. Payment retry was not executed.",
          transactionId: transaction._id,
          retryCount: transaction.retryCount,
        };
      }

      // ---------------------------------------------
      // CREATE RAZORPAY TEST ORDER
      // ---------------------------------------------

      const order = await createRazorpayOrder({
        amount: transaction.amount,
        currency: transaction.currency,
        receipt: `recovery_${transaction._id}_${Date.now()}`,
      });

      // ---------------------------------------------
      // ONLY UPDATE DATABASE AFTER
      // RAZORPAY ORDER WAS CREATED SUCCESSFULLY
      // ---------------------------------------------

      transaction.retryCount += 1;

      transaction.razorpayPaymentId = order.id;

      await transaction.save();

      return {
        success: true,
        action: "RETRY_PAYMENT",
        message:
          "Razorpay recovery order created successfully.",
        transactionId: transaction._id,
        razorpayOrderId: order.id,
        razorpayOrderStatus: order.status,
        retryCount: transaction.retryCount,
      };
    }


    // =====================================================
    // SEND REMINDER
    // =====================================================

    case "SEND_REMINDER":

      return {
        success: true,
        action: "SEND_REMINDER",
        message:
          "Payment reminder action approved.",
        transactionId: transaction._id,
      };


    // =====================================================
    // CREATE PAYMENT LINK
    // =====================================================

    case "CREATE_PAYMENT_LINK":

      return {
        success: true,
        action: "CREATE_PAYMENT_LINK",
        message:
          "Payment link creation approved.",
        transactionId: transaction._id,
      };


    // =====================================================
    // ESCALATE
    // =====================================================

    case "ESCALATE":

      return {
        success: false,
        action: "ESCALATE",
        message:
          "Payment action not executed. Transaction requires human review.",
        transactionId: transaction._id,
        requiresHumanApproval: true,
      };


    // =====================================================
    // NO ACTION
    // =====================================================

    case "NO_ACTION":

      return {
        success: false,
        action: "NO_ACTION",
        message:
          "No recovery action was executed.",
        transactionId: transaction._id,
      };


    // =====================================================
    // UNKNOWN ACTION
    // =====================================================

    default:

      return {
        success: false,
        action: "UNKNOWN",
        message:
          "Unsupported recovery action.",
        transactionId: transaction._id,
      };
  }
};

module.exports = {
  executeAction,
};