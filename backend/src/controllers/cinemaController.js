//backend/src/services/showtimeService.js
const cinemaService = require("../services/cinemaService");

// Tạo rạp chiếu phim (POST /api/cinemas)
exports.getAllCinemas = async (req, res) => {
  try {
    const cinemas = await cinemaService.getAllCinemas();
    res.json(cinemas);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Lấy thông tin rạp chiếu phim theo ID (GET /api/cinemas/:id)
exports.getCinemaById = async (req, res) => {
  try {
    const cinema = await cinemaService.getCinemaById(parseInt(req.params.id));
    if (!cinema) return res.status(404).json({ message: "Cinema not found" });
    res.json(cinema);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Tạo rạp chiếu phim (POST /api/cinemas)
exports.createCinema = async (req, res) => {
  try {
    const { name, address } = req.body;
    const newCinema = await cinemaService.createCinema({ name, address });
    res.status(201).json(newCinema);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Cập nhật thông tin rạp chiếu phim (PUT /api/cinemas/:id)
exports.updateCinema = async (req, res) => {
  try {
    const { name, address } = req.body;
    const updated = await cinemaService.updateCinema(parseInt(req.params.id), {
      name,
      address,
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Xóa rạp chiếu phim (DELETE /api/cinemas/:id)
exports.deleteCinema = async (req, res) => {
  try {
    await cinemaService.deleteCinema(parseInt(req.params.id));
    res.json({ message: "Cinema deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
