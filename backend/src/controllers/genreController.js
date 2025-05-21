// backend/src/controllers/genreController.js
const prisma = require('../../prisma/prisma');

// Lấy tất cả thể loại
exports.getAllGenres = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const perPage = parseInt(req.query.perPage) || 10;
  const search = req.query.search || '';

  try {
    const [genres, total] = await Promise.all([      prisma.genre.findMany({
        skip: (page - 1) * perPage,
        take: perPage,
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        orderBy: {
          id: 'asc',
        },
      }),
      prisma.genre.count({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      }),
    ]);

    res.json({
      data: genres,
      total,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Lỗi khi lấy danh sách thể loại' });
  }
};

// Lấy thể loại theo ID
exports.getGenreById = async (req, res) => {
  const id = Number(req.params.id);
  try {
    const genre = await prisma.genre.findUnique({ where: { id } });
    genre ? res.json(genre) : res.status(404).json({ error: 'Thể loại không tìm thấy' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi lấy thể loại' });
  }
};

// Tao thể loại mới
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

// Câp nhật thể loại theo ID
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

// Xóa thể loại theo ID
exports.deleteGenre = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.genre.delete({ where: { id } });
    res.json({ message: 'Xóa thể loại thành công' });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi khi xóa thể loại' });
  }
};
