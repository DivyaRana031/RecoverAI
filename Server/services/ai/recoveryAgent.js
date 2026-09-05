require("dotenv").config();

const Groq = require("groq-sdk");

const { retrievePolicies } = require("../rag/retrieval");
const { applyGuardrails } = require("./guardrails");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});


// =====================================================
// ANALYZE TRANSACTION
// =====================================================

const analyzeTransaction = async (transaction) => {
  try {

    // =================================================
    // 1. BUILD RAG QUERY
    // =================================================

    const query = `
      Payment transaction recovery.
      Customer: ${transaction.customerName}
      Amount: ${transaction.amount} ${transaction.currency}
      Status: ${transaction.status}
      Failure reason: ${transaction.failureReason || "unknown"}
      Previous retry count: ${transaction.retryCount}
    `;


    // =================================================
    // 2. RETRIEVE POLICIES
    // =================================================

    const policies = await retrievePolicies(
      query,
      3
    );


    // =================================================
    // 3. BUILD POLICY CONTEXT
    // =================================================

    const policyContext = policies
      .map(
        (policy, index) => `
Policy ${index + 1}:
Title: ${policy.title}
Category: ${policy.category}
Content: ${policy.content}
`
      )
      .join("\n");


    // =================================================
    // 4. ASK GROQ FOR DECISION
    // =================================================

    const completion =
      await groq.chat.completions.create({

        model:
          process.env.GROQ_MODEL ||
          "openai/gpt-oss-120b",

        messages: [

          // -----------------------------------------
          // SYSTEM
          // -----------------------------------------

          {
            role: "system",

            content: `
You are RecoverAI, an AI revenue recovery decision engine.

Your job is to analyze failed payment transactions using ONLY:

1. Transaction information.
2. Retrieved recovery policies.

Do not invent policies.

Choose exactly ONE action:

- RETRY_PAYMENT
- SEND_REMINDER
- CREATE_PAYMENT_LINK
- ESCALATE
- NO_ACTION

Rules:

- Follow the retrieved policies.
- Consider retryCount.
- Consider transaction amount.
- High-value transactions may require human approval.
- Never recommend unlimited retries.
- If retryCount is 2 or greater, NEVER recommend RETRY_PAYMENT.
- If retryCount is 2 or greater, choose ESCALATE.
- If the transaction is already recovered, choose NO_ACTION.
- If policies conflict or information is insufficient, choose ESCALATE.
- Never directly execute a payment.
- You only provide a recommendation.
`,
          },


          // -----------------------------------------
          // USER
          // -----------------------------------------

          {
            role: "user",

            content: `
TRANSACTION INFORMATION

Customer: ${transaction.customerName}
Email: ${transaction.customerEmail}
Amount: ${transaction.amount} ${transaction.currency}
Status: ${transaction.status}
Failure reason: ${
              transaction.failureReason ||
              "unknown"
            }
Retry count: ${transaction.retryCount}
Already recovered: ${transaction.recovered}

RECOVERY POLICIES

${policyContext}

Analyze the transaction and provide a recovery recommendation.
`,
          },
        ],


        // =================================================
        // STRUCTURED JSON RESPONSE
        // =================================================

        response_format: {
          type: "json_schema",

          json_schema: {

            name: "recovery_decision",

            strict: true,

            schema: {

              type: "object",

              properties: {

                action: {
                  type: "string",

                  enum: [
                    "RETRY_PAYMENT",
                    "SEND_REMINDER",
                    "CREATE_PAYMENT_LINK",
                    "ESCALATE",
                    "NO_ACTION",
                  ],
                },

                reason: {
                  type: "string",
                },

                requiresHumanApproval: {
                  type: "boolean",
                },

                riskLevel: {
                  type: "string",

                  enum: [
                    "LOW",
                    "MEDIUM",
                    "HIGH",
                  ],
                },
              },

              required: [
                "action",
                "reason",
                "requiresHumanApproval",
                "riskLevel",
              ],

              additionalProperties: false,
            },
          },
        },

        reasoning_effort: "medium",
      });


    // =================================================
    // 5. PARSE AI RESPONSE
    // =================================================

    let aiDecision = JSON.parse(
      completion.choices[0].message.content
    );


    // =================================================
    // 6. DETERMINISTIC BUSINESS RULES
    // =================================================
    //
    // IMPORTANT:
    // The LLM is NOT the final authority.
    // Application rules override AI recommendations.
    //


    // ---------------------------------------------
    // RULE 1: ALREADY RECOVERED
    // ---------------------------------------------

    if (transaction.recovered === true) {

      aiDecision = {
        action: "NO_ACTION",

        reason:
          "Transaction has already been recovered; no further recovery action is required.",

        requiresHumanApproval: false,

        riskLevel: "LOW",
      };
    }


    // ---------------------------------------------
    // RULE 2: MAXIMUM RETRIES REACHED
    // ---------------------------------------------

    else if (
      Number(transaction.retryCount) >= 2
    ) {

      aiDecision = {
        action: "ESCALATE",

        reason:
          "Maximum retry attempts reached for this transaction; policy requires escalation to human review.",

        requiresHumanApproval: true,

        riskLevel: "MEDIUM",
      };
    }


    // =================================================
    // 7. APPLY DETERMINISTIC GUARDRAILS
    // =================================================

    const guardrailResult =
      applyGuardrails(
        transaction,
        aiDecision
      );


    // =================================================
    // 8. RETURN COMPLETE RESULT
    // =================================================

    return {
      aiDecision,
      guardrailResult,
      policies,
    };

  } catch (error) {

    console.error(
      "AI recovery analysis failed:",
      error.message
    );

    throw error;
  }
};


module.exports = {
  analyzeTransaction,
};