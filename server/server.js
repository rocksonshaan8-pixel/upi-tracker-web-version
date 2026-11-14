const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Allow multiple origins via comma-separated CORS_ORIGIN, falling back to localhost dev
const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:5173,http://localhost:4173")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser requests (curl, health checks) which have no Origin header
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: false,
};

const pool = require("./db");
const transactionRoutes = require("./routes/transactions");
const documentRoutes = require("./routes/documents");
const uploadRoutes = require("./routes/uploadRoutes");
const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use("/api/transactions", transactionRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/uploads", uploadRoutes);

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
