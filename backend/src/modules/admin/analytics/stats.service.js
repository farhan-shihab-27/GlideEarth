const statsRepository = require('./stats.repository');

/**
 * @fileoverview Service for admin dashboard statistics
 */

const statsService = {
  /**
   * Gets aggregated dashboard statistics by fetching data concurrently
   * @returns {Promise<Object>} The dashboard statistics
   */
  getDashboardStats: async () => {
    const [totalRevenue, orderStats, lowStockProducts, recentOrders] = await Promise.all([
      statsRepository.getTotalRevenue(),
      statsRepository.getOrderStats(),
      statsRepository.getLowStockProducts(),
      statsRepository.getRecentOrders()
    ]);

    return {
      totalRevenue,
      orderStats,
      lowStockProducts,
      recentOrders
    };
  }
};

module.exports = statsService;
