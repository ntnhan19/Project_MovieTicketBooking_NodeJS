//backend/src/middlewares/authMiddlewares.js
const jwt = require("jsonwebtoken");

// Middleware kiểm tra token
const authenticate = (req, res, next) => {
  // Lấy token từ header và log token nhận được
  const authHeader = req.headers.authorization;
  console.log("[AUTH] authHeader:", authHeader);
  const token = authHeader?.split(" ")[1];

  if (!token) {
    console.error("[AUTH] Không có token trong header.");
    return res.status(401).json({ message: "Token không hợp lệ" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (error) {
    console.error("[AUTH] Lỗi verify token:", error);
    return res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }
};

// Middleware kiểm tra quyền
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Log role của user và các role bắt buộc
    console.log("[AUTH] User role:", req.user?.role, " | Yêu cầu:", roles);
    if (!roles.includes(req.user.role)) {
      console.error("[AUTH] User không có quyền.");
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};
