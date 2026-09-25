import { Pool } from "pg";

// Strip ?sslmode=... from the URL so it doesn't override the ssl object below.
// Aiven uses a self-signed cert chain, so we must set rejectUnauthorized: false
// explicitly via the ssl option (URL-level sslmode=require would override this).
const connectionString = (process.env.DATABASE_URL ?? "").replace(
    /[?&]sslmode=[^&]*/,
    ""
);

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