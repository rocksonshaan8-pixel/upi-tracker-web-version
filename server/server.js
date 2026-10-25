const express = require("express");
const cors = require("cors");
require("dotenv").config();

const pool = require("./db");
const transactionRoutes = require("./routes/transactions");
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/transactions", transactionRoutes);

// Test route
app.get("/", (req, res) => {
res.json({
message: "UPI Tracker Backend is running!"
});
});

// Test PostgreSQL connection
app.get("/api/health", async (req, res) => {
try {
const result = await pool.query(
"SELECT current_database() AS database, NOW() AS time"
);


    res.json({
        status: "healthy",
        database: result.rows[0].database,
        time: result.rows[0].time
    });
} catch (error) {
    console.error("Database health check failed:", error.message);

    res.status(500).json({
        status: "error",
        message: "Database connection failed"
    });
}


});

// Start server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
console.log(`UPI Tracker backend running on port ${PORT}`);
});
