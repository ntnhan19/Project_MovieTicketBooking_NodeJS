// backend/src/controllers/hallController.js
const hallService = require('../services/hallService');

// Lấy tất cả phòng chiếu với phân trang và lọc theo rạp
const getAllHalls = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const cinemaId = req.query.cinemaId ? parseInt(req.query.cinemaId) : undefined;
    
    const halls = await hallService.getAllHalls(page, limit, cinemaId);
    res.status(200).json(halls);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng chiếu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy thông tin phòng chiếu theo ID
const getHallById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const hall = await hallService.getHallById(id);
    
    if (!hall) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
    }
    
    res.status(200).json(hall);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin phòng chiếu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy phòng chiếu theo rạp
const getHallsByCinema = async (req, res) => {
  try {
    const cinemaId = parseInt(req.params.cinemaId);
    const halls = await hallService.getHallsByCinema(cinemaId);
    res.status(200).json(halls);
  } catch (error) {
    console.error('Lỗi khi lấy phòng chiếu theo rạp:', error);
    if (error.message === 'Không tìm thấy rạp') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Tạo phòng chiếu mới
const createHall = async (req, res) => {
  try {
    const { name, totalSeats, rows, columns, cinemaId } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !totalSeats || !rows || !columns || !cinemaId) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Kiểm tra tính hợp lệ của dữ liệu
    if (totalSeats <= 0 || rows <= 0 || columns <= 0) {
      return res.status(400).json({ message: 'Thông tin phòng chiếu không hợp lệ' });
    }

    // Kiểm tra nếu tích của rows và columns phải bằng với totalSeats
    if (rows * columns !== totalSeats) {
      return res.status(400).json({ 
        message: 'Tổng số ghế phải bằng tích của số hàng và số cột',
        details: `${rows} × ${columns} = ${rows * columns}, không bằng ${totalSeats}`
      });
    }

    const newHall = await hallService.createHall({
      name,
      totalSeats,
      rows,
      columns,
      cinemaId
    });

    res.status(201).json(newHall);
  } catch (error) {
    console.error('Lỗi khi tạo phòng chiếu:', error);
    if (error.message === 'Rạp không tồn tại') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Phòng chiếu đã tồn tại')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Cập nhật phòng chiếu
const updateHall = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, totalSeats, rows, columns, cinemaId } = req.body;

    // Kiểm tra phòng chiếu có tồn tại không
    const existingHall = await hallService.getHallById(id);
    if (!existingHall) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
    }

    // Kiểm tra tính hợp lệ nếu cung cấp totalSeats, rows và columns
    if (totalSeats !== undefined && rows !== undefined && columns !== undefined) {
      if (totalSeats <= 0 || rows <= 0 || columns <= 0) {
        return res.status(400).json({ message: 'Thông tin phòng chiếu không hợp lệ' });
      }

      if (rows * columns !== totalSeats) {
        return res.status(400).json({ 
          message: 'Tổng số ghế phải bằng tích của số hàng và số cột',
          details: `${rows} × ${columns} = ${rows * columns}, không bằng ${totalSeats}`
        });
      }
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (totalSeats !== undefined) updateData.totalSeats = totalSeats;
    if (rows !== undefined) updateData.rows = rows;
    if (columns !== undefined) updateData.columns = columns;
    if (cinemaId !== undefined) updateData.cinemaId = cinemaId;

    const updatedHall = await hallService.updateHall(id, updateData);
    res.status(200).json(updatedHall);
  } catch (error) {
    console.error('Lỗi khi cập nhật phòng chiếu:', error);
    if (error.message === 'Rạp không tồn tại') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message.includes('Phòng chiếu đã tồn tại')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Xóa phòng chiếu
const deleteHall = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Kiểm tra phòng chiếu có tồn tại không
    const existingHall = await hallService.getHallById(id);
    if (!existingHall) {
      return res.status(404).json({ message: 'Không tìm thấy phòng chiếu' });
    }
    
    // Kiểm tra xem phòng chiếu có đang được sử dụng trong lịch chiếu không
    const hasShowtimes = await hallService.checkHallHasShowtimes(id);
    if (hasShowtimes) {
      return res.status(400).json({ 
        message: 'Không thể xóa phòng chiếu đang được sử dụng trong lịch chiếu',
        details: 'Vui lòng xóa tất cả lịch chiếu liên quan trước'
      });
    }
    
    await hallService.deleteHall(id);
    res.status(200).json({ message: 'Xóa phòng chiếu thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa phòng chiếu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

module.exports = {
  getAllHalls,
  getHallById,
  getHallsByCinema,
  createHall,
  updateHall,
  deleteHall
};