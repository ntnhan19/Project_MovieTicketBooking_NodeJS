// backend/src/routes/promotionRoutes.js
const express = require('express');
const router = express.Router();
const promotionController = require('../controllers/promotionController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Routes công khai
router.get('/', promotionController.getAllPromotions);
// Đặt route cụ thể cho edit trước route parameter
router.get('/code/:code', promotionController.getPromotionByCode);
router.get('/validate/:code', promotionController.validatePromotionCode);
// Route xử lý ID số - đặt sau các route cụ thể
router.get('/:id([0-9]+)', promotionController.getPromotionById);

// Routes yêu cầu quyền admin
router.post('/', authenticate, authorizeRoles('ADMIN'), promotionController.createPromotion);
router.put('/:id([0-9]+)', authenticate, authorizeRoles('ADMIN'), promotionController.updatePromotion);
router.delete('/:id([0-9]+)', authenticate, authorizeRoles('ADMIN'), promotionController.deletePromotion);

module.exports = router;