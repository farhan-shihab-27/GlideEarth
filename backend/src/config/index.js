/**
 * ============================================================================
 * GLIDEEARTH — CONFIG BARREL EXPORT
 * ============================================================================
 * Single import point for all configuration modules.
 *
 * Usage:
 *   const { config, db } = require('../config');
 * ============================================================================
 */

const config = require('./environment');
const db = require('./database');

module.exports = { config, db };
