const prisma = require("../../prisma/prisma");
const seatService = require("./seatService");
const mailService = require("./mailService");
const QRCode = require("qrcode");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

// Hàm tạo mã bảo mật cho QR
const generateSecurityToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

// Hàm mã hóa dữ liệu QR
const encryptQRData = (data) => {
  const algorithm = "aes-256-gcm";
  const secretKey =
    process.env.QR_SECRET_KEY || "your-default-secret-key-32-chars!!";
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipher(algorithm, secretKey);
  cipher.setAAD(Buffer.from("qr-ticket-data"));

  let encrypted = cipher.update(JSON.stringify(data), "utf8", "hex");
  encrypted += cipher.final("hex");

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString("hex"),
    authTag: authTag.toString("hex"),
  };
};

// Hàm giải mã dữ liệu QR
const decryptQRData = (encryptedData) => {
  const algorithm = "aes-256-gcm";
  const secretKey =
    process.env.QR_SECRET_KEY || "your-default-secret-key-32-chars!!";

  const decipher = crypto.createDecipher(algorithm, secretKey);
  decipher.setAAD(Buffer.from("qr-ticket-data"));
  decipher.setAuthTag(Buffer.from(encryptedData.authTag, "hex"));

  let decrypted = decipher.update(encryptedData.encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");

  return JSON.parse(decrypted);
};

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
          concessionOrders: {
            include: {
              items: {
                include: {
                  item: true,
                  combo: true,
                },
              },
            },
          },
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
    data: {
      paymentId: paymentId,
      updatedAt: new Date(),
    },
  });
};

// Cập nhật trạng thái nhiều vé
const updateTicketsStatus = async (ticketIds, status) => {
  const validStatuses = ["PENDING", "CONFIRMED", "USED", "CANCELLED"];
  if (!validStatuses.includes(status)) {
    throw new Error("Trạng thái vé không hợp lệ");
  }

  // Thực hiện cập nhật trạng thái trong giao dịch
  const result = await prisma.$transaction(async (tx) => {
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

    const updateResult = await tx.ticket.updateMany({
      where: { id: { in: ticketIds } },
      data: {
        status,
        updatedAt: new Date(),
      },
    });

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

      await tx.ticket.updateMany({
        where: { id: { in: ticketIds } },
        data: {
          qrCode: null,
          updatedAt: new Date(),
        },
      });
    }

    return { result: updateResult, tickets };
  });

  // Thực hiện tạo QR và gửi email ngoài giao dịch nếu trạng thái là CONFIRMED
  if (status === "CONFIRMED") {
    for (const ticket of result.tickets) {
      try {
        const qrResult = await generateTicketQR(ticket.id);
        const concessionOrder = ticket.concessionOrders[0] || null;
        await mailService.sendTicketConfirmationEmail(
          ticket.user,
          ticket,
          ticket.showtime.movie,
          ticket.showtime.hall.cinema,
          ticket.showtime,
          ticket.seat,
          qrResult.qrCodeUrl,
          concessionOrder
        );
      } catch (error) {
        console.error(`Lỗi khi xử lý QR/email cho vé ${ticket.id}:`, error);
        // Có thể lưu log lỗi hoặc thông báo, nhưng không làm thất bại toàn bộ hàm
      }
    }
  }

  return result.result;
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
      concessionOrders: {
        include: {
          items: {
            include: {
              item: true,
              combo: true,
            },
          },
        },
      },
    },
  });
};

// Lấy tất cả vé với filter cải tiến
const getAllTickets = async (page = 1, limit = 10, filter = {}) => {
  const skip = (page - 1) * limit;
  const where = {};

  if (filter.status) {
    where.status = filter.status;
  }

  if (filter.search) {
    where.OR = [
      { id: { equals: parseInt(filter.search, 10) || 0 } },
      { user: { name: { contains: filter.search, mode: "insensitive" } } },
    ];
  }

  // Filter theo ngày tạo
  if (filter.fromDate || filter.toDate) {
    where.createdAt = {};
    if (filter.fromDate) {
      where.createdAt.gte = new Date(filter.fromDate);
    }
    if (filter.toDate) {
      where.createdAt.lte = new Date(filter.toDate);
    }
  }

  const [tickets, total] = await prisma.$transaction([
    prisma.ticket.findMany({
      skip,
      take: limit,
      where,
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
        concessionOrders: {
          include: {
            items: {
              include: {
                item: true,
                combo: true,
              },
            },
          },
        },
      },
      orderBy: {
        [filter._sort || "createdAt"]: filter._order || "desc",
      },
    }),
    prisma.ticket.count({ where }),
  ]);

  return {
    data: tickets,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

const getTicketWithFullDetails = async (ticketId) => {
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
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        promotion: true,
        payment: true,
        concessionOrders: {
          include: {
            items: {
              include: {
                item: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    description: true,
                  },
                },
                combo: {
                  select: {
                    id: true,
                    name: true,
                    price: true,
                    image: true,
                    description: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // Kiểm tra và làm sạch dữ liệu concessionOrders
    if (ticket && ticket.concessionOrders) {
      ticket.concessionOrders = ticket.concessionOrders.map((order) => ({
        ...order,
        items: order.items.map((orderItem) => {
          // Đảm bảo mỗi item có đầy đủ thông tin cần thiết
          const processedItem = {
            id: orderItem.id,
            orderId: orderItem.orderId,
            quantity: orderItem.quantity || 0,
            price: orderItem.price || 0,
            notes: orderItem.notes || null,
          };

          // Thêm thông tin item hoặc combo
          if (orderItem.item) {
            processedItem.itemId = orderItem.itemId;
            processedItem.item = {
              ...orderItem.item,
              price: orderItem.item.price || 0,
            };
          }

          if (orderItem.combo) {
            processedItem.comboId = orderItem.comboId;
            processedItem.combo = {
              ...orderItem.combo,
              price: orderItem.combo.price || 0,
            };
          }

          return processedItem;
        }),
      }));
    }

    return ticket;
  } catch (error) {
    console.error("[TicketService] Lỗi khi lấy thông tin chi tiết vé:", error);
    throw new Error(`Không thể lấy thông tin vé: ${error.message}`);
  }
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
      concessionOrders: {
        include: {
          items: {
            include: {
              item: true,
              combo: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
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

    const updateData = {
      status,
      updatedAt: new Date(),
    };

    // Xóa QR code khi hủy vé
    if (status === "CANCELLED") {
      updateData.qrCode = null;
    }

    const updatedTicket = await tx.ticket.update({
      where: { id },
      data: updateData,
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
    data: {
      price: newPrice,
      promotionId: promotion.id,
      updatedAt: new Date(),
    },
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

// Lấy thống kê vé với filter theo ngày
const getTicketStats = async (filter = {}) => {
  try {
    const { fromDate, toDate, userId } = filter;

    // Tạo điều kiện where với createdAt và userId
    const where = {};

    // Filter theo userId nếu có
    if (userId) {
      where.userId = userId;
    }

    // Filter theo thời gian nếu có
    if (fromDate || toDate) {
      where.createdAt = {};
      if (fromDate) where.createdAt.gte = new Date(fromDate);
      if (toDate) where.createdAt.lte = new Date(toDate);
    }

    // Lấy thống kê theo status
    const stats = await prisma.ticket.groupBy({
      by: ["status"],
      _count: {
        status: true,
      },
      _sum: {
        price: true,
      },
      where,
    });

    // Đếm tổng số vé và tổng doanh thu
    const [total, totalRevenue] = await Promise.all([
      prisma.ticket.count({ where }),
      prisma.ticket.aggregate({
        where,
        _sum: {
          price: true,
        },
      }),
    ]);

    // Format kết quả
    const formattedStats = {
      total,
      totalRevenue: totalRevenue._sum.price || 0,
      pending: 0,
      confirmed: 0,
      used: 0,
      cancelled: 0,
      pendingRevenue: 0,
      confirmedRevenue: 0,
      usedRevenue: 0,
      cancelledRevenue: 0,
    };

    stats.forEach((item) => {
      const status = item.status.toLowerCase();
      if (status in formattedStats) {
        formattedStats[status] = item._count.status;
        formattedStats[`${status}Revenue`] = item._sum.price || 0;
      }
    });

    return formattedStats;
  } catch (error) {
    console.error("[TicketService] Lỗi khi lấy thống kê vé:", error);
    throw new Error("Không thể lấy thống kê vé");
  }
};

// Tạo QR code đơn giản nhưng bảo mật
const generateTicketQR = async (ticketId) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        showtime: {
          include: {
            movie: true,
            hall: { include: { cinema: true } },
          },
        },
        seat: true,
        user: true,
        promotion: true,
        concessionOrders: {
          include: {
            items: {
              include: {
                item: true,
                combo: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new Error("Không tìm thấy vé");
    }

    // Kiểm tra vé đã có QR code chưa
    if (ticket.qrCode && ticket.status === "CONFIRMED") {
      return {
        qrCodeUrl: ticket.qrCode,
        ticket,
        isExisting: true,
      };
    }

    // Tạo QR data đơn giản nhưng đầy đủ thông tin cần thiết
    const qrPayload = {
      // ID và mã xác thực chính
      tid: ticket.id, // ticket ID
      uid: ticket.userId, // user ID
      token: generateSecurityToken().substring(0, 16), // Token ngắn hơn

      // Thông tin cốt lõi để xác thực
      movie: ticket.showtime.movie.id,
      showtime: ticket.showtime.id,
      seat: `${ticket.seat.row}${ticket.seat.column}`,
      hall: ticket.showtime.hall.id,
      cinema: ticket.showtime.hall.cinema.id,

      // Thông tin thanh toán
      price: ticket.price,
      status: ticket.status,

      // Thông tin thời gian
      created: Math.floor(ticket.createdAt.getTime() / 1000), // Unix timestamp
      showAt: Math.floor(ticket.showtime.startTime.getTime() / 1000),

      // Promotion (nếu có)
      promo: ticket.promotion ? ticket.promotion.code : null,

      // Concession (chỉ lưu tổng tiền)
      concession: ticket.concessionOrders[0]
        ? ticket.concessionOrders[0].totalAmount
        : 0,

      // Checksum bảo mật
      hash: crypto
        .createHash("md5")
        .update(`${ticketId}-${ticket.userId}-${ticket.showtime.id}`)
        .digest("hex")
        .substring(0, 8), // Chỉ lấy 8 ký tự đầu
    };

    // Tạo QR string ngắn gọn
    const qrString = Buffer.from(JSON.stringify(qrPayload)).toString("base64");

    // Tạo QR code với options tối ưu
    const qrOptions = {
      errorCorrectionLevel: "M", // Mức vừa phải thay vì H
      type: "image/png",
      quality: 0.9,
      margin: 1,
      color: {
        dark: "#000000",
        light: "#FFFFFF",
      },
      width: 400, // Kích thước vừa phải
    };

    const qrCodeUrl = await QRCode.toDataURL(qrString, qrOptions);

    // Lưu QR code vào database
    await prisma.ticket.update({
      where: { id: ticketId },
      data: {
        qrCode: qrCodeUrl,
        qrData: qrString, // Lưu cả raw data để verify
        updatedAt: new Date(),
      },
    });

    // Cập nhật QR cho đơn bắp nước (nếu có)
    if (ticket.concessionOrders[0]) {
      await prisma.concessionOrder.update({
        where: { id: ticket.concessionOrders[0].id },
        data: {
          qrCode: qrCodeUrl,
          updatedAt: new Date(),
        },
      });
    }

    console.log(`[TicketService] Đã tạo QR code cho vé ${ticketId}`);

    return {
      qrCodeUrl,
      qrData: qrString,
      ticket,
      isExisting: false,
      metadata: {
        length: qrString.length,
        created: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error("Lỗi khi tạo mã QR cho vé:", error);
    throw new Error(`Không thể tạo mã QR: ${error.message}`);
  }
};

// Xác thực mã QR - CẢI TIẾN
const validateQR = async (qrData) => {
  try {
    let qrPayload;

    // Giải mã dữ liệu QR từ Base64
    try {
      const decodedString = Buffer.from(qrData, "base64").toString("utf8");
      qrPayload = JSON.parse(decodedString);
    } catch (decodeError) {
      throw new Error("Mã QR không hợp lệ - không thể giải mã");
    }

    // Validate cấu trúc QR mới
    if (!qrPayload.tid || !qrPayload.uid || !qrPayload.token) {
      throw new Error("Mã QR thiếu thông tin bắt buộc");
    }

    // Validate checksum
    const expectedHash = crypto
      .createHash("md5")
      .update(`${qrPayload.tid}-${qrPayload.uid}-${qrPayload.showtime}`)
      .digest("hex")
      .substring(0, 8);

    if (qrPayload.hash !== expectedHash) {
      throw new Error("Mã QR không hợp lệ - checksum không khớp");
    }

    return await prisma.$transaction(async (tx) => {
      // Tìm vé trong database
      const ticket = await tx.ticket.findUnique({
        where: { id: qrPayload.tid },
        include: {
          concessionOrders: true,
          showtime: {
            include: {
              movie: true,
              hall: { include: { cinema: true } },
            },
          },
          seat: true,
          user: true,
        },
      });

      if (!ticket) {
        throw new Error("Không tìm thấy vé trong hệ thống");
      }

      // Kiểm tra trạng thái vé
      if (ticket.status === "USED") {
        throw new Error("Vé đã được sử dụng trước đó");
      }

      if (ticket.status === "CANCELLED") {
        throw new Error("Vé đã bị hủy");
      }

      if (ticket.status !== "CONFIRMED") {
        throw new Error("Vé chưa được xác nhận thanh toán");
      }

      // Kiểm tra thời gian suất chiếu
      const showtimeStart = new Date(ticket.showtime.startTime);
      const now = new Date();
      const timeUntilShow = showtimeStart.getTime() - now.getTime();
      const hoursUntilShow = timeUntilShow / (1000 * 60 * 60);

      // Chỉ cho phép check-in trước giờ chiếu tối đa 1 tiếng
      if (hoursUntilShow > 1) {
        throw new Error(
          `Vé chỉ có thể check-in trước giờ chiếu tối đa 1 tiếng. Thời gian còn lại: ${Math.ceil(
            hoursUntilShow
          )} giờ`
        );
      }

      // Không cho phép check-in sau khi phim đã kết thúc
      if (hoursUntilShow < -ticket.showtime.movie.duration / 60) {
        throw new Error("Suất chiếu đã kết thúc, không thể sử dụng vé");
      }

      // Validate dữ liệu QR với database (cấu trúc mới)
      const seatPosition = `${ticket.seat.row}${ticket.seat.column}`;
      const dataMatches =
        qrPayload.uid === ticket.userId &&
        qrPayload.movie === ticket.showtime.movie.id &&
        qrPayload.cinema === ticket.showtime.hall.cinema.id &&
        qrPayload.showtime === ticket.showtime.id &&
        qrPayload.seat === seatPosition &&
        qrPayload.hall === ticket.showtime.hall.id &&
        qrPayload.price === ticket.price;

      if (!dataMatches) {
        throw new Error("Thông tin trong mã QR không khớp với dữ liệu vé");
      }

      // Cập nhật trạng thái vé thành USED
      const updatedTicket = await tx.ticket.update({
        where: { id: qrPayload.tid },
        data: {
          status: "USED",
          updatedAt: new Date(),
        },
        include: {
          showtime: {
            include: {
              movie: true,
              hall: { include: { cinema: true } },
            },
          },
          seat: true,
          user: true,
          promotion: true,
          concessionOrders: {
            include: {
              items: {
                include: {
                  item: true,
                  combo: true,
                },
              },
            },
          },
        },
      });

      // Cập nhật trạng thái đơn bắp nước (nếu có)
      if (ticket.concessionOrders.length > 0) {
        await tx.concessionOrder.updateMany({
          where: { ticketId: qrPayload.tid },
          data: {
            status: "COMPLETED",
            updatedAt: new Date(),
          },
        });
      }

      console.log(
        `[TicketService] Vé ${qrPayload.tid} đã được check-in thành công`
      );

      return {
        success: true,
        message: "Check-in thành công",
        ticket: updatedTicket,
        checkInTime: new Date().toISOString(),
        showtimeInfo: {
          movie: updatedTicket.showtime.movie.title,
          cinema: updatedTicket.showtime.hall.cinema.name,
          hall: updatedTicket.showtime.hall.name,
          startTime: updatedTicket.showtime.startTime,
          seatPosition: `${updatedTicket.seat.row}${updatedTicket.seat.column}`,
        },
        concessionInfo:
          updatedTicket.concessionOrders.length > 0
            ? {
                orderId: updatedTicket.concessionOrders[0].id,
                items: updatedTicket.concessionOrders[0].items.map((item) => ({
                  name: item.item?.name || item.combo?.name,
                  quantity: item.quantity,
                })),
                totalAmount: updatedTicket.concessionOrders[0].totalAmount,
              }
            : null,
      };
    });
  } catch (error) {
    console.error("[TicketService] Lỗi xác thực QR:", error);
    throw new Error(error.message || "Xác thực mã QR thất bại");
  }
};

// Lấy thông tin QR không xác thực (để hiển thị)
const getQRInfo = async (qrData) => {
  try {
    let qrPayload;

    // Giải mã dữ liệu QR từ Base64
    try {
      const decodedString = Buffer.from(qrData, "base64").toString("utf8");
      qrPayload = JSON.parse(decodedString);
    } catch (decodeError) {
      throw new Error("Mã QR không hợp lệ - không thể giải mã");
    }

    // Validate cấu trúc QR cơ bản (cấu trúc mới)
    if (!qrPayload.tid || !qrPayload.uid || !qrPayload.token) {
      throw new Error("Mã QR không hợp lệ");
    }

    // Tìm vé trong database
    const ticket = await prisma.ticket.findUnique({
      where: { id: qrPayload.tid },
      include: {
        showtime: {
          include: {
            movie: true,
            hall: { include: { cinema: true } },
          },
        },
        seat: true,
        user: true,
        promotion: true,
        concessionOrders: {
          include: {
            items: {
              include: {
                item: true,
                combo: true,
              },
            },
          },
        },
      },
    });

    if (!ticket) {
      throw new Error("Không tìm thấy vé trong hệ thống");
    }

    return {
      ticketInfo: {
        id: ticket.id,
        status: ticket.status,
        price: ticket.price,
        createdAt: ticket.createdAt,
      },
      movieInfo: {
        title: ticket.showtime.movie.title,
        duration: ticket.showtime.movie.duration,
        rating: ticket.showtime.movie.rating,
      },
      cinemaInfo: {
        name: ticket.showtime.hall.cinema.name,
        location: ticket.showtime.hall.cinema.location,
        hall: ticket.showtime.hall.name,
      },
      showtimeInfo: {
        startTime: ticket.showtime.startTime,
        endTime: ticket.showtime.endTime,
        language: ticket.showtime.language,
        subtitle: ticket.showtime.subtitle,
      },
      seatInfo: {
        position: `${ticket.seat.row}${ticket.seat.column}`,
        type: ticket.seat.type,
      },
      userInfo: {
        name: ticket.user.name,
        email: ticket.user.email,
      },
      promotionInfo: ticket.promotion
        ? {
            code: ticket.promotion.code,
            discount: ticket.promotion.discount,
            type: ticket.promotion.type,
          }
        : null,
      concessionInfo: ticket.concessionOrders[0]
        ? {
            orderId: ticket.concessionOrders[0].id,
            items: ticket.concessionOrders[0].items.map((item) => ({
              name: item.item?.name || item.combo?.name,
              quantity: item.quantity,
              price: item.price,
            })),
            totalAmount: ticket.concessionOrders[0].totalAmount,
          }
        : null,
      qrMetadata: {
        generatedAt: new Date(qrPayload.created * 1000).toISOString(), // Chuyển từ unix timestamp
        showtime: new Date(qrPayload.showAt * 1000).toISOString(),
        token: qrPayload.token,
        hash: qrPayload.hash,
        encrypted: false, // QR mới không mã hóa
      },
    };
  } catch (error) {
    console.error("[TicketService] Lỗi lấy thông tin QR:", error);
    throw new Error(error.message || "Không thể đọc thông tin mã QR");
  }
};

// Kiểm tra trạng thái QR
const checkQRStatus = async (ticketId) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
      include: {
        showtime: {
          include: {
            movie: true,
            hall: { include: { cinema: true } },
          },
        },
        seat: true,
      },
    });

    if (!ticket) {
      return { valid: false, reason: "Không tìm thấy vé" };
    }

    if (ticket.status === "USED") {
      return { valid: false, reason: "Vé đã được sử dụng" };
    }

    if (ticket.status === "CANCELLED") {
      return { valid: false, reason: "Vé đã bị hủy" };
    }

    if (ticket.status !== "CONFIRMED") {
      return { valid: false, reason: "Vé chưa được xác nhận thanh toán" };
    }

    // Kiểm tra thời gian
    const showtimeStart = new Date(ticket.showtime.startTime);
    const now = new Date();
    const timeUntilShow = showtimeStart.getTime() - now.getTime();
    const hoursUntilShow = timeUntilShow / (1000 * 60 * 60);

    if (hoursUntilShow > 1) {
      return {
        valid: false,
        reason: `Chưa đến giờ check-in. Còn ${Math.ceil(hoursUntilShow)} giờ`,
        canCheckInAt: new Date(
          showtimeStart.getTime() - 60 * 60 * 1000
        ).toISOString(),
      };
    }

    if (hoursUntilShow < -ticket.showtime.movie.duration / 60) {
      return { valid: false, reason: "Suất chiếu đã kết thúc" };
    }

    return {
      valid: true,
      ticket: {
        id: ticket.id,
        movie: ticket.showtime.movie.title,
        cinema: ticket.showtime.hall.cinema.name,
        hall: ticket.showtime.hall.name,
        seat: `${ticket.seat.row}${ticket.seat.column}`,
        showtime: ticket.showtime.startTime,
      },
    };
  } catch (error) {
    console.error("[TicketService] Lỗi kiểm tra trạng thái QR:", error);
    return { valid: false, reason: "Lỗi hệ thống" };
  }
};

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

const cancelMultipleTickets = async (
  ticketIds,
  userId,
  reason,
  isAdmin = false
) => {
  try {
    if (!Array.isArray(ticketIds) || ticketIds.length === 0) {
      throw new Error("Danh sách ID vé không hợp lệ");
    }

    const results = [];
    const errors = [];

    for (const ticketId of ticketIds) {
      try {
        const result = await cancelTicketWithReason(
          ticketId,
          isAdmin ? null : userId,
          reason
        );
        results.push({ ticketId, success: true, data: result });
      } catch (error) {
        errors.push({ ticketId, success: false, error: error.message });
      }
    }

    return {
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
    };
  } catch (error) {
    console.error("[TicketService] Lỗi khi hủy nhiều vé:", error);
    throw new Error(error.message || "Không thể hủy nhiều vé");
  }
};

module.exports = {
  createTicket,
  getTicketBySeatId,
  deleteTicket,
  updateTicketsPayment,
  updateTicketsStatus,
  getTicketsByPaymentId,
  getAllTickets,
  getTicketsByUserId,
  getTicketById,
  getTicketWithFullDetails,
  updateTicketStatus,
  applyPromotion,
  getTicketStats,
  generateTicketQR,
  validateQR,
  getQRInfo,
  checkQRStatus,
  canCancelTicket,
  cancelTicketWithReason,
  cancelMultipleTickets,
};
