require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
});

(async () => {
    await pool.query(
        "ALTER TABLE transactions ADD COLUMN IF NOT EXISTS app_name VARCHAR(50)"
    );

    await pool.query(`
        UPDATE transactions
        SET app_name = CASE
            WHEN id % 5 = 1 THEN 'Google Pay'
            WHEN id % 5 = 2 THEN 'PhonePe'
            WHEN id % 5 = 3 THEN 'Paytm'
            WHEN id % 5 = 4 THEN 'BHIM'
            ELSE 'Amazon Pay'
        END
        WHERE app_name IS NULL
    `);

    console.log("app_name column added and backfilled.");
    await pool.end();
})().catch((err) => {
    console.error(err.message);
    pool.end();
});
