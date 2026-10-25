import { useState } from "react";
import Dashboard from "./components/Dashboard";
import Notification from "./components/Notification";
import "./App.css";

function App() {
const [refreshKey, setRefreshKey] = useState(0);


const handleTransactionGenerated = () => {
    setRefreshKey((previous) => previous + 1);
};

return (
    <main className="app">
        <header className="app-header">
            <div className="brand-mark">₹</div>
            <h1>UPI Tracker</h1>
            <p>Every transaction. One clear picture.</p>
            <span className="status-badge">
                <span className="status-dot"></span>
                Transaction dashboard
            </span>
        </header>

        <Dashboard refreshKey={refreshKey} />

        <footer className="app-footer">
            UPI Tracker <span>·</span> Simulated transactions for demonstration
        </footer>

        <Notification
            onTransactionGenerated={handleTransactionGenerated}
        />
    </main>
);


}

export default App;
