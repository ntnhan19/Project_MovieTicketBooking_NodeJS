// backend/src/controllers/seatController.js
const seatService = require('../services/seatService');

// Lấy tất cả ghế của một suất chiếu (GET /api/seats/showtime/:showtimeId)
const getSeatsByShowtime = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.showtimeId);
    const seats = await seatService.getSeatsByShowtime(showtimeId);
    res.status(200).json(seats);
  } catch (error) {
    console.error('Error getting seats by showtime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cập nhật thông tin ghế (PUT /api/seats/:id)
const updateSeat = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, type } = req.body;

    // Kiểm tra dữ liệu đầu vào
    const validStatuses = ['AVAILABLE', 'BOOKED', 'LOCKED'];
    const validTypes = ['STANDARD', 'VIP', 'COUPLE'];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid seat status' });
    }

    if (type && !validTypes.includes(type)) {
      return res.status(400).json({ message: 'Invalid seat type' });
    }

    const updatedSeat = await seatService.updateSeat(id, { status, type });
    res.status(200).json(updatedSeat);
  } catch (error) {
    console.error('Error updating seat:', error);
    if (error.message === 'Seat not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Khóa nhiều ghế tạm thời (POST /api/seats/lock)
const lockMultipleSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;
    const userId = req.user.id;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ success: false, message: 'seatIds must be a non-empty array' });
    }

    await seatService.lockMultipleSeats(seatIds, userId);

    // Set timeout unlock từng ghế sau 15 phút
    seatIds.forEach(seatId => {
      setTimeout(async () => {
        try {
          await seatService.unlockSeatIfLocked(seatId);
        } catch (error) {
          console.error('Error auto-unlocking seat:', error);
        }
      }, 15 * 60 * 1000); // 15 phút
    });

    return res.status(200).json({
      success: true,
      message: 'Seats locked successfully',
    });
  } catch (error) {
    console.error('Error locking multiple seats:', error);
    if (error.message === 'Some seats are not available') {
      return res.status(400).json({ success: false, message: error.message });
    }
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Mở khóa nhiều ghế (POST /api/seats/unlock)
const unlockMultipleSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({ message: 'seatIds must be a non-empty array' });
    }

    const result = await seatService.unlockMultipleSeats(seatIds);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error unlocking multiple seats:', error);
    // Xử lý các lỗi nghiêm trọng khác, không phải lỗi "No seats are locked"
    res.status(500).json({ message: 'Internal server error' });
  }
};


// Lấy thông tin chi tiết của ghế (GET /api/seats/:id)
const getSeatById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const seat = await seatService.getSeatById(id);
    
    if (!seat) {
      return res.status(404).json({ message: 'Seat not found' });
    }
    
    res.status(200).json(seat);
  } catch (error) {
    console.error('Error getting seat details:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy layout ghế theo phòng (GET /api/seats/hall/:hallId)
const getSeatLayoutByHall = async (req, res) => {
  try {
    const hallId = parseInt(req.params.hallId);
    const layout = await seatService.getSeatLayoutByHall(hallId);
    res.status(200).json(layout);
  } catch (error) {
    console.error('Error getting seat layout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getSeatsByShowtime,
  updateSeat,
  lockMultipleSeats,
  unlockMultipleSeats,
  getSeatById,
  getSeatLayoutByHall
};