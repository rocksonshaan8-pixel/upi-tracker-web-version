import "./About.css";

function About({ onBack }) {
    return (
        <section className="about-page">
            <button className="about-back-btn" onClick={onBack}>
                ← Back to Dashboard
            </button>

            <header className="about-hero">
                <div className="brand-mark">₹</div>
                <h1>About UPI Tracker</h1>
                <p>Every transaction. One clear picture.</p>
            </header>

            <div className="about-grid">
                <article className="about-card">
                    <h2>What is it?</h2>
                    <p>
                        UPI Tracker is a transaction dashboard that keeps all of your
                        UPI payments — PhonePe, Google Pay, Paytm, Amazon Pay and BHIM —
                        in one place. Instead of juggling multiple apps to figure out
                        where your money went, you get a single clear picture of every
                        transaction.
                    </p>
                </article>

                <article className="about-card">
                    <h2>Key Features</h2>
                    <ul>
                        <li><strong>Unified history:</strong> Browse all simulated UPI transactions in one feed.</li>
                        <li><strong>Analytics:</strong> See spending broken down by app, category and time.</li>
                        <li><strong>Instant notifications:</strong> Get alerted the moment a new transaction is generated.</li>
                        <li><strong>Payment logos:</strong> Recognise each provider at a glance with app-specific branding.</li>
                    </ul>
                </article>

                <article className="about-card">
                    <h2>How it works</h2>
                    <p>
                        The app is built with <strong>React</strong> on the front end and a
                        <strong> Node.js / Express</strong> server with a database on the back end.
                        Transactions are stored server-side and fetched through a REST API,
                        so your dashboard stays in sync across refreshes.
                    </p>
                </article>

                <article className="about-card">
                    <h2>Disclaimer</h2>
                    <p>
                        All transactions shown are <strong>simulated for demonstration
                            purposes</strong> only. No real money is involved, and no real bank
                        or UPI account data is used or stored.
                    </p>
                </article>

                <article className="about-card">
                    <h2>Tech Stack</h2>
                    <div className="about-tags">
                        <span>React</span>
                        <span>Vite</span>
                        <span>Node.js</span>
                        <span>Express</span>
                        <span>REST API</span>
                    </div>
                </article>

                <article className="about-card">
                    <h2>Contact &amp; Support</h2>
                    <p>
                        Found a bug or have an idea for a feature? Open an issue on the
                        project repository, or reach the developer directly. Feedback is
                        always welcome!
                    </p>
                </article>
            </div>

            <footer className="app-footer">
                UPI Tracker <span>·</span> Simulated transactions for demonstration
            </footer>
        </section>
    );
}

export default About;
