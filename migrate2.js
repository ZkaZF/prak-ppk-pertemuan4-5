const { Client } = require("pg");
const fs = require("fs");

let envStr = "";
try { envStr = fs.readFileSync(".env.local", "utf8"); } catch(e) {}
let dbUrl = "";
envStr.split("\n").forEach(l => {
  if (l.startsWith("DATABASE_URL=")) dbUrl = l.split("=").slice(1).join("=").trim();
});

const connectionString = dbUrl.replace(/[?&]sslmode=[^&]*/, "");

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    console.log("Connected to DB");
    const sql = fs.readFileSync("schema.sql", "utf-8");
    await client.query(sql);
    console.log("Schema applied successfully.");
  } catch (err) {
    console.error("Error applying schema:", err);
  } finally {
    await client.end();
  }
}

run();
