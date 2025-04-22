// backend/src/routes/movieRoutes.js
const express = require('express');
const router = express.Router();
const movieController = require('../controllers/movieController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Các route công khai
router.get('/', movieController.getAllMovies);
router.get('/upcoming', movieController.getUpcomingMovies);
router.get('/now-showing', movieController.getNowShowingMovies);
router.get('/cinema/:cinemaId', movieController.getMoviesByCinema);
router.get('/:id', movieController.getMovieById);

// Các route cần quyền admin
router.post('/', authenticate, authorizeRoles("ADMIN"), movieController.createMovie);
router.put('/:id', authenticate, authorizeRoles("ADMIN"), movieController.updateMovie);
router.delete('/:id', authenticate, authorizeRoles("ADMIN"), movieController.deleteMovie);

module.exports = router;