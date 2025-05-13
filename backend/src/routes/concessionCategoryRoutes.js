// backend/src/routes/concessionCategoryRoutes.js
const express = require('express');
const router = express.Router();
const concessionCategoryController = require('../controllers/concessionCategoryController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Public routes
router.get('/active', concessionCategoryController.getActiveCategories);
router.get('/search', concessionCategoryController.searchCategories);
router.get('/:id/available-items', concessionCategoryController.getCategoryWithAvailableItems);
router.get('/', concessionCategoryController.getAllCategories);
router.get('/:id', concessionCategoryController.getCategoryById);

// Admin routes - protected
router.post('/', authenticate, authorizeRoles('ADMIN'), concessionCategoryController.createCategory);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), concessionCategoryController.updateCategory);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), concessionCategoryController.deleteCategory);
router.patch('/:id/toggle-status', authenticate, authorizeRoles('ADMIN'), concessionCategoryController.toggleCategoryStatus);

module.exports = router;