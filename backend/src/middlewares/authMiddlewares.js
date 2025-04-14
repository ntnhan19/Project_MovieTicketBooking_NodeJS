//backend/src/middlewares/authMiddlewares.js
const jwt = require("jsonwebtoken");

// Middleware kiểm tra token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Token không hợp lệ" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token hết hạn hoặc không hợp lệ" });
  }
};

// Middleware kiểm tra quyền
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Không có quyền truy cập" });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
};

