// backend/src/routes/hallRoutes.js
const express = require('express');
const router = express.Router();
const hallController = require('../controllers/hallController');
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');

// Routes công khai - không cần đăng nhập
router.get('/', hallController.getAllHalls);
router.get('/:id', hallController.getHallById);
router.get('/cinema/:cinemaId', hallController.getHallsByCinema);

// Routes yêu cầu đăng nhập - chỉ cho phép người dùng đã xác thực
router.post('/', authenticate, authorizeRoles("ADMIN"), hallController.createHall);
router.put('/:id', authenticate, authorizeRoles("ADMIN"), hallController.updateHall);
router.delete('/:id', authenticate, authorizeRoles("ADMIN"), hallController.deleteHall);

module.exports = router;