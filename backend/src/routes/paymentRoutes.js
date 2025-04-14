const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
console.log('paymentController:', paymentController); // Giả sử bạn đã tạo controller cho thanh toán
const { authenticate } = require('../middlewares/authMiddlewares'); // Giả sử bạn có middleware xác thực

// Routes cho thanh toán
router.post('/payments', authenticate, paymentController.createPayment);
router.get('/payments/:id', authenticate, paymentController.getPaymentById);
router.get('/payments/ticket/:ticketId', authenticate, paymentController.getPaymentByTicketId);
router.put('/payments/:id/status', authenticate, paymentController.updatePaymentStatus);
router.post('/payments/webhook', paymentController.paymentWebhook); // Webhook không cần xác thực

module.exports = router;