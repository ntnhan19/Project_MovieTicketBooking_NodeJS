// backend/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddlewares");

// Đăng ký
router.post('/register', authController.register);

// Đăng nhập
router.post('/login', authController.login);

// Gửi lại email xác thực
router.post('/resend-verification', authController.resendVerificationEmail);

// Xác thực email
router.get('/verify-email/:token', authController.verifyEmail);

// Test route: chỉ dành cho admin/user
router.get("/admin-only", authenticate, authorizeRoles("ADMIN"), (req, res) => {
  res.json({ message: "Chào admin!" });
});

router.get("/user-only", authenticate, authorizeRoles("USER"), (req, res) => {
  res.json({ message: "Chào người dùng!" });
});

module.exports = router;