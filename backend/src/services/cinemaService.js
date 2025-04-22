// backend/src/services/cinemaService.js
const prisma = require('../../prisma/prisma');

// Tạo rạp chiếu phim mới
const createCinema = async (cinemaData) => {
  return await prisma.cinema.create({
    data: cinemaData
  });
};

// Lấy tất cả rạp chiếu phim
const getAllCinemas = async () => {
  return await prisma.cinema.findMany({
    include: {
      halls: {
        select: {
          id: true,
          name: true,
          totalSeats: true
        }
      }
    }
  });
};

// Lấy rạp chiếu phim theo ID
const getCinemaById = async (id) => {
  return await prisma.cinema.findUnique({
    where: { id },
    include: {
      halls: true
    }
  });
};

// Cập nhật thông tin rạp chiếu phim
const updateCinema = async (id, updateData) => {
  return await prisma.cinema.update({
    where: { id },
    data: updateData
  });
};

// Xóa rạp chiếu phim
const deleteCinema = async (id) => {
  // Kiểm tra xem rạp chiếu phim có tồn tại không
  const cinema = await prisma.cinema.findUnique({
    where: { id },
    include: {
      halls: true
    }
  });
  
  if (!cinema) {
    throw new Error('Không tìm thấy rạp chiếu phim');
  }
  
  // Kiểm tra xem rạp có phòng chiếu không
  if (cinema.halls.length > 0) {
    throw new Error('Không thể xóa rạp chiếu phim có phòng chiếu');
  }
  
  return await prisma.cinema.delete({
    where: { id }
  });
};

// Lấy tất cả phòng chiếu của một rạp
const getHallsByCinema = async (cinemaId) => {
  // Kiểm tra xem rạp chiếu phim có tồn tại không
  const cinema = await prisma.cinema.findUnique({
    where: { id: cinemaId }
  });
  
  if (!cinema) {
    throw new Error('Không tìm thấy rạp chiếu phim');
  }
  
  return await prisma.hall.findMany({
    where: { cinemaId }
  });
};

// Tạo phòng chiếu mới cho rạp
const createHall = async (hallData) => {
  // Kiểm tra xem rạp chiếu phim có tồn tại không
  const cinema = await prisma.cinema.findUnique({
    where: { id: hallData.cinemaId }
  });
  
  if (!cinema) {
    throw new Error('Không tìm thấy rạp chiếu phim');
  }
  
  return await prisma.hall.create({
    data: hallData
  });
};

module.exports = {
  createCinema,
  getAllCinemas,
  getCinemaById,
  updateCinema,
  deleteCinema,
  getHallsByCinema,
  createHall
};