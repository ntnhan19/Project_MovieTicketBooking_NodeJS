// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');
const userController = require('../controllers/userController');

// Các route cần xác thực
router.get('/me', authenticate, userController.getCurrentUser);
router.post('/change-password', authenticate, userController.changePassword);

// Các route admin
router.get('/', authenticate, authorizeRoles("ADMIN"), userController.getUsers);
router.post('/', authenticate, authorizeRoles("ADMIN"), userController.createUser);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, authorizeRoles("ADMIN"), userController.deleteUser);

module.exports = router;