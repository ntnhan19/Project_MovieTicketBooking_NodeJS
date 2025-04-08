// backend/src/controllers/genreController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all genres
exports.getAllGenres = async (req, res) => {
  try {
    const genres = await prisma.genre.findMany();
    res.json(genres);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thể loại' });
  }
};

// Get genre by ID
exports.getGenreById = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const genre = await prisma.genre.findUnique({ where: { id } });
    genre ? res.json(genre) : res.status(404).json({ error: 'Thể loại không tìm thấy' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy thể loại' });
  }
};

// Create a new genre
exports.createGenre = async (req, res) => {
  const { name } = req.body;
  try {
    const genre = await prisma.genre.create({
      data: { name },
    });
    res.status(201).json(genre);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi tạo thể loại' });
  }
};

// Update genre by ID
exports.updateGenre = async (req, res) => {
  const id = Number(req.params.id);
  const { name } = req.body;
  try {
    const genre = await prisma.genre.update({
      where: { id },
      data: { name },
    });
    res.json(genre);
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi cập nhật thể loại' });
  }
};

// Delete genre by ID
exports.deleteGenre = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.genre.delete({ where: { id } });
    res.json({ message: 'Xóa thể loại thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa thể loại' });
  }
};
