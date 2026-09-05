import { useEffect, useState, useMemo } from "react";
import api from "../services/api";
import {
  FileText,
  RotateCw,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  Send,
  Link2,
  MinusCircle,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

const Logs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("ALL");

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");

      const response = await api.get(
        "http://localhost:5000/api/recovery/logs",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setLogs(response.data.logs || []);
    } catch (err) {
      console.error("Failed to fetch logs:", err);
      setError(
        err.response?.data?.message || "Failed to retrieve recovery logs."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Filter and search logic
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        log.transactionId?.customerName
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        log.transactionId?.customerEmail
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        log.aiAction?.toLowerCase().includes(searchQuery.toLowerCase());

      if (selectedFilter === "ALL") return matchesSearch;
      if (selectedFilter === "BLOCKED") return matchesSearch && !log.guardrailAllowed;
      if (selectedFilter === "EXECUTED") return matchesSearch && log.actionExecuted;
      return matchesSearch && log.riskLevel?.toUpperCase() === selectedFilter;
    });
  }, [logs, searchQuery, selectedFilter]);

  // Metric stats
  const metrics = useMemo(() => {
    const total = logs.length;
    const executed = logs.filter((l) => l.actionExecuted).length;
    const blocked = logs.filter((l) => !l.guardrailAllowed).length;
    const highRisk = logs.filter((l) => l.riskLevel?.toUpperCase() === "HIGH").length;
    return { total, executed, blocked, highRisk };
  }, [logs]);

  const getActionBadge = (action) => {
    const configs = {
      RETRY_PAYMENT: {
        bg: "bg-blue-50 text-blue-700 border-blue-200/60 ring-blue-500/10",
        icon: RotateCw,
        label: "Retry Payment",
      },
      ESCALATE: {
        bg: "bg-rose-50 text-rose-700 border-rose-200/60 ring-rose-500/10",
        icon: ShieldAlert,
        label: "Escalate",
      },
      SEND_REMINDER: {
        bg: "bg-amber-50 text-amber-700 border-amber-200/60 ring-amber-500/10",
        icon: Send,
        label: "Send Reminder",
      },
      CREATE_PAYMENT_LINK: {
        bg: "bg-purple-50 text-purple-700 border-purple-200/60 ring-purple-500/10",
        icon: Link2,
        label: "Payment Link",
      },
      NO_ACTION: {
        bg: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10",
        icon: MinusCircle,
        label: "No Action",
      },
    };

    const config = configs[action] || {
      bg: "bg-slate-100 text-slate-700 border-slate-200 ring-slate-500/10",
      icon: MinusCircle,
      label: action || "Unknown",
    };

    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ring-1 ${config.bg}`}
      >
        <Icon size={13} className="shrink-0" />
        {config.label}
      </span>
    );
  };

  const getRiskBadge = (level) => {
    const lvl = level?.toUpperCase();
    if (lvl === "HIGH") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          High
        </span>
      );
    }
    if (lvl === "MEDIUM") {
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          Medium
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {level || "Low"}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";
    const d = new Date(date);
    return (
      <div className="flex flex-col">
        <span className="text-xs font-medium text-slate-700">
          {d.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <span className="text-[11px] text-slate-400">
          {d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50/60 p-6 md:p-10 selection:bg-indigo-500 selection:text-white">
      {/* Page Heading & Refresh Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 ring-1 ring-indigo-100">
              <FileText size={22} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Audit & Decision Logs
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1.5 ml-10">
            Real-time trace of AI reasoning, safety guardrails, and automated executions
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 hover:border-slate-300 active:scale-95 transition-all shadow-sm disabled:opacity-60 cursor-pointer"
        >
          <RotateCw
            size={16}
            className={`text-slate-500 ${loading ? "animate-spin" : ""}`}
          />
          Refresh Trace
        </button>
      </div>

      {/* Metric Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Decisions</span>
            <TrendingUp size={16} className="text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.total}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Auto Executed</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.executed}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Guardrail Intercepts</span>
            <ShieldAlert size={16} className="text-rose-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.blocked}</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">High Risk Triggers</span>
            <AlertTriangle size={16} className="text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{metrics.highRisk}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
          />
          <input
            type="text"
            placeholder="Search customer, email, or action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl placeholder:text-slate-400 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 shadow-sm transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <Filter size={16} className="text-slate-400 shrink-0 ml-1 mr-1" />
          {["ALL", "HIGH", "EXECUTED", "BLOCKED"].map((tab) => (
            <button
              key={tab}
              onClick={() => setSelectedFilter(tab)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition shrink-0 cursor-pointer ${
                selectedFilter === tab
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/20"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab === "ALL" ? "All Events" : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-6 rounded-2xl bg-rose-50 border border-rose-200/80 p-4 text-rose-600 flex items-center gap-3 text-sm">
          <AlertTriangle size={18} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <RotateCw size={30} className="animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-700">Fetching audit history</p>
            <p className="text-xs text-slate-400 mt-1">Synchronizing decisions with safety logs...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400 mb-3">
              <FileText size={24} />
            </div>
            <p className="text-sm font-semibold text-slate-800">No recovery logs found</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              {searchQuery || selectedFilter !== "ALL"
                ? "Try adjusting your search query or filter tags."
                : "Recovery actions initiated by the autonomous AI engine will register here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[11px] font-bold tracking-wider text-slate-500 uppercase">
                  <th className="py-3.5 px-6">Customer</th>
                  <th className="py-3.5 px-6">AI Recommendation</th>
                  <th className="py-3.5 px-6">Risk Profile</th>
                  <th className="py-3.5 px-6">Guardrail Status</th>
                  <th className="py-3.5 px-6">Resolved Action</th>
                  <th className="py-3.5 px-6">Execution</th>
                  <th className="py-3.5 px-6">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredLogs.map((log) => (
                  <tr
                    key={log._id}
                    className="hover:bg-slate-50/80 transition-colors duration-150 group"
                  >
                    {/* Customer */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                        {log.transactionId?.customerName || "Anonymous Customer"}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {log.transactionId?.customerEmail || "no-email@recorded"}
                      </div>
                    </td>

                    {/* AI Proposed Action */}
                    <td className="py-4 px-6">{getActionBadge(log.aiAction)}</td>

                    {/* Risk Level */}
                    <td className="py-4 px-6">{getRiskBadge(log.riskLevel)}</td>

                    {/* Guardrail Policy */}
                    <td className="py-4 px-6">
                      {log.guardrailAllowed ? (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50/70 border border-emerald-200/50 px-2.5 py-1 rounded-lg">
                          <ShieldCheck size={14} className="text-emerald-500" />
                          Passed
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-600 bg-rose-50/70 border border-rose-200/50 px-2.5 py-1 rounded-lg">
                          <ShieldAlert size={14} className="text-rose-500" />
                          Intercepted
                        </div>
                      )}
                    </td>

                    {/* Final Action Resolved */}
                    <td className="py-4 px-6">{getActionBadge(log.finalAction)}</td>

                    {/* Action Executed Status */}
                    <td className="py-4 px-6">
                      {log.actionExecuted ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                          <CheckCircle2 size={16} />
                          Dispatched
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-400">
                          <XCircle size={16} />
                          Idle
                        </span>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-slate-400 shrink-0" />
                        {formatDate(log.createdAt)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Summary */}
        {!loading && filteredLogs.length > 0 && (
          <div className="py-3 px-6 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>
              Showing <strong className="text-slate-700">{filteredLogs.length}</strong> of{" "}
              <strong className="text-slate-700">{logs.length}</strong> recorded audit events
            </span>
            <span className="font-mono text-[11px]">System: Operational</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Logs;