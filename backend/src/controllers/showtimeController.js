// backend/src/controllers/showtimeController.js
const prisma = require("../../prisma/prisma");
const showtimeService = require("../services/showtimeService");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// Cấu hình dayjs để hỗ trợ múi giờ
dayjs.extend(utc);
dayjs.extend(timezone);

// Thiết lập múi giờ Việt Nam
const VIETNAM_TIMEZONE = "Asia/Ho_Chi_Minh"; // UTC+7

/**
 * Chuyển đổi thời gian bất kỳ sang đối tượng dayjs với múi giờ Việt Nam
 * Điều này KHÔNG làm thay đổi thời điểm, chỉ thay đổi cách biểu diễn
 */
const formatToVietnamTime = (timeInput) => {
  if (!timeInput) return null;

  try {
    return dayjs(timeInput).tz(VIETNAM_TIMEZONE);
  } catch (error) {
    console.error("Lỗi khi format thời gian sang múi giờ Việt Nam:", error);
    return dayjs().tz(VIETNAM_TIMEZONE);
  }
};

/**
 * Ghi log thời gian để debug (không làm thay đổi dữ liệu)
 */
const logTimeDebug = (label, timeUTC) => {
  if (!timeUTC) return;

  const timeVN = formatToVietnamTime(timeUTC);
  console.log(`${label} (UTC): ${timeUTC}`);
  console.log(`${label} (VN): ${timeVN.format("YYYY-MM-DD HH:mm:ss")}`);
};

// Tạo suất chiếu (POST /api/showtimes)
const createShowtime = async (req, res) => {
  try {
    // Lấy dữ liệu từ request body và loại bỏ trường id nếu có
    const { movieId, hallId, startTime, price, ...otherData } = req.body;

    // QUAN TRỌNG: Loại bỏ hoàn toàn trường id nếu có
    const { id, ...dataWithoutId } = otherData;

    // Ghi log dữ liệu gửi đến để debug
    console.log("Request body gốc:", req.body);
    console.log("Dữ liệu đã xử lý (đã loại bỏ id):", {
      movieId,
      hallId,
      startTime,
      price,
    });

    // Kiểm tra các thông tin đầu vào
    if (!movieId || !hallId || !startTime || price === undefined) {
      return res.status(400).json({
        message: "Missing required fields (movieId, hallId, startTime, price)",
      });
    }

    // Kiểm tra giá hợp lệ
    if (typeof price !== "number" && isNaN(parseFloat(price))) {
      return res.status(400).json({ message: "Price must be a valid number" });
    }

    if (parseFloat(price) <= 0) {
      return res
        .status(400)
        .json({ message: "Price must be a positive number" });
    }

    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(movieId, 10) },
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    const hall = await prisma.hall.findUnique({
      where: { id: parseInt(hallId, 10) },
    });
    if (!hall) return res.status(404).json({ message: "Hall not found" });

    // Ghi log thời gian để debug
    logTimeDebug("Thời gian bắt đầu", startTime);

    // Tính endTime từ startTime và thời lượng phim (UTC)
    const endTime = dayjs(startTime)
      .add(movie.duration, "minute")
      .toISOString();

    // Ghi log thời gian kết thúc để debug
    logTimeDebug("Thời gian kết thúc", endTime);

    // Kiểm tra xung đột lịch chiếu
    const conflictingShowtime = await prisma.showtime.findFirst({
      where: {
        hallId: parseInt(hallId, 10),
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });

    if (conflictingShowtime) {
      return res.status(400).json({
        message: "Time slot is already booked for this hall",
      });
    }

    // Tạo showtime mới sử dụng service
    const newShowtime = await showtimeService.createShowtime({
      movieId,
      hallId,
      startTime, // Giữ nguyên định dạng UTC từ frontend
      endTime, // Giữ nguyên định dạng UTC
      price,
    });

    res.status(201).json(newShowtime);
  } catch (error) {
    console.error("Error creating showtime:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy tất cả suất chiếu (GET /api/showtimes)
const getAllShowtimes = async (req, res) => {
  try {
    // Xử lý các tham số lọc từ query string
    const { movieId, cinemaId, date, showPast } = req.query;

    let filter = {};

    if (movieId) {
      filter.movieId = parseInt(movieId, 10);
    }

    if (cinemaId) {
      filter.hall = { cinemaId: parseInt(cinemaId, 10) };
    }

    if (date) {
      // Chuyển đổi ngày thành UTC đầu ngày và cuối ngày
      const startDate = dayjs
        .tz(date, VIETNAM_TIMEZONE)
        .startOf("day")
        .utc()
        .toDate();
      const endDate = dayjs
        .tz(date, VIETNAM_TIMEZONE)
        .endOf("day")
        .utc()
        .toDate();

      filter.startTime = { gte: startDate, lte: endDate };

      logTimeDebug(`Lọc theo ngày ${date} - Từ`, startDate);
      logTimeDebug(`Lọc theo ngày ${date} - Đến`, endDate);
    }

    // Mặc định, chỉ hiển thị suất chiếu hiện tại và trong tương lai
    if (showPast !== "true") {
      // Lấy thời gian hiện tại theo UTC
      const now = new Date();
      logTimeDebug("Thời gian hiện tại", now);

      filter.startTime = {
        ...filter.startTime,
        gte: filter.startTime?.gte || now,
      };
    }

    const showtimes = await prisma.showtime.findMany({
      where: filter,
      include: {
        movie: true,
        hall: {
          include: {
            cinema: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    // Log thông tin để debug
    console.log(`Filter: ${JSON.stringify(filter)}`);
    console.log(`Tìm thấy ${showtimes.length} suất chiếu`);

    res.status(200).json(showtimes);
  } catch (error) {
    console.error("Error getting showtimes:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getShowtimeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const showtime = await showtimeService.getShowtimeById(id);

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    // Lấy thêm số ghế còn trống
    const availableSeatCount = await showtimeService.getAvailableSeatCount(id);

    res.status(200).json({
      ...showtime,
      availableSeatCount,
    });
  } catch (error) {
    console.error("Error getting showtime:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Lấy danh sách ghế theo suất chiếu (GET /api/showtimes/:id/seats)
const getSeatsByShowtime = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.id, 10);

    // Kiểm tra xem showtime có tồn tại không
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId },
    });

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    const seats = await prisma.seat.findMany({
      where: {
        showtimeId: showtimeId,
      },
      select: {
        id: true,
        row: true,
        column: true,
        status: true,
        type: true,
      },
      orderBy: [{ row: "asc" }, { column: "asc" }],
    });

    // Nhóm ghế theo hàng để dễ hiển thị
    const seatsByRow = seats.reduce((acc, seat) => {
      if (!acc[seat.row]) {
        acc[seat.row] = [];
      }
      acc[seat.row].push(seat);
      return acc;
    }, {});

    res.status(200).json({
      totalSeats: seats.length,
      availableSeats: seats.filter((s) => s.status === "AVAILABLE").length,
      seatsByRow,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDatesByMovieAndCinema = async (req, res) => {
  try {
    const movieId = parseInt(req.query.movieId, 10);
    const cinemaId = parseInt(req.query.cinemaId, 10);

    // Lấy thời gian hiện tại theo UTC
    const now = new Date();
    logTimeDebug("Lấy ngày từ thời điểm", now);

    // Lấy tất cả showtime của movie tại các hall thuộc cinema đó và chỉ lấy những ngày từ hiện tại trở đi
    const showtimes = await prisma.showtime.findMany({
      where: {
        movieId,
        hall: { cinemaId },
        startTime: { gte: now },
      },
      select: { startTime: true },
    });

    // Lọc unique ngày và chuyển về giờ Việt Nam
    const uniqueDates = Array.from(
      new Set(
        showtimes.map((s) => {
          // Format theo giờ Việt Nam và lấy ngày
          return formatToVietnamTime(s.startTime).format("YYYY-MM-DD");
        })
      )
    ).sort();

    console.log(`Tìm thấy ${uniqueDates.length} ngày có suất chiếu`);
    return res.status(200).json({ dates: uniqueDates });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTimesByMovieCinemaDate = async (req, res) => {
  try {
    const movieId = parseInt(req.query.movieId, 10);
    const cinemaId = parseInt(req.query.cinemaId, 10);
    const date = req.query.date; // 'YYYY-MM-DD'

    // Chuyển đổi ngày thành UTC đầu ngày và cuối ngày
    const startDate = dayjs
      .tz(date, VIETNAM_TIMEZONE)
      .startOf("day")
      .utc()
      .toDate();
    const endDate = dayjs
      .tz(date, VIETNAM_TIMEZONE)
      .endOf("day")
      .utc()
      .toDate();

    // Lấy thời gian hiện tại UTC
    const now = new Date();

    logTimeDebug(`Lọc theo ngày ${date} - Từ`, startDate);
    logTimeDebug(`Lọc theo ngày ${date} - Đến`, endDate);
    logTimeDebug("Thời gian hiện tại", now);

    // Nếu ngày được chọn là ngày hiện tại, chỉ lấy các suất chiếu trong tương lai
    let timeFilter = {
      gte: startDate,
      lte: endDate,
    };

    // Nếu ngày là hôm nay, chỉ lấy từ giờ hiện tại trở đi
    const today = formatToVietnamTime(now).format("YYYY-MM-DD");
    if (date === today) {
      timeFilter.gte = now;
      logTimeDebug("Ngày hôm nay, lọc từ giờ hiện tại", now);
    }

    const showtimes = await prisma.showtime.findMany({
      where: {
        movieId: movieId,
        hall: {
          cinemaId: cinemaId,
        },
        startTime: timeFilter,
      },
      select: {
        id: true,
        startTime: true,
        hall: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    console.log(`Tìm thấy ${showtimes.length} suất chiếu`);
    if (showtimes.length > 0) {
      logTimeDebug("Suất chiếu đầu tiên", showtimes[0].startTime);
    }

    // Đếm số ghế còn trống cho mỗi suất chiếu
    const results = await Promise.all(
      showtimes.map(async (s) => {
        const availableSeats = await prisma.seat.count({
          where: {
            showtimeId: s.id,
            status: "AVAILABLE",
          },
        });

        // Hiển thị giờ theo định dạng 24h của Việt Nam (HH:MM)
        const time = formatToVietnamTime(s.startTime).format("HH:mm");

        return {
          id: s.id,
          time,
          hallName: s.hall.name,
          hallId: s.hall.id,
          availableSeats,
        };
      })
    );

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật suất chiếu (PUT /api/showtimes/:id)
const updateShowtime = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { movieId, hallId, startTime, price } = req.body;

    // Kiểm tra các thông tin đầu vào
    if (!movieId || !hallId || !startTime || price === undefined) {
      return res.status(400).json({
        message: "Missing required fields (movieId, hallId, startTime, price)",
      });
    }

    // Kiểm tra movie có tồn tại không
    const movie = await prisma.movie.findUnique({
      where: { id: parseInt(movieId, 10) },
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    // Kiểm tra hall có tồn tại không
    const hall = await prisma.hall.findUnique({
      where: { id: parseInt(hallId, 10) },
    });
    if (!hall) return res.status(404).json({ message: "Hall not found" });

    // Ghi log thời gian để debug
    logTimeDebug("Thời gian bắt đầu", startTime);

    // Tính endTime từ startTime và thời lượng phim
    const endTime = dayjs(startTime)
      .add(movie.duration, "minute")
      .toISOString();

    // Ghi log thời gian kết thúc để debug
    logTimeDebug("Thời gian kết thúc", endTime);

    // Kiểm tra xung đột lịch chiếu (trừ suất chiếu hiện tại)
    const conflictingShowtime = await prisma.showtime.findFirst({
      where: {
        hallId: parseInt(hallId, 10),
        id: { not: id },
        OR: [
          {
            startTime: { lte: startTime },
            endTime: { gt: startTime },
          },
          {
            startTime: { lt: endTime },
            endTime: { gte: endTime },
          },
          {
            startTime: { gte: startTime },
            endTime: { lte: endTime },
          },
        ],
      },
    });

    if (conflictingShowtime) {
      return res.status(400).json({
        message: "Time slot is already booked for this hall",
      });
    }

    try {
      const updatedShowtime = await showtimeService.updateShowtime(id, {
        movieId,
        hallId,
        startTime,
        endTime,
        price,
      });
      res.status(200).json(updatedShowtime);
    } catch (err) {
      if (err.message === "Cannot update showtime with existing tickets") {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error updating showtime:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Xóa suất chiếu (DELETE /api/showtimes/:id)
const deleteShowtime = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    try {
      await showtimeService.deleteShowtime(id);
      res.status(204).send();
    } catch (err) {
      if (err.message === "Cannot delete showtime with existing tickets") {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error("Error deleting showtime:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  createShowtime,
  getAllShowtimes,
  getShowtimeById,
  updateShowtime,
  deleteShowtime,
  getDatesByMovieAndCinema,
  getTimesByMovieCinemaDate,
  getSeatsByShowtime,
};
