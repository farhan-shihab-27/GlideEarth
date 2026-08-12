/**
 * @module AuthRepository
 * @description Repository layer for the authentication module.
 * This file handles all direct database interactions using raw, parameterized SQL queries via the `pg` pool.
 * It adheres to the Controller-Service-Repository (CSR) architectural pattern, keeping SQL separate from business logic.
 */

const { db } = require('../../config');

class AuthRepository {
  /**
   * Finds an active admin user by their email address.
   * Uses parameterized queries to prevent SQL injection.
   *
   * @param {string} email - The email address of the admin to search for.
   * @returns {Promise<Object|null>} The admin user object if found, otherwise null.
   */
  async findByEmail(email) {
    const query = `
      SELECT id, username, email, password_hash, role, is_active
      FROM admin_users
      WHERE email = $1 AND deleted_at IS NULL
    `;
    const result = await db.query(query, [email]);
    return result.rows[0] || null;
  }

  /**
   * Updates the last login timestamp for an admin user.
   *
   * @param {number|string} id - The unique identifier of the admin user.
   * @returns {Promise<void>}
   */
  async updateLastLogin(id) {
    const query = `
      UPDATE admin_users
      SET last_login_at = NOW()
      WHERE id = $1
    `;
    await db.query(query, [id]);
  }
}

module.exports = new AuthRepository();
