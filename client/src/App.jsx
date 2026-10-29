import { useState } from "react";
import Dashboard from "./components/Dashboard";
import About from "./components/About";
import Notification from "./components/Notification";
import "./App.css";

function App() {
const [refreshKey, setRefreshKey] = useState(0);
const [page, setPage] = useState("dashboard");


const handleTransactionGenerated = () => {
    setRefreshKey((previous) => previous + 1);
};

return (
    <main className="app">
        <header className="app-header">
            <div className="brand-mark">₹</div>
            <h1>UPI Tracker</h1>
            <p>Every transaction. One clear picture.</p>
            <button
                className="status-badge"
                onClick={() => setPage(page === "dashboard" ? "about" : "dashboard")}
                title={page === "dashboard" ? "About UPI Tracker" : "Back to Dashboard"}
            >
                <span className="status-dot"></span>
                {page === "dashboard" ? "About" : "Back to Dashboard"}
            </button>
        </header>

        {page === "about" ? (
            <About onBack={() => setPage("dashboard")} />
        ) : (
            <>
                <Dashboard refreshKey={refreshKey} />

                <footer className="app-footer">
                    UPI Tracker <span>·</span> Simulated transactions for demonstration
                </footer>
            </>
        )}

        <Notification
            onTransactionGenerated={handleTransactionGenerated}
        />
    </main>
);


}

export default App;
