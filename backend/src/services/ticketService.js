const prisma = require("../../prisma/prisma");
const seatService = require("./seatService");
const mailService = require("./mailService");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");

// Tạo vé mới
const createTicket = async ({ userId, showtimeId, seats, promotionId }) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
  });
  if (!showtime) {
    throw new Error("Không tìm thấy suất chiếu");
  }

  if (showtime.price === null) {
    throw new Error("Suất chiếu chưa có giá cơ bản");
  }

  let finalPromoId = null;
  if (promotionId) {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId },
    });
    if (!promotion) {
      throw new Error("Khuyến mãi không hợp lệ");
    }
    const now = new Date();
    if (
      !promotion.isActive ||
      now < promotion.validFrom ||
      now > promotion.validUntil
    ) {
      throw new Error("Khuyến mãi không hợp lệ");
    }
    finalPromoId = promotionId;
  }

  const createdTickets = [];
  let totalPrice = 0;

  return await prisma.$transaction(async (tx) => {
    for (const seatId of seats) {
      const seat = await tx.seat.findUnique({ where: { id: seatId } });
      if (!seat) {
        throw new Error(`Ghế ${seatId} không tồn tại`);
      }

      // Kiểm tra trạng thái ghế
      const seatsStatus = await seatService.getSeatById(seatId);
      if (seatsStatus.status === "BOOKED") {
        const existingTicket = await tx.ticket.findFirst({
          where: {
            seatId: seatId,
            userId: userId,
            status: "PENDING",
          },
        });
        if (existingTicket) {
          createdTickets.push(existingTicket);
          totalPrice += existingTicket.price;
          continue;
        } else {
          // Thử mở khóa ghế nếu không có vé PENDING hợp lệ
          try {
            await seatService.unlockSeatIfLocked(seatId, userId);
            await tx.seat.update({
              where: { id: seatId },
              data: {
                status: "AVAILABLE",
                lockedBy: null,
                lockedAt: null,
              },
            });
          } catch (error) {
            throw new Error(`Ghế ${seatId} không có sẵn và không thể mở khóa`);
          }
        }
      } else if (
        seatsStatus.status !== "AVAILABLE" &&
        seatsStatus.status !== "LOCKED"
      ) {
        throw new Error(`Ghế ${seatId} không có sẵn`);
      }

      // Khóa ghế trước khi tạo vé
      await seatService.lockMultipleSeats([seatId], userId);

      let basePrice = showtime.price;
      let ticketPrice = basePrice;
      if (seat.type === "VIP") {
        ticketPrice = basePrice * 1.5;
      } else if (seat.type === "COUPLE") {
        ticketPrice = basePrice * 2.0;
      }

      if (finalPromoId) {
        const promotion = await tx.promotion.findUnique({
          where: { id: finalPromoId },
        });
        if (promotion.type === "PERCENTAGE") {
          ticketPrice = ticketPrice * (1 - promotion.discount / 100);
        } else if (promotion.type === "FIXED") {
          ticketPrice = Math.max(0, ticketPrice - promotion.discount);
        }
      }

      ticketPrice = Math.round(ticketPrice * 100) / 100;
      totalPrice += ticketPrice;

      // Cập nhật trạng thái ghế thành BOOKED
      await tx.seat.update({
        where: { id: seatId },
        data: {
          status: "BOOKED",
          lockedBy: null,
          lockedAt: null,
        },
      });

      const ticketData = {
        userId,
        showtimeId,
        seatId,
        price: ticketPrice,
        status: "PENDING",
      };

      if (finalPromoId) {
        ticketData.promotionId = finalPromoId;
      }

      const newTicket = await tx.ticket.create({
        data: ticketData,
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
          promotion: true,
        },
      });

      createdTickets.push(newTicket);
    }

    return {
      tickets: createdTickets,
      totalAmount: totalPrice,
    };
  });
};

// Lấy vé theo seatId và userId
const getTicketBySeatId = async (seatId, userId, status = "PENDING") => {
  return await prisma.ticket.findFirst({
    where: {
      seatId,
      userId,
      status,
    },
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
      promotion: true,
    },
  });
};

// Xóa vé
const deleteTicket = async (id) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { seat: true },
  });

  if (!ticket) {
    throw new Error("Không tìm thấy vé");
  }

  return await prisma.$transaction(async (tx) => {
    // Sử dụng seatService để mở khóa ghế
    await seatService.unlockSeatIfLocked(ticket.seat.id, ticket.userId);

    return await tx.ticket.delete({
      where: { id },
    });
  });
};

// Cập nhật payment ID cho nhiều vé
const updateTicketsPayment = async (ticketIds, paymentId) => {
  return await prisma.ticket.updateMany({
    where: { id: { in: ticketIds } },
    data: { paymentId: paymentId },
  });
};

// Cập nhật trạng thái nhiều vé
const updateTicketsStatus = async (ticketIds, status) => {
  const validStatuses = ["PENDING", "CONFIRMED", "USED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Trạng thái vé không hợp lệ");
  }

  return await prisma.$transaction(async (tx) => {
    const tickets = await tx.ticket.findMany({
      where: { id: { in: ticketIds } },
      include: {
        seat: true,
        user: true,
        showtime: {
          include: {
            movie: true,
            hall: { include: { cinema: true } },
          },
        },
        concessionOrders: {
          include: { items: true },
        },
      },
    });

    const result = await tx.ticket.updateMany({
      where: { id: { in: ticketIds } },
      data: { status },
    });

    if (status === "CONFIRMED") {
      for (const ticket of tickets) {
        const qrCodeUrl = await generateTicketQR(ticket.id);
        const concessionOrder = ticket.concessionOrders[0] || null;
        await mailService.sendTicketConfirmationEmail(
          ticket.user,
          ticket,
          ticket.showtime.movie,
          ticket.showtime.hall.cinema,
          ticket.showtime,
          ticket.seat,
          qrCodeUrl,
          concessionOrder
        );
      }
    }

    if (status === "CANCELLED") {
      const seatIds = tickets.map((ticket) => ticket.seatId);
      for (const ticket of tickets) {
        await seatService.unlockSeatIfLocked(ticket.seatId, ticket.userId);
      }
      await tx.seat.updateMany({
        where: { id: { in: seatIds } },
        data: {
          status: "AVAILABLE",
          lockedBy: null,
          lockedAt: null,
        },
      });
    }

    return result;
  });
};

// Lấy vé theo payment ID
const getTicketsByPaymentId = async (paymentId) => {
  return await prisma.ticket.findMany({
    where: { paymentId },
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
      promotion: true,
    },
  });
};

// Lấy tất cả vé
const getAllTickets = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [tickets, total] = await prisma.$transaction([
    prisma.ticket.findMany({
      skip,
      take: limit,
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
        promotion: true,
        payment: true,
      },
      orderBy: {
        showtime: { startTime: "asc" },
      },
    }),
    prisma.ticket.count(),
  ]);

  return {
    data: tickets,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

// Lấy vé theo userId
const getTicketsByUserId = async (userId) => {
  return await prisma.ticket.findMany({
    where: { userId },
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
      promotion: true,
      payment: true,
    },
    orderBy: {
      showtime: { startTime: "desc" },
    },
  });
};

// Lấy vé theo ID
const getTicketById = async (id) => {
  console.log("[TicketService] getTicketById called with id:", id);
  if (!id || isNaN(id) || id <= 0) {
    console.error("[TicketService] ID vé không hợp lệ:", id);
    throw new Error("ID vé không hợp lệ");
  }

  const ticket = await prisma.ticket.findUnique({
    where: { id },
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
      promotion: true,
      payment: true,
    },
  });

  if (!ticket) {
    console.warn("[TicketService] Không tìm thấy vé với ID:", id);
  }

  return ticket;
};

// Cập nhật trạng thái một vé
const updateTicketStatus = async (id, status) => {
  const validStatuses = ["PENDING", "CONFIRMED", "USED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Trạng thái vé không hợp lệ");
  }

  return await prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.findUnique({
      where: { id },
      include: { seat: true },
    });
    if (!ticket) {
      throw new Error("Không tìm thấy vé");
    }

    const updatedTicket = await tx.ticket.update({
      where: { id },
      data: { status },
      include: { showtime: true, seat: true, promotion: true },
    });

    if (status === "CANCELLED") {
      await seatService.unlockSeatIfLocked(ticket.seat.id, ticket.userId);
      await tx.seat.update({
        where: { id: ticket.seat.id },
        data: {
          status: "AVAILABLE",
          lockedBy: null,
          lockedAt: null,
        },
      });
    }

    return updatedTicket;
  });
};

// Áp dụng khuyến mãi
const applyPromotion = async (ticketId, promotionCode) => {
  const promotion = await prisma.promotion.findUnique({
    where: { code: promotionCode },
  });
  if (!promotion) {
    throw new Error("Không tìm thấy khuyến mãi");
  }
  const now = new Date();
  if (!promotion.isActive) {
    throw new Error("Khuyến mãi không còn hiệu lực");
  }
  if (now < promotion.validFrom || now > promotion.validUntil) {
    throw new Error("Khuyến mãi đã hết hạn");
  }
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId },
  });
  if (!ticket) {
    throw new Error("Ticket not found");
  }
  let newPrice = ticket.price;
  if (promotion.type === "PERCENTAGE") {
    newPrice = ticket.price * (1 - promotion.discount / 100);
  } else if (promotion.type === "FIXED") {
    newPrice = Math.max(0, ticket.price - promotion.discount);
  }
  newPrice = Math.round(newPrice * 100) / 100;
  return await prisma.ticket.update({
    where: { id: ticketId },
    data: { price: newPrice, promotionId: promotion.id },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: { include: { cinema: true } },
        },
      },
      seat: true,
      promotion: true,
    },
  });
};

// Lấy thống kê vé
const getTicketStats = async (filter = {}) => {
  try {
    const { fromDate, toDate } = filter;

    const where = {};
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    const stats = await prisma.ticket.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
      where,
    });

    const total = await prisma.ticket.count({ where });

    const formattedStats = {
      total,
      pending: 0,
      confirmed: 0,
      used: 0,
      cancelled: 0,
    };

    stats.forEach((item) => {
      const status = item.status.toLowerCase();
      if (status in formattedStats) {
        formattedStats[status] = item._count.status;
      }
    });

    return formattedStats;
  } catch (error) {
    console.error("[TicketService] Lỗi khi lấy thống kê vé:", error);
    throw new Error("Không thể lấy thống kê vé");
  }
};

// Tạo và lưu mã QR cho vé
const generateTicketQR = async (ticketId) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        showtime: {
          include: { movie: true, hall: { include: { cinema: true } } },
        },
        seat: true,
        concessionOrders: {
          include: { items: { include: { item: true, combo: true } } },
        },
      },
    });
    if (!ticket) throw new Error("Không tìm thấy vé");

    const qrToken = uuidv4();
    const qrData = JSON.stringify({
      type: "TICKET",
      ticketId: ticket.id,
      qrToken,
      concessionOrderId: ticket.concessionOrders[0]?.id || null,
      details: {
        movieTitle: ticket.showtime.movie.title,
        cinemaName: ticket.showtime.hall.cinema.name,
        hallName: ticket.showtime.hall.name,
        seat: `${ticket.seat.row}${ticket.seat.column}`,
        showtime: ticket.showtime.startTime.toISOString(),
        concessions:
          ticket.concessionOrders[0]?.items.map((item) => ({
            name: item.item?.name || item.combo?.name,
            quantity: item.quantity,
            price: item.price,
          })) || [],
      },
    });

    const qrCodeUrl = await QRCode.toDataURL(qrData);

    await prisma.ticket.update({
      where: { id: ticketId },
      data: { qrCode: qrCodeUrl },
    });

    if (ticket.concessionOrders[0]) {
      await prisma.concessionOrder.update({
        where: { id: ticket.concessionOrders[0].id },
        data: { qrCode: qrCodeUrl },
      });
    }

    return { qrCodeUrl, ticket };
  } catch (error) {
    console.error("Lỗi khi tạo mã QR cho vé:", error);
    throw new Error("Không thể tạo mã QR");
  }
};

// Xác thực mã QR
const validateQR = async (qrData) => {
  try {
    const { type, ticketId, qrToken, concessionOrderId } = JSON.parse(qrData);
    if (type !== "TICKET") throw new Error("Mã QR không hợp lệ");

    return await prisma.$transaction(async (tx) => {
      const ticket = await tx.ticket.findUnique({
        where: { id: ticketId },
        include: { concessionOrders: true },
      });
      if (!ticket) throw new Error("Không tìm thấy vé");
      if (ticket.status === "USED") throw new Error("Vé đã được sử dụng");
      if (ticket.status === "CANCELLED") throw new Error("Vé đã bị hủy");

      // Cập nhật trạng thái vé
      await tx.ticket.update({
        where: { id: ticketId },
        data: { status: "USED", qrCode: null },
      });

      // Cập nhật trạng thái đơn bắp nước (nếu có)
      if (concessionOrderId) {
        const order = await tx.concessionOrder.findUnique({
          where: { id: concessionOrderId },
        });
        if (
          order &&
          order.status !== "COMPLETED" &&
          order.status !== "CANCELLED"
        ) {
          await tx.concessionOrder.update({
            where: { id: concessionOrderId },
            data: { status: "COMPLETED", qrCode: null },
          });
        }
      }

      return { ticketId, concessionOrderId, status: "VALID" };
    });
  } catch (error) {
    console.error("Lỗi khi xác thực mã QR:", error);
    throw new Error(error.message || "Xác thực mã QR thất bại");
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketsByUserId,
  getTicketById,
  getTicketBySeatId,
  updateTicketStatus,
  deleteTicket,
  applyPromotion,
  updateTicketsPayment,
  updateTicketsStatus,
  getTicketsByPaymentId,
  getTicketStats,
  generateTicketQR,
  validateQR,
};
