const prisma = require("../../prisma/prisma");

const createPayment = async ({ tickets, concessionOrders, method }) => {
  // Kiểm tra xem có ticket nào không
  if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
    throw new Error("Không có vé để thanh toán");
  }

  // Lấy ticket IDs
  const ticketIds = tickets.map((ticket) => ticket.id);

  // Kiểm tra xem có payment nào đã tồn tại cho các vé này chưa
  const existingPayment = await prisma.payment.findFirst({
    where: {
      tickets: {
        some: {
          id: { in: ticketIds },
        },
      },
      status: { in: ["PENDING", "COMPLETED"] },
    },
  });

  if (existingPayment) {
    throw new Error("Payment already exists for one or more tickets");
  }

  // Kiểm tra method hợp lệ
  const validMethods = [
    "VNPAY",
    "CREDIT_CARD",
    "BANK_TRANSFER",
    "E_WALLET",
    "CASH",
    "ZALOPAY",
    "MOMO",
  ];
  if (!validMethods.includes(method)) {
    method = "CREDIT_CARD";
  }

  // Tính tổng số tiền thanh toán từ vé và bắp nước
  let totalAmount = 0;

  // Tính tổng tiền từ vé
  tickets.forEach((ticket) => {
    let amount = ticket.price || 0;

    // Áp dụng khuyến mãi nếu có
    if (ticket.promotion) {
      if (ticket.promotion.type === "PERCENTAGE") {
        amount = amount * (1 - ticket.promotion.discount / 100);
      } else if (ticket.promotion.type === "FIXED") {
        amount = Math.max(0, amount - ticket.promotion.discount);
      }
    }

    // Đảm bảo giá không âm
    amount = Math.max(0, amount);

    // Cộng vào tổng số tiền
    totalAmount += amount;
  });

  // Tính tổng tiền từ concession orders
  if (concessionOrders && Array.isArray(concessionOrders)) {
    concessionOrders.forEach((order) => {
      totalAmount += order.totalAmount || 0;
    });
  }

  // Làm tròn số tiền đến 2 chữ số thập phân
  totalAmount = Math.round(totalAmount * 100) / 100;

  // Tạo thanh toán mới
  const payment = await prisma.payment.create({
    data: {
      amount: totalAmount,
      method,
      status: "PENDING",
      createdAt: new Date(),
      appTransId:
        method === "VNPAY"
          ? `${Date.now()}-${Math.floor(Math.random() * 1000)}`
          : null,
      additionalData:
        method === "VNPAY"
          ? JSON.stringify({ amount: totalAmount * 100 })
          : null,
      tickets: {
        connect: ticketIds.map((id) => ({ id })),
      },
      concessionOrders: {
        connect: concessionOrders.map((order) => ({ id: order.id })),
      },
    },
    include: {
      tickets: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          showtime: {
            include: {
              movie: true,
              hall: true,
            },
          },
          seat: true,
          promotion: true,
        },
      },
      concessionOrders: {
        include: {
          items: true,
        },
      },
    },
  });

  return payment;
};

// Lấy thông tin thanh toán theo ID
const getPaymentById = async (id) => {
  return await prisma.payment.findUnique({
    where: { id },
    include: {
      tickets: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          showtime: {
            include: {
              movie: true,
              hall: true,
            },
          },
          seat: true,
          promotion: true,
        },
      },
      concessionOrders: {
        include: {
          items: true,
        },
      },
    },
  });
};

// Lấy thông tin thanh toán theo ticketId
const getPaymentByTicketId = async (ticketId) => {
  return await prisma.payment.findFirst({
    where: {
      tickets: {
        some: {
          id: ticketId,
        },
      },
    },
    include: {
      tickets: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          showtime: {
            include: {
              movie: true,
              hall: true,
            },
          },
          seat: true,
          promotion: true,
        },
      },
      concessionOrders: {
        include: {
          items: true,
        },
      },
    },
  });
};

// Cập nhật trạng thái thanh toán
const updatePaymentStatus = async (id, status) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      tickets: {
        include: {
          seat: true,
        },
      },
      concessionOrders: true,
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  const updatedPayment = await prisma.payment.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(),
      ...(status === "COMPLETED" ? { paymentDate: new Date() } : {}),
    },
    include: {
      tickets: {
        include: {
          seat: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          showtime: {
            include: {
              movie: true,
              hall: true,
            },
          },
          promotion: true,
        },
      },
      concessionOrders: {
        include: {
          items: true,
        },
      },
    },
  });

  // Nếu thanh toán thành công, cập nhật trạng thái tất cả các vé thành CONFIRMED
  if (status === "COMPLETED") {
    await prisma.ticket.updateMany({
      where: {
        id: {
          in: payment.tickets.map((ticket) => ticket.id),
        },
      },
      data: { status: "CONFIRMED" },
    });

    // Cập nhật trạng thái concession orders thành PAID
    await prisma.concessionOrder.updateMany({
      where: {
        id: {
          in: payment.concessionOrders.map((order) => order.id),
        },
      },
      data: { status: "PAID" },
    });
  }

  // Nếu thanh toán bị hủy hoặc thất bại, cập nhật trạng thái vé thành CANCELLED và mở khóa ghế
  if (status === "CANCELLED" || status === "FAILED") {
    const ticketIds = payment.tickets.map((ticket) => ticket.id);
    const orderIds = payment.concessionOrders.map((order) => order.id);

    // Cập nhật trạng thái các vé
    await prisma.ticket.updateMany({
      where: {
        id: {
          in: ticketIds,
        },
      },
      data: { status: "CANCELLED" },
    });

    // Cập nhật trạng thái các concession orders
    await prisma.concessionOrder.updateMany({
      where: {
        id: {
          in: orderIds,
        },
      },
      data: { status: "CANCELLED" },
    });

    // Mở khóa tất cả các ghế
    for (const ticket of payment.tickets) {
      if (ticket.seat) {
        await prisma.seat.update({
          where: { id: ticket.seat.id },
          data: {
            status: "AVAILABLE",
            lockedBy: null,
            lockedAt: null,
          },
        });
      }
    }
  }

  return updatedPayment;
};

// Lấy tất cả thanh toán của một người dùng
const getPaymentsByUserId = async (userId) => {
  return await prisma.payment.findMany({
    where: {
      tickets: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      tickets: {
        include: {
          showtime: {
            include: {
              movie: true,
              hall: true,
            },
          },
          seat: true,
          promotion: true,
        },
      },
      concessionOrders: {
        include: {
          items: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Tính toán thống kê thanh toán (cho admin)
const getPaymentStatistics = async (startDate, endDate) => {
  const where = {};
  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = new Date(startDate);
    if (endDate) where.createdAt.lte = new Date(endDate);
  }

  // Tổng số giao dịch
  const totalTransactions = await prisma.payment.count({ where });

  // Tổng số tiền của các giao dịch hoàn thành
  const totalAmount = await prisma.payment.aggregate({
    where: {
      ...where,
      status: "COMPLETED",
    },
    _sum: {
      amount: true,
    },
  });

  // Thống kê theo phương thức thanh toán
  const paymentMethodStats = await prisma.payment.groupBy({
    by: ["method"],
    where: {
      ...where,
      status: "COMPLETED",
    },
    _count: {
      id: true,
    },
    _sum: {
      amount: true,
    },
  });

  // Thống kê theo trạng thái thanh toán
  const paymentStatusStats = await prisma.payment.groupBy({
    by: ["status"],
    where,
    _count: {
      id: true,
    },
  });

  return {
    totalTransactions,
    totalCompleted: totalAmount._sum.amount || 0,
    methodStats: paymentMethodStats,
    statusStats: paymentStatusStats,
  };
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentByTicketId,
  updatePaymentStatus,
  getPaymentsByUserId,
  getPaymentStatistics,
};
