import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  ShieldAlert,
  RefreshCw,
  Activity,
  TrendingUp,
  IndianRupee,
  Brain,
} from "lucide-react";

import api from "../services/api";

const Recovery = () => {
  const [recoveryCases, setRecoveryCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecoveryCases = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recovery");

      setRecoveryCases(response.data.recoveryCases || []);
    } catch (error) {
      console.error("Failed to fetch recovery cases:", error);

      setError(
        error.response?.data?.message ||
          "Failed to load recovery cases"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecoveryCases();
  }, []);

  // ==========================================
  // STATUS
  // ==========================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "RECOVERED":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "ESCALATED":
        return "bg-red-50 text-red-700 border-red-200";

      case "IN_PROGRESS":
        return "bg-blue-50 text-blue-700 border-blue-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getRiskStyle = (riskLevel) => {
    switch (riskLevel) {
      case "HIGH":
        return "bg-red-50 text-red-700 border-red-200";

      case "MEDIUM":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "LOW":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const getActionStyle = (action) => {
    switch (action) {
      case "RETRY_PAYMENT":
        return "bg-blue-50 text-blue-700";

      case "SEND_REMINDER":
        return "bg-purple-50 text-purple-700";

      case "CREATE_PAYMENT_LINK":
        return "bg-indigo-50 text-indigo-700";

      case "ESCALATE":
        return "bg-red-50 text-red-700";

      case "NO_ACTION":
        return "bg-slate-100 text-slate-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "RECOVERED":
        return <CheckCircle size={14} />;

      case "ESCALATED":
        return <ShieldAlert size={14} />;

      case "IN_PROGRESS":
        return <Activity size={14} />;

      default:
        return <Clock size={14} />;
    }
  };

  // ==========================================
  // STATS
  // ==========================================

  const totalCases = recoveryCases.length;

  const escalatedCases = recoveryCases.filter(
    (item) => item.status === "ESCALATED"
  ).length;

  const inProgressCases = recoveryCases.filter(
    (item) => item.status === "IN_PROGRESS"
  ).length;

  const recoveredCases = recoveryCases.filter(
    (item) => item.status === "RECOVERED"
  ).length;

  const totalAtRisk = recoveryCases.reduce(
    (total, item) => total + (item.revenueAtRisk || 0),
    0
  );

  const formatCurrency = (amount) => {
    return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 p-6 lg:p-8">

      <div className="mx-auto max-w-7xl">

        {/* ========================================== */}
        {/* HEADER */}
        {/* ========================================== */}

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">

          <div>

            <div className="mb-3 flex items-center gap-2">

              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">
                Recovery Operations
              </span>

              <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                Monitoring active
              </span>

            </div>

            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Recovery Center
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Monitor revenue recovery, AI recommendations,
              payment attempts, and cases requiring human review.
            </p>

          </div>

          <button
            onClick={fetchRecoveryCases}
            disabled={loading}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />

            Refresh
          </button>

        </div>

        {/* ========================================== */}
        {/* ERROR */}
        {/* ========================================== */}

        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">

            <AlertTriangle size={18} />

            <span>{error}</span>

          </div>
        )}

        {/* ========================================== */}
        {/* OVERVIEW CARDS */}
        {/* ========================================== */}

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-5">

          {/* Total */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Cases
                </p>

                <p className="mt-3 text-2xl font-bold text-slate-900">
                  {totalCases}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Brain size={21} />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              AI-analyzed recovery cases
            </p>

          </div>

          {/* At Risk */}
          <div className="rounded-2xl border border-red-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Revenue at Risk
                </p>

                <p className="mt-3 text-2xl font-bold text-red-600">
                  {formatCurrency(totalAtRisk)}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <IndianRupee size={21} />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Value currently being recovered
            </p>

          </div>

          {/* In Progress */}
          <div className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  In Progress
                </p>

                <p className="mt-3 text-2xl font-bold text-blue-600">
                  {inProgressCases}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Activity size={21} />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Recovery actions underway
            </p>

          </div>

          {/* Escalated */}
          <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Escalated
                </p>

                <p className="mt-3 text-2xl font-bold text-orange-600">
                  {escalatedCases}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                <ShieldAlert size={21} />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Require human review
            </p>

          </div>

          {/* Recovered */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Recovered
                </p>

                <p className="mt-3 text-2xl font-bold text-emerald-600">
                  {recoveredCases}
                </p>
              </div>

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <TrendingUp size={21} />
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-400">
              Successfully recovered
            </p>

          </div>

        </div>

        {/* ========================================== */}
        {/* RECOVERY TABLE */}
        {/* ========================================== */}

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Table Header */}
          <div className="border-b border-slate-100 px-6 py-5">

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">

              <div>

                <h2 className="text-lg font-bold text-slate-900">
                  Recovery Cases
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  AI recommendations and recovery progress.
                </p>

              </div>

              <div className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                {totalCases} {totalCases === 1 ? "case" : "cases"}
              </div>

            </div>

          </div>

          {/* Loading */}
          {loading ? (

            <div className="px-6 py-16 text-center">

              <RefreshCw
                size={30}
                className="mx-auto animate-spin text-indigo-600"
              />

              <p className="mt-4 text-sm text-slate-500">
                Loading recovery cases...
              </p>

            </div>

          ) : recoveryCases.length === 0 ? (

            /* ======================================== */
            /* EMPTY STATE */
            /* ======================================== */

            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">

                <CheckCircle
                  size={30}
                  className="text-emerald-600"
                />

              </div>

              <h3 className="mt-5 text-lg font-semibold text-slate-900">
                No recovery cases
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                There are currently no payment recovery cases
                requiring attention. Failed transactions analyzed
                by the AI agent will appear here.
              </p>

            </div>

          ) : (

            <>
              {/* ====================================== */}
              {/* DESKTOP TABLE */}
              {/* ====================================== */}

              <div className="hidden overflow-x-auto lg:block">

                <table className="w-full">

                  <thead className="bg-slate-50">

                    <tr className="border-b border-slate-200">

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Customer
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Amount
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Risk
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        AI Action
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Attempts
                      </th>

                      <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Created
                      </th>

                    </tr>

                  </thead>

                  <tbody className="divide-y divide-slate-100">

                    {recoveryCases.map((recoveryCase) => {

                      const transaction =
                        recoveryCase.transactionId;

                      const customerName =
                        transaction?.customerName ||
                        "Unknown Customer";

                      return (
                        <tr
                          key={recoveryCase._id}
                          className="transition hover:bg-slate-50/70"
                        >

                          {/* Customer */}
                          <td className="px-6 py-5">

                            <div className="flex items-center gap-3">

                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">

                                {customerName
                                  .charAt(0)
                                  .toUpperCase()}

                              </div>

                              <div className="min-w-0">

                                <p className="font-semibold text-slate-900">
                                  {customerName}
                                </p>

                                <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                                  {transaction?.customerEmail ||
                                    "No email"}
                                </p>

                              </div>

                            </div>

                          </td>

                          {/* Amount */}
                          <td className="px-4 py-5">

                            <p className="font-bold text-slate-900">
                              {formatCurrency(
                                recoveryCase.revenueAtRisk
                              )}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              Revenue at risk
                            </p>

                          </td>

                          {/* Risk */}
                          <td className="px-4 py-5">

                            <span
                              className={`inline-flex rounded-full border px-3 py-1.5 text-xs font-bold ${getRiskStyle(
                                recoveryCase.riskLevel
                              )}`}
                            >
                              {recoveryCase.riskLevel ||
                                "UNKNOWN"}
                            </span>

                          </td>

                          {/* Action */}
                          <td className="px-4 py-5">

                            <span
                              className={`inline-flex rounded-lg px-3 py-1.5 text-xs font-bold ${getActionStyle(
                                recoveryCase.recommendedAction
                              )}`}
                            >
                              {recoveryCase.recommendedAction ||
                                "NO_ACTION"}
                            </span>

                          </td>

                          {/* Attempts */}
                          <td className="px-4 py-5">

                            <div className="flex items-center gap-2">

                              <div className="flex gap-1">

                                {[
                                  ...Array(
                                    recoveryCase.maxAttempts ||
                                      2
                                  ),
                                ].map((_, index) => (

                                  <span
                                    key={index}
                                    className={`h-2 w-5 rounded-full ${
                                      index <
                                      (recoveryCase.attempts ||
                                        0)
                                        ? "bg-indigo-500"
                                        : "bg-slate-200"
                                    }`}
                                  />

                                ))}

                              </div>

                              <span className="text-xs font-semibold text-slate-600">
                                {recoveryCase.attempts || 0}/
                                {recoveryCase.maxAttempts || 2}
                              </span>

                            </div>

                          </td>

                          {/* Status */}
                          <td className="px-4 py-5">

                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${getStatusStyle(
                                recoveryCase.status
                              )}`}
                            >
                              {getStatusIcon(
                                recoveryCase.status
                              )}

                              {recoveryCase.status ||
                                "PENDING"}
                            </span>

                          </td>

                          {/* Date */}
                          <td className="px-6 py-5">

                            <p className="text-sm font-medium text-slate-700">
                              {new Date(
                                recoveryCase.createdAt
                              ).toLocaleDateString("en-IN")}
                            </p>

                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(
                                recoveryCase.createdAt
                              ).toLocaleTimeString("en-IN", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>

                          </td>

                        </tr>
                      );
                    })}

                  </tbody>

                </table>

              </div>

              {/* ====================================== */}
              {/* MOBILE CARDS */}
              {/* ====================================== */}

              <div className="divide-y divide-slate-100 lg:hidden">

                {recoveryCases.map((recoveryCase) => {

                  const transaction =
                    recoveryCase.transactionId;

                  const customerName =
                    transaction?.customerName ||
                    "Unknown Customer";

                  return (
                    <div
                      key={recoveryCase._id}
                      className="p-5"
                    >

                      {/* Customer + Status */}

                      <div className="flex items-start justify-between gap-4">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">

                            {customerName
                              .charAt(0)
                              .toUpperCase()}

                          </div>

                          <div className="min-w-0">

                            <p className="truncate font-semibold text-slate-900">
                              {customerName}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-500">
                              {transaction?.customerEmail ||
                                "No email"}
                            </p>

                          </div>

                        </div>

                        <span
                          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${getStatusStyle(
                            recoveryCase.status
                          )}`}
                        >
                          {getStatusIcon(
                            recoveryCase.status
                          )}

                          {recoveryCase.status ||
                            "PENDING"}
                        </span>

                      </div>

                      {/* Details */}

                      <div className="mt-5 grid grid-cols-2 gap-4">

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-xs text-slate-400">
                            Amount at Risk
                          </p>

                          <p className="mt-1 font-bold text-red-600">
                            {formatCurrency(
                              recoveryCase.revenueAtRisk
                            )}
                          </p>

                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-xs text-slate-400">
                            Risk Level
                          </p>

                          <span
                            className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${getRiskStyle(
                              recoveryCase.riskLevel
                            )}`}
                          >
                            {recoveryCase.riskLevel ||
                              "UNKNOWN"}
                          </span>

                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-xs text-slate-400">
                            AI Action
                          </p>

                          <p className="mt-1 text-xs font-bold text-slate-800">
                            {recoveryCase.recommendedAction ||
                              "NO_ACTION"}
                          </p>

                        </div>

                        <div className="rounded-xl bg-slate-50 p-3">

                          <p className="text-xs text-slate-400">
                            Attempts
                          </p>

                          <p className="mt-1 font-bold text-slate-800">
                            {recoveryCase.attempts || 0}/
                            {recoveryCase.maxAttempts || 2}
                          </p>

                        </div>

                      </div>

                    </div>
                  );
                })}

              </div>
            </>
          )}

        </div>

        {/* ========================================== */}
        {/* INFO BANNER */}
        {/* ========================================== */}

        <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-5">

          <div className="flex gap-4">

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
              <ShieldAlert size={20} />
            </div>

            <div>

              <h3 className="font-semibold text-slate-900">
                Safety-first recovery
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-600">
                AI recommendations are validated by deterministic
                guardrails before recovery actions are executed.
                Transactions reaching the retry limit are escalated
                for human review instead of being retried indefinitely.
              </p>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
};

export default Recovery;