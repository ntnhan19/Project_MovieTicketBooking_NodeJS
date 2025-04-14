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
};