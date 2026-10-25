const express = require("express");
const router = express.Router();
const pool = require("../db");

const names = [
"Rohan Das",
"Priya Sharma",
"Arjun Kumar",
"Ananya Patel",
"Rahul Verma",
"Sneha Reddy",
"Vikram Singh",
"Neha Gupta"
];

const paymentApps = [
    "Google Pay",
    "PhonePe",
    "Paytm",
    "BHIM",
    "Amazon Pay"
];

router.post("/generate", async (req, res) => {
const client = await pool.connect();


try {
    await client.query("BEGIN");

    // Prevent concurrent transaction generation while checking balance.
    await client.query(
        "LOCK TABLE transactions IN EXCLUSIVE MODE"
    );

    const balanceResult = await client.query(`
        SELECT COALESCE(
            SUM(
                CASE
                    WHEN type = 'CREDIT' THEN amount
                    ELSE -amount
                END
            ),
            0
        ) AS balance
        FROM transactions
    `);

    const balance = Number(balanceResult.rows[0].balance);

    let type = Math.random() < 0.5 ? "CREDIT" : "DEBIT";
    const amount = Number(
        (Math.random() * 4900 + 100).toFixed(2)
    );

    const personName =
        names[Math.floor(Math.random() * names.length)];

    const appName =
        paymentApps[Math.floor(Math.random() * paymentApps.length)];

    // Cancel a debit that exceeds the available balance.
    if (type === "DEBIT" && amount > balance) {
        await client.query("COMMIT");

        return res.status(200).json({
            message: "Transaction Cancelled",
            cancelled: true,
            transaction: {
                type: "DEBIT",
                amount: amount.toFixed(2),
                person_name: personName,
                app_name: appName,
                description: "Insufficient balance",
                created_at: new Date().toISOString()
            }
        });
    }

    const description =
        type === "CREDIT"
            ? `Money received from ${personName}`
            : `Money sent to ${personName}`;

    const result = await client.query(
        `INSERT INTO transactions
            (person_name, amount, type, description, app_name)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [personName, amount, type, description, appName]
    );

    await client.query("COMMIT");

    return res.status(201).json({
        message: "Transaction generated successfully",
        cancelled: false,
        transaction: result.rows[0]
    });
} catch (error) {
    await client.query("ROLLBACK");

    console.error("Transaction generation error:", error);

    return res.status(500).json({
        message: "Failed to generate transaction"
    });
} finally {
    client.release();
}


});

// Get transaction history.
router.get("/", async (req, res) => {
try {
const result = await pool.query(`             SELECT *
            FROM transactions
            ORDER BY created_at DESC, id DESC
        `);


    return res.json({
        count: result.rows.length,
        transactions: result.rows
    });
} catch (error) {
    console.error("Transaction history error:", error);

    return res.status(500).json({
        message: "Failed to fetch transactions"
    });
}


});

// Get transaction summary.
router.get("/summary", async (req, res) => {
try {
const result = await pool.query(`             SELECT
                COALESCE(
                    SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END),
                    0
                ) AS "totalCredits",
                COALESCE(
                    SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END),
                    0
                ) AS "totalDebits",
                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'CREDIT' THEN amount
                            ELSE -amount
                        END
                    ),
                    0
                ) AS "netBalance",
                COUNT(*) AS "transactionCount"
            FROM transactions
        `);


    return res.json(result.rows[0]);
} catch (error) {
    console.error("Transaction summary error:", error);

    return res.status(500).json({
        message: "Failed to fetch transaction summary"
    });
}


});

module.exports = router;

// Get monthly summary grouped by app.
router.get("/monthly", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') AS month,
                DATE_TRUNC('month', created_at) AS month_start,
                COALESCE(
                    SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END),
                    0
                ) AS "totalCredits",
                COALESCE(
                    SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END),
                    0
                ) AS "totalDebits",
                COALESCE(
                    SUM(
                        CASE
                            WHEN type = 'CREDIT' THEN amount
                            ELSE -amount
                        END
                    ),
                    0
                ) AS "netBalance",
                COUNT(*) AS "transactionCount"
            FROM transactions
            GROUP BY DATE_TRUNC('month', created_at)
            ORDER BY month_start ASC
        `);

        return res.json(result.rows);
    } catch (error) {
        console.error("Monthly summary error:", error);

        return res.status(500).json({
            message: "Failed to fetch monthly summary"
        });
    }
});

// Get spending breakdown per payment app.
router.get("/by-app", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                app_name AS "appName",
                COUNT(*) AS "transactionCount",
                COALESCE(
                    SUM(CASE WHEN type = 'CREDIT' THEN amount ELSE 0 END),
                    0
                ) AS "totalCredits",
                COALESCE(
                    SUM(CASE WHEN type = 'DEBIT' THEN amount ELSE 0 END),
                    0
                ) AS "totalDebits",
                COALESCE(SUM(amount), 0) AS "totalVolume"
            FROM transactions
            GROUP BY app_name
            ORDER BY "totalVolume" DESC
        `);

        return res.json(result.rows);
    } catch (error) {
        console.error("Per-app summary error:", error);

        return res.status(500).json({
            message: "Failed to fetch per-app summary"
        });
    }
});
