const { Client } = require("pg");
const fs = require("fs");
require("dotenv").config({ path: ".env.local" });

const connectionString = (process.env.DATABASE_URL || "").replace(/[?&]sslmode=[^&]*/, "");

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
