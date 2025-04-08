//src/controllers/showtimeController.js
const showtimeService = require('../services/showtimeService');

exports.getAllShowtimes = async (req, res) => {
  try {
    const showtimes = await showtimeService.getAllShowtimes();
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getShowtimeById = async (req, res) => {
  try {
    const showtime = await showtimeService.getShowtimeById(Number(req.params.id));
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });
    res.json(showtime);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createShowtime = async (req, res) => {
  try {
    const newShowtime = await showtimeService.createShowtime(req.body);
    res.status(201).json(newShowtime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.updateShowtime = async (req, res) => {
  try {
    const updated = await showtimeService.updateShowtime(Number(req.params.id), req.body);
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deleteShowtime = async (req, res) => {
  try {
    await showtimeService.deleteShowtime(Number(req.params.id));
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
