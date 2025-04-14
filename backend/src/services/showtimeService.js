//src/services/showtimeService.js
const prisma = require('../../prisma/prisma');

const createShowtime = async ({ movieId, hallId, startTime, endTime }) => {
  return await prisma.showtime.create({
    data: {
      movieId,
      hallId,
      startTime,
      endTime,
    },
  });
};

const generateSeats = async (showtimeId, hall) => {
  const seats = [];
  for (let r = 0; r < hall.rows; r++) {
    const rowLetter = String.fromCharCode(65 + r); // A, B, C, ...
    for (let c = 1; c <= hall.columns; c++) {
      seats.push({
        showtimeId,
        row: rowLetter,
        column: c.toString(),
        status: 'AVAILABLE' // Sử dụng enum SeatStatus
      });
    }
  }

  await prisma.seat.createMany({ data: seats });
};

const getAllShowtimes = async () => {
  return await prisma.showtime.findMany({
    include: {
      movie: true,
      hall: true,
    },
  });
};

const getShowtimeById = async (id) => {
  return await prisma.showtime.findUnique({
    where: { id },
    include: {
      movie: true,
      hall: true,
    },
  });
};

const updateShowtime = async (id, { movieId, hallId, startTime, endTime }) => {
  return await prisma.showtime.update({
    where: { id },
    data: {
      movieId,
      hallId,
      startTime,
      endTime,
    },
  });
};

const deleteShowtime = async (id) => {
  await prisma.seat.deleteMany({ where: { showtimeId: id } }); // xoá ghế trước
  return await prisma.showtime.delete({ where: { id } });
};

module.exports = {
  createShowtime,
  generateSeats,
  getAllShowtimes,
  getShowtimeById,
  updateShowtime,
  deleteShowtime,
};
