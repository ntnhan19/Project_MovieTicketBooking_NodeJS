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
      error.message.includes("Suất chiếu chưa có giá cơ bản") ||
      (error.message.includes("Ghế") &&
        error.message.includes("không thể mở khóa"))
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
    const filter = {
      status: req.query.status,
      search: req.query.search,
      fromDate: req.query.fromDate,
      toDate: req.query.toDate,
      _sort: req.query._sort,
      _order: req.query._order,
    };

    const tickets = await ticketService.getAllTickets(page, limit, filter);
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
    const ticket = await ticketService.getTicketBySeatId(
      seatId,
      userId,
      status
    );
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
    const result = await ticketService.updateTicketsPayment(
      ticketIds,
      paymentId
    );
    res
      .status(200)
      .json({ message: `Updated ${result.count} tickets with payment ID` });
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
    if (req.user.role !== "ADMIN" && req.user.id !== ticket.userId) {
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
      error.message === "Khuyến mãi không còn hiệu lực" ||
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

const generateTicketQR = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID vé không hợp lệ",
      });
    }

    const result = await ticketService.generateTicketQR(ticketId);

    res.status(200).json({
      success: true,
      message: result.isExisting
        ? "QR code đã tồn tại"
        : "Tạo QR code thành công",
      data: {
        qrCodeUrl: result.qrCodeUrl,
        qrData: result.qrData,
        ticket: {
          id: result.ticket.id,
          status: result.ticket.status,
          movie: result.ticket.showtime.movie.title,
          cinema: result.ticket.showtime.hall.cinema.name,
          showtime: result.ticket.showtime.startTime,
        },
        metadata: result.metadata,
        isExisting: result.isExisting,
      },
    });
  } catch (error) {
    console.error("[TicketController] Lỗi khi tạo QR code:", error);

    if (error.message.includes("Không tìm thấy vé")) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé để tạo mã QR",
      });
    }

    if (error.message.includes("chưa được xác nhận")) {
      return res.status(400).json({
        success: false,
        message: "Chỉ có thể tạo mã QR cho vé đã được xác nhận thanh toán",
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ khi tạo mã QR",
    });
  }
};

// Xác thực mã QR - ĐÃ CẬP NHẬT
const validateTicketQR = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({
        success: false,
        message: "Dữ liệu QR là bắt buộc",
      });
    }

    const result = await ticketService.validateQR(qrData);

    res.status(200).json({
      success: true,
      message: result.message,
      data: {
        ticket: {
          id: result.ticket.id,
          status: result.ticket.status,
          price: result.ticket.price,
          checkInTime: result.checkInTime,
        },
        showtime: result.showtimeInfo,
        concession: result.concessionInfo,
        user: {
          name: result.ticket.user.name,
          email: result.ticket.user.email,
        },
        promotion: result.ticket.promotion
          ? {
              code: result.ticket.promotion.code,
              discount: result.ticket.promotion.discount,
            }
          : null,
      },
    });
  } catch (error) {
    console.error("[TicketController] Lỗi khi xác thực mã QR:", error);

    // Phân loại lỗi cụ thể
    if (error.message.includes("không hợp lệ")) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errorType: "INVALID_QR",
      });
    }

    if (error.message.includes("đã được sử dụng")) {
      return res.status(409).json({
        success: false,
        message: error.message,
        errorType: "ALREADY_USED",
      });
    }

    if (error.message.includes("đã bị hủy")) {
      return res.status(409).json({
        success: false,
        message: error.message,
        errorType: "CANCELLED",
      });
    }

    if (
      error.message.includes("chưa đến giờ") ||
      error.message.includes("đã kết thúc")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
        errorType: "TIME_INVALID",
      });
    }

    res.status(400).json({
      success: false,
      message: error.message || "Xác thực mã QR thất bại",
      errorType: "VALIDATION_ERROR",
    });
  }
};

// Lấy thông tin QR (không check-in)
const getQRInfo = async (req, res) => {
  try {
    const { qrData } = req.body;

    if (!qrData) {
      return res.status(400).json({ message: "Dữ liệu QR là bắt buộc" });
    }

    const info = await ticketService.getQRInfo(qrData);

    res.status(200).json({
      message: "Lấy thông tin QR thành công",
      data: info,
    });
  } catch (error) {
    console.error("[TicketController] Lỗi khi lấy thông tin QR:", error);
    res.status(400).json({
      message: error.message || "Không thể đọc thông tin mã QR",
    });
  }
};

// Kiểm tra trạng thái QR
const checkQRStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const ticketId = parseInt(id);

    if (isNaN(ticketId) || ticketId <= 0) {
      return res.status(400).json({ message: "ID vé không hợp lệ" });
    }

    const statusResult = await ticketService.checkQRStatus(ticketId);

    res.status(200).json({
      message: "Kiểm tra trạng thái QR thành công",
      valid: statusResult.valid,
      reason: statusResult.reason,
      ticket: statusResult.ticket,
      canCheckInAt: statusResult.canCheckInAt,
    });
  } catch (error) {
    console.error("[TicketController] Lỗi khi kiểm tra trạng thái QR:", error);
    res.status(500).json({
      message: error.message || "Lỗi máy chủ khi kiểm tra trạng thái QR",
    });
  }
};

// Lấy thống kê vé của người dùng
const getUserTicketStats = async (req, res) => {
  try {
    const { userId } = req.params;

    // Kiểm tra quyền truy cập
    if (req.user.role !== "ADMIN" && req.user.id != userId) {
      return res.status(403).json({
        success: false,
        message: "Truy cập bị từ chối: Bạn không có quyền xem thống kê này",
      });
    }

    // Lấy thống kê từ ticketService
    const filter = { userId: parseInt(userId) };
    const stats = await ticketService.getTicketStats(filter);

    res.status(200).json({
      success: true,
      data: {
        totalTickets: stats.total,
        confirmedTickets: stats.confirmed,
        usedTickets: stats.used,
        cancelledTickets: stats.cancelled,
        pendingTickets: stats.pending,
      },
    });
  } catch (error) {
    console.error(
      "[TicketController] Lỗi khi lấy thống kê vé của user:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy thống kê vé",
    });
  }
};

/**
 * Tính tổng tiền bắp nước từ danh sách đơn hàng
 * @param {Array} concessionOrders - Danh sách đơn hàng bắp nước
 * @returns {number} - Tổng tiền bắp nước
 */
const calculateConcessionTotal = (concessionOrders) => {
  if (!concessionOrders || !Array.isArray(concessionOrders)) {
    return 0;
  }

  return concessionOrders.reduce((orderSum, order) => {
    if (!order.items || !Array.isArray(order.items)) {
      return orderSum;
    }

    const orderTotal = order.items.reduce((itemSum, orderItem) => {
      let price = 0;
      const quantity = parseInt(orderItem.quantity) || 0;

      // Ưu tiên lấy giá từ item hoặc combo
      if (orderItem.item?.price) {
        price = parseFloat(orderItem.item.price);
      } else if (orderItem.combo?.price) {
        price = parseFloat(orderItem.combo.price);
      } else if (orderItem.price) {
        price = parseFloat(orderItem.price);
      }

      return itemSum + price * quantity;
    }, 0);

    return orderSum + orderTotal;
  }, 0);
};

const getTicketWithFullDetails = async (req, res) => {
  try {
    // Validate input
    const id = parseInt(req.params.id);
    if (isNaN(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID vé không hợp lệ",
        code: "INVALID_TICKET_ID",
      });
    }

    // Kiểm tra user authentication
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Bạn cần đăng nhập để xem thông tin vé",
        code: "AUTHENTICATION_REQUIRED",
      });
    }

    // Lấy thông tin vé
    const ticket = await ticketService.getTicketWithFullDetails(id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy vé",
        code: "TICKET_NOT_FOUND",
      });
    }

    // Kiểm tra quyền truy cập
    if (req.user.role !== "ADMIN" && req.user.id !== ticket.userId) {
      return res.status(403).json({
        success: false,
        message: "Bạn không có quyền xem vé này",
        code: "ACCESS_DENIED",
      });
    }

    // Thêm một số thông tin tính toán hữu ích
    const processedTicket = {
      ...ticket,
      totalConcessionAmount: calculateConcessionTotal(ticket.concessionOrders),
      isExpired: new Date(ticket.showtime.startTime) < new Date(),
    };

    res.status(200).json({
      success: true,
      data: processedTicket,
      message: "Lấy thông tin vé thành công",
    });
  } catch (error) {
    console.error(
      "[TicketController] Lỗi khi lấy thông tin chi tiết vé:",
      error
    );

    // Phân loại lỗi để trả về response phù hợp
    if (error.message.includes("Không thể lấy thông tin vé")) {
      return res.status(500).json({
        success: false,
        message: "Lỗi khi truy xuất dữ liệu vé",
        code: "DATABASE_ERROR",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi máy chủ nội bộ",
      code: "INTERNAL_SERVER_ERROR",
      ...(process.env.NODE_ENV === "development" && { error: error.message }),
    });
  }
};

// Kiểm tra xem vé có thể hủy được không
const canCancelTicket = async (ticketId, userId = null) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
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
        user: true,
        payment: true,
      },
    });

    if (!ticket) {
      return {
        canCancel: false,
        reason: "Không tìm thấy vé",
        code: "TICKET_NOT_FOUND",
      };
    }

    // Kiểm tra quyền sở hữu vé (nếu userId được cung cấp)
    if (userId && ticket.userId !== userId) {
      return {
        canCancel: false,
        reason: "Bạn không có quyền hủy vé này",
        code: "UNAUTHORIZED",
      };
    }

    // Kiểm tra trạng thái vé
    if (ticket.status === "CANCELLED") {
      return {
        canCancel: false,
        reason: "Vé đã được hủy trước đó",
        code: "ALREADY_CANCELLED",
      };
    }

    if (ticket.status === "USED") {
      return {
        canCancel: false,
        reason: "Vé đã được sử dụng, không thể hủy",
        code: "ALREADY_USED",
      };
    }

    // Kiểm tra thời gian - chỉ cho phép hủy trước giờ chiếu ít nhất 2 tiếng
    const showtimeStart = new Date(ticket.showtime.startTime);
    const now = new Date();
    const timeUntilShow = showtimeStart.getTime() - now.getTime();
    const hoursUntilShow = timeUntilShow / (1000 * 60 * 60);

    const minCancelHours = 2; // Tối thiểu 2 tiếng trước giờ chiếu
    if (hoursUntilShow < minCancelHours) {
      return {
        canCancel: false,
        reason: `Chỉ có thể hủy vé trước ${minCancelHours} tiếng so với giờ chiếu. Thời gian còn lại: ${Math.max(
          0,
          hoursUntilShow
        ).toFixed(1)} tiếng`,
        code: "TIME_LIMIT_EXCEEDED",
        timeRemaining: hoursUntilShow,
        minRequiredHours: minCancelHours,
      };
    }

    // Kiểm tra chính sách hoàn tiền dựa trên thời gian
    let refundPercentage = 100;
    if (hoursUntilShow < 24) {
      refundPercentage = 50; // Hoàn 50% nếu hủy trong vòng 24h
    } else if (hoursUntilShow < 48) {
      refundPercentage = 80; // Hoàn 80% nếu hủy trong vòng 48h
    }

    const refundAmount =
      Math.round(((ticket.price * refundPercentage) / 100) * 100) / 100;

    return {
      canCancel: true,
      ticket: {
        id: ticket.id,
        status: ticket.status,
        price: ticket.price,
        movieTitle: ticket.showtime.movie.title,
        cinemaName: ticket.showtime.hall.cinema.name,
        hallName: ticket.showtime.hall.name,
        seatPosition: `${ticket.seat.row}${ticket.seat.column}`,
        showtime: ticket.showtime.startTime,
        createdAt: ticket.createdAt,
      },
      refundInfo: {
        refundPercentage,
        refundAmount,
        originalAmount: ticket.price,
        deductedAmount: ticket.price - refundAmount,
      },
      timeInfo: {
        hoursUntilShow: Math.round(hoursUntilShow * 10) / 10,
        showtimeStart: ticket.showtime.startTime,
        currentTime: now,
      },
    };
  } catch (error) {
    console.error("[TicketService] Lỗi khi kiểm tra khả năng hủy vé:", error);
    return {
      canCancel: false,
      reason: "Lỗi hệ thống khi kiểm tra vé",
      code: "SYSTEM_ERROR",
      error: error.message,
    };
  }
};

// Hủy vé với lý do và xử lý hoàn tiền
const cancelTicketWithReason = async (
  ticketId,
  userId = null,
  reason = null
) => {
  try {
    // Kiểm tra khả năng hủy vé trước
    const cancelCheck = await canCancelTicket(ticketId, userId);
    if (!cancelCheck.canCancel) {
      throw new Error(cancelCheck.reason);
    }

    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { id: ticketId },
        include: {
          seat: true,
          showtime: {
            include: {
              movie: true,
              hall: { include: { cinema: true } },
            },
          },
          user: true,
          payment: true,
          concessionOrders: true,
        },
      });

      // Cập nhật trạng thái vé
      const updatedTicket = await tx.ticket.update({
        where: { id: ticketId },
        data: {
          status: "CANCELLED",
          qrCode: null, // Xóa QR code
          updatedAt: new Date(),
          // Có thể thêm trường cancellationReason nếu cần
          // cancellationReason: reason,
          // cancelledAt: new Date()
        },
      });

      // Mở khóa và cập nhật trạng thái ghế
      await seatService.unlockSeatIfLocked(ticket.seat.id, ticket.userId);
      await tx.seat.update({
        where: { id: ticket.seat.id },
        data: {
          status: "AVAILABLE",
          lockedBy: null,
          lockedAt: null,
        },
      });

      // Hủy đơn bắp nước (nếu có)
      if (ticket.concessionOrders.length > 0) {
        await tx.concessionOrder.updateMany({
          where: { ticketId: ticketId },
          data: {
            status: "CANCELLED",
            updatedAt: new Date(),
          },
        });
      }

      // Tính toán hoàn tiền
      const refundInfo = cancelCheck.refundInfo;

      console.log(
        `[TicketService] Đã hủy vé ${ticketId}. Hoàn tiền: ${refundInfo.refundAmount}/${refundInfo.originalAmount}`
      );

      return {
        success: true,
        message: "Hủy vé thành công",
        ticket: updatedTicket,
        refundInfo,
        cancelledAt: new Date().toISOString(),
        reason: reason || "Người dùng yêu cầu hủy",
      };
    });
  } catch (error) {
    console.error("[TicketService] Lỗi khi hủy vé:", error);
    throw new Error(error.message || "Không thể hủy vé");
  }
};

// Thêm vào cuối module.exports:
module.exports = {
  // ... các method hiện tại
  canCancelTicket,
  cancelTicketWithReason,
};

// ===== THÊM VÀO ticketController.js =====

// Kiểm tra khả năng hủy vé
const checkCancelTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id; // Từ middleware auth

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID vé không hợp lệ",
      });
    }

    const result = await ticketService.canCancelTicket(parseInt(id), userId);

    if (!result.canCancel) {
      return res.status(400).json({
        success: false,
        message: result.reason,
        code: result.code,
        ...result,
      });
    }

    res.json({
      success: true,
      message: "Vé có thể hủy được",
      data: result,
    });
  } catch (error) {
    console.error(
      "[TicketController] Lỗi khi kiểm tra khả năng hủy vé:",
      error
    );
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống",
      error: error.message,
    });
  }
};

// Hủy vé
const cancelTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user?.id; // Từ middleware auth

    if (!id || isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "ID vé không hợp lệ",
      });
    }

    const result = await ticketService.cancelTicketWithReason(
      parseInt(id),
      userId,
      reason
    );

    res.json({
      success: true,
      message: result.message,
      data: {
        ticket: result.ticket,
        refundInfo: result.refundInfo,
        cancelledAt: result.cancelledAt,
        reason: result.reason,
      },
    });
  } catch (error) {
    console.error("[TicketController] Lỗi khi hủy vé:", error);

    // Xử lý các loại lỗi khác nhau
    if (error.message.includes("Không tìm thấy vé")) {
      return res.status(404).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("không có quyền") ||
      error.message.includes("UNAUTHORIZED")
    ) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    if (
      error.message.includes("thời gian") ||
      error.message.includes("TIME_LIMIT")
    ) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi hủy vé",
      error: error.message,
    });
  }
};

// Hủy nhiều vé cùng lúc (cho admin hoặc bulk cancel)
const cancelMultipleTickets = async (req, res) => {
  try {
    const { ticketIds, reason } = req.body;
    const userId = req.user?.id;
    const isAdmin = req.user?.role === "ADMIN"; // Kiểm tra quyền admin

    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách ID vé không hợp lệ",
      });
    }

    const results = [];
    const errors = [];

    for (const ticketId of ticketIds) {
      try {
        const result = await ticketService.cancelTicketWithReason(
          ticketId,
          isAdmin ? null : userId, // Admin có thể hủy bất kỳ vé nào
          reason
        );
        results.push({ ticketId, success: true, data: result });
      } catch (error) {
        errors.push({ ticketId, success: false, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Đã xử lý ${ticketIds.length} vé. Thành công: ${results.length}, Lỗi: ${errors.length}`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: ticketIds.length,
          successful: results.length,
          failed: errors.length,
        },
      },
    });
  } catch (error) {
    console.error("[TicketController] Lỗi khi hủy nhiều vé:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi hệ thống khi hủy nhiều vé",
      error: error.message,
    });
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
  validateTicketQR,
  checkQRStatus,
  getQRInfo,
  getUserTicketStats,
  getTicketWithFullDetails,
  cancelMultipleTickets,
  cancelTicket,
  checkCancelTicket,
  canCancelTicket,
};
