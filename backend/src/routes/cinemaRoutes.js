// backend/src/routes/cinemaRoutes.js
const express = require('express');
const router = express.Router();
const cinemaController = require('../controllers/cinemaController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Routes công khai
router.get('/', cinemaController.getAllCinemas);
router.get('/:id', cinemaController.getCinemaById);
router.get('/:cinemaId/halls', cinemaController.getHallsByCinema);

// Routes yêu cầu quyền admin
router.post('/', authenticate, authorizeRoles('ADMIN'), cinemaController.createCinema);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), cinemaController.updateCinema);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), cinemaController.deleteCinema);
router.post('/:cinemaId/halls', authenticate, authorizeRoles('ADMIN'), cinemaController.createHall);

module.exports = router;