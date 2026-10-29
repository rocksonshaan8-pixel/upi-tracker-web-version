import { useCallback, useEffect, useMemo, useState } from "react";
import { getSummary, getTransactions, getMonthlySummary, getAppBreakdown } from "../services/api";
import Analytics from "./Analytics";
import { paymentAppLogos } from "./logos";

const PAGE_SIZE = 8;

function Dashboard({ refreshKey = 0 }) {
    const [summary, setSummary] = useState(null);
    const [monthly, setMonthly] = useState([]);
    const [apps, setApps] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Table controls
    const [search, setSearch] = useState("");
    const [appFilter, setAppFilter] = useState("All");
    const [typeFilter, setTypeFilter] = useState("All");
    const [sortBy, setSortBy] = useState("date");
    const [sortDir, setSortDir] = useState("desc");
    const [page, setPage] = useState(1);


    const refreshDashboard = useCallback(async () => {
        try {
            const [summaryData, transactionData, monthlyData, appData] = await Promise.all([
                getSummary(),
                getTransactions(),
                getMonthlySummary(),
                getAppBreakdown(),
            ]);

            setSummary(summaryData);
            setTransactions(transactionData.transactions || []);
            setMonthly(monthlyData || []);
            setApps(appData || []);
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

    useEffect(() => {
        setPage(1);
    }, [search, appFilter, typeFilter, sortBy, sortDir]);

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

    const filtered = useMemo(() => {
        let list = [...transactions];

        if (search.trim()) {
            const q = search.trim().toLowerCase();
            list = list.filter(
                (t) =>
                    t.person_name?.toLowerCase().includes(q) ||
                    t.description?.toLowerCase().includes(q) ||
                    t.app_name?.toLowerCase().includes(q)
            );
        }

        if (appFilter !== "All") {
            list = list.filter((t) => t.app_name === appFilter);
        }

        if (typeFilter !== "All") {
            list = list.filter((t) => t.type === typeFilter);
        }

        const dir = sortDir === "asc" ? 1 : -1;
        list.sort((a, b) => {
            switch (sortBy) {
                case "amount":
                    return (Number(a.amount) - Number(b.amount)) * dir;
                case "person":
                    return (a.person_name || "").localeCompare(b.person_name || "") * dir;
                case "app":
                    return (a.app_name || "").localeCompare(b.app_name || "") * dir;
                default:
                    return (new Date(a.created_at) - new Date(b.created_at)) * dir;
            }
        });

        return list;
    }, [transactions, search, appFilter, typeFilter, sortBy, sortDir]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paged = filtered.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const toggleSort = (field) => {
        if (sortBy === field) {
            setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(field);
            setSortDir("desc");
        }
    };

    const exportCsv = () => {
        const headers = ["Date", "Person", "App", "Type", "Amount", "Description"];
        const rows = filtered.map((t) => [
            formatDate(t.created_at),
            t.person_name,
            t.app_name || "UPI",
            t.type,
            Number(t.amount).toFixed(2),
            `"${(t.description || "").replace(/"/g, '""')}"`,
        ]);

        const csv = [headers, ...rows]
            .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
            .join("\n");

        const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `upi-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

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

            <Analytics monthly={monthly} apps={apps} />

            <section className="transactions-panel">
                <div className="panel-header">
                    <div>
                        <h2>Recent Transactions</h2>
                        <p>Your latest simulated UPI activity</p>
                    </div>
                    <div className="panel-actions">
                        <button type="button" className="export-btn" onClick={exportCsv}>
                            ⬇ Export CSV
                        </button>
                        <span className="transaction-count">
                            {filtered.length} of {transactions.length} transactions
                        </span>
                    </div>
                </div>

                <div className="table-controls">
                    <input
                        type="text"
                        className="search-input"
                        placeholder="Search person, app or description…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <select
                        className="filter-select"
                        value={appFilter}
                        onChange={(e) => setAppFilter(e.target.value)}
                    >
                        <option value="All">All apps</option>
                        {Object.keys(paymentAppLogos).map((name) => (
                            <option key={name} value={name}>{name}</option>
                        ))}
                    </select>
                    <select
                        className="filter-select"
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                    >
                        <option value="All">All types</option>
                        <option value="CREDIT">Received</option>
                        <option value="DEBIT">Sent</option>
                    </select>
                </div>

                {loading ? (
                    <div className="empty-state">Loading your transactions...</div>
                ) : filtered.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-icon">₹</span>
                        <h3>No matching transactions</h3>
                        <p>Try changing your search or filters.</p>
                    </div>
                ) : (
                    <>
                        <div className="table-wrapper">
                            <table className="transactions-table">
                                <thead>
                                    <tr>
                                        <th onClick={() => toggleSort("person")} className="sortable">
                                            Person / Description {sortBy === "person" && (sortDir === "asc" ? "↑" : "↓")}
                                        </th>
                                        <th onClick={() => toggleSort("app")} className="sortable">
                                            Paid Via {sortBy === "app" && (sortDir === "asc" ? "↑" : "↓")}
                                        </th>
                                        <th onClick={() => toggleSort("date")} className="sortable">
                                            Date &amp; Time {sortBy === "date" && (sortDir === "asc" ? "↑" : "↓")}
                                        </th>
                                        <th onClick={() => toggleSort("amount")} className="amount-column sortable">
                                            Amount {sortBy === "amount" && (sortDir === "asc" ? "↑" : "↓")}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paged.map((transaction) => (
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
                                                <span className="payment-app">
                                                    <img
                                                        src={paymentAppLogos[transaction.app_name]}
                                                        alt={transaction.app_name || "Payment app"}
                                                        className="payment-app-logo"
                                                        title={transaction.app_name}
                                                    />
                                                    <span>{transaction.app_name || "UPI"}</span>
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

                        <div className="pagination">
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setPage(currentPage - 1)}
                            >
                                ← Prev
                            </button>
                            <span>
                                Page {currentPage} of {totalPages}
                            </span>
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() => setPage(currentPage + 1)}
                            >
                                Next →
                            </button>
                        </div>
                    </>
                )}
            </section>
        </section>
    );
}

export default Dashboard;
