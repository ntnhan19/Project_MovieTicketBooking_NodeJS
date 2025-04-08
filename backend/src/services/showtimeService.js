//src/services/showtimeService.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllShowtimes = async () => {
  return await prisma.showtime.findMany({
    include: {
      movie: true,
      seats: true,
    },
  });
};

exports.getShowtimeById = async (id) => {
  return await prisma.showtime.findUnique({
    where: { id },
    include: {
      movie: true,
      seats: true,
    },
  });
};

exports.createShowtime = async (data) => {
  return await prisma.showtime.create({
    data,
  });
};

exports.updateShowtime = async (id, data) => {
  return await prisma.showtime.update({
    where: { id },
    data,
  });
};

exports.deleteShowtime = async (id) => {
  return await prisma.showtime.delete({
    where: { id },
  });
};
