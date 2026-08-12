/**
 * ============================================================================
 * GLIDEEARTH — ENVIRONMENT CONFIGURATION
 * ============================================================================
 * Centralizes all environment variable access with validation and defaults.
 * Every config value flows through this single module — no scattered
 * `process.env` calls throughout the codebase.
 * ============================================================================
 */

const dotenv = require('dotenv');
const path = require('path');

// Load .env from the backend root directory
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

/**
 * Helper: Read an env variable with an optional default.
 * Throws immediately on missing required variables to fail fast at startup.
 */
function getEnv(key, defaultValue = undefined) {
  const value = process.env[key] || defaultValue;
  if (value === undefined) {
    throw new Error(`[CONFIG] Missing required environment variable: ${key}`);
  }
  return value;
}

/**
 * Helper: Parse an env variable as an integer.
 */
function getEnvInt(key, defaultValue) {
  return parseInt(getEnv(key, String(defaultValue)), 10);
}

// ============================================================================
// EXPORTED CONFIGURATION OBJECT
// ============================================================================

const config = {
  // --- Server ---
  nodeEnv: getEnv('NODE_ENV', 'development'),
  port: getEnvInt('PORT', 5000),
  isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
  isProduction: getEnv('NODE_ENV', 'development') === 'production',

  // --- Database ---
  db: {
    host: getEnv('DB_HOST', 'localhost'),
    port: getEnvInt('DB_PORT', 5432),
    database: getEnv('DB_NAME', 'glideearth'),
    user: getEnv('DB_USER', 'postgres'),
    password: getEnv('DB_PASSWORD'),

    // Connection pool tuning knobs
    pool: {
      max: getEnvInt('DB_POOL_MAX', 20),
      min: getEnvInt('DB_POOL_MIN', 5),
      idleTimeoutMs: getEnvInt('DB_POOL_IDLE_TIMEOUT_MS', 30000),
      connectionTimeoutMs: getEnvInt('DB_POOL_CONNECTION_TIMEOUT_MS', 5000),
    },
  },

  // --- Rate Limiting ---
  rateLimit: {
    windowMs: getEnvInt('RATE_LIMIT_WINDOW_MS', 900000),   // 15 minutes
    maxRequests: getEnvInt('RATE_LIMIT_MAX_REQUESTS', 200),
  },

  // --- CORS ---
  corsOrigin: getEnv('CORS_ORIGIN', 'http://localhost:3000'),
};

module.exports = config;
