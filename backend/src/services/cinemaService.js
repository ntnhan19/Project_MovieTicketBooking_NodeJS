//backend/src/services/cinemaService.js
const prisma = require('../../prisma/prisma');

exports.getAllCinemas = () => {
    return prisma.cinema.findMany({
      include: { halls: true },
    });
  };
  
  exports.getCinemaById = (id) => {
    return prisma.cinema.findUnique({
      where: { id },
      include: { halls: true },
    });
  };
  
  exports.createCinema = (data) => {
    return prisma.cinema.create({ data });
  };
  
  exports.updateCinema = (id, data) => {
    return prisma.cinema.update({
      where: { id },
      data,
    });
  };
  
  exports.deleteCinema = (id) => {
    return prisma.cinema.delete({ where: { id } });
  };

