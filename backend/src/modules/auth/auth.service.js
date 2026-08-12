/**
 * @module AuthService
 * @description Service layer for the authentication module.
 * This file encapsulates the core business logic, such as password verification, JWT generation,
 * and account status checks. It bridges the Controller (HTTP requests) and the Repository (Database operations).
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authRepository = require('./auth.repository');
const AppError = require('../../utils/AppError');
const { config } = require('../../config');

class AuthService {
  /**
   * Authenticates an admin user and generates a JSON Web Token (JWT).
   *
   * @param {string} email - The admin user's email address.
   * @param {string} password - The plain-text password provided by the user.
   * @returns {Promise<Object>} An object containing the JWT and the authenticated admin details.
   * @throws {AppError} Throws unauthorized if credentials are invalid, or forbidden if the account is deactivated.
   */
  async login(email, password) {
    // Retrieve admin user from the repository
    const adminUser = await authRepository.findByEmail(email);

    // Validate email and password (using generic message to prevent username enumeration)
    if (!adminUser) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    const isPasswordValid = await bcrypt.compare(password, adminUser.password_hash);
    if (!isPasswordValid) {
      throw AppError.unauthorized('Invalid email or password.');
    }

    // Check if the account is active
    if (!adminUser.is_active) {
      throw AppError.forbidden('Your account has been deactivated.');
    }

    // Update the last login timestamp
    await authRepository.updateLastLogin(adminUser.id);

    // Generate JWT payload
    const payload = {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
    };

    // Sign the JWT
    const token = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    // Return the token and sanitized admin details (exclude password hash)
    return {
      token,
      admin: {
        id: adminUser.id,
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role,
      },
    };
  }
}

module.exports = new AuthService();
