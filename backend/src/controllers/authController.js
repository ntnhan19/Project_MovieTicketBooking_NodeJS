// backend/src/controllers/authController.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../../prisma/prisma");
const mailService = require("../services/mailService");

// Hàm validation đầu vào
const validateRegisterInput = (data) => {
  const errors = [];
  const { name, email, phone, password } = data;

  // Kiểm tra các trường bắt buộc
  if (!name?.trim()) {
    errors.push("Vui lòng nhập họ tên");
  } else if (name.trim().length < 2) {
    errors.push("Họ tên phải có ít nhất 2 ký tự");
  } else if (name.trim().length > 50) {
    errors.push("Họ tên không được quá 50 ký tự");
  } else if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(name.trim())) {
    errors.push("Họ tên chỉ được chứa chữ cái và khoảng trắng");
  }

  if (!email?.trim()) {
    errors.push("Vui lòng nhập email");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("Email không đúng định dạng");
  } else if (email.trim().length > 100) {
    errors.push("Email không được quá 100 ký tự");
  }

  if (!phone?.trim()) {
    errors.push("Vui lòng nhập số điện thoại");
  } else if (!/^(0[3|5|7|8|9])+([0-9]{8})$/.test(phone.trim())) {
    errors.push("Số điện thoại phải có định dạng 0xxxxxxxxx (10 số)");
  }

  if (!password) {
    errors.push("Vui lòng nhập mật khẩu");
  } else if (password.length < 6) {
    errors.push("Mật khẩu phải có ít nhất 6 ký tự");
  } else if (password.length > 50) {
    errors.push("Mật khẩu không được quá 50 ký tự");
  } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.push("Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số");
  }

  return errors;
};

const validateLoginInput = (data) => {
  const errors = [];
  const { email, password } = data;

  if (!email?.trim()) {
    errors.push("Vui lòng nhập email");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
    errors.push("Email không đúng định dạng");
  }

  if (!password) {
    errors.push("Vui lòng nhập mật khẩu");
  }

  return errors;
};

// Đăng ký tài khoản có xác thức email
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    // Validation đầu vào
    const validationErrors = validateRegisterInput({
      name,
      email,
      phone,
      password,
    });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: validationErrors[0], // Trả về lỗi đầu tiên
        errors: validationErrors, // Trả về tất cả lỗi
        type: "VALIDATION_ERROR",
      });
    }

    // Chuẩn hóa dữ liệu
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = phone.trim();
    const normalizedName = name.trim();

    // Kiểm tra email đã tồn tại chưa
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email đã được sử dụng",
        type: "EMAIL_EXISTS",
        suggestion:
          "Vui lòng sử dụng email khác hoặc đăng nhập nếu đây là tài khoản của bạn",
      });
    }

    // Kiểm tra số điện thoại đã tồn tại chưa - SỬA ĐỔI TẠI ĐÂY
    const existingPhone = await prisma.user.findFirst({
      where: { phone: normalizedPhone },
    });

    if (existingPhone) {
      return res.status(409).json({
        error: "Số điện thoại đã được sử dụng",
        type: "PHONE_EXISTS",
        suggestion: "Vui lòng sử dụng số điện thoại khác",
      });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 12);

    // Tạo người dùng mới
    const newUser = await prisma.user.create({
      data: {
        name: normalizedName,
        email: normalizedEmail,
        phone: normalizedPhone,
        password: hashedPassword,
        role: "USER",
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Tạo token xác thực email
    const verificationToken = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        type: "email_verification",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Gửi email xác thực với xử lý lỗi cải tiến
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    let emailSent = false;
    let emailError = null;

    try {
      await mailService.sendVerificationEmail(newUser, verificationUrl);
      emailSent = true;
    } catch (error) {
      console.error("Lỗi khi gửi email xác thực:", error);
      emailError = error;

      // Phân loại lỗi email
      let emailErrorType = "UNKNOWN_EMAIL_ERROR";
      let emailErrorMessage = "Không thể gửi email xác thực";

      if (error.message?.includes("Invalid email")) {
        emailErrorType = "INVALID_EMAIL";
        emailErrorMessage = "Địa chỉ email không hợp lệ";
      } else if (
        error.message?.includes("Email not found") ||
        error.message?.includes("No such user")
      ) {
        emailErrorType = "EMAIL_NOT_EXISTS";
        emailErrorMessage = "Địa chỉ email không tồn tại";
      } else if (error.message?.includes("Rate limit")) {
        emailErrorType = "RATE_LIMIT";
        emailErrorMessage = "Gửi email quá nhanh, vui lòng thử lại sau";
      } else if (error.message?.includes("Service unavailable")) {
        emailErrorType = "SERVICE_UNAVAILABLE";
        emailErrorMessage = "Dịch vụ email tạm thời không khả dụng";
      }

      // Log chi tiết để debug
      console.error("Chi tiết lỗi email:", {
        type: emailErrorType,
        message: emailErrorMessage,
        originalError: error.message,
        userId: newUser.id,
        email: normalizedEmail,
      });
    }

    // Loại bỏ trường password trước khi trả về
    const { password: _, ...userWithoutPassword } = newUser;

    // Trả về response với thông tin về email
    if (emailSent) {
      res.status(201).json({
        success: true,
        user: userWithoutPassword,
        message:
          "Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.",
        verificationEmailSent: true,
      });
    } else {
      res.status(201).json({
        success: true,
        user: userWithoutPassword,
        message:
          "Đăng ký thành công nhưng không thể gửi email xác thực. Bạn có thể yêu cầu gửi lại email sau.",
        verificationEmailSent: false,
        emailError: {
          type: emailErrorType || "UNKNOWN_EMAIL_ERROR",
          message: emailErrorMessage || "Không thể gửi email xác thực",
        },
        canResendEmail: true,
      });
    }
  } catch (error) {
    console.error("Lỗi khi đăng ký tài khoản:", error);

    // Xử lý lỗi database cụ thể
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (target?.includes("email")) {
        return res.status(409).json({
          error: "Email đã được sử dụng",
          type: "EMAIL_EXISTS",
        });
      }
      if (target?.includes("phone")) {
        return res.status(409).json({
          error: "Số điện thoại đã được sử dụng",
          type: "PHONE_EXISTS",
        });
      }
    }

    res.status(500).json({
      error: "Có lỗi xảy ra khi đăng ký tài khoản",
      type: "SERVER_ERROR",
    });
  }
};

// Đăng nhập
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation đầu vào
    const validationErrors = validateLoginInput({ email, password });
    if (validationErrors.length > 0) {
      return res.status(400).json({
        error: validationErrors[0],
        errors: validationErrors,
        type: "VALIDATION_ERROR",
      });
    }

    // Chuẩn hóa email
    const normalizedEmail = email.trim().toLowerCase();

    // Tìm kiếm người dùng theo email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Kiểm tra người dùng tồn tại và mật khẩu chính xác
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: "Email hoặc mật khẩu không đúng",
        type: "INVALID_CREDENTIALS",
      });
    }

    // Kiểm tra xác thức email
    if (!user.emailVerified) {
      return res.status(401).json({
        error:
          "Tài khoản chưa được xác thức email. Vui lòng kiểm tra email của bạn.",
        type: "EMAIL_NOT_VERIFIED",
        suggestion: "Bạn có thể yêu cầu gửi lại email xác thức",
      });
    }

    // Tạo token JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Loại bỏ trường password trước khi trả về
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: "Đăng nhập thành công",
    });
  } catch (error) {
    console.error("Lỗi khi đăng nhập:", error);
    res.status(500).json({
      error: "Có lỗi xảy ra khi đăng nhập",
      type: "SERVER_ERROR",
    });
  }
};

// Gửi lại email xác thức
exports.resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email?.trim()) {
      return res.status(400).json({
        error: "Vui lòng cung cấp email",
        type: "VALIDATION_ERROR",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return res.status(404).json({
        error: "Email không tồn tại trong hệ thống",
        type: "USER_NOT_FOUND",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        error: "Tài khoản đã được xác thực",
        type: "ALREADY_VERIFIED",
      });
    }

    // Kiểm tra rate limiting (tùy chọn)
    const lastVerificationTime = user.updatedAt;
    const now = new Date();
    const timeDiff = now.getTime() - lastVerificationTime.getTime();
    const waitTime = 60000; // 1 phút

    if (timeDiff < waitTime) {
      const remainingTime = Math.ceil((waitTime - timeDiff) / 1000);
      return res.status(429).json({
        error: `Vui lòng đợi ${remainingTime} giây trước khi gửi lại email`,
        type: "RATE_LIMIT",
        retryAfter: remainingTime,
      });
    }

    // Tạo token xác thực email mới
    const verificationToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        type: "email_verification",
      },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    // Gửi email với xử lý lỗi chi tiết
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    try {
      await mailService.sendVerificationEmail(user, verificationUrl);

      // Cập nhật thời gian để rate limiting
      await prisma.user.update({
        where: { id: user.id },
        data: { updatedAt: new Date() },
      });

      res.json({
        success: true,
        message: "Đã gửi lại email xác thực thành công",
      });
    } catch (emailError) {
      console.error("Lỗi khi gửi lại email xác thực:", emailError);

      // Phân loại lỗi email
      let errorType = "EMAIL_SEND_FAILED";
      let errorMessage = "Không thể gửi email xác thực";

      if (emailError.message?.includes("Invalid email")) {
        errorType = "INVALID_EMAIL";
        errorMessage = "Địa chỉ email không hợp lệ";
      } else if (emailError.message?.includes("Email not found")) {
        errorType = "EMAIL_NOT_EXISTS";
        errorMessage = "Địa chỉ email không tồn tại";
      } else if (emailError.message?.includes("Rate limit")) {
        errorType = "RATE_LIMIT";
        errorMessage = "Gửi email quá nhanh, vui lòng thử lại sau";
      }

      res.status(500).json({
        error: errorMessage,
        type: errorType,
        suggestion: "Vui lòng kiểm tra lại địa chỉ email hoặc thử lại sau",
      });
    }
  } catch (error) {
    console.error("Lỗi khi gửi lại email xác thực:", error);
    res.status(500).json({
      error: "Có lỗi xảy ra khi gửi lại email xác thực",
      type: "SERVER_ERROR",
    });
  }
};

// Xác thức email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        error: "Token xác thức không được cung cấp",
        type: "MISSING_TOKEN",
      });
    }

    // Xác thức token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return res.status(401).json({
        error: "Token không hợp lệ hoặc đã hết hạn",
        type: "INVALID_TOKEN",
      });
    }

    const { userId } = decoded;

    // Tìm kiếm người dùng
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        error: "Không tìm thấy người dùng",
        type: "USER_NOT_FOUND",
      });
    }

    if (user.emailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email đã được xác thức trước đó",
        type: "ALREADY_VERIFIED",
      });
    }

    // Cập nhật trạng thái xác thức email
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: true,
        updatedAt: new Date(),
      },
    });

    // Loại bỏ trường password trước khi trả về
    const { password: _, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      user: userWithoutPassword,
      message: "Xác thức email thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xác thức email:", error);
    res.status(500).json({
      error: "Có lỗi xảy ra khi xác thức email",
      type: "SERVER_ERROR",
    });
  }
};
