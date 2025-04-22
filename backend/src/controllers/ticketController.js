// backend/src/controllers/ticketController.js
const ticketService = require('../services/ticketService');

// Tạo vé mới (POST /api/tickets)
const createTicket = async (req, res) => {
  try {
    const { userId, showtimeId, seats, promotionId } = req.body;

    if (!userId || !showtimeId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or seats must be a non-empty array' });
    }

    // Kiểm tra tính hợp lệ của dữ liệu đầu vào
    const numberedSeats = seats.map(seatId => typeof seatId === 'string' ? parseInt(seatId) : seatId);
    
    // Tạo vé cho nhiều ghế
    const result = await ticketService.createTicket({
      userId,
      showtimeId,
      seats: numberedSeats,
      promotionId
    });

    // Trả về kết quả
    res.status(201).json({
      message: `Đã tạo ${result.tickets.length} vé thành công`,
      tickets: result.tickets,
      totalAmount: result.totalAmount,
      ticketIds: result.tickets.map(ticket => ticket.id)
    });
  } catch (error) {
    console.error('Error creating tickets:', error);
    if (error.message === 'Ghế không có sẵn' || 
        error.message === 'Không tìm thấy người dùng' || 
        error.message === 'Không tìm thấy suất chiếu' || 
        error.message === 'Không tìm thấy ghế' ||
        error.message === 'Khuyến mãi không hợp lệ' ||
        error.message.includes('Ghế') ||
        error.message.includes('không tồn tại') ||
        error.message.includes('Suất chiếu chưa có giá cơ bản')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy tất cả vé (GET /api/tickets) - Admin only
const getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tickets = await ticketService.getAllTickets(page, limit);
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Lỗi nhận được vé:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy vé theo ID (GET /api/tickets/:id)
const getTicketById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ticket = await ticketService.getTicketById(id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }
    
    // Kiểm tra quyền truy cập (chỉ admin hoặc chủ sở hữu mới có thể xem)
    if (req.user.role !== 'ADMIN' && req.user.id !== ticket.userId) {
      return res.status(403).json({ message: 'Truy cập bị từ chối' });
    }
    
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Lỗi nhận được vé:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy vé theo ID người dùng (GET /api/tickets/user/:userId)
const getTicketsByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Check access rights (only admin or owner can view)
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Truy cập bị từ chối' });
    }
    
    const tickets = await ticketService.getTicketsByUserId(userId);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error getting user tickets:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy vé theo payment ID (GET /api/tickets/payment/:paymentId)
const getTicketsByPaymentId = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const tickets = await ticketService.getTicketsByPaymentId(paymentId);
    
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error getting tickets by payment ID:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật payment ID cho nhiều vé (PUT /api/tickets/update-payment)
const updateTicketsPayment = async (req, res) => {
  try {
    const { ticketIds, paymentId } = req.body;
    
    if (!ticketIds || !Array.isArray(ticketIds) || !paymentId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const result = await ticketService.updateTicketsPayment(ticketIds, paymentId);
    res.status(200).json({ message: `Updated ${result.count} tickets with payment ID` });
  } catch (error) {
    console.error('Error updating tickets payment:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật trạng thái vé (PUT /api/tickets/:id/status)
const updateTicketStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    
    const ticket = await ticketService.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }
    
    // Only admins or ticket owners can update status
    if (req.user.role !== 'ADMIN' && req.user.id !== ticket.userId) {
      return res.status(403).json({ message: 'Truy cập bị từ chối' });
    }
    
    const updatedTicket = await ticketService.updateTicketStatus(id, status);
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Lỗi cập nhật trạng thái vé:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật trạng thái nhiều vé (PUT /api/tickets/batch-status)
const updateTicketsStatus = async (req, res) => {
  try {
    const { ticketIds, status } = req.body;
    
    if (!ticketIds || !Array.isArray(ticketIds) || !status) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Trạng thái không hợp lệ' });
    }
    
    const result = await ticketService.updateTicketsStatus(ticketIds, status);
    res.status(200).json({ message: `Updated ${result.count} tickets with status: ${status}` });
  } catch (error) {
    console.error('Error updating tickets status:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Xóa vé (DELETE /api/tickets/:id) - Admin only
const deleteTicket = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const ticket = await ticketService.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }
    
    // Only admins or ticket owners with PENDING status can delete
    if (req.user.role !== 'ADMIN' && 
        (req.user.id !== ticket.userId || ticket.status !== 'PENDING')) {
      return res.status(403).json({ message: 'Truy cập bị từ chối' });
    }
    
    await ticketService.deleteTicket(id);
    res.status(200).json({ message: 'Xóa vé thành công' });
  } catch (error) {
    console.error('Lỗi xóa vé:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Khóa ghế (POST /api/tickets/lock/:id) - Khóa ghế trong 15 phút
const lockSeat = async (req, res) => {
  try {
    const seatId = parseInt(req.params.id);
    const result = await ticketService.lockSeat(seatId);
    
    // Đặt thời gian khóa ghế trong 15 phút
    setTimeout(async () => {
      try {
        await ticketService.checkAndUnlockSeat(seatId);
      } catch (error) {
        console.error('Lỗi mở khóa ghế:', error);
      }
    }, 15 * 60 * 1000); // 15 minutes
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi khóa ghế:', error);
    if (error.message === 'Ghế không có sẵn' || error.message === 'Không tìm thấy ghế') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Mở khóa ghế (POST /api/tickets/unlock/:id) - Mở khóa ghế
const unlockSeat = async (req, res) => {
  try {
    const seatId = parseInt(req.params.id);
    const result = await ticketService.unlockSeat(seatId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi mở khóa ghế:', error);
    if (error.message === 'Không tìm thấy ghế') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy ghế theo suất chiếu (GET /api/tickets/showtime/:showtimeId)
const getSeatsByShowtime = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.showtimeId);
    const seats = await ticketService.getSeatsByShowtime(showtimeId);
    res.status(200).json(seats);
  } catch (error) {
    console.error('Lỗi lấy ghế theo suất chiếu:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Áp dụng khuyến mãi (POST /api/tickets/:id/promotion)
const applyPromotion = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { promotionCode } = req.body;
    
    if (!promotionCode) {
      return res.status(400).json({ message: 'Mã khuyến mãi là bắt buộc' });
    }
    
    const ticket = await ticketService.getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }
    
    // Only ticket owner or admin can apply promotion
    if (req.user.role !== 'ADMIN' && req.user.id !== ticket.userId) {
      return res.status(403).json({ message: 'Truy cập bị từ chối' });
    }
    
    const updatedTicket = await ticketService.applyPromotion(ticketId, promotionCode);
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Lỗi áp dụng khuyến mãi:', error);
    if (error.message === 'Không tìm thấy khuyến mãi' || 
        error.message === 'Khuyến mãi đã hết hạn' || 
        error.message === 'Khuyến mãi không hoạt động') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketsByUserId,
  getTicketsByPaymentId,
  updateTicketsPayment,
  updateTicketStatus,
  updateTicketsStatus,
  deleteTicket,
  lockSeat,
  unlockSeat,
  getSeatsByShowtime,
  applyPromotion
};