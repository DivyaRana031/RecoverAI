import { useEffect, useState } from "react";
import {
  Brain,
  CheckCircle,
  XCircle,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";

import api from "../services/api";

const AIDecisions = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ============================================
  // FETCH LATEST AI DECISIONS
  // ============================================

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/recovery/logs");

      const allLogs = response.data.logs || [];

      /*
        Backend returns logs newest first.

        We only want the latest decision
        for each transaction.

        Example:

        Rahul
        ESCALATE          <- keep
        RETRY_PAYMENT
        RETRY_PAYMENT

        Priya
        RETRY_PAYMENT     <- keep
        RETRY_PAYMENT
      */

      const latestLogs = [];
      const seenTransactions = new Set();

      for (const log of allLogs) {
        const transactionId =
          log.transactionId?._id || log.transactionId;

        // Ignore logs without a transaction
        if (!transactionId) {
          continue;
        }

        // Keep only the first/latest log
        if (!seenTransactions.has(transactionId)) {
          seenTransactions.add(transactionId);
          latestLogs.push(log);
        }
      }

      setLogs(latestLogs);

    } catch (error) {
      console.error(
        "Failed to fetch AI decisions:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load AI decisions"
      );

    } finally {
      setLoading(false);
    }
  };


  // ============================================
  // INITIAL LOAD
  // ============================================

  useEffect(() => {
    fetchLogs();
  }, []);


  // ============================================
  // RISK STYLE
  // ============================================

  const getRiskStyle = (risk) => {
    switch (risk) {
      case "LOW":
        return "bg-green-50 text-green-700";

      case "MEDIUM":
        return "bg-orange-50 text-orange-700";

      case "HIGH":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };


  // ============================================
  // PAGE
  // ============================================

  return (
    <main className="flex-1 p-8">

      {/* ====================================== */}
      {/* HEADER */}
      {/* ====================================== */}

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-indigo-50 p-3">
              <Brain
                size={24}
                className="text-indigo-600"
              />
            </div>

            <div>

              <h2 className="text-3xl font-bold text-slate-900">
                AI Decisions
              </h2>

              <p className="mt-1 text-slate-500">
                Review the latest decisions made by the RecoverAI agent.
              </p>

            </div>

          </div>

        </div>


        {/* Refresh */}
        <button
          onClick={fetchLogs}
          disabled={loading}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >

          <RefreshCw
            size={17}
            className={
              loading ? "animate-spin" : ""
            }
          />

          Refresh

        </button>

      </div>


      {/* ====================================== */}
      {/* ERROR */}
      {/* ====================================== */}

      {error && (
        <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">

          <AlertTriangle size={18} />

          {error}

        </div>
      )}


      {/* ====================================== */}
      {/* LOADING */}
      {/* ====================================== */}

      {loading ? (

        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">

          <RefreshCw
            size={28}
            className="mx-auto animate-spin text-indigo-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading AI decisions...
          </p>

        </div>

      ) : logs.length === 0 ? (

        /* ==================================== */
        /* EMPTY STATE */
        /* ==================================== */

        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">

            <Brain
              size={28}
              className="text-indigo-600"
            />

          </div>


          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No AI decisions yet
          </h3>


          <p className="mt-1 text-sm text-slate-500">
            Analyze a failed transaction to generate an AI decision.
          </p>

        </div>

      ) : (

        /* ==================================== */
        /* DECISION CARDS */
        /* ==================================== */

        <div className="space-y-5">

          {logs.map((log) => {

            const transaction =
              log.transactionId;

            const customerName =
              transaction?.customerName ||
              "Unknown Customer";

            const amount =
              transaction?.amount || 0;

            const allowed =
              log.guardrailAllowed;

            return (

              <div
                key={log._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >

                {/* ================================= */}
                {/* CARD HEADER */}
                {/* ================================= */}

                <div className="flex flex-col gap-4 border-b border-slate-200 p-6 md:flex-row md:items-center md:justify-between">

                  {/* Customer */}

                  <div className="flex items-center gap-4">

                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-50 font-semibold text-indigo-600">

                      {customerName
                        .charAt(0)
                        .toUpperCase()}

                    </div>


                    <div>

                      <h3 className="font-semibold text-slate-900">
                        {customerName}
                      </h3>

                      <p className="text-sm text-slate-500">
                        ₹
                        {Number(
                          amount
                        ).toLocaleString("en-IN")}
                      </p>

                    </div>

                  </div>


                  {/* Action + Risk */}

                  <div className="flex flex-wrap items-center gap-2">

                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                      {log.aiAction}
                    </span>


                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${getRiskStyle(
                        log.riskLevel
                      )}`}
                    >
                      {log.riskLevel || "UNKNOWN"} RISK
                    </span>

                  </div>

                </div>


                {/* ================================= */}
                {/* CARD BODY */}
                {/* ================================= */}

                <div className="grid gap-6 p-6 lg:grid-cols-3">

                  {/* ================================= */}
                  {/* AI REASONING */}
                  {/* ================================= */}

                  <div className="lg:col-span-2">

                    <div className="mb-2 flex items-center gap-2">

                      <Brain
                        size={17}
                        className="text-indigo-600"
                      />

                      <p className="text-sm font-semibold text-slate-900">
                        AI Reasoning
                      </p>

                    </div>


                    <p className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">

                      {log.aiReason ||
                        "No reasoning available."}

                    </p>

                  </div>


                  {/* ================================= */}
                  {/* GUARDRAILS */}
                  {/* ================================= */}

                  <div>

                    <div className="mb-2 flex items-center gap-2">

                      <ShieldCheck
                        size={17}
                        className={
                          allowed
                            ? "text-green-600"
                            : "text-red-600"
                        }
                      />

                      <p className="text-sm font-semibold text-slate-900">
                        Guardrails
                      </p>

                    </div>


                    <div
                      className={`rounded-xl p-4 ${
                        allowed
                          ? "bg-green-50"
                          : "bg-red-50"
                      }`}
                    >

                      <div className="flex items-center gap-2">

                        {allowed ? (

                          <CheckCircle
                            size={20}
                            className="text-green-600"
                          />

                        ) : (

                          <XCircle
                            size={20}
                            className="text-red-600"
                          />

                        )}


                        <span
                          className={`font-semibold ${
                            allowed
                              ? "text-green-700"
                              : "text-red-700"
                          }`}
                        >

                          {allowed
                            ? "ALLOWED"
                            : "BLOCKED"}

                        </span>

                      </div>


                      <p className="mt-2 text-xs text-slate-500">
                        Final action:
                      </p>


                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {log.finalAction}
                      </p>

                    </div>

                  </div>

                </div>


                {/* ================================= */}
                {/* CARD FOOTER */}
                {/* ================================= */}

                <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">

                  <div className="flex flex-wrap gap-5">

                    {/* Executed */}

                    <div>

                      <span className="text-slate-500">
                        Executed:
                      </span>{" "}

                      <span className="font-semibold">
                        {log.actionExecuted
                          ? "Yes"
                          : "No"}
                      </span>

                    </div>


                    {/* Date */}

                    <div>

                      <span className="text-slate-500">
                        Date:
                      </span>{" "}

                      <span className="font-semibold">

                        {new Date(
                          log.createdAt
                        ).toLocaleString("en-IN")}

                      </span>

                    </div>

                  </div>


                  {/* Execution Status */}

                  {log.actionExecuted ? (

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700">

                      <CheckCircle size={14} />

                      Action Executed

                    </span>

                  ) : (

                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">

                      <XCircle size={14} />

                      Action Not Executed

                    </span>

                  )}

                </div>

              </div>

            );
          })}

        </div>

      )}

    </main>
  );
};

export default AIDecisions;