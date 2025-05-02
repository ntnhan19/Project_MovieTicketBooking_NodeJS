// backend/src/controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = require('../../prisma/prisma');
const mailService = require('../services/mailService');

// Đăng ký tài khoản có xác thực email
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin' });
    }
    
    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email đã được sử dụng' });
    }
    
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Tạo người dùng mới
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        role: 'USER',
        emailVerified: false
      }
    });
    
    // Tạo token xác thực email
    const verificationToken = jwt.sign(
      { userId: newUser.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Gửi email xác thực
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await mailService.sendVerificationEmail(newUser, verificationUrl);
    
    // Loại bỏ trường password trước khi trả về
    const { password: _, ...userWithoutPassword } = newUser;
    
    res.status(201).json({
      user: userWithoutPassword,
      message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.'
    });
  } catch (error) {
    console.error('Lỗi khi đăng ký tài khoản:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đăng ký tài khoản' });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!email || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp email và mật khẩu' });
    }
    
    // Tìm kiếm người dùng theo email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    // Kiểm tra người dùng tồn tại và mật khẩu chính xác
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Email hoặc mật khẩu không đúng' });
    }
    
    // Kiểm tra xác thực email (tùy chọn, có thể bỏ nếu không cần)
    if (!user.emailVerified) {
      return res.status(401).json({ 
        error: 'Tài khoản chưa được xác thực email. Vui lòng kiểm tra email của bạn.'
      });
    }
    
    // Tạo token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );
    
    // Loại bỏ trường password trước khi trả về
    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Lỗi khi đăng nhập:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đăng nhập' });
  }
};

// Gửi lại email xác thực
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Vui lòng cung cấp email' });
    }
    
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'Email không tồn tại' });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ error: 'Tài khoản đã được xác thực' });
    }
    
    // Tạo token xác thực email
    const verificationToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Gửi email xác thực
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    await mailService.sendVerificationEmail(user, verificationUrl);
    
    res.json({ message: 'Đã gửi lại email xác thực' });
  } catch (error) {
    console.error('Lỗi khi gửi lại email xác thực:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi gửi lại email xác thực' });
  }
};