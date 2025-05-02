// backend/src/routes/paymentRoutes.js
const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Routes không cần xác thực
router.get('/vnpay-return', paymentController.vnpayReturn); // Return URL từ VNPay
router.post('/vnpay-ipn', paymentController.vnpayIPN); // IPN từ VNPay
router.post('/webhook', paymentController.paymentWebhook); // Webhook tổng hợp

// Routes cần xác thực người dùng
router.use(authenticate);

// Routes cho tất cả người dùng đã xác thực
router.post('/', paymentController.createPayment);
router.get('/:id', paymentController.getPaymentById);
router.get('/ticket/:ticketId', paymentController.getPaymentByTicketId);
router.get('/:id/check-vnpay-status', paymentController.checkVNPayStatus);
router.patch('/:id/status', paymentController.updatePaymentStatus); // User có thể hủy thanh toán của mình

// Routes chỉ dành cho admin
router.put('/:id/status', authorizeRoles('ADMIN'), paymentController.updatePaymentStatus);
router.post('/:id/simulate-success', authorizeRoles('ADMIN'), paymentController.simulatePaymentSuccess);

module.exports = router;