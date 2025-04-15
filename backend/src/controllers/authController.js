// backend/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const prisma = require("../../prisma/prisma");

// Tạo JWT token
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Đăng nhập
exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log('Login request received with email:', email); // Ghi log email nhận được từ frontend

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.log('User not found with email:', email);  // Ghi log khi không tìm thấy user
      return res.status(401).json({ message: "Email không tồn tại" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Incorrect password for user:', email);  // Ghi log khi mật khẩu sai
      return res.status(401).json({ message: "Sai mật khẩu" });
    }

    const token = generateToken(user);

    console.log('Login successful for user:', user.email);  // Ghi log khi đăng nhập thành công

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Login error:', err.message);  // Ghi log khi có lỗi xảy ra
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};

// Đăng ký
exports.register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  try {
    console.log('Register request received with email:', email); // Ghi log email nhận được từ frontend

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Email already exists:', email);  // Ghi log khi email đã tồn tại
      return res.status(400).json({ message: "Email đã tồn tại" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        role: "USER",
      },
    });

    const token = generateToken(user);

    console.log('User registered successfully:', user.email);  // Ghi log khi đăng ký thành công

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error('Registration error:', err.message);  // Ghi log khi có lỗi xảy ra
    res.status(500).json({ message: "Lỗi server", error: err.message });
  }
};
