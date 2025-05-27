// backend/src/routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// ===== Admin Routes =====
router.get('/', authenticate, authorizeRoles("ADMIN"), ticketController.getAllTickets);
router.get('/stats', authenticate, authorizeRoles("ADMIN"), ticketController.getTicketStats);
router.post('/validate-qr', authenticate, authorizeRoles("ADMIN"), ticketController.validateTicketQR);

// ===== User Routes =====
router.post('/', authenticate, ticketController.createTicket);

router.get('/seat/:seatId', authenticate, ticketController.getTicketBySeatId);
router.get('/user/:userId', authenticate, ticketController.getTicketsByUserId);
router.get('/payment/:paymentId', authenticate, ticketController.getTicketsByPaymentId);

router.put('/update-payment', authenticate, ticketController.updateTicketsPayment);
router.put('/batch-status', authenticate, ticketController.updateTicketsStatus);
router.put('/:id/status', authenticate, ticketController.updateTicketStatus);
router.post('/:id/promotion', authenticate, ticketController.applyPromotion);
router.get('/:id/qr', authenticate, ticketController.generateTicketQR);

router.get('/:id', authenticate, ticketController.getTicketById);
router.delete('/:id', authenticate, ticketController.deleteTicket);

module.exports = router;