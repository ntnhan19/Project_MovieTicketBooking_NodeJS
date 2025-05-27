// backend/src/routes/concessionOrderRoutes.js
const express = require('express');
const router = express.Router();
const concessionOrderController = require('../controllers/concessionOrderController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// User routes - protected
router.get('/my-orders', authenticate, concessionOrderController.getUserOrders);
router.get('/my-orders/:id', authenticate, concessionOrderController.getUserOrderById);
router.post('/with-tickets', authenticate, concessionOrderController.createOrderWithTickets);
router.post('/', authenticate, concessionOrderController.createOrder);
router.patch('/:id/cancel', authenticate, concessionOrderController.cancelOrder);
router.patch("/:id", authenticate, concessionOrderController.updateOrder);

// Admin routes - protected
// QUAN TRỌNG: Đặt route /statistics TRƯỚC route /:id
router.get('/statistics', authenticate, authorizeRoles('ADMIN'), concessionOrderController.getOrderStatistics);
router.get('/', authenticate, authorizeRoles('ADMIN'), concessionOrderController.getAllOrders);
router.get('/:id', authenticate, authorizeRoles('ADMIN'), concessionOrderController.getOrderById);
router.patch('/:id/status', authenticate, authorizeRoles('ADMIN'), concessionOrderController.updateOrderStatus);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), concessionOrderController.deleteOrder);

module.exports = router;