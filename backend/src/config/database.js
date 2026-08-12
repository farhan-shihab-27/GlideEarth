/**
 * ============================================================================
 * GLIDEEARTH — DATABASE CONNECTION POOL
 * ============================================================================
 * Sets up a high-performance `pg.Pool` for PostgreSQL, optimized for the
 * ad-campaign-driven traffic spikes this platform will experience.
 *
 * ARCHITECTURE NOTES:
 * ───────────────────
 * • The pool maintains `min` warm connections at all times, scaling up to
 *   `max` under load. This eliminates cold-start latency on traffic bursts.
 *
 * • `idleTimeoutMillis` controls how long an unused connection stays open.
 *   Set to 30s — long enough to survive between page navigations, short
 *   enough to reclaim resources during quiet periods.
 *
 * • `connectionTimeoutMillis` caps how long a request waits for a free
 *   connection. At 5s, we fail fast rather than queue indefinitely —
 *   the frontend can retry or show a graceful error.
 *
 * • `statement_timeout` kills any query running longer than 30s to prevent
 *   a single rogue query from hogging a connection slot.
 *
 * PGBOUNCER READINESS:
 * ───────────────────
 * When you add PgBouncer in front of PostgreSQL, reduce `pool.max` here
 * to match PgBouncer's `default_pool_size` and set `pool.min` to 0.
 * PgBouncer will handle warm connection management at that point.
 * ============================================================================
 */

const { Pool } = require('pg');
const config = require('./environment');

// ============================================================================
// POOL INSTANTIATION
// ============================================================================

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,

  // --- Pool Sizing ---
  // `max`: Upper bound on simultaneous connections.
  //        20 is a strong default for a single Node.js process.
  //        Scale horizontally with multiple processes, not a larger pool.
  max: config.db.pool.max,

  // `min`: Warm connections kept alive even during idle periods.
  //        These are ready instantly when an ad-click spike hits.
  min: config.db.pool.min,

  // --- Timeouts ---
  // How long an idle connection sits in the pool before being destroyed.
  idleTimeoutMillis: config.db.pool.idleTimeoutMs,

  // How long a client waits to acquire a connection from the pool.
  // Fail fast at 5s — better to return a 503 than hang the request.
  connectionTimeoutMillis: config.db.pool.connectionTimeoutMs,

  // --- Connection-Level Defaults ---
  // Applied to every new connection when it's created.
  options: `-c statement_timeout=30000 -c idle_in_transaction_session_timeout=60000`,
});

// ============================================================================
// POOL EVENT LISTENERS — Observability & Debugging
// ============================================================================

pool.on('connect', (client) => {
  console.log(`[DB POOL] New connection established (total: ${pool.totalCount}, idle: ${pool.idleCount}, waiting: ${pool.waitingCount})`);
});

pool.on('acquire', () => {
  // Fires every time a client is checked out — useful for monitoring under load.
  // Keep this silent in production to avoid log spam; enable via debug flag.
  if (config.isDevelopment) {
    console.log(`[DB POOL] Connection acquired (idle: ${pool.idleCount}, waiting: ${pool.waitingCount})`);
  }
});

pool.on('remove', () => {
  console.log(`[DB POOL] Connection removed (total: ${pool.totalCount})`);
});

pool.on('error', (err) => {
  // Unexpected errors on idle clients — log but don't crash.
  // The pool will automatically replace the dead connection.
  console.error('[DB POOL] Unexpected error on idle client:', err.message);
});

// ============================================================================
// QUERY HELPER — Convenience wrapper around pool.query()
// ============================================================================

/**
 * Execute a parameterized SQL query against the pool.
 * Returns the full result object from `pg`.
 *
 * @param {string} text   - SQL query string with $1, $2, ... placeholders.
 * @param {Array}  params - Parameter values (auto-sanitized by pg).
 * @returns {Promise<import('pg').QueryResult>}
 *
 * @example
 *   const { rows } = await db.query(
 *     'SELECT * FROM products WHERE slug = $1 AND deleted_at IS NULL',
 *     ['custom-lighter-01']
 *   );
 */
async function query(text, params = []) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;

  // Log slow queries (> 200ms) in all environments for observability
  if (duration > 200) {
    console.warn(`[DB SLOW QUERY] ${duration}ms | ${text.substring(0, 120)}...`);
  }

  return result;
}

// ============================================================================
// TRANSACTION HELPER — For multi-step atomic operations (e.g., order creation)
// ============================================================================

/**
 * Execute a callback within a database transaction.
 * Automatically commits on success, rolls back on error.
 *
 * @param {Function} callback - Async function receiving a dedicated `client`.
 * @returns {Promise<*>} Whatever the callback returns.
 *
 * @example
 *   const order = await db.transaction(async (client) => {
 *     const { rows: [order] } = await client.query('INSERT INTO orders ...', [...]);
 *     await client.query('INSERT INTO order_items ...', [...]);
 *     return order;
 *   });
 */
async function transaction(callback) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

// ============================================================================
// HEALTH CHECK — Used by readiness probes and /health endpoint
// ============================================================================

/**
 * Verify the database is reachable and responding.
 * Returns pool statistics for monitoring dashboards.
 */
async function healthCheck() {
  const start = Date.now();
  await pool.query('SELECT 1');
  return {
    status: 'healthy',
    responseTimeMs: Date.now() - start,
    pool: {
      total: pool.totalCount,
      idle: pool.idleCount,
      waiting: pool.waitingCount,
    },
  };
}

// ============================================================================
// GRACEFUL SHUTDOWN — Called from server.js on SIGTERM/SIGINT
// ============================================================================

/**
 * Drain all connections cleanly. Waits for active queries to finish,
 * then closes every connection in the pool.
 */
async function shutdown() {
  console.log('[DB POOL] Draining connections...');
  await pool.end();
  console.log('[DB POOL] All connections closed.');
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  pool,
  query,
  transaction,
  healthCheck,
  shutdown,
};
