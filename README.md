

# RecoverAI — AI-Powered Revenue Recovery Platform

## 1. Project Overview

**RecoverAI** is an AI-powered payment recovery platform designed to help businesses identify failed payments, understand why revenue is at risk, and choose safe recovery actions.

The system combines **AI recommendations, RAG-based policy retrieval, deterministic guardrails, Razorpay Test Mode, and human escalation** to create a controlled revenue-recovery workflow.

The key idea is:

> **AI recommends. Business rules decide. Guardrails protect. Actions are executed only when safe.**

---

# 2. Problem Statement

Failed payments create significant revenue leakage for businesses.

A traditional system may simply mark a payment as failed, but it does not answer:

* Why did the payment fail?
* Should the payment be retried?
* Should the customer receive a reminder?
* Should a payment link be generated?
* Is the transaction too risky for automation?
* When should the case be escalated to a human?

RecoverAI addresses this problem by automatically analyzing failed transactions and selecting an appropriate recovery path while preventing unsafe automated actions.

---

# 3. Solution

RecoverAI creates an intelligent recovery pipeline:

```text
Failed Payment
      ↓
AI Recovery Agent
      ↓
RAG Policy Retrieval
      ↓
AI Recommendation
      ↓
Deterministic Guardrails
      ↓
 ┌───────────────┐
 │               │
Allowed        Blocked
 │               │
 ↓               ↓
Execute       ESCALATE
 │               │
 ↓               ↓
Razorpay      Human Review
Test Mode
      ↓
MongoDB
      ↓
Audit Logs
```

This ensures that the AI does not have unrestricted control over payment actions.

---

# 4. Key Features

### 🔐 Authentication

* User signup
* User login
* JWT authentication
* Protected routes
* Logout functionality

### 💳 Transaction Management

* Create transactions
* Track payment status
* Track failed transactions
* Store customer and payment information
* Track retry attempts

### 🤖 AI Recovery Agent

The AI analyzes:

* Transaction amount
* Payment status
* Failure reason
* Customer information
* Previous retry attempts
* Retrieved recovery policies

It can recommend:

```text
RETRY_PAYMENT
SEND_REMINDER
CREATE_PAYMENT_LINK
ESCALATE
NO_ACTION
```

### 📚 RAG-Based Policy Retrieval

RecoverAI retrieves relevant recovery policies from its knowledge base before generating an AI recommendation.

The workflow is:

```text
Transaction Context
       ↓
Query Embedding
       ↓
Voyage AI
       ↓
MongoDB Vector Search
       ↓
Relevant Policies
       ↓
Groq LLM
       ↓
Recovery Recommendation
```

### 🛡️ Deterministic Guardrails

AI recommendations are never blindly executed.

Guardrails check:

* Is the AI action supported?
* Has the payment already been recovered?
* Has the retry limit been reached?
* Is the transaction high-value?
* Does the AI require human approval?

For example:

```text
Transaction > ₹10,000
        ↓
Guardrail BLOCKED
        ↓
ESCALATE
        ↓
Human Review
```

### 🔄 Retry Protection

RecoverAI limits payment retries to **2 attempts**.

```text
0/2 → Retry
1/2 → Retry
2/2 → Escalate
```

This prevents unlimited automated payment attempts.

### 👤 Human Escalation

When automation is unsafe or no longer allowed:

```text
ESCALATE
    ↓
Recovery Case
    ↓
Human Review
```

### 🧾 Audit Logging

Every recovery decision is recorded, including:

* AI recommendation
* AI reasoning
* Risk level
* Guardrail result
* Final action
* Execution result
* Timestamp

This provides traceability for every recovery decision.

---

# 5. AI Architecture

RecoverAI uses three important AI components.

### Groq

Used as the LLM for generating recovery recommendations.

### Voyage AI

Used to generate embeddings for recovery policies and transaction queries.

### MongoDB Vector Search

Used to retrieve the most relevant recovery policies using semantic similarity.

The combined architecture is:

```text
                 Transaction
                      ↓
             Recovery Context
                      ↓
              Voyage Embedding
                      ↓
              MongoDB Vector DB
                      ↓
             Top Recovery Policies
                      ↓
                  Groq LLM
                      ↓
             AI Recommendation
                      ↓
             Deterministic Rules
                      ↓
                Final Action
```

---

# 6. Guardrail Logic

The guardrails are the final authority.

### Rule 1 — Invalid AI decision

```text
Invalid action
     ↓
ESCALATE
```

### Rule 2 — Already recovered

```text
Recovered = true
     ↓
NO_ACTION
```

### Rule 3 — Maximum retries

```text
Retry Count >= 2
       ↓
ESCALATE
```

### Rule 4 — High-value transaction

```text
Amount > ₹10,000
       ↓
BLOCK AUTOMATION
       ↓
ESCALATE
```

### Rule 5 — AI requests human approval

```text
requiresHumanApproval = true
       ↓
ESCALATE
```

This architecture makes the system safer than allowing an LLM to directly execute payment operations.

---

# 7. Recovery Workflow

### Normal payment recovery

```text
Failed Payment
      ↓
Analyze
      ↓
RAG retrieves policies
      ↓
Groq generates recommendation
      ↓
Guardrails validate
      ↓
RETRY_PAYMENT
      ↓
Razorpay Test Order
      ↓
Retry Count +1
```

### Retry limit reached

```text
Failed Payment
      ↓
Retry Count = 2
      ↓
AI / Rule
      ↓
ESCALATE
      ↓
Recovery Case
      ↓
Human Review
```

### High-value payment

```text
₹15,000 Failed Payment
        ↓
AI Recommendation
        ↓
Guardrail
        ↓
Amount > ₹10,000
        ↓
BLOCKED
        ↓
ESCALATE
        ↓
Human Review
```

---

# 8. Technology Stack

### Frontend

* React
* Vite
* React Router
* Tailwind CSS
* Axios

### Backend

* Node.js
* Express.js
* JWT
* REST APIs

### Database

* MongoDB
* Mongoose
* MongoDB Vector Search

### AI / ML

* Groq LLM
* Voyage AI Embeddings
* Retrieval-Augmented Generation (RAG)

### Payment

* Razorpay Test Mode

### Development

* Git
* GitHub
* VS Code

---

# 9. Project Architecture

```text
RecoverAI
│
├── React/Vite Frontend
│        │
│        │ HTTP + JWT
│        ↓
├── Node.js + Express Backend
│        │
│        ↓
├── Recovery Controller
│        │
│        ↓
├── AI Recovery Agent
│        ├── RAG Retrieval
│        ├── Groq LLM
│        └── Business Rules
│        │
│        ↓
├── Deterministic Guardrails
│        │
│        ├───────────────┐
│        ↓               ↓
│    ALLOWED          BLOCKED
│        ↓               ↓
│   Action Executor   Human Review
│        ↓
│   Razorpay Test Mode
│        │
│        ↓
└── MongoDB
```

---

# 10. Backend Structure

```text
Server/
│
├── app.js
├── server.js
├── .env
│
├── controllers/
│   ├── authController.js
│   ├── transactionController.js
│   └── recoveryController.js
│
├── routes/
│   ├── authRoutes.js
│   ├── transactionRoutes.js
│   └── recoveryRoutes.js
│
├── middleware/
│   └── authMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Transaction.js
│   ├── RecoveryCase.js
│   ├── RecoveryLog.js
│   └── KnowledgeBase.js
│
├── services/
│   ├── ai/
│   │   ├── recoveryAgent.js
│   │   └── guardrails.js
│   │
│   ├── rag/
│   │   ├── retrieval.js
│   │   └── embeddings.js
│   │
│   └── actions/
│       ├── actionExecutor.js
│       └── razorpayService.js
│
└── config/
    └── db.js
```

---

# 11. Frontend Structure

```text
Client/
└── src/
    │
    ├── App.jsx
    │
    ├── components/
    │   ├── Sidebar.jsx
    │   └── ProtectedRoute.jsx
    │
    ├── pages/
    │   ├── Dashboard.jsx
    │   ├── Transactions.jsx
    │   ├── Recovery.jsx
    │   ├── AIDecisions.jsx
    │   ├── Logs.jsx
    │   ├── Login.jsx
    │   └── Signup.jsx
    │
    └── services/
        └── api.js
```

---

# 12. API Endpoints

### Authentication

```text
POST /api/auth/signup
POST /api/auth/login
```

### Transactions

```text
POST /api/transactions
GET  /api/transactions
GET  /api/transactions/:id
GET  /api/transactions/dashboard/stats
```

### Recovery

```text
POST /api/recovery
GET  /api/recovery
POST /api/recovery/analyze/:transactionId
GET  /api/recovery/logs
```

All protected endpoints use JWT authentication.

---

# 13. Database Models

### User

Stores authenticated users.

```text
User
 ├── name
 ├── email
 └── password
```

### Transaction

```text
Transaction
 ├── userId
 ├── customerId
 ├── customerName
 ├── customerEmail
 ├── amount
 ├── currency
 ├── status
 ├── failureReason
 ├── paymentType
 ├── razorpayPaymentId
 ├── retryCount
 ├── recovered
 └── recoveredAmount
```

### RecoveryCase

Stores cases requiring recovery or human intervention.

```text
RecoveryCase
 ├── transaction
 ├── status
 ├── recommendedAction
 ├── attempts
 └── maxAttempts
```

### RecoveryLog

Stores the audit trail.

```text
RecoveryLog
 ├── transaction
 ├── aiAction
 ├── aiReason
 ├── riskLevel
 ├── guardrailAllowed
 ├── finalAction
 ├── actionExecuted
 └── executionResult
```

### KnowledgeBase

Stores recovery policies and embeddings for RAG retrieval.

---

# 14. Safety Philosophy

RecoverAI follows a **bounded autonomy** approach.

The AI is allowed to make recommendations, but it does not have unrestricted authority over payment actions.

```text
AI
 ↓
Recommendation

Business Rules
 ↓
Validation

Guardrails
 ↓
Permission

Action Executor
 ↓
Razorpay
```

If any safety condition fails:

```text
BLOCK
 ↓
ESCALATE
 ↓
HUMAN REVIEW
```

This makes the system safer, explainable, and auditable.

---

# 15. What I Personally Implemented

For your buildathon presentation, you can say:

> I implemented the complete end-to-end recovery workflow, including the React dashboard, Node/Express APIs, MongoDB transaction and recovery models, AI recovery agent, RAG-based policy retrieval, deterministic guardrails, Razorpay Test Mode integration, recovery case management, and audit logging.

You can additionally explain:

> I designed the safety architecture so that the AI only recommends actions, while deterministic guardrails make the final decision. This prevents unlimited retries and automatically escalates high-risk or high-value transactions to human review.

---

# 16. What Problem Does It Solve?

### Short answer for judges:

> RecoverAI reduces revenue leakage from failed payments by intelligently analyzing failed transactions, retrieving relevant recovery policies, recommending the most appropriate recovery action, and safely executing or escalating that action based on deterministic guardrails.

---

# 17. Why Use AI?

A normal rule-based system could say:

```text
if payment_failed:
    retry()
```

But RecoverAI considers multiple factors:

```text
Failure Reason
+
Amount
+
Retry History
+
Recovery Policies
+
Risk
+
Transaction State
```

The AI can therefore recommend different actions depending on the situation.

However, **AI does not get the final authority**.

---

# 18. What Makes RecoverAI Different?

The important differentiator isn't simply:

> "We use an LLM."

It's:

> **AI + RAG + deterministic guardrails + bounded payment execution + human escalation + auditability.**

That is the stronger engineering story.

---

# 19. Demo Script

For your final demo, use this sequence.

### Step 1 — Login

Show:

```text
Login
 ↓
Dashboard
```

### Step 2 — Show failed transactions

Point out:

```text
Revenue At Risk
Failed Transactions
Recovery Rate
```

### Step 3 — Normal recovery

Create/use a failed transaction:

```text
Amount: ₹2,500
Failure: Network Error
Retry: 0/2
```

Click:

**Analyze Recovery**

Show:

```text
AI Recommendation
RETRY_PAYMENT

Guardrail
ALLOWED

Execution
EXECUTED

Retry
1/2
```

### Step 4 — Retry limit

Analyze the same transaction again.

Show:

```text
Retry
2/2
```

Analyze again.

Show:

```text
Final Action
ESCALATE

Human Review
```

### Step 5 — High-value transaction

Use:

```text
Amount: ₹15,000+
```

Show:

```text
AI Recommendation
       ↓
Guardrail
BLOCKED
       ↓
ESCALATE
       ↓
Human Review
```

This is probably your **best demo moment** because it demonstrates AI + safety together.

### Step 6 — AI Decisions

Show:

```text
AI recommendation
Risk
Reasoning
Guardrail result
Final action
```

### Step 7 — Logs

Show the audit trail.

Explain:

> Every AI decision and execution outcome is recorded for traceability.

---

# 20. Resume Version

### RecoverAI — AI-Powered Revenue Recovery Platform

**Tech:** React, Node.js, Express.js, MongoDB, Groq, Voyage AI, Razorpay Test Mode, JWT, RAG

* Built an AI-powered payment recovery platform that analyzes failed transactions and recommends recovery actions using **Groq LLM + RAG-based policy retrieval with Voyage AI embeddings and MongoDB Vector Search**.
* Designed deterministic **guardrails and bounded retry workflows** to prevent unsafe automated payment actions, enforce retry limits, block high-value transactions, and escalate risky cases for human review.
* Implemented **Razorpay Test Mode integration, JWT authentication, recovery case management, dashboard analytics, and audit logging** for end-to-end recovery tracking.

---

# 21. One-Line Resume Version

> **RecoverAI:** AI-powered revenue recovery platform using RAG, Groq LLM, MongoDB Vector Search, deterministic guardrails, and Razorpay Test Mode to safely recover failed payments and escalate high-risk cases.

---

# 22. GitHub Repository Description

Use this as your GitHub description:

> **AI-powered revenue recovery platform that uses RAG, LLM-based recommendations, deterministic guardrails, Razorpay Test Mode, and human escalation to safely recover failed payments.**

---

# 23. GitHub Topics

Add these topics to your repository:

```text
react
nodejs
express
mongodb
mongodb-vector-search
rag
generative-ai
groq
voyage-ai
razorpay
payment-recovery
fintech
llm
jwt
tailwindcss
```

---

# 24. Future Improvements

You can mention these without claiming they're already implemented:

* Real email/SMS payment reminders
* Automatic payment-link generation
* Webhook-based payment status synchronization
* More advanced customer risk scoring
* Recovery success prediction
* A/B testing of recovery strategies
* More granular business policies
* Human approval interface for escalated cases
* Production payment integration
* Recovery analytics and ROI tracking

---

# 25. Final Project Story

If a judge asks:

### **"Explain your project in one minute."**

Say:

> **RecoverAI is an AI-powered revenue recovery platform for failed payments. When a payment fails, the system collects the transaction context and retrieves relevant recovery policies using RAG and MongoDB Vector Search. Groq then recommends a recovery action such as retrying the payment, sending a reminder, or escalating the case. However, the AI never directly controls the payment. Deterministic guardrails validate the recommendation, enforce rules like maximum retries and high-value transaction limits, and either allow the action through Razorpay Test Mode or escalate it to human review. Every decision and execution result is stored in audit logs. So the core idea is AI-driven recovery with bounded autonomy and safety.**

That's your **main story**. Memorize this one. 🔥

---

## Final architecture to put in your README/presentation

```text
                         ┌──────────────────────┐
                         │    React Frontend    │
                         │ Dashboard / Recovery │
                         └──────────┬───────────┘
                                    │
                              HTTP + JWT
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Node + Express API  │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │  Recovery Controller │
                         └──────────┬───────────┘
                                    │
                                    ▼
                    ┌──────────────────────────────┐
                    │      AI Recovery Agent       │
                    │                              │
                    │  ┌────────┐   ┌──────────┐  │
                    │  │  RAG   │   │  Groq    │  │
                    │  │Policies│──▶│   LLM    │  │
                    │  └────────┘   └──────────┘  │
                    └──────────────┬───────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────────┐
                    │   Deterministic Guardrails   │
                    │                              │
                    │ Retry Limit │ High Value    │
                    │ AI Approval │ Valid Action  │
                    └──────────────┬───────────────┘
                                   │
                    ┌──────────────┴──────────────┐
                    │                             │
                 ALLOWED                       BLOCKED
                    │                             │
                    ▼                             ▼
          ┌──────────────────┐           ┌────────────────┐
          │ Action Executor  │           │ Human Review   │
          └────────┬─────────┘           └───────┬────────┘
                   │                             │
                   ▼                             ▼
          ┌──────────────────┐          ┌────────────────┐
          │ Razorpay Test    │          │ Recovery Case  │
          │      Mode        │          │   ESCALATED    │
          └────────┬─────────┘          └───────┬────────┘
                   │                             │
                   └──────────────┬──────────────┘
                                  ▼
                         ┌──────────────────┐
                         │     MongoDB      │
                         │ Transactions     │
                         │ Recovery Cases   │
                         │ Audit Logs       │
                         │ Knowledge Base   │
                         └──────────────────┘
```

**This is now your complete project package:** code → architecture → AI explanation → safety story → README → demo → resume. 🚀
