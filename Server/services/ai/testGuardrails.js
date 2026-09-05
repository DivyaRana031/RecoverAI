const { applyGuardrails } = require("./guardrails");

// Test 1: Normal retry
const transaction1 = {
  amount: 2999,
  retryCount: 0,
  recovered: false,
};

const aiDecision1 = {
  action: "RETRY_PAYMENT",
  reason: "Temporary network failure.",
  requiresHumanApproval: false,
};

console.log("\nTEST 1 — Normal retry");

console.log(
  applyGuardrails(transaction1, aiDecision1)
);


// Test 2: Retry limit reached
const transaction2 = {
  amount: 2999,
  retryCount: 2,
  recovered: false,
};

const aiDecision2 = {
  action: "RETRY_PAYMENT",
  reason: "Retry payment.",
  requiresHumanApproval: false,
};

console.log("\nTEST 2 — Retry limit");

console.log(
  applyGuardrails(transaction2, aiDecision2)
);


// Test 3: High value transaction
const transaction3 = {
  amount: 15000,
  retryCount: 0,
  recovered: false,
};

const aiDecision3 = {
  action: "RETRY_PAYMENT",
  reason: "Retry payment.",
  requiresHumanApproval: false,
};

console.log("\nTEST 3 — High value");

console.log(
  applyGuardrails(transaction3, aiDecision3)
);


// Test 4: Already recovered
const transaction4 = {
  amount: 2999,
  retryCount: 0,
  recovered: true,
};

const aiDecision4 = {
  action: "RETRY_PAYMENT",
  reason: "Retry payment.",
  requiresHumanApproval: false,
};

console.log("\nTEST 4 — Already recovered");

console.log(
  applyGuardrails(transaction4, aiDecision4)
);