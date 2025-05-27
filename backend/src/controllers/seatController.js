const seatService = require("../services/seatService");

// Hàm gửi thông báo real-time
const broadcastSeatUpdate = (
  io,
  showtimeId,
  seatId,
  status,
  lockedBy = null,
  triggeredBy = null
) => {
  io.to(`showtime:${showtimeId}`).emit("seatUpdate", {
    seatId,
    status,
    lockedBy,
    triggeredBy,
  });
};

// Lấy tất cả ghế của một suất chiếu
const getSeatsByShowtime = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.showtimeId);
    const seats = await seatService.getSeatsByShowtime(showtimeId);
    res.status(200).json(seats);
  } catch (error) {
    console.error("Error getting seats by showtime:", error);
    res.status(500).json({
      success: false,
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
};

// Cập nhật thông tin ghế
const updateSeat = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status, type } = req.body;
    const validStatuses = ["AVAILABLE", "BOOKED", "LOCKED"];
    const validTypes = ["STANDARD", "VIP", "COUPLE"];

    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_STATUS",
        message: "Invalid seat status",
      });
    }
    if (type && !validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_TYPE",
        message: "Invalid seat type",
      });
    }

    const updatedSeat = await seatService.updateSeat(id, { status, type });
    res.status(200).json(updatedSeat);
  } catch (error) {
    console.error("Error updating seat:", error);
    if (error.message === "Seat not found") {
      return res.status(404).json({
        success: false,
        errorCode: "SEAT_NOT_FOUND",
        message: error.message,
      });
    }
    res.status(500).json({
      success: false,
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
};

// Khóa nhiều ghế tạm thời
const lockMultipleSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_INPUT",
        message: "seatIds must be a non-empty array",
      });
    }

    const result = await seatService.lockMultipleSeats(seatIds, userId);

    // Lấy showtimeId từ một ghế
    const seat = await seatService.getSeatById(seatIds[0]);
    if (!seat) {
      return res.status(404).json({
        success: false,
        errorCode: "SEAT_NOT_FOUND",
        message: "Seat not found",
      });
    }

    // Phát sự kiện cho từng ghế được khóa
    seatIds.forEach((seatId) => {
      broadcastSeatUpdate(
        io,
        seat.showtimeId,
        seatId,
        "LOCKED",
        userId,
        userId
      );
    });

    return res.status(200).json({
      success: true,
      message: "Seats locked successfully",
      seatIds: result.seatIds,
      lockedAt: result.lockedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error locking multiple seats:", error);
    return res.status(400).json({
      success: false,
      errorCode: error.message.includes("not available")
        ? "SEAT_UNAVAILABLE"
        : "UNKNOWN_ERROR",
      message: error.message,
    });
  }
};

// Mở khóa nhiều ghế
const unlockMultipleSeats = async (req, res) => {
  try {
    const { seatIds } = req.body;
    const userId = req.user.id;
    const io = req.app.get("io");

    if (!seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
      return res.status(400).json({
        success: false,
        errorCode: "INVALID_INPUT",
        message: "seatIds must be a non-empty array",
      });
    }

    const result = await seatService.unlockMultipleSeats(seatIds, userId);

    // Phát sự kiện cho từng ghế được mở khóa
    if (result.seatIds.length > 0) {
      const seats = await seatService.getSeatsByShowtime(
        (
          await seatService.getSeatById(result.seatIds[0])
        ).showtimeId
      );
      result.seatIds.forEach((seatId) => {
        const seat = seats.find((s) => s.id === seatId);
        if (seat) {
          broadcastSeatUpdate(
            io,
            seat.showtimeId,
            seatId,
            "AVAILABLE",
            null,
            userId
          );
        }
      });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      seatIds: result.seatIds,
    });
  } catch (error) {
    console.error("Error unlocking multiple seats:", error);
    return res.status(500).json({
      success: false,
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
};

// Lấy thông tin chi tiết của ghế
const getSeatById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const seat = await seatService.getSeatById(id);

    if (!seat) {
      return res.status(404).json({
        success: false,
        errorCode: "SEAT_NOT_FOUND",
        message: "Seat not found",
      });
    }

    res.status(200).json(seat);
  } catch (error) {
    console.error("Error getting seat details:", error);
    res.status(500).json({
      success: false,
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
};

// Lấy layout ghế theo phòng
const getSeatLayoutByHall = async (req, res) => {
  try {
    const hallId = parseInt(req.params.hallId);
    const layout = await seatService.getSeatLayoutByHall(hallId);
    res.status(200).json(layout);
  } catch (error) {
    console.error("Error getting seat layout:", error);
    res.status(500).json({
      success: false,
      errorCode: "INTERNAL_SERVER_ERROR",
      message: "Internal server error",
    });
  }
};

const renewSeatLock = async (req, res) => {
  try {
    const seatId = parseInt(req.params.id);
    const userId = req.user.id;
    const io = req.app.get("io");

    const result = await seatService.renewSeatLock(seatId, userId);

    // Lấy showtimeId để phát sự kiện
    const seat = await seatService.getSeatById(seatId);
    broadcastSeatUpdate(io, seat.showtimeId, seatId, "LOCKED", userId, userId);

    res.status(200).json({
      success: true,
      message: result.message,
      seatId,
    });
  } catch (error) {
    console.error("Error renewing seat lock:", error);
    res.status(400).json({
      success: false,
      errorCode: "INVALID_REQUEST",
      message: error.message,
    });
  }
};

module.exports = {
  getSeatsByShowtime,
  updateSeat,
  lockMultipleSeats,
  unlockMultipleSeats,
  getSeatById,
  getSeatLayoutByHall,
  renewSeatLock,
};