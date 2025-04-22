//src/services/showtimeService.js
const prisma = require('../../prisma/prisma');
const seatService = require('./seatService');

const createShowtime = async ({ movieId, hallId, startTime, endTime, price }) => {
  // Kiểm tra giá cơ bản
  if (price === undefined || price === null) {
    throw new Error('Giá cơ bản của suất chiếu là bắt buộc');
  }
  
  const showtime = await prisma.showtime.create({
    data: {
      movieId,
      hallId,
      startTime,
      endTime,
      price,
    },
  });
  
  // Sau khi tạo showtime, tạo ghế tương ứng
  const hall = await prisma.hall.findUnique({ where: { id: hallId } });
  if (hall) {
    await seatService.generateSeats(showtime.id, hall);
  }
  
  return showtime;
};

const getAllShowtimes = async () => {
  return await prisma.showtime.findMany({
    include: {
      movie: true,
      hall: {
        include: {
          cinema: true
        }
      },
    },
  });
};

const getShowtimeById = async (id) => {
  return await prisma.showtime.findUnique({
    where: { id },
    include: {
      movie: true,
      hall: {
        include: {
          cinema: true
        }
      },
    },
  });
};

const updateShowtime = async (id, { movieId, hallId, startTime, endTime, price }) => {
  // Kiểm tra xem có vé nào đã được đặt cho suất chiếu này chưa
  const existingTickets = await prisma.ticket.findMany({
    where: { showtimeId: id }
  });
  
  if (existingTickets.length > 0) {
    throw new Error('Cannot update showtime with existing tickets');
  }
  
  return await prisma.showtime.update({
    where: { id },
    data: {
      movieId,
      hallId,
      startTime,
      endTime,
      price,
    },
  });
};

const deleteShowtime = async (id) => {
  // Kiểm tra xem có vé nào đã được đặt cho suất chiếu này chưa
  const existingTickets = await prisma.ticket.findMany({
    where: { showtimeId: id }
  });
  
  if (existingTickets.length > 0) {
    throw new Error('Cannot delete showtime with existing tickets');
  }
  
  // Xóa tất cả ghế liên quan trước
  await prisma.seat.deleteMany({ where: { showtimeId: id } });
  
  // Sau đó xóa suất chiếu
  return await prisma.showtime.delete({ where: { id } });
};

const getShowtimesByMovie = async (movieId) => {
  return await prisma.showtime.findMany({
    where: { movieId },
    include: {
      hall: {
        include: {
          cinema: true
        }
      }
    },
    orderBy: { startTime: 'asc' }
  });
};

const getShowtimesByCinema = async (cinemaId) => {
  return await prisma.showtime.findMany({
    where: {
      hall: {
        cinemaId
      }
    },
    include: {
      movie: true,
      hall: true
    },
    orderBy: { startTime: 'asc' }
  });
};


const getAvailableSeatCount = async (showtimeId) => {
  const seats = await prisma.seat.findMany({
    where: {
      showtimeId,
      status: 'AVAILABLE'
    }
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
  getAvailableSeatCount
};