import { useEffect, useState } from "react";
import api from "../services/api";
import {
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Percent,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Lock,
  UserCheck,
  Loader2,
  ArrowUpRight,
} from "lucide-react";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalTransactions: 0,
    totalRevenue: 0,
    revenueAtRisk: 0,
    recoveredRevenue: 0,
    failedTransactions: 0,
    recoveredTransactions: 0,
    recoveryRate: 0,
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [error, setError] = useState("");

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const [statsResponse, transactionsResponse] = await Promise.all([
        api.get("/transactions/dashboard/stats"),
        api.get("/transactions"),
      ]);

      if (statsResponse.data.success) {
        setStats(statsResponse.data.stats);
      }

      if (transactionsResponse.data.success) {
        const failedTransactions =
          transactionsResponse.data.transactions.filter(
            (transaction) => transaction.status === "failed"
          );

        setTransactions(failedTransactions);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError(
        err.response?.data?.message || "Unable to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const analyzeRecovery = async (transactionId) => {
    try {
      setAnalyzingId(transactionId);
      setAnalysisResult(null);
      setError("");

      const response = await api.post(`/recovery/analyze/${transactionId}`);

      if (response.data.success) {
        setAnalysisResult(response.data);
        await fetchDashboardData();
      }
    } catch (err) {
      console.error("Recovery analysis error:", err);
      setError(
        err.response?.data?.message || "Recovery analysis failed."
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "RETRY_PAYMENT":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "SEND_REMINDER":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "CREATE_PAYMENT_LINK":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "ESCALATE":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "NO_ACTION":
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getRiskBadge = (risk) => {
    switch (risk) {
      case "HIGH":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "LOW":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/60 p-6 md:p-10">
        <div className="mx-auto max-w-7xl animate-pulse space-y-8">
          <div className="flex justify-between items-center">
            <div className="space-y-2">
              <div className="h-4 w-32 rounded bg-slate-200" />
              <div className="h-8 w-64 rounded-lg bg-slate-200" />
            </div>
            <div className="h-10 w-28 rounded-xl bg-slate-200" />
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-white border border-slate-200" />
            ))}
          </div>

          <div className="h-96 rounded-2xl bg-white border border-slate-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 text-slate-800 p-6 md:p-10 selection:bg-indigo-500 selection:text-white">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* Top Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-semibold text-indigo-700 border border-indigo-100">
                <Sparkles size={12} className="text-indigo-600" />
                AI Revenue Recovery
              </span>
              <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                System Active
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Recovery Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Monitor revenue risks, execute AI interventions, and enforce guardrails.
            </p>
          </div>

          <button
            onClick={fetchDashboardData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 cursor-pointer"
          >
            <RefreshCw size={14} className="text-slate-500" />
            Refresh Data
          </button>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            <AlertTriangle size={18} className="text-rose-500 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Primary Statistics */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Revenue */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Total Revenue
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {formatCurrency(stats.totalRevenue)}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  From successful payments
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp size={20} />
              </div>
            </div>
          </div>

          {/* Revenue at Risk */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                  Revenue At Risk
                </p>
                <h2 className="mt-3 text-2xl font-bold text-rose-600">
                  {formatCurrency(stats.revenueAtRisk)}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Failed payment vulnerability
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <AlertTriangle size={20} />
              </div>
            </div>
          </div>

          {/* Recovered Revenue */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-indigo-600">
                  Recovered Revenue
                </p>
                <h2 className="mt-3 text-2xl font-bold text-indigo-600">
                  {formatCurrency(stats.recoveredRevenue)}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Salvaged automatically
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <ShieldCheck size={20} />
              </div>
            </div>
          </div>

          {/* Recovery Rate */}
          <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Recovery Rate
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {stats.recoveryRate || 0}%
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Failed charges recovered
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                <Percent size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Statistics */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold text-slate-500">Total Transactions</p>
            <p className="mt-1 text-xl font-bold text-slate-900">{stats.totalTransactions}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold text-rose-600">Failed Transactions</p>
            <p className="mt-1 text-xl font-bold text-rose-600">{stats.failedTransactions}</p>
          </div>
          <div className="rounded-xl border border-slate-200/80 bg-white px-5 py-4 shadow-sm">
            <p className="text-xs font-semibold text-emerald-600">Recovered Transactions</p>
            <p className="mt-1 text-xl font-bold text-emerald-600">{stats.recoveredTransactions}</p>
          </div>
        </div>

        {/* Revenue at Risk Table Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-3 border-b border-slate-100 px-6 py-5 md:flex-row md:items-center">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <ShieldAlert size={18} className="text-rose-500" />
                Revenue at Risk
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Failed payments ready for AI analysis or manual escalation.
              </p>
            </div>

            <span className="w-fit rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-700">
              {transactions.length} requiring attention
            </span>
          </div>

          {transactions.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900">
                No failed payments
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                All transactions are currently healthy.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {transactions.map((transaction) => {
                const isRetryLimitReached = transaction.retryCount >= 2;
                const isHighValue = transaction.amount > 10000;
                const isAnalyzing = analyzingId === transaction._id;

                return (
                  <div
                    key={transaction._id}
                    className="px-6 py-5 transition hover:bg-slate-50/70"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">

                      {/* Customer */}
                      <div className="flex min-w-[220px] items-center gap-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-700">
                          {transaction.customerName?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-slate-900 truncate">
                            {transaction.customerName}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {transaction.customerEmail}
                          </p>
                          <p className="text-[11px] font-mono text-slate-400">
                            ID: {transaction.customerId}
                          </p>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="min-w-[140px]">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Amount at Risk
                        </p>
                        <p className="mt-1 text-base font-bold text-rose-600 font-mono">
                          {formatCurrency(transaction.amount)}
                        </p>
                      </div>

                      {/* Failure Reason */}
                      <div className="min-w-[170px]">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Failure Reason
                        </p>
                        <p className="mt-1 text-xs font-semibold text-slate-700">
                          {transaction.failureReason || "Payment Failed"}
                        </p>
                      </div>

                      {/* Retry Indicator */}
                      <div className="min-w-[130px]">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                          Attempts
                        </p>
                        <div className="mt-2 flex items-center gap-1.5">
                          {[0, 1].map((attempt) => (
                            <div
                              key={attempt}
                              className={`h-2 w-8 rounded-full ${
                                transaction.retryCount > attempt
                                  ? "bg-indigo-600"
                                  : "bg-slate-200"
                              }`}
                            />
                          ))}
                          <span className="ml-1 text-xs font-semibold text-slate-600">
                            {transaction.retryCount}/2
                          </span>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="shrink-0">
                        {isAnalyzing ? (
                          <button
                            disabled
                            className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-400 cursor-not-allowed"
                          >
                            <Loader2 size={14} className="animate-spin text-slate-500" />
                            Analyzing...
                          </button>
                        ) : isRetryLimitReached ? (
                          <button
                            onClick={() => analyzeRecovery(transaction._id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 transition shadow-sm cursor-pointer"
                          >
                            <ShieldAlert size={14} />
                            Escalate for Review
                          </button>
                        ) : isHighValue ? (
                          <button
                            onClick={() => analyzeRecovery(transaction._id)}
                            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition shadow-sm cursor-pointer"
                          >
                            <AlertTriangle size={14} />
                            Escalate for Human Review
                          </button>
                        ) : (
                          <button
                            onClick={() => analyzeRecovery(transaction._id)}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-semibold text-white shadow-sm transition active:scale-95 cursor-pointer"
                          >
                            <Sparkles size={14} />
                            Analyze Recovery
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* AI Analysis Result Card */}
        {analysisResult && (
          <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm">
            <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4 flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles size={16} className="text-indigo-600" />
                  AI Recovery Analysis
                </h3>
                <p className="text-xs text-slate-500">
                  Autonomous proposal validated by deterministic guardrails.
                </p>
              </div>

              <span
                className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${
                  analysisResult.guardrails?.allowed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-rose-200 bg-rose-50 text-rose-700"
                }`}
              >
                {analysisResult.guardrails?.allowed
                  ? "✓ GUARDRAIL ALLOWED"
                  : "✕ GUARDRAIL BLOCKED"}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 p-6 lg:grid-cols-3">
              {/* AI Recommendation */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  AI Recommendation
                </p>

                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${getActionBadge(
                      analysisResult.aiDecision?.action
                    )}`}
                  >
                    {analysisResult.aiDecision?.action || "N/A"}
                  </span>
                  <span
                    className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${getRiskBadge(
                      analysisResult.aiDecision?.riskLevel
                    )}`}
                  >
                    {analysisResult.aiDecision?.riskLevel || "UNKNOWN"}
                  </span>
                </div>

                <p className="text-xs leading-relaxed text-slate-600 pt-1">
                  {analysisResult.aiDecision?.reason || "No reasoning provided."}
                </p>
              </div>

              {/* Guardrails */}
              <div
                className={`rounded-xl border p-5 space-y-2 ${
                  analysisResult.guardrails?.allowed
                    ? "border-emerald-200 bg-emerald-50/50"
                    : "border-rose-200 bg-rose-50/50"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Guardrails Verdict
                </p>

                <p
                  className={`text-base font-bold flex items-center gap-1.5 ${
                    analysisResult.guardrails?.allowed
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  {analysisResult.guardrails?.allowed ? "✓ ALLOWED" : "✕ BLOCKED"}
                </p>

                <div className="pt-1">
                  <p className="text-[11px] font-semibold text-slate-500 uppercase">
                    Final Action
                  </p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    {analysisResult.guardrails?.finalAction || "N/A"}
                  </p>
                </div>

                <p className="text-xs leading-relaxed text-slate-600 pt-1">
                  {analysisResult.guardrails?.reason || "No guardrail reason provided."}
                </p>
              </div>

              {/* Execution */}
              <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-5 space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Execution Status
                </p>

                {analysisResult.guardrails?.finalAction === "ESCALATE" ? (
                  <>
                    <p className="text-base font-bold text-amber-700 flex items-center gap-1.5">
                      <UserCheck size={16} /> HUMAN REVIEW
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600 pt-1">
                      Automated retry was blocked. This case has been escalated for manual review.
                    </p>
                  </>
                ) : (
                  <>
                    <p
                      className={`text-base font-bold flex items-center gap-1.5 ${
                        analysisResult.execution?.success
                          ? "text-emerald-700"
                          : "text-slate-600"
                      }`}
                    >
                      {analysisResult.execution?.success ? (
                        <>
                          <CheckCircle2 size={16} /> EXECUTED
                        </>
                      ) : (
                        "NOT EXECUTED"
                      )}
                    </p>
                    <p className="text-xs leading-relaxed text-slate-600 pt-1">
                      {analysisResult.execution?.message || "No execution details reported."}
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Retrieved Policies (RAG) */}
            {analysisResult.policies && analysisResult.policies.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/30 px-6 py-5">
                <div className="mb-3">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Retrieved Recovery Policies (RAG)
                  </p>
                  <p className="text-xs text-slate-400">
                    Context policies retrieved from knowledge base
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  {analysisResult.policies.map((policy, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-1 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-semibold text-slate-800 truncate">
                          {policy.title}
                        </p>
                        {policy.score !== undefined && (
                          <span className="text-[11px] font-mono font-bold text-indigo-600">
                            {Number(policy.score).toFixed(2)}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {policy.category}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Safety Banner */}
        <div className="rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5 shadow-sm">
          <div className="flex items-start gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm border border-indigo-100">
              <Lock size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Safety-First Autonomous Recovery
              </h3>
              <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                AI decisions are audited through deterministic guardrails prior to execution. Transactions exceeding ₹10,000 or the 2-retry threshold are escalated for human oversight.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;