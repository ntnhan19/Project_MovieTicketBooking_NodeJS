// backend/src/routes/promotionRoutes.js
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Routes công khai
router.get('/', promotionController.getAllPromotions);
router.get('/:id', promotionController.getPromotionById);
router.get('/code/:code', promotionController.getPromotionByCode);
router.get('/validate/:code', promotionController.validatePromotionCode);

// Routes yêu cầu quyền admin
router.post('/', authenticate, authorizeRoles('ADMIN'), promotionController.createPromotion);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), promotionController.updatePromotion);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), promotionController.deletePromotion);

module.exports = router;