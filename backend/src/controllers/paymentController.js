// backend/src/controllers/paymentController.js
const paymentService = require("../services/paymentService");
const vnpayService = require("../services/vnpayService");
const prisma = require("../../prisma/prisma");

/**
 * Tạo thanh toán mới (POST /api/payments)
 */
const createPayment = async (req, res) => {
  try {
    const { ticketIds, method } = req.body;
    const userId = req.user?.id;

    // Validate input
    if (
      !ticketIds ||
      !Array.isArray(ticketIds) ||
      ticketIds.length === 0 ||
      !method
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Lấy thông tin của tất cả các vé
    const tickets = await prisma.ticket.findMany({
      where: { id: { in: ticketIds } },
      include: {
        user: true,
        showtime: true,
        promotion: true,
        seat: true,
      },
    });

    if (tickets.length === 0) {
      return res.status(404).json({ message: "Không tìm thấy vé" });
    }

    // Kiểm tra quyền truy cập (chỉ admin hoặc chủ sở hữu vé mới có thể tạo thanh toán)
    if (userId && req.user.role !== "ADMIN") {
      const unauthorizedTicket = tickets.find(
        (ticket) => ticket.userId !== userId
      );
      if (unauthorizedTicket) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Truyền vào service để tạo thanh toán
    const payment = await paymentService.createPayment({ tickets, method });

    // Xử lý theo phương thức thanh toán
    switch (method) {
      case "VNPAY":
        try {
          // Lấy địa chỉ IP của người dùng
          const ipAddr =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            "127.0.0.1";

          // Tạo đơn hàng VNPay và lấy URL thanh toán
          const vnpayOrder = await vnpayService.createVNPayOrder(
            payment,
            tickets[0],
            ipAddr
          );
          console.log("VNPay order created:", vnpayOrder);

          return res.status(201).json({
            ...payment,
            paymentUrl: vnpayOrder.paymentUrl,
            orderToken: vnpayOrder.orderToken,
          });
        } catch (error) {
          console.error("VNPay error:", error);
          await paymentService.updatePaymentStatus(payment.id, "FAILED");
          return res
            .status(400)
            .json({ message: `Lỗi tạo thanh toán VNPAY: ${error.message}` });
        }
      default:
        // Với các phương thức thanh toán khác, trả về payment bình thường
        res.status(201).json(payment);
    }
  } catch (error) {
    console.error("Error creating payment:", error);
    if (error.message === "Payment already exists for one or more tickets") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Xử lý kết quả thanh toán từ VNPay (GET /api/payments/vnpay-return)
 */
const vnpayReturn = async (req, res) => {
  try {
    const vnpayData = req.query;
    console.log("VNPay return data:", vnpayData);

    // Xử lý dữ liệu trả về qua service
    const result = await vnpayService.processVNPayReturn(vnpayData);

    if (result.success) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/booking/payment?paymentId=${result.paymentId}&status=success`
      );
    } else {
      return res.redirect(
        `${process.env.FRONTEND_URL}/booking/payment/result?paymentId=${result.paymentId}&status=failed&code=${result.responseCode}`
      );
    }
  } catch (error) {
    console.error("Error processing VNPay return:", error);
    return res.redirect(
      `${
        process.env.FRONTEND_URL
      }/payment/result?error=true&message=${encodeURIComponent(error.message)}`
    );
  }
};

/**
 * VNPay IPN (Instant Payment Notification) handler (POST /api/payments/vnpay-ipn)
 */
const vnpayIPN = async (req, res) => {
  try {
    const ipnData = req.query;
    console.log("VNPay IPN received:", ipnData);

    // Xử lý IPN qua service
    const result = await vnpayService.processVNPayIPN(ipnData);

    // VNPay yêu cầu trả về đúng định dạng này
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error processing VNPay IPN:", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

/**
 * Kiểm tra trạng thái thanh toán VNPay (GET /api/payments/:id/check-vnpay-status)
 */
const checkVNPayStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (!payment.appTransId || payment.method !== "VNPAY") {
      return res
        .status(400)
        .json({ message: "This payment was not processed by VNPay" });
    }

    // Lấy địa chỉ IP của người dùng
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    try {
      // Kiểm tra trạng thái giao dịch
      const result = await vnpayService.checkTransactionStatus(payment, ipAddr);
      return res.status(200).json(result);
    } catch (error) {
      // Trả về thông tin cơ bản nếu có lỗi
      return res.status(200).json({
        status: payment.status,
        message: `Không thể kiểm tra chi tiết: ${error.message}`,
        paymentId: payment.id,
        appTransId: payment.appTransId,
        error: true,
      });
    }
  } catch (error) {
    console.error("Error checking VNPay status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Lấy thông tin thanh toán theo ID (GET /api/payments/:id)
 */
const getPaymentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;

    const payment = await paymentService.getPaymentById(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Kiểm tra quyền truy cập (chỉ admin hoặc chủ sở hữu vé mới có thể xem)
    if (userId && req.user.role !== "ADMIN") {
      const unauthorizedTicket = payment.tickets.find(
        (ticket) => ticket.userId !== userId
      );
      if (unauthorizedTicket) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error getting payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy thông tin thanh toán theo ID vé (GET /api/payments/ticket/:ticketId)
const getPaymentByTicketId = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const userId = req.user?.id;

    // Trước tiên xem ticket thuộc về ai
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    // Kiểm tra quyền truy cập với ticket
    if (userId && req.user.role !== "ADMIN" && userId !== ticket.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const payment = await paymentService.getPaymentByTicketId(ticketId);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    res.status(200).json(payment);
  } catch (error) {
    console.error("Error getting payment by ticket:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật trạng thái thanh toán (PUT /api/payments/:id/status)
const updatePaymentStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    const userId = req.user?.id;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ["PENDING", "COMPLETED", "CANCELLED", "FAILED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Kiểm tra thanh toán tồn tại
    const payment = await paymentService.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Kiểm tra quyền truy cập
    if (userId && req.user.role !== "ADMIN") {
      const unauthorizedTicket = payment.tickets.find(
        (ticket) => ticket.userId !== userId
      );
      if (unauthorizedTicket) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Thêm kiểm tra nghiệp vụ: nếu không phải admin, user chỉ được phép hủy thanh toán
    if (userId && req.user.role !== "ADMIN" && status !== "CANCELLED") {
      return res
        .status(403)
        .json({ message: "You can only cancel your own payment" });
    }

    const updatedPayment = await paymentService.updatePaymentStatus(id, status);
    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Mô phỏng webhook từ cổng thanh toán (POST /api/payments/webhook)
const paymentWebhook = async (req, res) => {
  try {
    const { paymentId, status, transactionId } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Kiểm tra thanh toán tồn tại
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    const updatedPayment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status,
        transactionId,
        ...(status === "COMPLETED" ? { paymentDate: new Date() } : {}),
      },
    });

    // Gọi service để xử lý các thay đổi liên quan đến trạng thái vé
    if (status === "COMPLETED" || status === "CANCELLED") {
      await paymentService.updatePaymentStatus(paymentId, status);
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Error processing payment webhook:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const simulatePaymentSuccess = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const result = await vnpayService.simulatePaymentSuccess(paymentId);

    res.status(200).json({
      success: true,
      message: "Payment simulated successfully",
      result,
    });
  } catch (error) {
    console.error("Error simulating payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentByTicketId,
  updatePaymentStatus,
  paymentWebhook,
  simulatePaymentSuccess,
  vnpayReturn,
  vnpayIPN,
  checkVNPayStatus,
};
