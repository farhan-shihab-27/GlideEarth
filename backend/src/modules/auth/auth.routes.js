/**
 * @module AuthRoutes
 * @description Routing configuration for the authentication module.
 * This file maps specific HTTP verbs and URL paths to corresponding Controller methods.
 * It wraps asynchronous route handlers with an `asyncHandler` to ensure errors are caught and passed
 * to the global error handling middleware.
 */

const express = require('express');
const authController = require('./auth.controller');
const asyncHandler = require('../../utils/asyncHandler');

const router = express.Router();

/**
 * @route POST /
 * @description Authenticates an admin user and returns a JWT.
 * @access Public (Admin Login)
 */
router.post('/', asyncHandler(authController.login.bind(authController)));

module.exports = router;
