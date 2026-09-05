const RecoveryCase = require("../models/RecoveryCase");
const Transaction = require("../models/Transaction");
const RecoveryLog = require("../models/RecoveryLog");

const {
  analyzeTransaction,
} = require("../services/ai/recoveryAgent");

const {
  executeAction,
} = require("../services/actions/actionExecutor");


// =====================================================
// CREATE RECOVERY CASE
// =====================================================

const createRecoveryCase = async (req, res) => {
  try {
    const { transactionId } = req.body;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const existingCase = await RecoveryCase.findOne({
      transactionId,
      userId: req.userId,
    });

    if (existingCase) {
      return res.status(409).json({
        success: false,
        message: "Recovery case already exists",
        recoveryCase: existingCase,
      });
    }

    const recoveryCase = await RecoveryCase.create({
      userId: req.userId,
      transactionId: transaction._id,
      revenueAtRisk: transaction.amount,
      riskLevel: "MEDIUM",
      recommendedAction: "NO_ACTION",
      attempts: transaction.retryCount,
    });

    return res.status(201).json({
      success: true,
      message: "Recovery case created successfully",
      recoveryCase,
    });

  } catch (error) {
    console.error(
      "Create recovery case error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// GET RECOVERY CASES
// =====================================================

const getRecoveryCases = async (req, res) => {
  try {
    const recoveryCases = await RecoveryCase.find({
      userId: req.userId,
    })
      .populate("transactionId")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: recoveryCases.length,
      recoveryCases,
    });

  } catch (error) {
    console.error(
      "Get recovery cases error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};


// =====================================================
// AI RECOVERY ANALYSIS
// =====================================================

const analyzeRecovery = async (req, res) => {
  try {
    const { transactionId } = req.params;

    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }


    // =================================================
    // 1. FIND TRANSACTION
    // =================================================

    const transaction = await Transaction.findOne({
      _id: transactionId,
      userId: req.userId,
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }


    // =================================================
    // 2. RUN RAG + AI + GUARDRAILS
    // =================================================

    const result = await analyzeTransaction(
      transaction
    );

    const aiDecision = result.aiDecision;

    const guardrailResult =
      result.guardrailResult;


    // =================================================
    // 3. EXECUTE ACTION ONLY IF ALLOWED
    // =================================================

    let actionResult;

    if (guardrailResult.allowed) {
      actionResult = await executeAction(
        guardrailResult.finalAction,
        transaction
      );
    } else {
      actionResult = {
        success: false,
        action: guardrailResult.finalAction,
        message:
          "Action not executed because guardrails blocked it.",
        transactionId: transaction._id,
      };
    }


    // =================================================
    // 4. RELOAD TRANSACTION
    // =================================================
    // executeAction() may update retryCount.
    // Reloading guarantees that the response,
    // recovery case and logs use the latest state.

    const updatedTransaction =
      await Transaction.findOne({
        _id: transaction._id,
        userId: req.userId,
      });


    // =================================================
    // 5. FIND EXISTING RECOVERY CASE
    // =================================================

    let recoveryCase =
      await RecoveryCase.findOne({
        transactionId: updatedTransaction._id,
        userId: req.userId,
      });


    // =================================================
    // 6. HANDLE ESCALATION
    // =================================================

    if (
      guardrailResult.finalAction ===
      "ESCALATE"
    ) {

      // Create a recovery case automatically
      // when human review is required.

      if (!recoveryCase) {

        recoveryCase =
          await RecoveryCase.create({
            userId: req.userId,

            transactionId:
              updatedTransaction._id,

            revenueAtRisk:
              updatedTransaction.amount,

            riskLevel:
              aiDecision.riskLevel,

            recommendedAction:
              "ESCALATE",

            status: "ESCALATED",

            attempts:
              updatedTransaction.retryCount,

            maxAttempts: 2,

            recoveredAmount: 0,
          });

      } else {

        recoveryCase.riskLevel =
          aiDecision.riskLevel;

        recoveryCase.recommendedAction =
          "ESCALATE";

        recoveryCase.status =
          "ESCALATED";

        recoveryCase.attempts =
          updatedTransaction.retryCount;

        await recoveryCase.save();
      }
    }


    // =================================================
    // 7. HANDLE SUCCESSFUL RETRY
    // =================================================

    else if (
      guardrailResult.finalAction ===
        "RETRY_PAYMENT" &&
      actionResult.success
    ) {

      if (recoveryCase) {

        recoveryCase.riskLevel =
          aiDecision.riskLevel;

        recoveryCase.recommendedAction =
          "RETRY_PAYMENT";

        recoveryCase.status =
          "IN_PROGRESS";

        recoveryCase.attempts =
          updatedTransaction.retryCount;

        await recoveryCase.save();
      }
    }


    // =================================================
    // 8. CREATE RECOVERY LOG
    // =================================================

    const recoveryLog =
      await RecoveryLog.create({

        userId: req.userId,

        transactionId:
          updatedTransaction._id,

        recoveryCaseId:
          recoveryCase
            ? recoveryCase._id
            : null,

        aiAction:
          aiDecision.action,

        aiReason:
          aiDecision.reason,

        riskLevel:
          aiDecision.riskLevel,

        guardrailAllowed:
          guardrailResult.allowed,

        finalAction:
          guardrailResult.finalAction,

        actionExecuted:
          actionResult.success,

        executionResult:
          actionResult,
      });


    // =================================================
    // 9. RETURN COMPLETE RESULT
    // =================================================

    return res.status(200).json({

      success: true,

      message:
        "Recovery analysis completed",


      // Current transaction state
      transaction: {
        id:
          updatedTransaction._id,

        amount:
          updatedTransaction.amount,

        currency:
          updatedTransaction.currency,

        status:
          updatedTransaction.status,

        retryCount:
          updatedTransaction.retryCount,

        recovered:
          updatedTransaction.recovered,

        recoveredAmount:
          updatedTransaction.recoveredAmount,
      },


      // AI decision
      aiDecision,


      // Guardrail decision
      guardrails:
        guardrailResult,


      // Action execution
      execution:
        actionResult,


      // Recovery case
      recoveryCase,


      // Recovery log
      recoveryLog: {
        id:
          recoveryLog._id,
      },


      // Retrieved policies
      policies:
        result.policies.map(
          (policy) => ({
            title:
              policy.title,

            category:
              policy.category,

            score:
              policy.score,
          })
        ),
    });

  } catch (error) {

    console.error(
      "Analyze recovery error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Recovery analysis failed",
      error:
        error.message,
    });
  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createRecoveryCase,
  getRecoveryCases,
  analyzeRecovery,
};