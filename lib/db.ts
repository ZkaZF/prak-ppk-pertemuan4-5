import { Pool } from "pg";

let connectionString = process.env.DATABASE_URL?? "";
// Ambil base URL aja tanpa?query, karena ssl kita set manual di bawah
connectionString = connectionString.split("?")[0];

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false,
    },
    connectionTimeoutMillis: 10000,
    idleTimeoutMillis: 30000,
    max: 10,
});

pool.connect((err, _client, done) => {
    if (err) {
        console.error("[db] Connection error:", err.message);
    } else {
        console.log("[db] Connected to PostgreSQL ✓");
        done();
    }
});

export default pool;
