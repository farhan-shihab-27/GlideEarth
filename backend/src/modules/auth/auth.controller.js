/**
 * @module AuthController
 * @description Controller layer for the authentication module.
 * This file handles incoming HTTP requests, extracts parameters, validates initial input presence,
 * delegates complex operations to the Service layer, and structures the HTTP response using standard envelopes.
 */

const authService = require('./auth.service');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/apiResponse');

class AuthController {
  /**
   * Handles the login request for admin users.
   * Extracts credentials from the request body and utilizes the AuthService for authentication.
   *
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>} Sends a standardized JSON response on successful login.
   * @throws {AppError} Throws a bad request error if email or password is missing.
   */
  async login(req, res) {
    const { email, password } = req.body;

    // Basic input validation: ensure both email and password are provided
    if (!email || !password) {
      throw AppError.badRequest('Email and password are required.');
    }

    // Delegate authentication logic to the service layer
    const result = await authService.login(email, password);

    // Send successful response using standard API response utility
    sendSuccess(res, {
      statusCode: 200,
      message: 'Login successful.',
      data: result,
    });
  }
}

module.exports = new AuthController();
