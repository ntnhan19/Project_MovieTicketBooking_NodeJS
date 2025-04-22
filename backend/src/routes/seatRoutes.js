// backend/src/routes/seatRoutes.js
const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const { authenticate } = require('../middlewares/authMiddlewares');

// Lấy tất cả ghế của một suất chiếu
router.get('/showtime/:showtimeId', seatController.getSeatsByShowtime);

// Lấy thông tin chi tiết của ghế
router.get('/:id', seatController.getSeatById);

// Lấy layout ghế theo phòng
router.get('/hall/:hallId', seatController.getSeatLayoutByHall);

// Cập nhật thông tin ghế (yêu cầu đăng nhập + quyền admin)
router.put('/:id', authenticate, seatController.updateSeat);

// Khóa/mở khóa ghế (yêu cầu đăng nhập)
router.post('/lock', authenticate, seatController.lockMultipleSeats);
router.post('/unlock', authenticate, seatController.unlockMultipleSeats);

module.exports = router;