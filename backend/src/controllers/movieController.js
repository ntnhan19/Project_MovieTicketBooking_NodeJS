// backend/src/controllers/movieController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const parseGenres = (genres) => {
  if (!genres) return [];
  if (typeof genres === "string") genres = JSON.parse(genres);
  return genres.map((g) => ({ id: g?.id || g }));
};

// Lấy tất cả phim
exports.getAllMovies = async (req, res) => {
  try {
    const { title, genreId, releaseDate, director } = req.query;

    const filters = {};

    if (title) {
      filters.title = {
        contains: title,
        mode: "insensitive",
      };
    }

    if (director) {
      filters.director = {
        contains: director,
        mode: "insensitive",
      };
    }

    if (releaseDate) {
      filters.releaseDate = new Date(releaseDate);
    }

    const genreFilter = genreId
      ? {
          some: {
            id: Number(genreId),
          },
        }
      : undefined;

    const movies = await prisma.movie.findMany({
      where: {
        ...filters,
        genres: genreFilter,
      },
      include: {
        genres: true,
      },
    });

    // Set header cho React Admin để lấy total count nếu cần phân trang
    res.set("X-Total-Count", movies.length.toString());
    res.set("Access-Control-Expose-Headers", "X-Total-Count");

    res.json(movies);
  } catch (err) {
    console.error("Lỗi getAllMovies:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Lấy 1 phim theo ID
exports.getMovieById = async (req, res) => {
  try {
    const movie = await prisma.movie.findUnique({
      where: { id: Number(req.params.id) },
      include: { genres: true },
    });
    movie ? res.json(movie) : res.status(404).json({ error: "Không tìm thấy phim" });
  } catch (err) {
    console.error("Lỗi getMovieById:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

//
exports.getMoviesByCinema = async (req, res) => {
  try {
    const cinemaId = Number(req.params.cinemaId);
    
    const movies = await prisma.movie.findMany({
      where: {
        showtimes: {
          some: {
            hall: {
              cinemaId: cinemaId
            }
          }
        }
      },
      include: {
        genres: true
      }
    });
    
    res.json(movies);
  } catch (err) {
    console.error("Lỗi getMoviesByCinema:", err);
    res.status(500).json({ error: "Lỗi server" });
  }
};

// Tạo phim mới
exports.createMovie = async (req, res) => {
  try {
    let {
      title,
      description,
      releaseDate,
      genres = [],
      poster,
      duration,
      director,
      mainActors
    } = req.body;

    if (typeof genres === "string") genres = JSON.parse(genres);
    if (releaseDate) releaseDate = new Date(releaseDate);

    const movie = await prisma.movie.create({
      data: {
        title,
        description,
        releaseDate,
        poster,
        duration: Number(duration),
        director,
        mainActors,
        genres: {
          connect: genres.map((g) => ({ id: g.id || g }))
        },
      },
      include: { genres: true }
    });

    res.status(201).json(movie);
  } catch (err) {
    console.error("Lỗi tạo movie:", err);
    res.status(500).json({ error: "Lỗi tạo movie" });
  }
};

// Cập nhật phim
exports.updateMovie = async (req, res) => {
  const id = Number(req.params.id);
  try {
    let {
      title,
      description,
      releaseDate,
      genres = [],
      poster,
      duration,
      director,
      mainActors
    } = req.body;

    if (typeof genres === "string") genres = JSON.parse(genres);
    if (releaseDate) releaseDate = new Date(releaseDate);

    const movie = await prisma.movie.update({
      where: { id },
      data: {
        title,
        description,
        releaseDate,
        poster,
        duration: Number(duration),
        director,
        mainActors,
        genres: {
          set: genres.map((g) => ({ id: g.id || g }))
        },
      },
      include: { genres: true }
    });

    res.json(movie);
  } catch (err) {
    console.error("Lỗi update movie:", err);
    res.status(500).json({ error: "Lỗi cập nhật movie" });
  }
};


// Xóa phim
exports.deleteMovie = async (req, res) => {
  const id = Number(req.params.id);
  try {
    await prisma.movie.delete({ where: { id } });
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error("Lỗi delete movie:", err);
    res.status(500).json({ error: "Lỗi xóa movie" });
  }
};
