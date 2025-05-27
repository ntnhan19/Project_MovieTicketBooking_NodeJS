// backend/src/controllers/paymentController.js
const paymentService = require("../services/paymentService");
const vnpayService = require("../services/vnpayService");
const seatService = require("../services/seatService");
const prisma = require("../../prisma/prisma");

const createPayment = async (req, res) => {
  try {
    const { ticketIds, concessionOrderIds, method } = req.body;
    const userId = req.user?.id;

    if (
      !ticketIds ||
      !Array.isArray(ticketIds) ||
      ticketIds.length === 0 ||
      !method
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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

    if (userId && req.user.role !== "ADMIN") {
      const unauthorizedTicket = tickets.find(
        (ticket) => ticket.userId !== userId
      );
      if (unauthorizedTicket) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Kiểm tra concessionOrderIds nếu được cung cấp
    let concessionOrders = [];
    if (concessionOrderIds && Array.isArray(concessionOrderIds)) {
      concessionOrders = await prisma.concessionOrder.findMany({
        where: { id: { in: concessionOrderIds } },
      });

      if (concessionOrderIds.length !== concessionOrders.length) {
        return res
          .status(404)
          .json({ message: "Một số đơn hàng bắp nước không tìm thấy" });
      }

      // Kiểm tra quyền sở hữu concession orders
      if (userId && req.user.role !== "ADMIN") {
        const unauthorizedOrder = concessionOrders.find(
          (order) => order.userId !== userId
        );
        if (unauthorizedOrder) {
          return res
            .status(403)
            .json({ message: "Access denied for some concession orders" });
        }
      }
    }

    const payment = await paymentService.createPayment({
      tickets,
      concessionOrders,
      method,
    });

    switch (method) {
      case "VNPAY":
        try {
          const ipAddr =
            req.headers["x-forwarded-for"] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            "127.0.0.1";
          const vnpayOrder = await vnpayService.createVNPayOrder(
            payment,
            tickets[0],
            ipAddr
          );
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

const vnpayReturn = async (req, res) => {
  try {
    const vnpayData = req.query;
    const io = req.app.get("io");
    const result = await vnpayService.processVNPayReturn(vnpayData);

    if (!result.success && result.seatIds.length > 0) {
      const payment = await prisma.payment.findUnique({
        where: { id: result.paymentId },
        include: { tickets: { include: { seat: true } } },
      });
      const showtimeId = payment.tickets[0]?.showtimeId;
      if (showtimeId) {
        result.seatIds.forEach((seatId) => {
          io.to(`showtime:${showtimeId}`).emit("seatUpdate", {
            seatId,
            status: "AVAILABLE",
          });
        });
      }
    }

    if (result.success) {
      const payment = await paymentService.getPaymentById(result.paymentId);
      return res.redirect(
        `${process.env.FRONTEND_URL}/booking/payment?paymentId=${
          result.paymentId
        }&status=success&transactionId=${
          payment.transactionId || result.transactionId
        }`
      );
    } else {
      return res.redirect(
        `${process.env.FRONTEND_URL}/booking/payment/result?paymentId=${
          result.paymentId
        }&status=failed&code=${
          result.responseCode
        }&seatIds=${encodeURIComponent(JSON.stringify(result.seatIds))}`
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

const vnpayIPN = async (req, res) => {
  try {
    const ipnData = req.query;
    const result = await vnpayService.processVNPayIPN(ipnData);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error processing VNPay IPN:", error);
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

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

    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      "127.0.0.1";

    const result = await vnpayService.checkTransactionStatus(payment, ipAddr);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Error checking VNPay status:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getPaymentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user?.id;
    const payment = await paymentService.getPaymentById(id);

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

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

const getPaymentByTicketId = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const userId = req.user?.id;
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      select: { userId: true },
    });

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

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

    const payment = await paymentService.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Kiểm tra quyền: Người dùng chỉ có thể hủy thanh toán của chính mình
    if (userId && req.user.role !== "ADMIN") {
      const isOwner = payment.tickets.some(
        (ticket) => ticket.userId === userId
      );
      if (!isOwner && status !== "CANCELLED") {
        return res
          .status(403)
          .json({ message: "You can only cancel your own payment" });
      }
    }

    const updatedPayment = await paymentService.updatePaymentStatus(id, status);
    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error("Error updating payment status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const paymentWebhook = async (req, res) => {
  try {
    const { paymentId, status, transactionId } = req.body;

    if (!paymentId || !status) {
      return res.status(400).json({ message: "Missing required fields" });
    }

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

const getPayments = async (req, res) => {
  try {
    const {
      page = 1,
      perPage = 10,
      sortBy = "createdAt",
      sortOrder = "desc",
      status,
      method,
      search,
      startDate,
      endDate,
    } = req.query;

    const where = {};
    if (status) {
      where.status = status;
    }
    if (method) {
      where.method = method;
    }
    if (search) {
      where.OR = [
        { transactionId: { contains: search, mode: "insensitive" } },
        { appTransId: { contains: search, mode: "insensitive" } },
      ];
    }
    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    const total = await prisma.payment.count({ where });
    const payments = await prisma.payment.findMany({
      where,
      skip: (Number(page) - 1) * Number(perPage),
      take: Number(perPage),
      orderBy: { [sortBy]: sortOrder.toLowerCase() },
      include: {
        tickets: { select: { id: true, status: true, price: true } },
        concessionOrders: {
          select: { id: true, status: true, totalAmount: true },
        },
      },
    });

    res.json({
      data: payments,
      total,
      page: Number(page),
      perPage: Number(perPage),
    });
  } catch (error) {
    console.error("Error in getPayments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getPaymentStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const where = {};
    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: new Date(startDate) };
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: new Date(endDate) };
    }

    const [totalTransactions, methodStats, statusStats] = await Promise.all([
      prisma.payment.count({ where }),
      prisma.payment.groupBy({
        by: ["method"],
        where,
        _count: true,
        _sum: { amount: true },
      }),
      prisma.payment.groupBy({
        by: ["status"],
        where,
        _count: true,
        _sum: { amount: true },
      }),
    ]);

    res.json({ totalTransactions, methodStats, statusStats });
  } catch (error) {
    console.error("Error in getPaymentStatistics:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const cancelPayment = async (req, res) => {
  try {
    const paymentId = parseInt(req.params.id);
    const userId = req.user?.id;

    // Kiểm tra payment có tồn tại không
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tickets: {
          include: { seat: true },
        },
        concessionOrders: true,
      },
    });

    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    // Kiểm tra quyền sở hữu: Người dùng chỉ có thể hủy thanh toán của chính mình
    const isOwner = payment.tickets.some((ticket) => ticket.userId === userId);
    if (!isOwner) {
      return res
        .status(403)
        .json({ message: "You can only cancel your own payment" });
    }

    // Kiểm tra trạng thái thanh toán: Chỉ có thể hủy nếu đang ở trạng thái PENDING
    if (payment.status !== "PENDING") {
      return res
        .status(400)
        .json({
          message: "Cannot cancel a payment that is not in PENDING status",
        });
    }

    // Cập nhật trạng thái payment thành CANCELLED
    const updatedPayment = await paymentService.updatePaymentStatus(
      paymentId,
      "CANCELLED"
    );

    // Phát tín hiệu real-time để cập nhật trạng thái ghế (nếu cần)
    const io = req.app.get("io");
    const showtimeId = payment.tickets[0]?.showtimeId;
    if (showtimeId) {
      payment.tickets.forEach((ticket) => {
        if (ticket.seat) {
          io.to(`showtime:${showtimeId}`).emit("seatUpdate", {
            seatId: ticket.seat.id,
            status: "AVAILABLE",
          });
        }
      });
    }

    res
      .status(200)
      .json({
        message: "Payment cancelled successfully",
        payment: updatedPayment,
      });
  } catch (error) {
    console.error("Error cancelling payment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createPayment,
  vnpayReturn,
  vnpayIPN,
  updatePaymentStatus,
  paymentWebhook,
  getPaymentById,
  getPaymentByTicketId,
  checkVNPayStatus,
  simulatePaymentSuccess,
  getPayments,
  getPaymentStatistics,
  cancelPayment,
};
