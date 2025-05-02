const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { checkTicketPurchase } = require('../middlewares/ticketCheckMiddleware');
const { authenticate } = require('../middlewares/authMiddlewares');

// Routes công khai
router.get('/movie/:movieId', reviewController.getReviewsByMovie);
router.get('/stats/movie/:movieId', reviewController.getReviewStatsByMovie);

// Routes yêu cầu đăng nhập
router.get('/user/:userId', authenticate, reviewController.getReviewsByUser);
router.get('/check-eligibility/:movieId', authenticate, reviewController.checkReviewEligibility);
router.post('/', authenticate, checkTicketPurchase, reviewController.createReview);
router.put('/:id', authenticate, reviewController.updateReview);
router.delete('/:id', authenticate, reviewController.deleteReview);

router.get('/:id', reviewController.getReviewById);

module.exports = router;
