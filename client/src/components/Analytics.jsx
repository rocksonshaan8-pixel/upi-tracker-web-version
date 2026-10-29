import { paymentAppLogos } from "./logos";

function Analytics({ monthly, apps }) {
    const formatCurrency = (amount) =>
        Number(amount || 0).toLocaleString("en-IN", {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0,
        });

    const maxVolume = Math.max(
        ...(apps?.map((app) => Number(app.totalVolume)) || [0]),
        1
    );

    return (
        <div className="analytics-grid">
            <section className="analytics-panel">
                <div className="panel-header">
                    <div>
                        <h2>Monthly Trend</h2>
                        <p>Credits vs debits per month</p>
                    </div>
                </div>

                {(!monthly || monthly.length === 0) ? (
                    <div className="empty-state">No monthly data yet</div>
                ) : (
                    <div className="chart-wrapper">
                        <div className="chart-row chart-head">
                            <span>Month</span>
                            <span>Credits</span>
                            <span>Debits</span>
                        </div>
                        {monthly.map((m) => {
                            const credits = Number(m.totalCredits);
                            const debits = Number(m.totalDebits);
                            const max = Math.max(credits, debits, 1);

                            return (
                                <div className="chart-row" key={m.month}>
                                    <span className="chart-label">{m.month}</span>
                                    <div className="chart-bars">
                                        <div className="chart-bar-track">
                                            <div
                                                className="chart-bar bar-credit"
                                                style={{ width: `${(credits / max) * 100}%` }}
                                                title={`Credits: ${formatCurrency(credits)}`}
                                            />
                                        </div>
                                        <div className="chart-bar-track">
                                            <div
                                                className="chart-bar bar-debit"
                                                style={{ width: `${(debits / max) * 100}%` }}
                                                title={`Debits: ${formatCurrency(debits)}`}
                                            />
                                        </div>
                                    </div>
                                    <span className={`chart-net ${Number(m.netBalance) >= 0 ? "credit-text" : "debit-text"}`}>
                                        {formatCurrency(m.netBalance)}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>

            <section className="analytics-panel">
                <div className="panel-header">
                    <div>
                        <h2>Spending by App</h2>
                        <p>Which app you use the most</p>
                    </div>
                </div>

                {(!apps || apps.length === 0) ? (
                    <div className="empty-state">No app data yet</div>
                ) : (
                    <div className="app-breakdown">
                        {apps.map((app) => (
                            <div className="app-row" key={app.appName}>
                                <img
                                    src={paymentAppLogos[app.appName]}
                                    alt={app.appName}
                                    className="app-row-logo"
                                />
                                <div className="app-row-info">
                                    <div className="app-row-top">
                                        <strong>{app.appName}</strong>
                                        <span>{app.transactionCount} txns</span>
                                    </div>
                                    <div className="chart-bar-track app-bar-track">
                                        <div
                                            className="chart-bar bar-app"
                                            style={{ width: `${(Number(app.totalVolume) / maxVolume) * 100}%` }}
                                        />
                                    </div>
                                    <div className="app-row-bottom">
                                        <span className="credit-text">
                                            ↑ {formatCurrency(app.totalCredits)}
                                        </span>
                                        <span className="debit-text">
                                            ↓ {formatCurrency(app.totalDebits)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Analytics;
