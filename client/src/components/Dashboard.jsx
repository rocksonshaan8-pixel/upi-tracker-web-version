import { useCallback, useEffect, useState } from "react";
import { getSummary, getTransactions } from "../services/api";

function Dashboard({ refreshKey = 0 }) {
const [summary, setSummary] = useState(null);
const [transactions, setTransactions] = useState([]);
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");


const refreshDashboard = useCallback(async () => {
    try {
        const [summaryData, transactionData] = await Promise.all([
            getSummary(),
            getTransactions(),
        ]);

        setSummary(summaryData);
        setTransactions(transactionData.transactions || []);
        setError("");
    } catch (err) {
        console.error("Dashboard loading failed:", err);
        setError("Unable to load transactions. Check that your backend is running.");
    } finally {
        setLoading(false);
    }
}, []);

useEffect(() => {
    refreshDashboard();
}, [refreshDashboard, refreshKey]);

const formatCurrency = (amount) =>
    Number(amount || 0).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        minimumFractionDigits: 2,
    });

const formatDate = (date) =>
    new Date(date).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });

return (
    <section className="dashboard">
        {error && <div className="error-banner">{error}</div>}

        <div className="summary-grid">
            <article className="summary-card">
                <span className="card-label">Total Credits</span>
                <span className="card-icon credit-icon">↙</span>
                <h2 className="credit-text">
                    {loading ? "Loading..." : formatCurrency(summary?.totalCredits)}
                </h2>
                <p>Money received</p>
            </article>

            <article className="summary-card">
                <span className="card-label">Total Debits</span>
                <span className="card-icon debit-icon">↗</span>
                <h2 className="debit-text">
                    {loading ? "Loading..." : formatCurrency(summary?.totalDebits)}
                </h2>
                <p>Money sent</p>
            </article>

            <article className="summary-card balance-card">
                <span className="card-label">Net Balance</span>
                <span className="card-icon balance-icon">₹</span>
                <h2>
                    {loading ? "Loading..." : formatCurrency(summary?.netBalance)}
                </h2>
                <p>Credits minus debits</p>
            </article>
        </div>

        <section className="transactions-panel">
            <div className="panel-header">
                <div>
                    <h2>Recent Transactions</h2>
                    <p>Your latest simulated UPI activity</p>
                </div>
                <span className="transaction-count">
                    {transactions.length} transactions
                </span>
            </div>

            {loading ? (
                <div className="empty-state">Loading your transactions...</div>
            ) : transactions.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">₹</span>
                    <h3>No transactions yet</h3>
                    <p>Generate your first simulated transaction using the + button.</p>
                </div>
            ) : (
                <div className="table-wrapper">
                    <table className="transactions-table">
                        <thead>
                            <tr>
                                <th>Person / Description</th>
                                <th>Type</th>
                                <th>Date &amp; Time</th>
                                <th className="amount-column">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>
                                        <div className="person-cell">
                                            <span
                                                className={`transaction-avatar ${
                                                    transaction.type === "CREDIT"
                                                        ? "avatar-credit"
                                                        : "avatar-debit"
                                                }`}
                                            >
                                                {transaction.person_name
                                                    ?.charAt(0)
                                                    .toUpperCase() || "U"}
                                            </span>
                                            <div>
                                                <strong>{transaction.person_name}</strong>
                                                <small>{transaction.description}</small>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`type-badge ${
                                                transaction.type === "CREDIT"
                                                    ? "type-credit"
                                                    : "type-debit"
                                            }`}
                                        >
                                            {transaction.type === "CREDIT"
                                                ? "Received"
                                                : "Sent"}
                                        </span>
                                    </td>
                                    <td className="date-cell">
                                        {formatDate(transaction.created_at)}
                                    </td>
                                    <td
                                        className={`amount-column amount-cell ${
                                            transaction.type === "CREDIT"
                                                ? "credit-text"
                                                : "debit-text"
                                        }`}
                                    >
                                        {transaction.type === "CREDIT" ? "+" : "−"}
                                        {formatCurrency(transaction.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    </section>
);


}

export default Dashboard;
