// backend/src/routes/concessionComboRoutes.js
const express = require('express');
const router = express.Router();
const concessionComboController = require('../controllers/concessionComboController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Public routes
router.get('/popular', concessionComboController.getPopularCombos);
router.get('/', concessionComboController.getAllCombos);
router.get('/:id', concessionComboController.getComboById);

// Admin routes - protected
router.post('/', authenticate, authorizeRoles('ADMIN'), concessionComboController.createCombo);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), concessionComboController.updateCombo);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), concessionComboController.deleteCombo);
router.patch('/:id/toggle-availability', authenticate, authorizeRoles('ADMIN'), concessionComboController.toggleComboAvailability);

module.exports = router;