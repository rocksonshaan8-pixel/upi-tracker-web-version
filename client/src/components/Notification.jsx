import { useEffect, useRef, useState } from "react";
import { generateTransaction } from "../services/api";

const paymentAppLogos = {
    "Google Pay": "/payment-logos/google-pay.svg",
    "PhonePe": "/payment-logos/phonepe.svg",
    "Paytm": "/payment-logos/paytm.svg",
    "BHIM": "/payment-logos/bhim.svg",
    "Amazon Pay": "/payment-logos/amazon-pay.svg"
};

function Notification({ onTransactionGenerated }) {
const [loading, setLoading] = useState(false);
const [notification, setNotification] = useState(null);
const [error, setError] = useState("");


const notificationTimer = useRef(null);
const errorTimer = useRef(null);

useEffect(() => {
    return () => {
        clearTimeout(notificationTimer.current);
        clearTimeout(errorTimer.current);
    };
}, []);

const handleGenerate = async () => {
    if (loading) return;

    setLoading(true);
    setError("");

    clearTimeout(notificationTimer.current);
    clearTimeout(errorTimer.current);

    try {
        const data = await generateTransaction();

        setNotification({
            ...data.transaction,
            cancelled: Boolean(data.cancelled)
        });

        if (!data.cancelled && onTransactionGenerated) {
            onTransactionGenerated();
        }

        notificationTimer.current = setTimeout(() => {
            setNotification(null);
        }, 4000);
    } catch (err) {
        console.error("Transaction generation failed:", err);

        setNotification(null);
        setError("Transaction generation failed. Please try again.");

        errorTimer.current = setTimeout(() => {
            setError("");
        }, 4000);
    } finally {
        setLoading(false);
    }
};

const formattedAmount = notification
    ? Number(notification.amount).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
      })
    : "";

return (
    <>
        <div className="generate-hover-zone">
            <button
                type="button"
                className="floating-generate-btn"
                onClick={handleGenerate}
                disabled={loading}
                title="Generate a simulated transaction"
                aria-label="Generate transaction"
            >
                {loading ? "…" : "+"}
            </button>
        </div>

        {(notification || error) && (
            <div
                className={`notification-toast ${
                    notification?.cancelled ? "cancelled-toast" : ""
                }`}
                role="status"
                aria-live="polite"
            >
                {error ? (
                    <>
                        <strong className="toast-error">{error}</strong>
                    </>
                ) : (
                    <div className="toast-content">
                        <img
                            src={paymentAppLogos[notification.app_name]}
                            alt={notification.app_name || "Payment app"}
                            className="toast-app-logo"
                        />
                        <div className="toast-body">
                            {notification.cancelled ? (
                            <>
                                <strong className="toast-cancelled">
                                    Transaction Cancelled
                                </strong>

                                <p>{notification.person_name}</p>

                                <p className="toast-cancelled toast-amount">
                                    −₹{formattedAmount}
                                </p>

                                <small>
                                    Insufficient balance. No money was deducted.
                                </small>
                            </>
                            ) : (
                            <>
                                <strong>
                                    {notification.type === "CREDIT"
                                        ? "Money Received"
                                        : "Money Sent"}
                                </strong>

                                <p>{notification.person_name}</p>

                                <p
                                    className={
                                        notification.type === "CREDIT"
                                            ? "toast-credit"
                                            : "toast-debit"
                                    }
                                >
                                    {notification.type === "CREDIT" ? "+" : "−"}₹
                                    {formattedAmount}
                                </p>

                                <small>{notification.description}</small>
                            </>
                            )}
                        <small className="toast-app-name">
                            Paid via {notification.app_name || "UPI"}
                        </small>
                        </div>
                    </div>
                )}
            </div>
        )}
    </>
);


}

export default Notification;
