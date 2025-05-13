// backend/src/routes/concessionItemRoutes.js
const express = require('express');
const router = express.Router();
const concessionItemController = require('../controllers/concessionItemController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Public routes
router.get('/', concessionItemController.getAllItems);
router.get('/popular', concessionItemController.getPopularItems); // Route mới cho popular items
router.get('/available', concessionItemController.getAllAvailableItems); // Route mới cho available items
router.get('/search', concessionItemController.searchItems); // Route mới cho search items
router.get('/category/:categoryId', concessionItemController.getItemsByCategory);
router.get('/category/:categoryId/available', concessionItemController.getAvailableItemsByCategory); // Route mới cho available items by category
router.get('/:id', concessionItemController.getItemById);

// Admin routes - protected
router.post('/', authenticate, authorizeRoles('ADMIN'), concessionItemController.createItem);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), concessionItemController.updateItem);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), concessionItemController.deleteItem);
router.patch('/:id/toggle-availability', authenticate, authorizeRoles('ADMIN'), concessionItemController.toggleItemAvailability);

module.exports = router;