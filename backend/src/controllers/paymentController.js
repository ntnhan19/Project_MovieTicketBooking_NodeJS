// frontend/src/controllers/paymentController.js
const paymentService = require("../services/paymentService");
const zaloPayService = require("../services/zaloPayService");
const prisma = require("../../prisma/prisma");

// Tạo thanh toán mới (POST /api/payments)
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
      case "ZALOPAY":
        try {
          // Chỉ dùng vé đầu tiên để tạo thông tin thanh toán, nhưng payment sẽ liên kết với tất cả vé
          const zaloPayOrder = await zaloPayService.createZaloPayOrder(
            payment,
            tickets[0]
          );

          return res.status(201).json({
            ...payment,
            paymentUrl: zaloPayOrder.paymentUrl,
            orderToken: zaloPayOrder.orderToken,
          });
        } catch (zaloPayError) {
          console.error("ZaloPay payment creation error:", zaloPayError);
          // Cập nhật trạng thái thanh toán thành FAILED nếu có lỗi
          await paymentService.updatePaymentStatus(payment.id, "FAILED");
          return res
            .status(400)
            .json({
              message: `Lỗi tạo thanh toán ZaloPay: ${zaloPayError.message}`,
            });
        }

      case "VNPAY":
        try {
          // Ở đây bạn cần triển khai VNPayService
          // const vnpayOrder = await vnpayService.createVnpayOrder(payment, tickets);
          // Tạm thời trả về thông báo chưa triển khai
          return res.status(200).json({
            ...payment,
            message: "Chức năng thanh toán VNPAY đang được phát triển",
          });
        } catch (error) {
          await paymentService.updatePaymentStatus(payment.id, "FAILED");
          return res
            .status(400)
            .json({ message: `Lỗi tạo thanh toán VNPAY: ${error.message}` });
        }

      case "MOMO":
        try {
          // Tạm thời trả về payment đã tạo với thông báo phương thức đang phát triển
          return res.status(200).json({
            ...payment,
            message: "Chức năng thanh toán MOMO đang được phát triển",
            // Thêm các thông tin giả định để frontend có thể tiếp tục
            status: "PENDING",
            method: "MOMO",
          });

          // Khi có momoService, bỏ comment phần code dưới
          /*
            const momoOrder = await momoService.createMomoOrder(payment, tickets);
            return res.status(201).json({
              ...payment,
              paymentUrl: momoOrder.paymentUrl,
              orderToken: momoOrder.orderToken
            });
            */
        } catch (error) {
          await paymentService.updatePaymentStatus(payment.id, "FAILED");
          return res
            .status(400)
            .json({ message: `Lỗi tạo thanh toán MOMO: ${error.message}` });
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

// Xử lý callback từ ZaloPay (POST /api/payments/zalopay-callback)
const zaloPayCallback = async (req, res) => {
  try {
    const callbackData = req.body;
    console.log("ZaloPay callback received:", callbackData);

    const result = await zaloPayService.processZaloPayCallback(callbackData);

    // ZaloPay expects these specific response codes
    res.status(200).json({
      return_code: result.return_code,
      return_message: result.return_message,
    });
  } catch (error) {
    console.error("Error processing ZaloPay callback:", error);
    res.status(200).json({
      return_code: 0, // ZaloPay error code
      return_message: "Internal server error",
    });
  }
};

// Kiểm tra trạng thái thanh toán ZaloPay (GET /api/payments/:id/check-status)
const checkZaloPayStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payment = await prisma.payment.findUnique({
      where: { id },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (!payment.appTransId) {
      return res
        .status(400)
        .json({ message: "This payment was not processed by ZaloPay" });
    }

    const statusResult = await zaloPayService.checkPaymentStatus(
      payment.appTransId
    );

    if (statusResult.return_code === 1) {
      // Cập nhật trạng thái thanh toán từ ZaloPay nếu khác với trạng thái hiện tại
      if (statusResult.data.status === 1 && payment.status !== "COMPLETED") {
        await paymentService.updatePaymentStatus(id, "COMPLETED");
      } else if (
        statusResult.data.status !== 1 &&
        payment.status === "PENDING"
      ) {
        await paymentService.updatePaymentStatus(id, "FAILED");
      }
    }

    res.status(200).json({
      paymentId: id,
      zaloStatus: statusResult.data.status,
      appTransId: payment.appTransId,
      status: payment.status,
      return_message: statusResult.return_message,
    });
  } catch (error) {
    console.error("Error checking ZaloPay status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ZaloPay redirect controller (GET /api/payments/zalopay-result)
const zaloPayRedirect = async (req, res) => {
  // Xử lý khi người dùng được redirect từ ZaloPay về
  const { app_trans_id, status } = req.query;

  try {
    // Tìm payment dựa trên app_trans_id
    const payment = await prisma.payment.findFirst({
      where: { appTransId: app_trans_id },
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    // Chuyển hướng về trang kết quả thanh toán với thông tin
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/result?paymentId=${payment.id}&status=${status}`
    );
  } catch (error) {
    console.error("Error processing ZaloPay redirect:", error);
    return res.redirect(
      `${process.env.FRONTEND_URL}/payment/result?error=true`
    );
  }
};

// Lấy thông tin thanh toán theo ID (GET /api/payments/:id)
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
      const unauthorizedTicket = payment.ticket.find(
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
      const unauthorizedTicket = payment.ticket.find(
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
    const result = await zaloPayService.simulatePaymentSuccess(paymentId);

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
  zaloPayCallback,
  checkZaloPayStatus,
  zaloPayRedirect,
  simulatePaymentSuccess,
};
