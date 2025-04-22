// frontend/src/services/ticketService.js
const prisma = require('../../prisma/prisma');

// Tạo vé mới 
const createTicket = async ({ userId, showtimeId, seats, promotionId }) => {
  // Kiểm tra xem người dùng có tồn tại không
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error('Không tìm thấy người dùng');
  }

  // Kiểm tra xem suất chiếu có tồn tại không
  const showtime = await prisma.showtime.findUnique({ where: { id: showtimeId } });
  if (!showtime) {
    throw new Error('Không tìm thấy suất chiếu');
  }

  // Kiểm tra xem suất chiếu có giá cơ bản không
  if (showtime.price === null) {
    throw new Error('Suất chiếu chưa có giá cơ bản');
  }

  // Kiểm tra promotionId nếu có
  let finalPromoId = null;
  if (promotionId) {
    const promotion = await prisma.promotion.findUnique({
      where: { id: promotionId }
    });
    
    if (!promotion) {
      throw new Error('Khuyến mãi không hợp lệ');
    }
    
    const now = new Date();
    if (!promotion.isActive || now < promotion.validFrom || now > promotion.validUntil) {
      throw new Error('Khuyến mãi không hợp lệ');
    }
    
    finalPromoId = promotionId;
  }

  // Tạo nhiều vé cùng lúc
  const createdTickets = [];
  let totalPrice = 0;

  return await prisma.$transaction(async (tx) => {
    // Xử lý từng ghế một
    for (const seatId of seats) {
      // Kiểm tra xem ghế có tồn tại không
      const seat = await tx.seat.findUnique({
        where: { id: seatId }
      });

      if (!seat) {
        throw new Error(`Ghế ${seatId} không tồn tại`);
      }

      // Kiểm tra xem ghế có sẵn hoặc đã khóa không
      if (seat.status !== 'AVAILABLE' && seat.status !== 'LOCKED') {
        throw new Error(`Ghế ${seatId} không có sẵn`);
      }

      // Tính giá vé dựa trên loại ghế
      let basePrice = showtime.price;
      let ticketPrice = basePrice;
      
      // Áp dụng hệ số theo loại ghế
      if (seat.type === 'VIP') {
        ticketPrice = basePrice * 1.5;
      } else if (seat.type === 'COUPLE') {
        ticketPrice = basePrice * 2.0;
      }
      
      // Áp dụng khuyến mãi nếu có
      if (finalPromoId) {
        const promotion = await tx.promotion.findUnique({
          where: { id: finalPromoId }
        });
        
        if (promotion.type === 'PERCENTAGE') {
          ticketPrice = ticketPrice * (1 - promotion.discount / 100);
        } else if (promotion.type === 'FIXED') {
          ticketPrice = Math.max(0, ticketPrice - promotion.discount);
        }
      }
      
      // Làm tròn giá vé đến 2 chữ số thập phân
      ticketPrice = Math.round(ticketPrice * 100) / 100;
      totalPrice += ticketPrice;

      // Cập nhật trạng thái ghế
      await tx.seat.update({
        where: { id: seatId },
        data: { status: 'BOOKED' }
      });

      // Tạo vé mới
      const ticketData = {
        userId,
        showtimeId,
        seatId,
        price: ticketPrice,
        status: 'PENDING'
      };
      
      // Thêm mã khuyến mãi nếu có
      if (finalPromoId) {
        ticketData.promotionId = finalPromoId;
      }
      
      // Tạo vé và thêm vào danh sách
      const newTicket = await tx.ticket.create({
        data: ticketData,
        include: {
          showtime: {
            include: {
              movie: true,
              hall: {
                include: {
                  cinema: true
                }
              }
            }
          },
          seat: true,
          user: true,
          promotion: true
        }
      });
      
      createdTickets.push(newTicket);
    }
    
    return {
      tickets: createdTickets,
      totalAmount: totalPrice
    };
  });
};

// Các hàm khác giữ nguyên, thêm mới function cập nhật paymentId cho vé
const updateTicketsPayment = async (ticketIds, paymentId) => {
  return await prisma.ticket.updateMany({
    where: {
      id: {
        in: ticketIds
      }
    },
    data: {
      paymentId: paymentId
    }
  });
};

// Cập nhật trạng thái các vé khi thanh toán hoàn tất
const updateTicketsStatus = async (ticketIds, status) => {
  return await prisma.ticket.updateMany({
    where: {
      id: {
        in: ticketIds
      }
    },
    data: {
      status: status
    }
  });
};

// Lấy vé theo ID của payment
const getTicketsByPaymentId = async (paymentId) => {
  return await prisma.ticket.findMany({
    where: { paymentId },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: {
            include: {
              cinema: true
            }
          }
        }
      },
      seat: true,
      user: true,
      promotion: true
    }
  });
};

// Các hàm khác giữ nguyên
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
                cinema: true
              }
            }
          }
        },
        seat: true,
        user: true,
        promotion: true,
        payment: true
      },
      orderBy: {
        showtime: {
          startTime: 'desc'
        }
      }
    }),
    prisma.ticket.count()
  ]);
  
  return {
    data: tickets,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Lấy vé theo ID người dùng
const getTicketsByUserId = async (userId) => {
  return await prisma.ticket.findMany({
    where: { userId },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: {
            include: {
              cinema: true
            }
          }
        }
      },
      seat: true,
      promotion: true,
      payment: true
    },
    orderBy: {
      showtime: {
        startTime: 'desc'
      }
    }
  });
};

// Lấy vé theo ID
const getTicketById = async (id) => {
  return await prisma.ticket.findUnique({
    where: { id },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: {
            include: {
              cinema: true
            }
          }
        }
      },
      seat: true,
      user: true,
      promotion: true,
      payment: true
    }
  });
};

// Cập nhật trạng thái vé
const updateTicketStatus = async (id, status) => {
  return await prisma.ticket.update({
    where: { id },
    data: { status },
    include: {
      showtime: true,
      seat: true,
      promotion: true
    }
  });
};

// Xóa vé
const deleteTicket = async (id) => {
  const ticket = await prisma.ticket.findUnique({
    where: { id },
    include: { seat: true }
  });
  
  if (!ticket) {
    throw new Error('Không tìm thấy vé');
  }
  
  return await prisma.$transaction(async (tx) => {
    await tx.seat.update({
      where: { id: ticket.seat.id },
      data: { status: 'AVAILABLE' }
    });
    
    return await tx.ticket.delete({
      where: { id }
    });
  });
};

// Khóa ghế tạm thời khi người dùng đang chọn (15 phút)
const lockSeat = async (seatId) => {
  const seat = await prisma.seat.findUnique({
    where: { id: seatId }
  });

  if (!seat) {
    throw new Error('Không tìm thấy ghế');
  }

  if (seat.status !== 'AVAILABLE') {
    throw new Error('Ghế không có sẵn');
  }

  await prisma.seat.update({
    where: { id: seatId },
    data: { status: 'LOCKED' }
  });

  return { message: 'Đã khóa ghế thành công', seatId };
};

// Kiểm tra và mở khóa ghế nếu đã hết thời gian giữ
const checkAndUnlockSeat = async (seatId) => {
  const seat = await prisma.seat.findUnique({
    where: { id: seatId }
  });
  
  if (seat && seat.status === 'LOCKED') {
    return await unlockSeat(seatId);
  }
  
  return { message: 'Ghế không bị khóa hoặc đã đặt', seatId };
};

// Mở khóa ghế
const unlockSeat = async (seatId) => {
  const seat = await prisma.seat.findUnique({
    where: { id: seatId }
  });
  
  if (!seat) {
    throw new Error('Không tìm thấy ghế');
  }
  
  // Only unlock if the seat is currently locked
  if (seat.status === 'LOCKED') {
    await prisma.seat.update({
      where: { id: seatId },
      data: { status: 'AVAILABLE' }
    });
  }

  return { message: 'Mở khóa ghế thành công', seatId };
};

// Lấy danh sách ghế theo suất chiếu
const getSeatsByShowtime = async (showtimeId) => {
  return await prisma.seat.findMany({
    where: { showtimeId: showtimeId },
    orderBy: [
      { row: 'asc' },
      { column: 'asc' }
    ]
  });
};

// Áp dụng mã khuyến mãi cho vé
const applyPromotion = async (ticketId, promotionCode) => {
  // Tìm khuyến mãi theo mã
  const promotion = await prisma.promotion.findUnique({
    where: { code: promotionCode }
  });
  
  if (!promotion) {
    throw new Error('Không tìm thấy khuyến mãi');
  }
  
  // Kiểm tra xem khuyến mãi có còn hiệu lực không
  const now = new Date();
  if (!promotion.isActive) {
    throw new Error('Khuyến mãi không còn hiệu lực');
  }
  
  if (now < promotion.validFrom || now > promotion.validUntil) {
    throw new Error('Khuyến mãi đã hết hạn');
  }
  
  // Tìm vé theo ID
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId }
  });
  
  if (!ticket) {
    throw new Error('Ticket not found');
  }
  
  // Tính toán giá vé mới dựa trên khuyến mãi
  let newPrice = ticket.price;
  
  if (promotion.type === 'PERCENTAGE') {
    newPrice = ticket.price * (1 - promotion.discount / 100);
  } else if (promotion.type === 'FIXED') {
    newPrice = Math.max(0, ticket.price - promotion.discount);
  }
  
  // Làm tròn giá vé mới đến 2 chữ số thập phân
  newPrice = Math.round(newPrice * 100) / 100;
  
  // Cập nhật vé với giá mới và mã khuyến mãi
  return await prisma.ticket.update({
    where: { id: ticketId },
    data: {
      price: newPrice,
      promotionId: promotion.id
    },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: {
            include: {
              cinema: true
            }
          }
        }
      },
      seat: true,
      promotion: true
    }
  });
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketsByUserId,
  getTicketById,
  updateTicketStatus,
  deleteTicket,
  lockSeat,
  unlockSeat,
  checkAndUnlockSeat,
  getSeatsByShowtime,
  applyPromotion,
  updateTicketsPayment,
  updateTicketsStatus,
  getTicketsByPaymentId
};