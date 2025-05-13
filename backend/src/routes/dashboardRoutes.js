// backend/src/routes/dashboardRoutes.js
const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

/**
 * @route GET /api/dashboard
 * @desc Lấy dữ liệu dashboard
 * @access Private - Admin only
 */
router.get('/', authenticate, authorizeRoles('ADMIN'), dashboardController.getDashboardData);

module.exports = router;