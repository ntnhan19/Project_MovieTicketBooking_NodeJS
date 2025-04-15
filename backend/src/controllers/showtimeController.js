//src/controllers/showtimeController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const showtimeService = require('../services/showtimeService');

// Tạo suất chiếu (POST /api/showtimes)
const createShowtime = async (req, res) => {
  try {
    const { movieId, hallId, startTime } = req.body;

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const hall = await prisma.hall.findUnique({ where: { id: hallId } });
    if (!hall) return res.status(404).json({ message: 'Hall not found' });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + movie.duration * 60000);

    const newShowtime = await showtimeService.createShowtime({ movieId, hallId, startTime: start, endTime: end });
    await showtimeService.generateSeats(newShowtime.id, hall);

    res.status(201).json(newShowtime);
  } catch (error) {
    console.error('Error creating showtime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy tất cả suất chiếu (GET /api/showtimes)
const getAllShowtimes = async (req, res) => {
  try {
    const showtimes = await showtimeService.getAllShowtimes();
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
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    res.status(200).json(showtime);
  } catch (error) {
    console.error('Error getting showtime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy danh sách ghế theo suất chiếu (GET /api/showtimes/:id/seats)
const getSeatsByShowtime = async (req, res) => {
  try {
    const { id } = req.params;

    const seats = await prisma.seat.findMany({
      where: { showtimeId: parseInt(id) },
      select: {
        id: true,
        row: true,
        column: true,
        status: true,
      },
      orderBy: [
        { row: 'asc' },
        { column: 'asc' }
      ]
    });

    res.status(200).json(seats);
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
    ));

    return res.status(200).json(uniqueDates);
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
    const start = new Date(date + 'T00:00:00');
    const end = new Date(date + 'T23:59:59');

    const showtimes = await prisma.showtime.findMany({
      where: {
        movieId,
        hall: { cinemaId },
        startTime: { gte: start, lte: end }
      },
      select: {
        id: true,
        startTime: true,
        price: true
      },
      orderBy: { startTime: 'asc' }
    });

    const result = showtimes.map(s => ({
      id: s.id,
      time: s.startTime.toISOString().slice(11, 16), // 'HH:MM'
      price: s.price
    }));

    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// Cập nhật suất chiếu (PUT /api/showtimes/:id)
const updateShowtime = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { movieId, hallId, startTime } = req.body;

    const movie = await prisma.movie.findUnique({ where: { id: movieId } });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    const start = new Date(startTime);
    const end = new Date(start.getTime() + movie.duration * 60000);

    const updatedShowtime = await showtimeService.updateShowtime(id, { movieId, hallId, startTime: start, endTime: end });
    res.status(200).json(updatedShowtime);
  } catch (error) {
    console.error('Error updating showtime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Xóa suất chiếu (DELETE /api/showtimes/:id)
const deleteShowtime = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await showtimeService.deleteShowtime(id);
    res.status(204).send();
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