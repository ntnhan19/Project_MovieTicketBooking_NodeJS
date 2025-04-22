// backend/src/routes/ticketRoutes.js
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Routes cho vé
router.post('/', authenticate, ticketController.createTicket);
router.get('/:id', authenticate, ticketController.getTicketById);
router.get('/user/:userId', authenticate, ticketController.getTicketsByUserId);
router.get('/payment/:paymentId', authenticate, ticketController.getTicketsByPaymentId);
router.put('/update-payment', authenticate, ticketController.updateTicketsPayment);
router.put('/:id/status', authenticate, ticketController.updateTicketStatus);
router.put('/batch-status', authenticate, ticketController.updateTicketsStatus);
router.delete('/:id', authenticate, ticketController.deleteTicket);
router.post('/:id/promotion', authenticate, ticketController.applyPromotion);

// Routes cho ghế
router.get('/showtime/:showtimeId', ticketController.getSeatsByShowtime);
router.post('/lock/:id', authenticate, ticketController.lockSeat);
router.post('/unlock/:id', authenticate, ticketController.unlockSeat);

// Admin Routes
router.get('/', authenticate, authorizeRoles(['ADMIN']), ticketController.getAllTickets);

module.exports = router;