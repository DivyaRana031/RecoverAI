import {
  CheckCircle,
  XCircle,
  Brain,
  ShieldCheck,
  CreditCard,
  FileText,
} from "lucide-react";

const RecoveryResult = ({ result, onClose }) => {
  if (!result) return null;

  const { aiDecision, guardrails, execution, policies, recoveryLog } =
    result;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 p-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Recovery Analysis
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AI-powered payment recovery decision
            </p>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6 p-6">

          {/* AI Decision */}
          <section className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
            <div className="mb-4 flex items-center gap-2">
              <Brain size={20} className="text-indigo-600" />

              <h3 className="font-semibold text-slate-900">
                AI Decision
              </h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">

              <div>
                <p className="text-xs text-slate-500">
                  Action
                </p>

                <p className="mt-1 font-bold text-indigo-700">
                  {aiDecision?.action || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Risk Level
                </p>

                <p className="mt-1 font-bold">
                  {aiDecision?.riskLevel || "N/A"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-500">
                  Human Approval
                </p>

                <p className="mt-1 font-bold">
                  {aiDecision?.requiresHumanApproval
                    ? "Required"
                    : "Not Required"}
                </p>
              </div>

            </div>

            <div className="mt-4 rounded-lg bg-white p-4">
              <p className="text-xs font-medium text-slate-500">
                Reason
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {aiDecision?.reason || "No reason provided."}
              </p>
            </div>
          </section>


          {/* Guardrails */}
          <section className="rounded-xl border border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2">
              <ShieldCheck
                size={20}
                className={
                  guardrails?.allowed
                    ? "text-green-600"
                    : "text-red-600"
                }
              />

              <h3 className="font-semibold">
                Guardrail Result
              </h3>
            </div>

            <div className="flex items-center gap-3">

              {guardrails?.allowed ? (
                <>
                  <CheckCircle
                    size={24}
                    className="text-green-600"
                  />

                  <div>
                    <p className="font-semibold text-green-700">
                      Action Allowed
                    </p>

                    <p className="text-sm text-slate-500">
                      {guardrails.finalAction}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle
                    size={24}
                    className="text-red-600"
                  />

                  <div>
                    <p className="font-semibold text-red-700">
                      Action Blocked
                    </p>

                    <p className="text-sm text-slate-500">
                      Human approval required
                    </p>
                  </div>
                </>
              )}

            </div>

            <p className="mt-4 text-sm text-slate-600">
              {guardrails?.reason}
            </p>
          </section>


          {/* Execution */}
          <section className="rounded-xl border border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2">
              <CreditCard
                size={20}
                className="text-slate-700"
              />

              <h3 className="font-semibold">
                Action Execution
              </h3>
            </div>

            <div className="rounded-lg bg-slate-50 p-4">

              <div className="flex justify-between">
                <span className="text-sm text-slate-500">
                  Status
                </span>

                <span
                  className={`font-semibold ${
                    execution?.success
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {execution?.success
                    ? "Executed"
                    : "Not Executed"}
                </span>
              </div>

              <div className="mt-3 flex justify-between">
                <span className="text-sm text-slate-500">
                  Action
                </span>

                <span className="font-medium">
                  {execution?.action || "N/A"}
                </span>
              </div>

              {execution?.razorpayOrderId && (
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-slate-500">
                    Razorpay Order
                  </span>

                  <span className="font-mono text-xs">
                    {execution.razorpayOrderId}
                  </span>
                </div>
              )}

              {execution?.retryCount !== undefined && (
                <div className="mt-3 flex justify-between">
                  <span className="text-sm text-slate-500">
                    Retry Count
                  </span>

                  <span className="font-semibold">
                    {execution.retryCount}
                  </span>
                </div>
              )}

              <p className="mt-4 text-sm text-slate-600">
                {execution?.message}
              </p>

            </div>
          </section>


          {/* Retrieved Policies */}
          <section className="rounded-xl border border-slate-200 p-5">
            <div className="mb-4 flex items-center gap-2">
              <FileText
                size={20}
                className="text-slate-700"
              />

              <h3 className="font-semibold">
                Retrieved Policies
              </h3>
            </div>

            <div className="space-y-3">

              {policies?.map((policy, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-lg bg-slate-50 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {policy.title}
                    </p>

                    <p className="text-xs text-slate-500">
                      {policy.category}
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">
                    {Number(policy.score).toFixed(3)}
                  </span>
                </div>
              ))}

            </div>
          </section>


          {/* Recovery Log */}
          {recoveryLog?.id && (
            <div className="rounded-lg bg-slate-50 p-4 text-sm">
              <span className="text-slate-500">
                Recovery Log ID:
              </span>{" "}
              <span className="font-mono">
                {recoveryLog.id}
              </span>
            </div>
          )}

        </div>

        <div className="border-t border-slate-200 p-6">
          <button
            onClick={onClose}
            className="w-full rounded-xl bg-slate-900 px-4 py-3 font-medium text-white hover:bg-slate-800"
          >
            Close Analysis
          </button>
        </div>

      </div>
    </div>
  );
};

export default RecoveryResult;