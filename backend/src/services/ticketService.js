// backend/src/services/ticketService.js
const prisma = require('../../prisma/prisma');

const createTicket = async ({ userId, showtimeId, seatId, price }) => {
  // Kiểm tra xem ghế đã được đặt chưa
  const seat = await prisma.seat.findUnique({
    where: { id: seatId }
  });

  if (!seat) {
    throw new Error('Seat not found');
  }

  if (seat.status !== 'AVAILABLE') {
    throw new Error('Seat is not available');
  }

  // Transaction để đảm bảo tính nhất quán
  return await prisma.$transaction(async (tx) => {
    // Cập nhật trạng thái ghế
    await tx.seat.update({
      where: { id: seatId },
      data: { status: 'BOOKED' }
    });

    // Tạo vé mới
    return await tx.ticket.create({
      data: {
        userId,
        showtimeId,
        seatId,
        price,
        status: 'PENDING' // Trạng thái ban đầu
      },
      include: {
        showtime: {
          include: {
            movie: true,
            hall: true
          }
        },
        seat: true,
        user: true
      }
    });
  });
};

const getAllTickets = async () => {
  return await prisma.ticket.findMany({
    include: {
      showtime: {
        include: {
          movie: true,
          hall: true
        }
      },
      seat: true,
      user: true
    }
  });
};

const getTicketsByUserId = async (userId) => {
  return await prisma.ticket.findMany({
    where: { userId },
    include: {
      showtime: {
        include: {
          movie: true,
          hall: true
        }
      },
      seat: true
    },
    orderBy: {
      showtime: {
        startTime: 'desc'
      }
    }
  });
};

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
      user: true
    }
  });
};

const updateTicketStatus = async (id, status) => {
  return await prisma.ticket.update({
    where: { id },
    data: { status }
  });
};

// Khóa ghế tạm thời khi người dùng đang chọn (15 phút)
const lockSeat = async (seatId) => {
  const seat = await prisma.seat.findUnique({
    where: { id: seatId }
  });

  if (!seat) {
    throw new Error('Seat not found');
  }

  if (seat.status !== 'AVAILABLE') {
    throw new Error('Seat is not available');
  }

  await prisma.seat.update({
    where: { id: seatId },
    data: { status: 'LOCKED' }
  });

  return { message: 'Seat locked successfully', seatId };
};

// Mở khóa ghế nếu người dùng không hoàn tất đặt vé
const unlockSeat = async (seatId) => {
  await prisma.seat.update({
    where: { id: seatId },
    data: { status: 'AVAILABLE' }
  });

  return { message: 'Seat unlocked successfully', seatId };
};

// Lấy tất cả ghế của một suất chiếu
const getSeatsByShowtime = async (showtimeId) => {
  return await prisma.seat.findMany({
    where: { showtimeId: parseInt(showtimeId) },
    orderBy: [
      { row: 'asc' },
      { column: 'asc' }
    ]
  });
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketsByUserId,
  getTicketById,
  updateTicketStatus,
  lockSeat,
  unlockSeat,
  getSeatsByShowtime
};