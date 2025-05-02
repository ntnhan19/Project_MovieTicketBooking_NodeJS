// backend/src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const { authenticate, authorizeRoles } = require('../middlewares/authMiddlewares');
const userController = require('../controllers/userController');

// === ROUTES KHÔNG CẦN XÁC THỰC ===
// Quên mật khẩu
router.post('/forgot-password', userController.forgotPassword);
// Xác thực token reset mật khẩu
router.get('/verify-reset-token/:token', userController.verifyResetToken);
// Đặt lại mật khẩu
router.post('/reset-password', userController.resetPassword);
// Xác thực email
router.get('/verify-email/:token', userController.verifyEmail);

// === ROUTES CẦN XÁC THỰC ===
// Lấy thông tin người dùng hiện tại
router.get('/me', authenticate, userController.getCurrentUser);
// Thay đổi mật khẩu
router.post('/change-password', authenticate, userController.changePassword);
// Upload avatar
router.post('/upload-avatar', authenticate, userController.uploadAvatar);
// Lấy lịch sử đặt vé của bản thân
router.get('/my-tickets', authenticate, userController.getMyTickets);
// Lấy lịch sử đánh giá của bản thân
router.get('/my-reviews', authenticate, userController.getMyReviews);

// === ROUTES ADMIN ===
// Lấy danh sách người dùng (admin only)
router.get('/', authenticate, authorizeRoles("ADMIN"), userController.getUsers);
// Tạo người dùng mới (admin only)
router.post('/', authenticate, authorizeRoles("ADMIN"), userController.createUser);
// Lấy thông tin chi tiết người dùng (admin và chủ tài khoản)
router.get('/:id', authenticate, userController.getUserById);
// Cập nhật thông tin người dùng (admin và chủ tài khoản)
router.put('/:id', authenticate, userController.updateUser);
// Xóa người dùng (admin only)
router.delete('/:id', authenticate, authorizeRoles("ADMIN"), userController.deleteUser);

module.exports = router;