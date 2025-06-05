const prisma = require("../../prisma/prisma");

// Lấy tất cả ghế của một suất chiếu
const getSeatsByShowtime = async (showtimeId) => {
  return await prisma.seat.findMany({
    where: { showtimeId },
    orderBy: [{ row: "asc" }, { column: "asc" }],
    select: {
      id: true,
      row: true,
      column: true,
      status: true,
      type: true,
      showtimeId: true,
      lockedBy: true,
      lockedAt: true,
    },
  });
};

// Cập nhật thông tin ghế
const updateSeat = async (id, { status, type }) => {
  const seat = await prisma.seat.findUnique({
    where: { id },
  });

  if (!seat) {
    throw new Error("Seat not found");
  }

  return await prisma.seat.update({
    where: { id },
    data: {
      status: status || seat.status,
      type: type || seat.type,
    },
  });
};

// Thêm hàm gia hạn khóa ghế
const renewSeatLock = async (seatId, userId) => {
  const seat = await prisma.seat.findUnique({
    where: { id: seatId },
  });

  if (!seat) {
    throw new Error("Seat not found");
  }

  if (seat.status !== "LOCKED" || seat.lockedBy !== userId) {
    throw new Error("Seat is not locked by you or not locked");
  }

  // Gia hạn khóa thêm 5 phút
  await prisma.seat.update({
    where: { id: seatId },
    data: {
      lockedAt: new Date(),
    },
  });

  return { message: "Seat lock renewed successfully", seatId };
};

// Khóa nhiều ghế tạm thời hoặc gia hạn khóa ghế
const lockMultipleSeats = async (seatIds, userId) => {
  return await prisma.$transaction(async (tx) => {
    const seats = await tx.seat.findMany({
      where: { id: { in: seatIds } },
    });

    const notAvailableSeats = seats.filter(
      (seat) =>
        seat.status === "BOOKED" ||
        (seat.status === "LOCKED" && seat.lockedBy !== userId)
    );
    if (notAvailableSeats.length > 0) {
      throw new Error(
        `Seats ${notAvailableSeats
          .map((s) => `${s.row}${s.column}`)
          .join(", ")} are not available or locked by another user`
      );
    }

    if (seats.length !== seatIds.length) {
      throw new Error("Some seats were not found");
    }

    const lockedAt = new Date();
    await tx.seat.updateMany({
      where: { id: { in: seatIds } },
      data: {
        status: "LOCKED",
        lockedBy: userId,
        lockedAt: lockedAt,
      },
    });

    return {
      message: "Seats locked successfully",
      seatIds,
      lockedAt,
    };
  });
};

// Mở khóa một ghế nếu nó đang bị khóa
const unlockSeatIfLocked = async (seatId, userId) => {
  const seat = await prisma.seat.findUnique({
    where: { id: seatId },
  });

  if (!seat) {
    throw new Error("Seat not found");
  }

  // Kiểm tra thời gian khóa (5 phút = 300000ms)
  const lockExpirationTime = new Date(Date.now() - 5 * 60 * 1000);
  if (
    seat.status === "LOCKED" &&
    (seat.lockedBy === userId || seat.lockedAt < lockExpirationTime)
  ) {
    return await prisma.seat.update({
      where: { id: seatId },
      data: {
        status: "AVAILABLE",
        lockedBy: null,
        lockedAt: null,
      },
    });
  }

  return seat;
};

// Mở khóa nhiều ghế
const unlockMultipleSeats = async (seatIds, userId) => {
  const seats = await prisma.seat.findMany({
    where: { id: { in: seatIds } },
  });

  const lockExpirationTime = new Date(Date.now() - 5 * 60 * 1000);
  const lockedSeats = seats.filter(
    (seat) =>
      seat.status === "LOCKED" &&
      (seat.lockedBy === userId || seat.lockedAt < lockExpirationTime)
  );

  if (lockedSeats.length === 0) {
    return { message: "No locked seats to unlock", seatIds: [] };
  }

  const lockedSeatIds = lockedSeats.map((seat) => seat.id);
  await prisma.seat.updateMany({
    where: { id: { in: lockedSeatIds }, status: "LOCKED" },
    data: {
      status: "AVAILABLE",
      lockedBy: null,
      lockedAt: null,
    },
  });

  return {
    message: "Seats unlocked successfully",
    seatIds: lockedSeatIds,
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
              cinema: true,
            },
          },
        },
      },
    },
  });
};

// Lấy layout ghế theo phòng
const getSeatLayoutByHall = async (hallId) => {
  const hall = await prisma.hall.findUnique({
    where: { id: hallId },
  });

  if (!hall) {
    throw new Error("Hall not found");
  }

  return {
    hallId,
    name: hall.name,
    rows: hall.rows,
    columns: hall.columns,
    totalSeats: hall.totalSeats,
  };
};

// Tạo ghế cho suất chiếu
const generateSeats = async (showtimeId, hall) => {
  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    select: { price: true },
  });

  if (!showtime) {
    throw new Error("Showtime not found");
  }

  const seats = [];
  for (let r = 0; r < hall.rows; r++) {
    const rowLetter = String.fromCharCode(65 + r);
    for (let c = 1; c <= hall.columns; c++) {
      let seatType = "STANDARD";
      const middleRowStart = Math.floor(hall.rows / 4);
      const middleRowEnd = Math.floor((hall.rows * 3) / 4);
      if (r >= middleRowStart && r <= middleRowEnd) {
        seatType = "VIP";
      }
      if (r === hall.rows - 1) {
        seatType = "COUPLE";
      }
      seats.push({
        showtimeId,
        row: rowLetter,
        column: c.toString(),
        status: "AVAILABLE",
        type: seatType,
      });
    }
  }

  return await prisma.seat.createMany({ data: seats });
};

// Dọn dẹp ghế khóa quá hạn
const cleanupExpiredLocks = async (io) => {
  try {
    const lockExpirationTime = new Date(Date.now() - 5 * 60 * 1000); // 5 phút trước
    const expiredSeats = await prisma.seat.findMany({
      where: {
        status: "LOCKED",
        lockedAt: { lte: lockExpirationTime },
      },
    });

    if (expiredSeats.length > 0) {
      const seatIds = expiredSeats.map((seat) => seat.id);
      await prisma.seat.updateMany({
        where: { id: { in: seatIds }, status: "LOCKED" },
        data: {
          status: "AVAILABLE",
          lockedBy: null,
          lockedAt: null,
        },
      });

      // Phát sự kiện WebSocket cho từng ghế được mở khóa
      expiredSeats.forEach((seat) => {
        io.to(`showtime:${seat.showtimeId}`).emit("seatUpdate", {
          seatId: seat.id,
          status: "AVAILABLE",
          lockedBy: null,
          triggeredBy: "system",
        });
      });

      console.log(`Unlocked ${expiredSeats.length} expired seats`);
    }
  } catch (error) {
    console.error("Error cleaning up expired seat locks:", error);
  }
};

module.exports = {
  getSeatsByShowtime,
  updateSeat,
  lockMultipleSeats,
  unlockSeatIfLocked,
  unlockMultipleSeats,
  getSeatById,
  getSeatLayoutByHall,
  generateSeats,
  cleanupExpiredLocks,
  renewSeatLock
};
