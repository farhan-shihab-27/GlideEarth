/**
 * @fileoverview Payment IPN Controller
 */
const { db } = require('../../config');
const AppError = require('../../utils/AppError');
const { sendSuccess } = require('../../utils/apiResponse');

class PaymentController {
    /**
     * Handle incoming payment gateway webhook IPN
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Object} Success response
     * @throws {AppError} Bad request if missing required fields
     */
    async handleIpn(req, res) {
        const { transactionId, orderNumber, status, amount, gatewaySignature } = req.body;

        if (!transactionId || !orderNumber || !status) {
            throw AppError.badRequest('Missing required fields: transactionId, orderNumber, status');
        }

        console.log('[PAYMENT IPN] Received:', { transactionId, orderNumber, status, amount });

        // TODO: Verify gatewaySignature against shared secret (gateway-specific implementation)
        // TODO: Implement idempotency check — prevent duplicate IPN processing

        let paymentStatus;
        const upperStatus = status.toUpperCase();
        
        if (upperStatus === 'SUCCESS' || upperStatus === 'VALID') {
            paymentStatus = 'paid';
        } else if (upperStatus === 'FAILED' || upperStatus === 'INVALID' || upperStatus === 'CANCELLED') {
            paymentStatus = 'failed';
        } else {
            console.warn(`[PAYMENT IPN] Unknown status received: ${status}`);
            // Acknowledge but don't process unknown statuses
            return sendSuccess(res, { statusCode: 200, message: 'IPN acknowledged' });
        }

        const updateOrderSql = `
            UPDATE orders 
            SET payment_status = $1::payment_status, updated_at = NOW()
            WHERE order_number = $2
            RETURNING id, order_number, payment_status
        `;
        
        const { rows } = await db.query(updateOrderSql, [paymentStatus, orderNumber]);

        if (rows.length === 0) {
            console.warn(`[PAYMENT IPN] Order not found for orderNumber: ${orderNumber}`);
            // Never return errors to gateways — they'll retry indefinitely
            return sendSuccess(res, { statusCode: 200, message: 'IPN acknowledged, order not found' });
        }

        if (paymentStatus === 'paid') {
            const confirmOrderSql = `
                UPDATE orders 
                SET order_status = 'confirmed'::order_status, confirmed_at = NOW(), updated_at = NOW()
                WHERE order_number = $1 AND order_status = 'pending'
            `;
            await db.query(confirmOrderSql, [orderNumber]);
        }

        return sendSuccess(res, { statusCode: 200, message: 'IPN processed successfully.' });
    }
}

module.exports = new PaymentController();
