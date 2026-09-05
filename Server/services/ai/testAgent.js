require("dotenv").config();

const mongoose = require("mongoose");

const Transaction = require("../../models/Transaction");
const RecoveryLog = require("../../models/RecoveryLog");

const { analyzeTransaction } = require("./recoveryAgent");
const { executeAction } = require("../actions/actionExecutor");

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    // -----------------------------------
    // 1. Find failed transaction
    // -----------------------------------

    const transaction = await Transaction.findOne({
      status: "failed",
    });

    if (!transaction) {
      console.log("No failed transaction found.");
      await mongoose.disconnect();
      return;
    }

    console.log("\n================================");
    console.log("TRANSACTION");
    console.log("================================");

    console.log({
      id: transaction._id.toString(),
      customer: transaction.customerName,
      amount: transaction.amount,
      currency: transaction.currency,
      status: transaction.status,
      failureReason: transaction.failureReason,
      retryCount: transaction.retryCount,
      recovered: transaction.recovered,
    });

    // -----------------------------------
    // 2. RAG + Groq + Guardrails
    // -----------------------------------

    const result = await analyzeTransaction(transaction);

    console.log("\n================================");
    console.log("AI DECISION");
    console.log("================================");

    console.log(
      JSON.stringify(result.aiDecision, null, 2)
    );

    console.log("\n================================");
    console.log("GUARDRAIL RESULT");
    console.log("================================");

    console.log(
      JSON.stringify(result.guardrailResult, null, 2)
    );

    // -----------------------------------
    // 3. Execute action only if allowed
    // -----------------------------------

    let actionResult;

    if (result.guardrailResult.allowed) {
      console.log("\n================================");
      console.log("EXECUTING ACTION");
      console.log("================================");

      actionResult = await executeAction(
        result.guardrailResult.finalAction,
        transaction
      );
    } else {
      console.log("\n================================");
      console.log("ACTION BLOCKED");
      console.log("================================");

      actionResult = {
        success: false,
        action: result.guardrailResult.finalAction,
        message: "Action blocked by guardrails.",
      };
    }

    console.log(
      JSON.stringify(actionResult, null, 2)
    );

    // -----------------------------------
    // 4. Save Recovery Log
    // -----------------------------------

    const recoveryLog = await RecoveryLog.create({
      userId: transaction.userId,

      transactionId: transaction._id,

      aiAction: result.aiDecision.action,

      aiReason: result.aiDecision.reason,

      riskLevel: result.aiDecision.riskLevel,

      guardrailAllowed:
        result.guardrailResult.allowed,

      finalAction:
        result.guardrailResult.finalAction,

      actionExecuted:
        actionResult.success,

      executionResult: actionResult,
    });

    console.log("\n================================");
    console.log("RECOVERY LOG CREATED");
    console.log("================================");

    console.log({
      id: recoveryLog._id.toString(),
      transactionId:
        recoveryLog.transactionId.toString(),
      aiAction: recoveryLog.aiAction,
      finalAction: recoveryLog.finalAction,
      actionExecuted: recoveryLog.actionExecuted,
    });

    await mongoose.disconnect();

    console.log("\nMongoDB disconnected");
  } catch (error) {
    console.error(
      "\nTest failed:",
      error.message
    );

    await mongoose.disconnect();
  }
};

test();