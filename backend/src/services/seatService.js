// backend/src/services/seatService.js
const prisma = require('../../prisma/prisma');

// Lấy tất cả ghế của một suất chiếu
const getSeatsByShowtime = async (showtimeId) => {
  return await prisma.seat.findMany({
    where: { showtimeId },
    orderBy: [
      { row: 'asc' },
      { column: 'asc' }
    ]
  });
};

// Cập nhật thông tin ghế
const updateSeat = async (id, { status, type }) => {
  const seat = await prisma.seat.findUnique({
    where: { id }
  });

  if (!seat) {
    throw new Error('Seat not found');
  }

  return await prisma.seat.update({
    where: { id },
    data: {
      status: status || seat.status,
      type: type || seat.type
    }
  });
};

// Khóa nhiều ghế tạm thời
const lockMultipleSeats = async (seatIds, userId) => {
  const seats = await prisma.seat.findMany({
    where: {
      id: { in: seatIds }
    }
  });

  const notAvailableSeats = seats.filter(seat => seat.status !== 'AVAILABLE');
  if (notAvailableSeats.length > 0) {
    throw new Error('Some seats are not available');
  }

  await prisma.seat.updateMany({
    where: {
      id: { in: seatIds }
    },
    data: {
      status: 'LOCKED',
      // lockedBy: userId,
      // lockedAt: new Date()
    }
  });

  return { message: 'Seats locked successfully', seatIds };
};

// Mở khóa một ghế nếu nó đang bị khóa
const unlockSeatIfLocked = async (seatId) => {
  const seat = await prisma.seat.findUnique({
    where: { id: seatId }
  });

  if (!seat) {
    throw new Error('Seat not found');
  }

  if (seat.status === 'LOCKED') {
    return await prisma.seat.update({
      where: { id: seatId },
      data: {
        status: 'AVAILABLE',
        // lockedBy: null,
        // lockedAt: null
      }
    });
  }

  return seat; // Trả về seat hiện tại nếu không cần unlock
};

// Mở khóa nhiều ghế
const unlockMultipleSeats = async (seatIds) => {
  // Truy vấn tất cả ghế được yêu cầu
  const seats = await prisma.seat.findMany({
    where: {
      id: { in: seatIds }
    }
  });

  // Lọc ra các ghế đang trong trạng thái LOCKED
  const lockedSeats = seats.filter(seat => seat.status === 'LOCKED');
  
  // Nếu không có ghế nào đang được khóa, trả về kết quả thành công mà không cần ném lỗi
  if (lockedSeats.length === 0) {
    return { 
      message: 'No locked seats to unlock', 
      seatIds: [] 
    };
  }

  // Chỉ mở khóa những ghế thực sự đang bị khóa
  const lockedSeatIds = lockedSeats.map(seat => seat.id);
  await prisma.seat.updateMany({
    where: {
      id: { in: lockedSeatIds },
      status: 'LOCKED'
    },
    data: {
      status: 'AVAILABLE',
      // lockedBy: null,
      // lockedAt: null
    }
  });

  return { 
    message: 'Seats unlocked successfully', 
    seatIds: lockedSeatIds 
  };
};

// Lấy thông tin chi tiết của ghế
const getSeatById = async (id) => {
  return await prisma.seat.findUnique({
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
      }
    }
  });
};

// Lấy layout ghế theo phòng
const getSeatLayoutByHall = async (hallId) => {
  const hall = await prisma.hall.findUnique({
    where: { id: hallId }
  });

  if (!hall) {
    throw new Error('Hall not found');
  }

  // Trả về cấu trúc layout ghế của phòng này
  return {
    hallId,
    name: hall.name,
    rows: hall.rows,
    columns: hall.columns,
    totalSeats: hall.totalSeats
  };
};

// Tạo ghế cho suất chiếu - Có thể giữ nguyên trong showtimeService
const generateSeats = async (showtimeId, hall) => {
  const seats = [];
  for (let r = 0; r < hall.rows; r++) {
    const rowLetter = String.fromCharCode(65 + r); // A, B, C, ...
    for (let c = 1; c <= hall.columns; c++) {
      // Có thể xác định loại ghế (VIP, COUPLE) dựa trên vị trí
      let seatType = 'STANDARD';
      
      // Ví dụ: hàng giữa là ghế VIP
      const middleRowStart = Math.floor(hall.rows / 4);
      const middleRowEnd = Math.floor(hall.rows * 3 / 4);
      if (r >= middleRowStart && r <= middleRowEnd) {
        seatType = 'VIP';
      }
      
      // Ví dụ: hàng cuối là ghế đôi (COUPLE)
      if (r === hall.rows - 1) {
        seatType = 'COUPLE';
      }
      
      seats.push({
        showtimeId,
        row: rowLetter,
        column: c.toString(),
        status: 'AVAILABLE',
        type: seatType
      });
    }
  }

  return await prisma.seat.createMany({ data: seats });
};

module.exports = {
  getSeatsByShowtime,
  updateSeat,
  lockMultipleSeats,
  unlockMultipleSeats,
  unlockSeatIfLocked,
  getSeatById,
  getSeatLayoutByHall,
  generateSeats
};