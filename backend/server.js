/**
 * ============================================================================
 * GLIDEEARTH — SERVER ENTRY POINT
 * ============================================================================
 * Responsibilities:
 *   1. Start the HTTP server.
 *   2. Handle process-level events (uncaught exceptions, unhandled rejections).
 *   3. Implement graceful shutdown (drain DB pool, close HTTP connections).
 *
 * WHY THIS IS SEPARATE FROM app.js:
 * ──────────────────────────────────
 * app.js exports the configured Express instance — testable in isolation.
 * server.js handles process lifecycle — only runs in production/dev, never
 * imported by test files.
 * ============================================================================
 */

const app = require('./src/app');
const { config, db } = require('./src/config');

// ============================================================================
// UNCAUGHT EXCEPTION HANDLER
// ============================================================================
// Must be registered BEFORE the server starts. These are programming errors
// (bugs), not operational errors. Log and exit — the process manager (PM2,
// Docker, systemd) will restart us.

process.on('uncaughtException', (err) => {
  console.error('[FATAL] Uncaught Exception:');
  console.error(err);
  process.exit(1);
});

// ============================================================================
// START SERVER
// ============================================================================

const server = app.listen(config.port, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════════════╗
  ║                                                              ║
  ║   🌍  GLIDEEARTH API SERVER                                  ║
  ║                                                              ║
  ║   Environment:  ${config.nodeEnv.padEnd(40)}║
  ║   Port:         ${String(config.port).padEnd(40)}║
  ║   Database:     ${config.db.host}:${config.db.port}/${config.db.database}${' '.repeat(Math.max(0, 40 - `${config.db.host}:${config.db.port}/${config.db.database}`.length))}║
  ║   Pool Size:    ${String(config.db.pool.min + '-' + config.db.pool.max).padEnd(40)}║
  ║                                                              ║
  ║   Health:       http://localhost:${config.port}/health${' '.repeat(Math.max(0, 40 - `http://localhost:${config.port}/health`.length))}║
  ║   API Base:     http://localhost:${config.port}/api/v1${' '.repeat(Math.max(0, 40 - `http://localhost:${config.port}/api/v1`.length))}║
  ║                                                              ║
  ╚══════════════════════════════════════════════════════════════╝
  `);
});

// ============================================================================
// UNHANDLED REJECTION HANDLER
// ============================================================================
// Catches unhandled promise rejections (e.g., failed DB queries that
// weren't caught). In Node 15+, these would crash the process anyway.
// We log and shut down gracefully.

process.on('unhandledRejection', (err) => {
  console.error('[FATAL] Unhandled Promise Rejection:');
  console.error(err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
// Handles SIGTERM (Docker stop, K8s pod termination) and SIGINT (Ctrl+C).
// 1. Stop accepting new connections.
// 2. Wait for in-flight requests to finish.
// 3. Drain the database connection pool.
// 4. Exit cleanly.

async function gracefulShutdown(signal) {
  console.log(`\n[SHUTDOWN] Received ${signal}. Starting graceful shutdown...`);

  // 1. Stop accepting new HTTP connections
  server.close(async () => {
    console.log('[SHUTDOWN] HTTP server closed. No new connections accepted.');

    try {
      // 2. Drain the database connection pool
      await db.shutdown();
      console.log('[SHUTDOWN] Database pool drained. Goodbye.');
      process.exit(0);
    } catch (err) {
      console.error('[SHUTDOWN] Error during database shutdown:', err);
      process.exit(1);
    }
  });

  // Safety net: force exit after 10 seconds if graceful shutdown stalls
  setTimeout(() => {
    console.error('[SHUTDOWN] Graceful shutdown timed out. Forcing exit.');
    process.exit(1);
  }, 10000).unref();
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
