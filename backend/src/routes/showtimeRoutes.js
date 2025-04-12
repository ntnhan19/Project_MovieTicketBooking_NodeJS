//backend/src/routes/showtimeRoutes.js
const express = require('express');
const router = express.Router();
const showtimeController = require('../controllers/showtimeController');

// CRUD Showtime
router.post('/', showtimeController.createShowtime);
router.get('/', showtimeController.getAllShowtimes);
router.get('/:id', showtimeController.getShowtimeById);
router.put('/:id', showtimeController.updateShowtime);
router.delete('/:id', showtimeController.deleteShowtime);

module.exports = router;
