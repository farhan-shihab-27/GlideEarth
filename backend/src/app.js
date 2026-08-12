/**
 * ============================================================================
 * GLIDEEARTH — EXPRESS APPLICATION SETUP
 * ============================================================================
 * Configures the Express app with all middleware, security headers,
 * routes, and error handlers.
 *
 * MIDDLEWARE ORDER (Critical):
 * ────────────────────────────
 * 1. Security middleware (helmet, cors, hpp, rate-limit)
 * 2. Body parsers (JSON, URL-encoded)
 * 3. Compression (gzip responses)
 * 4. Request logging (morgan)
 * 5. Application routes
 * 6. 404 handler (catches unmatched routes)
 * 7. Global error handler (catches all thrown/rejected errors)
 *
 * This file DOES NOT call app.listen(). That responsibility belongs
 * to server.js, which handles process lifecycle and graceful shutdown.
 * ============================================================================
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const hpp = require('hpp');

const { config, db } = require('./config');
const apiRoutes = require('./routes');
const notFoundHandler = require('./middleware/notFound');
const globalErrorHandler = require('./middleware/errorHandler');
const { sendSuccess } = require('./utils/apiResponse');

const app = express();

// ============================================================================
// 1. SECURITY MIDDLEWARE
// ============================================================================

// Helmet: Sets various HTTP security headers (X-Content-Type-Options,
// Strict-Transport-Security, X-Frame-Options, etc.)
app.use(helmet());

// CORS: Allow requests from the frontend origin
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400, // Cache preflight for 24 hours
}));

// HPP: Protect against HTTP Parameter Pollution attacks
app.use(hpp());

// Rate Limiting: Prevent brute-force and DDoS on API endpoints
const limiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again later.',
    data: null,
  },
});
app.use('/api', limiter);

// ============================================================================
// 2. BODY PARSERS
// ============================================================================

// Parse JSON bodies (limit to 10KB to prevent payload attacks)
app.use(express.json({ limit: '10kb' }));

// Parse URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ============================================================================
// 3. COMPRESSION
// ============================================================================

// Compress all responses with gzip — critical for reducing payload size
// on the ad-click → storefront hot path
app.use(compression());

// ============================================================================
// 4. REQUEST LOGGING
// ============================================================================

// Use 'dev' format in development (colored, concise), 'combined' in production
if (config.isDevelopment) {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ============================================================================
// 5. HEALTH CHECK ENDPOINT
// ============================================================================

/**
 * GET /health
 * Readiness probe — checks database connectivity and returns pool stats.
 * Used by load balancers and container orchestrators (K8s, ECS, etc.)
 */
app.get('/health', async (_req, res) => {
  try {
    const dbHealth = await db.healthCheck();
    return sendSuccess(res, {
      message: 'Glideearth API is healthy.',
      data: {
        status: 'operational',
        uptime: `${Math.floor(process.uptime())}s`,
        database: dbHealth,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return res.status(503).json({
      success: false,
      message: 'Service unhealthy: database unreachable.',
      data: null,
    });
  }
});

// ============================================================================
// 6. APPLICATION ROUTES
// ============================================================================

app.use('/api/v1', apiRoutes);

// ============================================================================
// 7. ERROR HANDLING (Must be LAST)
// ============================================================================

// Catch requests that don't match any route
app.use(notFoundHandler);

// Global error handler — catches everything
app.use(globalErrorHandler);

module.exports = app;
