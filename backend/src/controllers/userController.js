// backend/src/controllers/userController.js
const userService = require("../services/userService");
const multer = require("multer");
const path = require("path");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

// Lấy danh sách người dùng
exports.getUsers = async (req, res) => {
  try {
    const { page, pageSize, search, role, sortBy, sortOrder } = req.query;

    const filter = {
      page,
      pageSize,
      search,
      role,
      sortBy,
      sortOrder,
    };

    const result = await userService.getUsers(filter);

    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy danh sách người dùng:", error);
    res
      .status(500)
      .json({ error: "Có lỗi xảy ra khi lấy danh sách người dùng" });
  }
};

// Lấy thông tin chi tiết của một người dùng
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: "Không tìm thấy người dùng" });
    }

    res.json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng:", error);
    res
      .status(500)
      .json({ error: "Có lỗi xảy ra khi lấy thông tin người dùng" });
  }
};

// Tạo người dùng mới
exports.createUser = async (req, res) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ error: "Vui lòng cung cấp đầy đủ thông tin" });
    }

    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error("Lỗi khi tạo người dùng:", error);

    if (error.message === "Email đã được sử dụng") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Có lỗi xảy ra khi tạo người dùng" });
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra userId có hợp lệ không
    const parsedUserId = Number(userId);
    if (isNaN(parsedUserId)) {
      return res.status(400).json({ error: "ID người dùng không hợp lệ" });
    }

    // Kiểm tra xem người dùng có quyền cập nhật hay không
    if (req.user.role !== "ADMIN" && req.user.id !== parsedUserId) {
      return res
        .status(403)
        .json({
          error: "Bạn không có quyền cập nhật thông tin của người dùng khác",
        });
    }

    const updatedUser = await userService.updateUser(parsedUserId, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);

    if (
      error.message === "Người dùng không tồn tại" ||
      error.message === "Email đã được sử dụng"
    ) {
      return res.status(400).json({ error: error.message });
    }

    res
      .status(500)
      .json({ error: "Có lỗi xảy ra khi cập nhật thông tin người dùng" });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Chỉ admin mới có quyền xóa người dùng
    if (req.user.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Bạn không có quyền xóa người dùng" });
    }

    await userService.deleteUser(userId);
    res.json({ message: "Người dùng đã được xóa thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa người dùng:", error);

    if (error.message.includes("Không thể xóa người dùng đã có vé")) {
      return res.status(400).json({ error: error.message });
    }

    if (error.message === "Người dùng không tồn tại") {
      return res.status(404).json({ error: error.message });
    }

    res.status(500).json({ error: "Có lỗi xảy ra khi xóa người dùng" });
  }
};

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userService.getCurrentUser(userId);
    res.json(user);
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng hiện tại:", error);
    res
      .status(500)
      .json({ error: "Có lỗi xảy ra khi lấy thông tin người dùng" });
  }
};

// Thay đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới" });
    }

    await userService.changePassword(userId, { currentPassword, newPassword });
    res.json({ message: "Mật khẩu đã được thay đổi thành công" });
  } catch (error) {
    console.error("Lỗi khi thay đổi mật khẩu:", error);

    if (error.message === "Mật khẩu hiện tại không đúng") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Có lỗi xảy ra khi thay đổi mật khẩu" });
  }
};

// Cấu hình lưu trữ cho multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/avatars");
    // Đảm bảo thư mục tồn tại
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// Cấu hình upload
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // giới hạn 5MB
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(
      path.extname(file.originalname).toLowerCase()
    );

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Chỉ chấp nhận file hình ảnh (jpeg, jpg, png, gif)"));
  },
}).single("avatar");

// Upload avatar
exports.uploadAvatar = (req, res) => {
  upload(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ error: `Lỗi multer: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Vui lòng chọn file để upload" });
    }

    try {
      const userId = req.user.id;
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Cập nhật URL avatar trong cơ sở dữ liệu
      const updatedUser = await userService.updateAvatar(userId, avatarUrl);
      res.json({
        message: "Upload avatar thành công",
        avatar: updatedUser.avatar,
      });
    } catch (error) {
      console.error("Lỗi khi cập nhật avatar:", error);
      res.status(500).json({ error: "Có lỗi xảy ra khi cập nhật avatar" });
    }
  });
};

// Gửi yêu cầu quên mật khẩu
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Vui lòng cung cấp email" });
    }

    const result = await userService.forgotPassword(email);
    res.json({ message: "Đã gửi email hướng dẫn đặt lại mật khẩu" });
  } catch (error) {
    console.error("Lỗi khi xử lý yêu cầu quên mật khẩu:", error);

    if (error.message === "Email không tồn tại") {
      return res.status(404).json({ error: error.message });
    }

    res
      .status(500)
      .json({ error: "Có lỗi xảy ra khi xử lý yêu cầu đặt lại mật khẩu" });
  }
};

// Xác thực mã reset mật khẩu
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token không hợp lệ" });
    }

    const isValid = await userService.verifyResetToken(token);

    if (isValid) {
      res.json({ valid: true });
    } else {
      res
        .status(400)
        .json({ valid: false, error: "Token không hợp lệ hoặc đã hết hạn" });
    }
  } catch (error) {
    console.error("Lỗi khi xác thực token reset mật khẩu:", error);
    res.status(500).json({ error: "Có lỗi xảy ra khi xác thực token" });
  }
};

// Đặt lại mật khẩu
exports.resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res
        .status(400)
        .json({ error: "Vui lòng cung cấp token và mật khẩu mới" });
    }

    await userService.resetPassword(token, newPassword);
    res.json({ message: "Đặt lại mật khẩu thành công" });
  } catch (error) {
    console.error("Lỗi khi đặt lại mật khẩu:", error);

    if (error.message === "Token không hợp lệ hoặc đã hết hạn") {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Có lỗi xảy ra khi đặt lại mật khẩu" });
  }
};

// Lấy lịch sử đặt vé của người dùng hiện tại
exports.getMyTickets = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 10, status } = req.query;

    const result = await userService.getUserTickets(userId, {
      page,
      pageSize,
      status,
    });
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đặt vé:", error);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy lịch sử đặt vé" });
  }
};

// Lấy lịch sử đánh giá của người dùng hiện tại
exports.getMyReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const { page = 1, pageSize = 10 } = req.query;

    const result = await userService.getUserReviews(userId, { page, pageSize });
    res.json(result);
  } catch (error) {
    console.error("Lỗi khi lấy lịch sử đánh giá:", error);
    res.status(500).json({ error: "Có lỗi xảy ra khi lấy lịch sử đánh giá" });
  }
};

// Xác thực email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({ error: "Token không hợp lệ" });
    }

    await userService.verifyEmail(token);
    res.json({ message: "Xác thực email thành công" });
  } catch (error) {
    console.error("Lỗi khi xác thực email:", error);

    if (
      error.message === "Token không hợp lệ hoặc đã hết hạn" ||
      error.message === "Người dùng không tồn tại"
    ) {
      return res.status(400).json({ error: error.message });
    }

    res.status(500).json({ error: "Có lỗi xảy ra khi xác thực email" });
  }
};
