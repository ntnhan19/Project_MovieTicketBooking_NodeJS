const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { authenticate } = require('../middlewares/authMiddlewares'); // Giả sử bạn có middleware xác thực

// Routes cho vé
router.post('/tickets', authenticate, ticketController.createTicket);
router.get('/tickets', authenticate, ticketController.getAllTickets);
router.get('/tickets/:id', authenticate, ticketController.getTicketById);
router.get('/tickets/user/:userId', authenticate, ticketController.getTicketsByUserId);
router.put('/tickets/:id/status', authenticate, ticketController.updateTicketStatus);

// Routes cho ghế
router.get('/seats/showtime/:showtimeId', ticketController.getSeatsByShowtime);
router.post('/seats/:id/lock', authenticate, ticketController.lockSeat);
router.post('/seats/:id/unlock', authenticate, ticketController.unlockSeat);

module.exports = router;