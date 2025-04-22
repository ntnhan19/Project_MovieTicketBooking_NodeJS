// backend/src/routes/reviewRoutes.js
const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Routes công khai
router.get('/', reviewController.getAllReviews);
router.get('/:id', reviewController.getReviewById);
router.get('/movie/:movieId', reviewController.getReviewsByMovie);
router.get('/user/:userId', reviewController.getReviewsByUser);
router.get('/stats/movie/:movieId', reviewController.getReviewStatsByMovie);

// Routes yêu cầu quyền admin
router.post('/', authenticate, authorizeRoles('ADMIN'), reviewController.createReview);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), reviewController.updateReview);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), reviewController.deleteReview);

module.exports = router;

