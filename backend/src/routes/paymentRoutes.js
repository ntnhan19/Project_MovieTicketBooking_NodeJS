// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Routes không cần xác thực
router.post('/webhook', paymentController.paymentWebhook); // Webhook tổng hợp
router.post('/zalopay-callback', paymentController.zaloPayCallback); // Callback từ ZaloPay
router.get('/zalopay-result', paymentController.zaloPayRedirect); // Redirect từ ZaloPay sau khi thanh toán

// Routes cần xác thực
router.get('/ticket/:ticketId', authenticate, paymentController.getPaymentByTicketId);
router.get('/:id/check-status', authenticate, paymentController.checkZaloPayStatus);
router.get('/:id', authenticate, paymentController.getPaymentById);
router.post('/', authenticate, paymentController.createPayment);

// Routes dành cho user
router.post('/user-payment', authenticate, paymentController.createPayment);
router.patch('/:id/status', authenticate, paymentController.updatePaymentStatus); // User có thể hủy thanh toán

// Routes dành cho admin
router.put('/:id/status', authenticate, authorizeRoles('ADMIN'), paymentController.updatePaymentStatus);
router.post('/:id/simulate-success', authenticate, authorizeRoles('ADMIN'), paymentController.simulatePaymentSuccess);

module.exports = router;