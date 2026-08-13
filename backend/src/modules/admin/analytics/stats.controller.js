const statsService = require('./stats.service');
const { sendSuccess } = require('../../../utils/apiResponse');

/**
 * @fileoverview Controller for admin dashboard statistics
 */

const statsController = {
  /**
   * Retrieves dashboard statistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @returns {Promise<void>}
   */
  getDashboardStats: async (req, res) => {
    const stats = await statsService.getDashboardStats();
    sendSuccess(res, {
      statusCode: 200,
      message: 'Dashboard statistics retrieved successfully.',
      data: stats
    });
  }
};

module.exports = statsController;
