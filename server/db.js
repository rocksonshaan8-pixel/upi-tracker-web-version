const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL
        ? { rejectUnauthorized: false }
        : false,
});

pool.on("error", (error) => {
    console.error("Unexpected PostgreSQL connection error:", error);
});

module.exports = pool;