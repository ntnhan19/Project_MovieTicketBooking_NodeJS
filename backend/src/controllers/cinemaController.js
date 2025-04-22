// backend/src/controllers/cinemaController.js
const cinemaService = require('../services/cinemaService');

// Tạo rạp chiếu phim mới (Chỉ Admin)
const createCinema = async (req, res) => {
  try {
    const { name, address, image, mapUrl } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!name || !address) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    const newCinema = await cinemaService.createCinema({
      name,
      address,
      image,
      mapUrl
    });

    res.status(201).json(newCinema);
  } catch (error) {
    console.error('Lỗi khi tạo rạp chiếu phim:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy tất cả rạp chiếu phim
const getAllCinemas = async (req, res) => {
  try {
    const cinemas = await cinemaService.getAllCinemas();
    res.status(200).json(cinemas);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách rạp chiếu phim:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy rạp chiếu phim theo ID
const getCinemaById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const cinema = await cinemaService.getCinemaById(id);
    
    if (!cinema) {
      return res.status(404).json({ message: 'Không tìm thấy rạp chiếu phim' });
    }
    
    res.status(200).json(cinema);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin rạp chiếu phim:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Cập nhật thông tin rạp chiếu phim (Chỉ Admin)
const updateCinema = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, address, image, mapUrl } = req.body;

    const updateData = {};
    
    // Chỉ cập nhật những trường được cung cấp
    if (name !== undefined) updateData.name = name;
    if (address !== undefined) updateData.address = address;
    if (image !== undefined) updateData.image = image;
    if (mapUrl !== undefined) updateData.mapUrl = mapUrl;

    const updatedCinema = await cinemaService.updateCinema(id, updateData);
    
    if (!updatedCinema) {
      return res.status(404).json({ message: 'Không tìm thấy rạp chiếu phim' });
    }
    
    res.status(200).json(updatedCinema);
  } catch (error) {
    console.error('Lỗi khi cập nhật rạp chiếu phim:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Xóa rạp chiếu phim (Chỉ Admin)
const deleteCinema = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await cinemaService.deleteCinema(id);
    res.status(200).json({ message: 'Xóa rạp chiếu phim thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa rạp chiếu phim:', error);
    if (error.message === 'Không tìm thấy rạp chiếu phim') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Không thể xóa rạp chiếu phim có phòng chiếu') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy tất cả phòng chiếu của một rạp
const getHallsByCinema = async (req, res) => {
  try {
    const cinemaId = parseInt(req.params.cinemaId);
    const halls = await cinemaService.getHallsByCinema(cinemaId);
    
    res.status(200).json(halls);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách phòng chiếu:', error);
    if (error.message === 'Không tìm thấy rạp chiếu phim') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Tạo phòng chiếu mới cho rạp (Chỉ Admin)
const createHall = async (req, res) => {
  try {
    const cinemaId = parseInt(req.params.cinemaId);
    const { name, totalSeats, rows, columns } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!name || !totalSeats || !rows || !columns) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }
    
    const newHall = await cinemaService.createHall({
      name,
      totalSeats,
      rows,
      columns,
      cinemaId
    });
    
    res.status(201).json(newHall);
  } catch (error) {
    console.error('Lỗi khi tạo phòng chiếu:', error);
    if (error.message === 'Không tìm thấy rạp chiếu phim') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

module.exports = {
  createCinema,
  getAllCinemas,
  getCinemaById,
  updateCinema,
  deleteCinema,
  getHallsByCinema,
  createHall
};