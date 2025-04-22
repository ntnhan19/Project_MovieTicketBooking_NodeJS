// backend/src/routes/showtimeRoutes.js
const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Public routes
router.get('/', showtimeController.getAllShowtimes);
router.get('/available-dates', showtimeController.getDatesByMovieAndCinema);
router.get('/filter', showtimeController.getTimesByMovieCinemaDate);
router.get('/:id', showtimeController.getShowtimeById);
router.get('/:id/seats', showtimeController.getSeatsByShowtime);

// Admin routes
router.post('/', authenticate, authorizeRoles('ADMIN'), showtimeController.createShowtime);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), showtimeController.updateShowtime);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), showtimeController.deleteShowtime);

module.exports = router;
