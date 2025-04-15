// backend/src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const { login, register } = require("../controllers/authController");
const { authenticate, authorizeRoles } = require("../middlewares/authMiddlewares");

// Đăng ký & Đăng nhập
router.post("/register", register);
router.post("/login", login);

// Test route: chỉ dành cho admin/user
router.get("/admin-only", authenticate, authorizeRoles("ADMIN"), (req, res) => {
  res.json({ message: "Chào admin!" });
});

router.get("/user-only", authenticate, authorizeRoles("USER"), (req, res) => {
  res.json({ message: "Chào người dùng!" });
});

module.exports = router;