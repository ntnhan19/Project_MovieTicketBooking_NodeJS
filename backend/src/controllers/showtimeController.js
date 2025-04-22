// backend/src/controllers/showtimeController.js
const prisma = require('../../prisma/prisma');
const showtimeService = require('../services/showtimeService');

// Tạo suất chiếu (POST /api/showtimes)
const createShowtime = async (req, res) => {
  try {
    const { movieId, hallId, startTime, price } = req.body;

    // Kiểm tra các thông tin đầu vào
    if (!movieId || !hallId || !startTime || price === undefined) {
      return res.status(400).json({ message: 'Missing required fields (movieId, hallId, startTime, price)' });
    }

    // Kiểm tra giá hợp lệ
    if (typeof price !== 'number' || price <= 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const hall = await prisma.hall.findUnique({ where: { id: hallId } });
    if (!hall) return res.status(404).json({ message: 'Hall not found' });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + movie.duration * 60000);

    // Kiểm tra xung đột lịch chiếu
    const conflictingShowtime = await prisma.showtime.findFirst({
      where: {
        hallId,
        OR: [
          {
            startTime: { lte: start },
            endTime: { gt: start }
          },
          {
            startTime: { lt: end },
            endTime: { gte: end }
          },
          {
            startTime: { gte: start },
            endTime: { lte: end }
          }
        ]
      }
    });

    if (conflictingShowtime) {
      return res.status(400).json({
        message: 'Time slot is already booked for this hall'
      });
    }

    const newShowtime = await showtimeService.createShowtime({
      movieId,
      hallId,
      startTime: start,
      endTime: end,
      price
    });

    res.status(201).json(newShowtime);
  } catch (error) {
    console.error('Error creating showtime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy tất cả suất chiếu (GET /api/showtimes)
const getAllShowtimes = async (req, res) => {
  try {
    // Xử lý các tham số lọc từ query string
    const { movieId, cinemaId, date } = req.query;
    
    let filter = {};
    
    if (movieId) {
      filter.movieId = parseInt(movieId);
    }
    
    if (cinemaId) {
      filter.hall = { cinemaId: parseInt(cinemaId) };
    }
    
    if (date) {
      const startDate = new Date(date + 'T00:00:00');
      const endDate = new Date(date + 'T23:59:59');
      filter.startTime = { gte: startDate, lte: endDate };
    }
    
    const showtimes = await prisma.showtime.findMany({
      where: filter,
      include: {
        movie: true,
        hall: {
          include: {
            cinema: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
    
    res.status(200).json(showtimes);
  } catch (error) {
    console.error('Error getting showtimes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getShowtimeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const showtime = await showtimeService.getShowtimeById(id);
    
    if (!showtime) {
      return res.status(404).json({ message: 'Showtime not found' });
    }
    
    // Lấy thêm số ghế còn trống
    const availableSeatCount = await showtimeService.getAvailableSeatCount(id);
    
    res.status(200).json({
      ...showtime,
      availableSeatCount
    });
  } catch (error) {
    console.error('Error getting showtime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy danh sách ghế theo suất chiếu (GET /api/showtimes/:id/seats)
const getSeatsByShowtime = async (req, res) => {
  try {
    const showtimeId = parseInt(req.params.id);

    // Kiểm tra xem showtime có tồn tại không
    const showtime = await prisma.showtime.findUnique({
      where: { id: showtimeId }
    });

    if (!showtime) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    const seats = await prisma.seat.findMany({
      where: {
        showtimeId: showtimeId // Sử dụng đúng định dạng, không cần đóng gói trong đối tượng phức tạp
      },
      select: {
        id: true,
        row: true,
        column: true,
        status: true,
        type: true
      },
      orderBy: [
        { row: 'asc' },
        { column: 'asc' }
      ]
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
      availableSeats: seats.filter(s => s.status === 'AVAILABLE').length,
      seatsByRow
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

const getDatesByMovieAndCinema = async (req, res) => {
  try {
    const movieId = parseInt(req.query.movieId);
    const cinemaId = parseInt(req.query.cinemaId);

    // Lấy tất cả showtime của movie tại các hall thuộc cinema đó
    const showtimes = await prisma.showtime.findMany({
      where: {
        movieId,
        hall: { cinemaId }
      },
      select: { startTime: true }
    });

    // Lọc unique ngày
    const uniqueDates = Array.from(new Set(
      showtimes.map(s => s.startTime.toISOString().split('T')[0])
    )).sort();

    return res.status(200).json({ dates: uniqueDates });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getTimesByMovieCinemaDate = async (req, res) => {
  try {
    const movieId = parseInt(req.query.movieId);
    const cinemaId = parseInt(req.query.cinemaId);
    const date = req.query.date; // 'YYYY-MM-DD'

    // Giới hạn từ 00:00 đến 23:59 ngày đó
    const start = new Date(date + 'T00:00:00Z'); 
    const end = new Date(date + 'T23:59:59.999Z');

    const showtimes = await prisma.showtime.findMany({
      where: {
        movieId: movieId,
        hall: {
          cinemaId: cinemaId
        },
        startTime: {
          gte: start,
          lte: end
        }
      },
      select: {
        id: true,
        startTime: true,
        hall: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { startTime: 'asc' }
    });
    
    console.log('Showtimes found:', showtimes.length);

    // Đếm số ghế còn trống cho mỗi suất chiếu
    const results = await Promise.all(showtimes.map(async (s) => {
      const availableSeats = await prisma.seat.count({
        where: {
          showtimeId: s.id,
          status: 'AVAILABLE'
        }
      });
      
      return {
        id: s.id,
        time: s.startTime.toISOString().slice(11, 16), // 'HH:MM'
        hallName: s.hall.name,
        hallId: s.hall.id,
        availableSeats
      };
    }));

    return res.status(200).json(results);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};



// Cập nhật suất chiếu (PUT /api/showtimes/:id)
const updateShowtime = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { movieId, hallId, startTime, price } = req.body;

    // Kiểm tra các thông tin đầu vào
    if (!movieId || !hallId || !startTime || price === undefined) {
      return res.status(400).json({ message: 'Missing required fields (movieId, hallId, startTime, price)' });
    }

    // Kiểm tra movie có tồn tại không
    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + movie.duration * 60000);

    // Kiểm tra xung đột lịch chiếu (trừ suất chiếu hiện tại)
    const conflictingShowtime = await prisma.showtime.findFirst({
      where: {
        hallId,
        id: { not: id },
        OR: [
          {
            startTime: { lte: start },
            endTime: { gt: start }
          },
          {
            startTime: { lt: end },
            endTime: { gte: end }
          },
          {
            startTime: { gte: start },
            endTime: { lte: end }
          }
        ]
      }
    });

    if (conflictingShowtime) {
      return res.status(400).json({
        message: 'Time slot is already booked for this hall'
      });
    }

    try {
      const updatedShowtime = await showtimeService.updateShowtime(id, { movieId, hallId, startTime: start, endTime: end, price });
      res.status(200).json(updatedShowtime);
    } catch (err) {
      if (err.message === 'Cannot update showtime with existing tickets') {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error updating showtime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Xóa suất chiếu (DELETE /api/showtimes/:id)
const deleteShowtime = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    try {
      await showtimeService.deleteShowtime(id);
      res.status(204).send();
    } catch (err) {
      if (err.message === 'Cannot delete showtime with existing tickets') {
        return res.status(400).json({ message: err.message });
      }
      throw err;
    }
  } catch (error) {
    console.error('Error deleting showtime:', error);
    res.status(500).json({ message: 'Internal server error' });
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