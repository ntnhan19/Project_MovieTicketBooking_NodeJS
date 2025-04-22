// backend/src/controllers/userController.js
const userService = require('../services/userService');

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
      sortOrder
    };
    
    const result = await userService.getUsers(filter);
    
    res.json(result);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách người dùng:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi lấy danh sách người dùng' });
  }
};

// Lấy thông tin chi tiết của một người dùng
exports.getUserById = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Không tìm thấy người dùng' });
    }
    
    res.json(user);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi lấy thông tin người dùng' });
  }
};

// Tạo người dùng mới
exports.createUser = async (req, res) => {
  try {
    // Kiểm tra dữ liệu đầu vào
    const { name, email, phone, password } = req.body;
    
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin' });
    }
    
    const newUser = await userService.createUser(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Lỗi khi tạo người dùng:', error);
    
    if (error.message === 'Email đã được sử dụng') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Có lỗi xảy ra khi tạo người dùng' });
  }
};

// Cập nhật thông tin người dùng
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Kiểm tra xem người dùng có quyền cập nhật hay không
    if (req.user.role !== 'ADMIN' && req.user.id !== Number(userId)) {
      return res.status(403).json({ error: 'Bạn không có quyền cập nhật thông tin của người dùng khác' });
    }
    
    const updatedUser = await userService.updateUser(userId, req.body);
    res.json(updatedUser);
  } catch (error) {
    console.error('Lỗi khi cập nhật người dùng:', error);
    
    if (error.message === 'Người dùng không tồn tại' || error.message === 'Email đã được sử dụng') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Có lỗi xảy ra khi cập nhật thông tin người dùng' });
  }
};

// Xóa người dùng
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Chỉ admin mới có quyền xóa người dùng
    if (req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Bạn không có quyền xóa người dùng' });
    }
    
    await userService.deleteUser(userId);
    res.json({ message: 'Người dùng đã được xóa thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa người dùng:', error);
    
    if (error.message.includes('Không thể xóa người dùng đã có vé')) {
      return res.status(400).json({ error: error.message });
    }
    
    if (error.message === 'Người dùng không tồn tại') {
      return res.status(404).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Có lỗi xảy ra khi xóa người dùng' });
  }
};

// Lấy thông tin người dùng hiện tại
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await userService.getCurrentUser(userId);
    res.json(user);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin người dùng hiện tại:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi lấy thông tin người dùng' });
  }
};

// Thay đổi mật khẩu
exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mật khẩu hiện tại và mật khẩu mới' });
    }
    
    await userService.changePassword(userId, { currentPassword, newPassword });
    res.json({ message: 'Mật khẩu đã được thay đổi thành công' });
  } catch (error) {
    console.error('Lỗi khi thay đổi mật khẩu:', error);
    
    if (error.message === 'Mật khẩu hiện tại không đúng') {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Có lỗi xảy ra khi thay đổi mật khẩu' });
  }
};