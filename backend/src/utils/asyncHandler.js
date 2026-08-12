/**
 * ============================================================================
 * GLIDEEARTH — ASYNC ROUTE HANDLER WRAPPER
 * ============================================================================
 * Eliminates try/catch boilerplate in every controller method.
 *
 * Without this:
 *   router.get('/products', async (req, res, next) => {
 *     try {
 *       const products = await productService.findAll();
 *       res.json(products);
 *     } catch (err) {
 *       next(err);  // Easy to forget this line!
 *     }
 *   });
 *
 * With this:
 *   router.get('/products', asyncHandler(productController.findAll));
 *
 * Any rejected promise is automatically forwarded to Express's error
 * handling middleware via `next(err)`.
 * ============================================================================
 */

/**
 * Wraps an async Express route handler to catch rejected promises.
 *
 * @param {Function} fn - Async route handler (req, res, next) => Promise<void>
 * @returns {Function} Express-compatible middleware
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
