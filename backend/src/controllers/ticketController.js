const ticketService = require("../services/ticketService");

// Tạo vé mới
const createTicket = async (req, res) => {
  try {
    const { userId, showtimeId, seats, promotionId } = req.body;

    if (
      !userId ||
      !showtimeId ||
      !seats ||
      !Array.isArray(seats) ||
      seats.length === 0
    ) {
      return res.status(400).json({
        message: "Missing required fields or seats must be a non-empty array",
      });
    }

    const numberedSeats = seats.map((seatId) =>
      typeof seatId === "string" ? parseInt(seatId) : seatId
    );
    const result = await ticketService.createTicket({
      userId,
      showtimeId,
      seats: numberedSeats,
      promotionId,
    });

    res.status(201).json({
      message: `Đã tạo ${result.tickets.length} vé thành công`,
      tickets: result.tickets,
      totalAmount: result.totalAmount,
      ticketIds: result.tickets.map((ticket) => ticket.id),
    });
  } catch (error) {
    console.error("Error creating tickets:", error);
    if (
      error.message === "Ghế không có sẵn" ||
      error.message === "Không tìm thấy người dùng" ||
      error.message === "Không tìm thấy suất chiếu" ||
      error.message === "Không tìm thấy ghế" ||
      error.message === "Khuyến mãi không hợp lệ" ||
      error.message.includes("Ghế") ||
      error.message.includes("không tồn tại") ||
      error.message.includes("Suất chiếu chưa có giá cơ bản")
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy tất cả vé
const getAllTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const tickets = await ticketService.getAllTickets(page, limit);
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Lỗi nhận được vé:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy vé theo ID
const getTicketById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({ message: "ID vé không hợp lệ" });
    }

    const ticket = await ticketService.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    if (req.user.role !== "ADMIN" && req.user.id !== ticket.userId) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }

    res.status(200).json(ticket);
  } catch (error) {
    console.error("[TicketController] Lỗi nhận được vé:", error);
    res.status(500).json({ message: "Lỗi máy chủ", error: error.message });
  }
};

// Lấy vé theo seatId
const getTicketBySeatId = async (req, res) => {
  try {
    const seatId = parseInt(req.params.seatId);
    const userId = parseInt(req.query.userId);
    const status = req.query.status || "PENDING";
    if (!seatId || !userId) {
      return res.status(400).json({ message: "Thiếu seatId hoặc userId" });
    }
    const ticket = await ticketService.getTicketBySeatId(seatId, userId, status);
    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }
    res.status(200).json(ticket);
  } catch (error) {
    console.error("Lỗi khi lấy vé theo seatId:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy vé theo userId
const getTicketsByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    if (req.user.role !== "ADMIN" && req.user.id !== userId) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }
    const tickets = await ticketService.getTicketsByUserId(userId);
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error getting user tickets:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy vé theo paymentId
const getTicketsByPaymentId = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.paymentId);
    const tickets = await ticketService.getTicketsByPaymentId(paymentId);
    res.status(200).json(tickets);
  } catch (error) {
    console.error("Error getting tickets by payment ID:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Cập nhật payment cho nhiều vé
const updateTicketsPayment = async (req, res) => {
  try {
    const { ticketIds, paymentId } = req.body;
    if (!ticketIds || !Array.isArray(ticketIds) || !paymentId) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    const result = await ticketService.updateTicketsPayment(ticketIds, paymentId);
    res.status(200).json({ message: `Updated ${result.count} tickets with payment ID` });
  } catch (error) {
    console.error("Error updating tickets payment:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Cập nhật trạng thái một vé
const updateTicketStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }
    const validStatuses = ["PENDING", "CONFIRMED", "USED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    const ticket = await ticketService.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }
    if (req.user.role !== "ADMIN" && req.user.id !== ticket.userId) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }
    const updatedTicket = await ticketService.updateTicketStatus(id, status);
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái vé:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Cập nhật trạng thái nhiều vé
const updateTicketsStatus = async (req, res) => {
  try {
    const { ticketIds, status } = req.body;
    if (!ticketIds || !Array.isArray(ticketIds) || !status) {
      return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
    }
    const validStatuses = ["PENDING", "CONFIRMED", "USED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ" });
    }
    const result = await ticketService.updateTicketsStatus(ticketIds, status);
    res.status(200).json({
      message: `Đã cập nhật ${result.count} vé với trạng thái: ${status}`,
      ticketIds,
    });
  } catch (error) {
    console.error("Lỗi cập nhật trạng thái vé:", error);
    res.status(500).json({ message: "Lỗi máy chủ khi cập nhật trạng thái vé" });
  }
};

// Xóa vé
const deleteTicket = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ticket = await ticketService.getTicketById(id);
    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }
    if (
      req.user.role !== "ADMIN" &&
      req.user.id !== ticket.userId
    ) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }
    await ticketService.deleteTicket(id);
    res.status(200).json({ message: "Xóa vé thành công" });
  } catch (error) {
    console.error("Lỗi xóa vé:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Áp dụng khuyến mãi
const applyPromotion = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.id);
    const { promotionCode } = req.body;
    if (!promotionCode) {
      return res.status(400).json({ message: "Mã khuyến mãi là bắt buộc" });
    }
    const ticket = await ticketService.getTicketById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }
    if (req.user.role !== "ADMIN" && req.user.id !== ticket.userId) {
      return res.status(403).json({ message: "Truy cập bị từ chối" });
    }
    const updatedTicket = await ticketService.applyPromotion(
      ticketId,
      promotionCode
    );
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error("Lỗi áp dụng khuyến mãi:", error);
    if (
      error.message === "Không tìm thấy khuyến mãi" ||
      error.message === "Khuyến mãi đã hết hạn" ||
      error.message === "Khuyến mãi không hoạt động"
    ) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Lấy thống kê vé
const getTicketStats = async (req, res) => {
  try {
    const filter = {};
    if (req.query.fromDate) filter.fromDate = req.query.fromDate;
    if (req.query.toDate) filter.toDate = req.query.toDate;
    const stats = await ticketService.getTicketStats(filter);
    res.status(200).json(stats);
  } catch (error) {
    console.error("Lỗi khi lấy thống kê vé:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// Tạo mã QR
const generateTicketQR = async (req, res) => {
  try {
    const { id } = req.params;
    const qrCodeUrl = await ticketService.generateTicketQR(parseInt(id));
    res.status(200).json({ qrCode: qrCodeUrl });
  } catch (error) {
    console.error('Lỗi khi tạo mã QR:', error);
    res.status(500).json({ message: error.message || 'Lỗi máy chủ' });
  }
};

// Xác thực mã QR
const validateTicketQR = async (req, res) => {
  try {
    const { qrData } = req.body;
    const result = await ticketService.validateQR(qrData);
    res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi khi xác thực mã QR:', error);
    res.status(400).json({ message: error.message || 'Xác thực thất bại' });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketBySeatId,
  getTicketsByUserId,
  getTicketsByPaymentId,
  updateTicketsPayment,
  updateTicketStatus,
  updateTicketsStatus,
  deleteTicket,
  applyPromotion,
  getTicketStats,
  generateTicketQR,
  validateTicketQR
};