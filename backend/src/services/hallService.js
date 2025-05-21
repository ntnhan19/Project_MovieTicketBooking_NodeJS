// backend/src/services/hallService.js
const prisma = require('../../prisma/prisma');

// Lấy tất cả phòng chiếu với phân trang và lọc theo rạp
const getAllHalls = async (page = 1, limit = 10, cinemaId = undefined) => {
  const skip = (page - 1) * limit;
  
  const whereClause = {};
  if (cinemaId !== undefined) {
    whereClause.cinemaId = cinemaId;
  }
  
  const [halls, total] = await prisma.$transaction([
    prisma.hall.findMany({
      where: whereClause,
      skip,
      take: limit,      include: {
        cinema: {
          select: {
            id: true,
            name: true,
            address: true
          }
        },
        showtimes: {
          select: {
            id: true
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    }),
    prisma.hall.count({ where: whereClause })
  ]);
  
  // Thêm thông tin về số lượng suất chiếu cho mỗi phòng
  const formattedHalls = halls.map(hall => ({
    ...hall,
    showtimeCount: hall.showtimes.length,
    showtimes: undefined // Loại bỏ mảng showtimes trong kết quả trả về
  }));
  
  return {
    data: formattedHalls,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  };
};

// Lấy phòng chiếu theo ID
const getHallById = async (id) => {
  return await prisma.hall.findUnique({
    where: { id },
    include: {
      cinema: {
        select: {
          id: true,
          name: true,
          address: true
        }
      },
      showtimes: {
        select: {
          id: true,
          startTime: true,
          endTime: true,
          movie: {
            select: {
              id: true,
              title: true,
              poster: true
            }
          }
        },
        orderBy: {
          startTime: 'asc'
        },
        take: 5 // Chỉ lấy 5 suất chiếu sắp tới
      }
    }
  });
};

// Lấy phòng chiếu theo rạp
const getHallsByCinema = async (cinemaId) => {
  // Kiểm tra xem rạp có tồn tại không
  const cinema = await prisma.cinema.findUnique({
    where: { id: cinemaId }
  });
  
  if (!cinema) {
    throw new Error('Không tìm thấy rạp');
  }
  
  return await prisma.hall.findMany({
    where: { cinemaId },
    include: {
      showtimes: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
};

// Tạo phòng chiếu mới
const createHall = async (hallData) => {
  // Kiểm tra xem rạp có tồn tại không
  const cinema = await prisma.cinema.findUnique({
    where: { id: hallData.cinemaId }
  });
  
  if (!cinema) {
    throw new Error('Rạp không tồn tại');
  }
  
  // Kiểm tra xem tên phòng chiếu đã tồn tại trong rạp chưa
  const existingHall = await prisma.hall.findFirst({
    where: {
      name: hallData.name,
      cinemaId: hallData.cinemaId
    }
  });
  
  if (existingHall) {
    throw new Error('Phòng chiếu đã tồn tại trong rạp này');
  }
  
  return await prisma.hall.create({
    data: hallData,
    include: {
      cinema: {
        select: {
          id: true,
          name: true,
          address: true
        }
      }
    }
  });
};

// Cập nhật phòng chiếu
const updateHall = async (id, updateData) => {
  // Kiểm tra xem rạp có tồn tại không (nếu cập nhật cinemaId)
  if (updateData.cinemaId) {
    const cinema = await prisma.cinema.findUnique({
      where: { id: updateData.cinemaId }
    });
    
    if (!cinema) {
      throw new Error('Rạp không tồn tại');
    }
    
    // Kiểm tra xem tên phòng chiếu đã tồn tại trong rạp mới chưa
    if (updateData.name) {
      const existingHall = await prisma.hall.findFirst({
        where: {
          name: updateData.name,
          cinemaId: updateData.cinemaId,
          id: { not: id }
        }
      });
      
      if (existingHall) {
        throw new Error('Phòng chiếu đã tồn tại trong rạp này');
      }
    }
  } else if (updateData.name) {
    // Nếu chỉ cập nhật tên, kiểm tra xem tên mới đã tồn tại trong rạp hiện tại chưa
    const currentHall = await prisma.hall.findUnique({
      where: { id }
    });
    
    if (currentHall) {
      const existingHall = await prisma.hall.findFirst({
        where: {
          name: updateData.name,
          cinemaId: currentHall.cinemaId,
          id: { not: id }
        }
      });
      
      if (existingHall) {
        throw new Error('Phòng chiếu đã tồn tại trong rạp này');
      }
    }
  }
  
  return await prisma.hall.update({
    where: { id },
    data: updateData,
    include: {
      cinema: {
        select: {
          id: true,
          name: true,
          address: true
        }
      }
    }
  });
};

// Kiểm tra xem phòng chiếu có đang được sử dụng trong lịch chiếu không
const checkHallHasShowtimes = async (id) => {
  const showtimeCount = await prisma.showtime.count({
    where: { hallId: id }
  });
  
  return showtimeCount > 0;
};

// Xóa phòng chiếu
const deleteHall = async (id) => {
  return await prisma.hall.delete({
    where: { id }
  });
};

module.exports = {
  getAllHalls,
  getHallById,
  getHallsByCinema,
  createHall,
  updateHall,
  checkHallHasShowtimes,
  deleteHall
};