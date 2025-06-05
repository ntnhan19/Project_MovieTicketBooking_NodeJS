// backend/src/services/showtimeService.js
const prisma = require("../../prisma/prisma");
const seatService = require("./seatService");
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

const createShowtime = async ({
  movieId,
  hallId,
  startTime,
  endTime,
  price,
  // Sử dụng rest parameter để loại bỏ mọi trường không mong muốn
  ...otherData
}) => {
  try {
    // Kiểm tra giá cơ bản
    if (price === undefined || price === null) {
      throw new Error("Giá cơ bản của suất chiếu là bắt buộc");
    }

    // Convert dữ liệu đầu vào
    const movieIdInt = parseInt(movieId, 10);
    const hallIdInt = parseInt(hallId, 10);
    const priceFloat = parseFloat(price);

    // Ghi log thời gian để debug
    logTimeDebug("Thời gian bắt đầu", startTime);
    logTimeDebug("Thời gian kết thúc", endTime);

    // Nếu endTime không được cung cấp, tính endTime dựa trên startTime + thời lượng phim
    let calculatedEndTime = endTime;

    if (!calculatedEndTime && startTime) {
      // Lấy thông tin về thời lượng phim
      const movie = await prisma.movie.findUnique({
        where: { id: movieIdInt },
      });

      if (movie && movie.duration) {
        // Tính thời gian kết thúc bằng cách thêm thời lượng phim vào thời gian bắt đầu
        // Lưu ý: dayjs không thay đổi instance ban đầu
        calculatedEndTime = dayjs(startTime)
          .add(movie.duration, "minute")
          .toISOString();
      } else {
        // Mặc định thời lượng 2 giờ nếu không có thông tin thời lượng phim
        calculatedEndTime = dayjs(startTime).add(2, "hour").toISOString();
      }

      logTimeDebug("Thời gian kết thúc (đã tính toán)", calculatedEndTime);
    }

    // Đảm bảo dữ liệu đúng kiểu và không chứa ID
    const data = {
      movieId: movieIdInt,
      hallId: hallIdInt,
      startTime, // Lưu vào database nguyên dạng (đã là UTC)
      endTime: calculatedEndTime, // Lưu vào database nguyên dạng (đã là UTC)
      price: priceFloat,
    };

    // Tạo showtime mới với cấu trúc dữ liệu đơn giản và rõ ràng
    const showtime = await prisma.showtime.create({ data });

    // Sau khi tạo showtime, tạo ghế tương ứng
    const hall = await prisma.hall.findUnique({
      where: { id: hallIdInt },
    });

    if (hall) {
      await seatService.generateSeats(showtime.id, hall);
    } else {
      console.warn(`Không tìm thấy hall với id ${hallIdInt}`);
    }

    return showtime;
  } catch (error) {
    console.error("Lỗi chi tiết khi tạo showtime:", error);

    // Kiểm tra lỗi cụ thể từ Prisma
    if (error.code === "P2002") {
      const target = error.meta?.target || [];
      if (target.includes("id")) {
        throw new Error(
          `Không thể tạo showtime do lỗi ràng buộc id. Vui lòng thử lại.`
        );
      }
    }

    throw error;
  }
};

// Các hàm khác giữ nguyên
const getAllShowtimes = async (options = {}) => {
  const now = new Date();
  let filter = { ...options.filter };

  // Xử lý bộ lọc trạng thái
  if (options.filter?.status && options.filter.status !== "all") {
    if (options.filter.status === "playing") {
      filter.startTime = { lte: now };
      filter.endTime = { gte: now };
    } else if (options.filter.status === "upcoming") {
      filter.startTime = { gt: now };
    } else if (options.filter.status === "ended") {
      filter.endTime = { lt: now };
    }
    delete filter.status; // Xóa trường status khỏi filter
  }

  // Xóa các trường không hợp lệ
  delete filter._sort;
  delete filter._order;

  const [showtimes, total] = await Promise.all([
    prisma.showtime.findMany({
      where: filter,
      include: {
        movie: true,
        hall: { include: { cinema: true } },
      },
      orderBy: options.orderBy || { startTime: "asc" },
      skip: (options.pagination?.page - 1) * options.pagination?.perPage || 0,
      take: options.pagination?.perPage || 10,
    }),
    prisma.showtime.count({ where: filter }),
  ]);

  return {
    data: showtimes,
    total,
    totalPages: Math.ceil(total / (options.pagination?.perPage || 10)),
  };
};

const getShowtimeById = async (id) => {
  return await prisma.showtime.findUnique({
    where: { id },
    include: {
      movie: true,
      hall: {
        include: {
          cinema: true,
        },
      },
    },
  });
};

const updateShowtime = async (
  id,
  { movieId, hallId, startTime, endTime, price }
) => {
  try {
    // Kiểm tra xem có vé nào đã được đặt cho suất chiếu này chưa
    const existingTickets = await prisma.ticket.findMany({
      where: { showtimeId: id },
    });

    if (existingTickets.length > 0) {
      throw new Error("Cannot update showtime with existing tickets");
    }

    // Convert dữ liệu đầu vào
    const movieIdInt = movieId ? parseInt(movieId, 10) : undefined;
    const hallIdInt = hallId ? parseInt(hallId, 10) : undefined;
    const priceFloat = price !== undefined ? parseFloat(price) : undefined;

    // Ghi log thời gian để debug
    logTimeDebug("Cập nhật - Thời gian bắt đầu", startTime);
    logTimeDebug("Cập nhật - Thời gian kết thúc", endTime);

    // Tạo object data chỉ với các trường được cung cấp
    const data = {};
    if (movieIdInt !== undefined) data.movieId = movieIdInt;
    if (hallIdInt !== undefined) data.hallId = hallIdInt;
    if (startTime !== undefined) data.startTime = startTime;
    if (endTime !== undefined) data.endTime = endTime;
    if (priceFloat !== undefined) data.price = priceFloat;

    return await prisma.showtime.update({
      where: { id },
      data,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật showtime:", error);
    throw error;
  }
};

const deleteShowtime = async (id) => {
  // Kiểm tra xem có vé nào đã được đặt cho suất chiếu này chưa
  const existingTickets = await prisma.ticket.findMany({
    where: { showtimeId: id },
  });

  if (existingTickets.length > 0) {
    throw new Error("Cannot delete showtime with existing tickets");
  }

  // Xóa tất cả ghế liên quan trước
  await prisma.seat.deleteMany({ where: { showtimeId: id } });

  // Sau đó xóa suất chiếu
  return await prisma.showtime.delete({ where: { id } });
};

const getShowtimesByMovie = async (movieId, showPast = false) => {
  // Lấy thời gian hiện tại (UTC)
  const now = new Date();

  // Ghi log thời gian hiện tại
  logTimeDebug(`Lọc suất chiếu phim ${movieId} từ thời điểm`, now);

  const filter = {
    movieId,
  };

  // Mặc định chỉ lấy các suất chiếu trong tương lai
  if (!showPast) {
    filter.startTime = { gte: now };
  }

  return await prisma.showtime.findMany({
    where: filter,
    include: {
      hall: {
        include: {
          cinema: true,
        },
      },
    },
    orderBy: { startTime: "asc" },
  });
};

const getShowtimesByCinema = async (cinemaId, showPast = false) => {
  // Lấy thời gian hiện tại (UTC)
  const now = new Date();

  // Ghi log thời gian hiện tại
  logTimeDebug(`Lọc suất chiếu rạp ${cinemaId} từ thời điểm`, now);

  const filter = {
    hall: {
      cinemaId,
    },
  };

  // Mặc định chỉ lấy các suất chiếu trong tương lai
  if (!showPast) {
    filter.startTime = { gte: now };
  }

  return await prisma.showtime.findMany({
    where: filter,
    include: {
      movie: true,
      hall: true,
    },
    orderBy: { startTime: "asc" },
  });
};

const getAvailableSeatCount = async (showtimeId) => {
  const seats = await prisma.seat.findMany({
    where: {
      showtimeId,
      status: "AVAILABLE",
    },
  });

  return seats.length;
};

module.exports = {
  createShowtime,
  getAllShowtimes,
  getShowtimeById,
  updateShowtime,
  deleteShowtime,
  getShowtimesByMovie,
  getShowtimesByCinema,
  getAvailableSeatCount,
};
