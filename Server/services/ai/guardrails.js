const ALLOWED_ACTIONS = [
  "RETRY_PAYMENT",
  "SEND_REMINDER",
  "CREATE_PAYMENT_LINK",
  "ESCALATE",
  "NO_ACTION",
];

const MAX_RETRIES = 2;
const HIGH_VALUE_LIMIT = 10000;

const applyGuardrails = (transaction, aiDecision) => {
  // 1. Validate AI decision
  if (!aiDecision || !aiDecision.action) {
    return {
      allowed: false,
      finalAction: "ESCALATE",
      reason: "AI did not provide a valid action.",
      requiresHumanApproval: true,
    };
  }

  // 2. Check whether action is allowed
  if (!ALLOWED_ACTIONS.includes(aiDecision.action)) {
    return {
      allowed: false,
      finalAction: "ESCALATE",
      reason: "AI suggested an unsupported action.",
      requiresHumanApproval: true,
    };
  }

  // 3. Already recovered → no further action
  if (transaction.recovered === true) {
    return {
      allowed: false,
      finalAction: "NO_ACTION",
      reason: "Transaction has already been recovered.",
      requiresHumanApproval: false,
    };
  }

  // 4. Retry limit
  if (
    aiDecision.action === "RETRY_PAYMENT" &&
    transaction.retryCount >= MAX_RETRIES
  ) {
    return {
      allowed: false,
      finalAction: "ESCALATE",
      reason: "Maximum payment retry limit has been reached.",
      requiresHumanApproval: true,
    };
  }

  // 5. High-value transaction
  if (transaction.amount > HIGH_VALUE_LIMIT) {
    return {
      allowed: false,
      finalAction: "ESCALATE",
      reason:
        "High-value transactions require human approval before recovery.",
      requiresHumanApproval: true,
    };
  }

  // 6. AI explicitly requested human approval
  if (aiDecision.requiresHumanApproval === true) {
    return {
      allowed: false,
      finalAction: "ESCALATE",
      reason: "AI determined that human approval is required.",
      requiresHumanApproval: true,
    };
  }

  // 7. Everything passed
  return {
    allowed: true,
    finalAction: aiDecision.action,
    reason: aiDecision.reason,
    requiresHumanApproval: false,
  };
};

module.exports = {
  applyGuardrails,
};