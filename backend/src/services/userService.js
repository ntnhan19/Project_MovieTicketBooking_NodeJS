// backend/src/services/userService.js
const prisma = require("../../prisma/prisma");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Lấy tất cả người dùng với các bộ lọc và phân trang
exports.getUsers = async (filter) => {
  const {
    page = 1,
    pageSize = 10,
    search = "",
    role,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filter;

  // Xây dựng điều kiện lọc
  const where = {};

  // Lọc theo từ khóa tìm kiếm
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search, mode: "insensitive" } },
    ];
  }

  // Lọc theo vai trò
  if (role) {
    where.role = role;
  }

  // Tính toán phân trang
  const skip = (Number(page) - 1) * Number(pageSize);

  // Tạo đối tượng sắp xếp
  const orderBy = {};
  orderBy[sortBy] = sortOrder.toLowerCase();

  // Đếm tổng số người dùng thỏa mãn điều kiện
  const totalCount = await prisma.user.count({ where });

  // Lấy danh sách người dùng theo điều kiện
  const users = await prisma.user.findMany({
    where,
    skip,
    take: Number(pageSize),
    orderBy,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      avatar: true,
      tickets: {
        select: {
          id: true,
        },
      },
      reviews: {
        select: {
          id: true,
        },
      },
    },
  });

  // Định dạng dữ liệu trả về
  const formattedUsers = users.map((user) => {
    return {
      ...user,
      ticketCount: user.tickets.length,
      reviewCount: user.reviews.length,
      tickets: undefined,
      reviews: undefined,
    };
  });

  return {
    users: formattedUsers,
    pagination: {
      totalCount,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(totalCount / Number(pageSize)),
    },
  };
};

// Lấy thông tin chi tiết của một người dùng
exports.getUserById = async (id) => {
  const userId = Number(id);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tickets: {
        include: {
          showtime: {
            include: {
              movie: true,
              hall: {
                include: {
                  cinema: true,
                },
              },
            },
          },
          seat: true,
          payment: true,
        },
        orderBy: {
          showtime: {
            startTime: "desc",
          },
        },
        take: 10,
      },
      reviews: {
        include: {
          movie: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
    },
  });

  if (!user) {
    return null;
  }

  // Loại bỏ trường password trước khi trả về
  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword;
};

// Tạo người dùng mới
exports.createUser = async (userData) => {
  const { password, email, name, phone, role, avatar } = userData;

  // Kiểm tra email đã tồn tại chưa
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new Error("Email đã được sử dụng");
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
      role: role || "USER",
      avatar,
    },
  });

  // Loại bỏ trường password trước khi trả về
  const { password: _, ...userWithoutPassword } = newUser;

  return userWithoutPassword;
};

// Cập nhật thông tin người dùng
exports.updateUser = async (id, userData) => {
  const userId = Number(id);
  let { name, email, phone, password, role, avatar } = userData;

  // Kiểm tra người dùng tồn tại
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("Người dùng không tồn tại");
  }

  // Kiểm tra email đã tồn tại chưa (nếu muốn đổi email)
  if (email && email !== existingUser.email) {
    const emailExists = await prisma.user.findUnique({
      where: { email },
    });

    if (emailExists) {
      throw new Error("Email đã được sử dụng");
    }
  }

  // Chuẩn bị dữ liệu cập nhật
  const updateData = {};

  if (name) updateData.name = name;
  if (email) updateData.email = email;
  if (phone) updateData.phone = phone;
  if (role) updateData.role = role;
  if (avatar !== undefined) updateData.avatar = avatar;

  // Mã hóa mật khẩu nếu có cập nhật mật khẩu
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }

  // Cập nhật người dùng
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  // Loại bỏ trường password trước khi trả về
  const { password: _, ...userWithoutPassword } = updatedUser;

  return userWithoutPassword;
};

// Xóa người dùng
exports.deleteUser = async (id) => {
  const userId = Number(id);

  // Kiểm tra người dùng tồn tại
  const existingUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!existingUser) {
    throw new Error("Người dùng không tồn tại");
  }

  // Kiểm tra người dùng có vé hay không
  const userWithTickets = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      tickets: {
        select: { id: true },
      },
    },
  });

  if (userWithTickets.tickets.length > 0) {
    // Chúng ta có thể xóa liên kết hoặc báo lỗi
    throw new Error(
      "Không thể xóa người dùng đã có vé. Vui lòng xóa vé trước."
    );
  }

  // Xóa đánh giá của người dùng
  await prisma.review.deleteMany({
    where: { userId },
  });

  // Xóa người dùng
  await prisma.user.delete({ where: { id: userId } });

  return { success: true };
};

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      avatar: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  return user;
};

// Thay đổi mật khẩu
exports.changePassword = async (userId, data) => {
  const { currentPassword, newPassword } = data;

  // Kiểm tra người dùng tồn tại
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  // Kiểm tra mật khẩu hiện tại
  const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Mật khẩu hiện tại không đúng");
  }

  // Mã hóa mật khẩu mới
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Cập nhật mật khẩu
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });

  return { success: true };
};

// Cấu hình nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || "smtp.gmail.com",
  port: process.env.MAIL_PORT || 587,
  secure: process.env.MAIL_SECURE === "true" || false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// Cập nhật avatar người dùng
exports.updateAvatar = async (userId, avatarUrl) => {
  // Kiểm tra người dùng có tồn tại không
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Người dùng không tồn tại");
  }

  // Cập nhật avatar
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
  });

  // Loại bỏ trường password trước khi trả về
  const { password: _, ...userWithoutPassword } = updatedUser;

  return userWithoutPassword;
};

// Gửi yêu cầu quên mật khẩu
exports.forgotPassword = async (email) => {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new Error("Email không tồn tại");
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenHash = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpires: resetTokenExpires,
        resetTokenCreatedAt: new Date(),
      },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const mailService = require("./mailService");
    await mailService.sendPasswordResetEmail(user, resetUrl);

    return { success: true };
  } catch (error) {
    console.error("Lỗi trong forgotPassword service:", error);
    throw error;
  }
};

// Xác thực token reset mật khẩu
exports.verifyResetToken = async (token) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: tokenHash,
      resetTokenExpires: {
        gt: new Date(),
      },
    },
  });

  return !!user;
};

// Đặt lại mật khẩu với token
exports.resetPassword = async (token, newPassword) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      resetToken: tokenHash,
      resetTokenExpires: {
        gt: new Date(),
      },
    },
  });

  if (!user) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpires: null,
      resetTokenCreatedAt: null,
    },
  });

  return { success: true };
};

// Lấy lịch sử đặt vé của người dùng
exports.getUserTickets = async (userId, options) => {
  const { page = 1, pageSize = 10, status } = options;

  // Xây dựng điều kiện tìm kiếm
  const where = { userId };

  // Lọc theo trạng thái vé (nếu có)
  if (status) {
    where.status = status;
  }

  // Đếm tổng số vé
  const totalCount = await prisma.ticket.count({ where });

  // Tính toán phân trang
  const skip = (Number(page) - 1) * Number(pageSize);

  // Lấy danh sách vé
  const tickets = await prisma.ticket.findMany({
    where,
    skip,
    take: Number(pageSize),
    orderBy: { showtime: { startTime: "desc" } },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: {
            include: {
              cinema: true,
            },
          },
        },
      },
      seat: true,
      payment: true,
    },
  });

  return {
    tickets,
    pagination: {
      totalCount,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(totalCount / Number(pageSize)),
    },
  };
};

// Lấy lịch sử đánh giá của người dùng
exports.getUserReviews = async (userId, options) => {
  const { page = 1, pageSize = 10 } = options;

  // Đếm tổng số đánh giá
  const totalCount = await prisma.review.count({
    where: { userId },
  });

  // Tính toán phân trang
  const skip = (Number(page) - 1) * Number(pageSize);

  // Lấy danh sách đánh giá
  const reviews = await prisma.review.findMany({
    where: { userId },
    skip,
    take: Number(pageSize),
    orderBy: { createdAt: "desc" },
    include: {
      movie: true,
    },
  });

  return {
    reviews,
    pagination: {
      totalCount,
      page: Number(page),
      pageSize: Number(pageSize),
      totalPages: Math.ceil(totalCount / Number(pageSize)),
    },
  };
};

// Xác thực email
exports.verifyEmail = async (token) => {
  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    // Kiểm tra người dùng tồn tại
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("Người dùng không tồn tại");
    }

    // Cập nhật trạng thái xác thực email
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });

    return { success: true };
  } catch (error) {
    throw new Error("Token không hợp lệ hoặc đã hết hạn");
  }
};
