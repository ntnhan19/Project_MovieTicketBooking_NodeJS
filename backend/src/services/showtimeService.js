//src/services/showtimeService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
  const seatCount = hall.seatCount || 60;
  const rows = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const totalRows = Math.ceil(seatCount / 10);

  const seats = [];
  for (let row = 0; row < totalRows; row++) {
    for (let num = 1; num <= 10; num++) {
      const seatNumber = `${rows[row]}${num}`;
      seats.push({ seatNumber, showtimeId });
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
