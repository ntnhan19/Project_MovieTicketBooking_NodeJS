// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middlewares/authMiddlewares');
const userController = require('../controllers/userController');

router.get('/', authenticate, userController.getUsers);
router.post('/', authenticate, userController.createUser);
router.get('/:id', authenticate, userController.getUserById);
router.put('/:id', authenticate, userController.updateUser);
router.delete('/:id', authenticate, userController.deleteUser);

module.exports = router;
