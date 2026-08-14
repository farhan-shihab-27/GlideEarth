/**
 * ============================================================================
 * GLIDEEARTH — DATABASE SCHEMA RUNNER
 * ============================================================================
 * Executes `database/schema.sql` against the configured PostgreSQL instance
 * (Aiven Cloud in production/staging, local Postgres in development).
 *
 * USAGE:
 *   npm run db:schema
 *
 * NOTES:
 * ──────
 * • This script uses the raw `pg.Pool` directly (not the app's query
 *   wrapper) because DDL scripts are multi-statement and run once, outside
 *   the request/response lifecycle the rest of the app is built around.
 * • Running this against a database that already has these tables will
 *   fail on the first `CREATE TABLE` / `CREATE TYPE` — which is the correct,
 *   safe behavior for a schema that should only ever be applied once to a
 *   fresh database.
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { pool, shutdown } = require('../src/config/database');

const SCHEMA_PATH = path.resolve(__dirname, '../../database/schema.sql');

async function runSchema() {
  console.log('[SCHEMA] Reading schema file:', SCHEMA_PATH);

  if (!fs.existsSync(SCHEMA_PATH)) {
    throw new Error(`Schema file not found at ${SCHEMA_PATH}`);
  }

  const sql = fs.readFileSync(SCHEMA_PATH, 'utf8');

  console.log('[SCHEMA] Connecting to database...');
  const client = await pool.connect();

  try {
    console.log('[SCHEMA] Executing schema.sql (this creates all tables, enums, indexes & triggers)...');
    // The Postgres "simple query" protocol (used when no params are passed)
    // supports multiple semicolon-separated statements in a single call —
    // exactly what a DDL script needs.
    await client.query(sql);
    console.log('[SCHEMA] ✔ Schema applied successfully.');
  } finally {
    client.release();
  }
}

runSchema()
  .then(async () => {
    await shutdown();
    console.log('[SCHEMA] Done. Connection pool closed.');
    process.exit(0);
  })
  .catch(async (err) => {
    console.error('[SCHEMA] ✘ Failed to apply schema:');
    console.error(err.message);
    if (err.code === '42P07' || err.code === '42710') {
      console.error(
        '[SCHEMA] Hint: it looks like the schema (or part of it) already exists. ' +
        'This script is meant to run once against a fresh database.'
      );
    }
    await shutdown();
    process.exit(1);
  });
