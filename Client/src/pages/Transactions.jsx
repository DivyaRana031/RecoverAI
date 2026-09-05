import { useEffect, useState } from "react";
import axios from "axios";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    customerEmail: "",
    amount: "",
    currency: "INR",
    status: "failed",
    failureReason: "NETWORK_ERROR",
    paymentType: "one_time",
  });

  const token = localStorage.getItem("token");

  // Fetch transactions
  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        "http://localhost:5000/api/transactions",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTransactions(response.data.transactions || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          "Failed to load transactions."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Create transaction
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "http://localhost:5000/api/transactions",
        {
          ...formData,
          amount: Number(formData.amount),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccess("Transaction created successfully.");

      setTransactions((prev) => [
        response.data.transaction,
        ...prev,
      ]);

      // Reset form
      setFormData({
        customerId: "",
        customerName: "",
        customerEmail: "",
        amount: "",
        currency: "INR",
        status: "failed",
        failureReason: "NETWORK_ERROR",
        paymentType: "one_time",
      });

      setShowForm(false);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to create transaction."
      );
    }
  };

  // Status badge
  const getStatusClass = (status) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-700";

      case "failed":
        return "bg-red-100 text-red-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "abandoned":
        return "bg-slate-100 text-slate-700";

      case "overdue":
        return "bg-orange-100 text-orange-700";

      default:
        return "bg-blue-100 text-blue-700";
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Transactions
          </h1>

          <p className="mt-1 text-slate-500">
            Manage and monitor your payment transactions.
          </p>
        </div>

        <button
          onClick={() => {
            setShowForm(!showForm);
            setError("");
            setSuccess("");
          }}
          className="rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          {showForm ? "Close Form" : "+ Add Transaction"}
        </button>
      </div>

      {/* Success Message */}
      {success && (
        <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Add Transaction Form */}
      {showForm && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-6 text-xl font-semibold text-slate-900">
            Create New Transaction
          </h2>

          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            {/* Customer ID */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Customer ID
              </label>

              <input
                type="text"
                name="customerId"
                value={formData.customerId}
                onChange={handleChange}
                placeholder="CUS001"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Customer Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Customer Name
              </label>

              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="Rahul Sharma"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Customer Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Customer Email
              </label>

              <input
                type="email"
                name="customerEmail"
                value={formData.customerEmail}
                onChange={handleChange}
                placeholder="rahul@example.com"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Amount
              </label>

              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder="2999"
                min="0"
                required
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Currency */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Currency
              </label>

              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>

              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="created">Created</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="abandoned">Abandoned</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Failure Reason */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Failure Reason
              </label>

              <select
                name="failureReason"
                value={formData.failureReason}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="NETWORK_ERROR">
                  Network Error
                </option>

                <option value="PAYMENT_DECLINED">
                  Payment Declined
                </option>

                <option value="INSUFFICIENT_FUNDS">
                  Insufficient Funds
                </option>

                <option value="TIMEOUT">
                  Timeout
                </option>

                <option value="">
                  None
                </option>
              </select>
            </div>

            {/* Payment Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Payment Type
              </label>

              <select
                name="paymentType"
                value={formData.paymentType}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="one_time">
                  One Time
                </option>

                <option value="subscription">
                  Subscription
                </option>

                <option value="invoice">
                  Invoice
                </option>
              </select>
            </div>

            {/* Submit */}
            <div className="md:col-span-2 flex justify-end">
              <button
                type="submit"
                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Create Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <h2 className="text-lg font-semibold text-slate-900">
            All Transactions
          </h2>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-500">
            Loading transactions...
          </div>
        ) : transactions.length === 0 ? (
          <div className="p-10 text-center text-slate-500">
            No transactions found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Customer
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Amount
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Status
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Failure Reason
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Retry
                  </th>

                  <th className="px-6 py-4 text-sm font-semibold text-slate-600">
                    Date
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction._id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Customer */}
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-slate-900">
                          {transaction.customerName}
                        </p>

                        <p className="text-sm text-slate-500">
                          {transaction.customerEmail}
                        </p>
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {transaction.currency || "INR"}{" "}
                      {Number(transaction.amount).toLocaleString()}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusClass(
                          transaction.status
                        )}`}
                      >
                        {transaction.status}
                      </span>
                    </td>

                    {/* Failure Reason */}
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {transaction.failureReason || "—"}
                    </td>

                    {/* Retry Count */}
                    <td className="px-6 py-4">
                      <span className="font-medium text-slate-700">
                        {transaction.retryCount || 0}/2
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {transaction.createdAt
                        ? new Date(
                            transaction.createdAt
                          ).toLocaleDateString()
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;