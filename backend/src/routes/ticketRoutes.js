const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// ===== Admin Routes =====
// Các route tĩnh dành cho admin
router.get('/', authenticate, authorizeRoles("ADMIN"), ticketController.getAllTickets);
router.get('/stats', authenticate, authorizeRoles("ADMIN"), ticketController.getTicketStats);
router.post('/validate-qr', authenticate, authorizeRoles("ADMIN"), ticketController.validateTicketQR);
router.post('/qr-info', authenticate, authorizeRoles("ADMIN"), ticketController.getQRInfo);
router.put('/cancel-multiple', authenticate, authorizeRoles("ADMIN"), ticketController.cancelMultipleTickets);

// ===== User Routes =====
// Tạo vé
router.post('/', authenticate, ticketController.createTicket);

router.get('/user/:userId', authenticate, ticketController.getTicketsByUserId);
router.get('/stats/user/:userId', authenticate, ticketController.getUserTicketStats);
router.get('/payment/:paymentId', authenticate, ticketController.getTicketsByPaymentId);
router.get('/seat/:seatId', authenticate, ticketController.getTicketBySeatId);

// Ticket update routes (tĩnh trước, động sau)
router.put('/update-payment', authenticate, ticketController.updateTicketsPayment);
router.put('/batch-status', authenticate, ticketController.updateTicketsStatus);

// Ticket-specific routes (động, nhóm lại theo :id)
router.get('/:id', authenticate, ticketController.getTicketById);
router.get('/:id/full-details', authenticate, ticketController.getTicketWithFullDetails);
router.get('/:id/qr/generate', authenticate, ticketController.generateTicketQR);
router.get('/:id/qr-status', authenticate, ticketController.checkQRStatus);
router.get('/:id/can-cancel', authenticate, ticketController.canCancelTicket);
router.put('/:id/status', authenticate, ticketController.updateTicketStatus);
router.put('/:id/cancel', authenticate, ticketController.cancelTicket);
router.post('/:id/promotion', authenticate, ticketController.applyPromotion);
router.delete('/:id', authenticate, ticketController.deleteTicket);

module.exports = router;