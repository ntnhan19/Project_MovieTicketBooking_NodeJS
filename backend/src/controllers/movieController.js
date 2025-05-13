// backend/src/controllers/movieController.js
const movieService = require('../services/movieService');

// Lấy tất cả phim
exports.getAllMovies = async (req, res) => {
  try {
    const { 
      title, 
      genreId, 
      releaseDate, 
      director,
      page = 1,
      limit = 10,
      sortBy = 'releaseDate',
      sortOrder = 'desc' 
    } = req.query;

    const filter = {
      title,
      genreId,
      releaseDate,
      director,
      page,
      limit,
      sortBy,
      sortOrder
    };

    const result = await movieService.getAllMovies(filter);

    // Thiết lập header cho phân trang
    res.set("X-Total-Count", result.pagination.total.toString());
    res.set("X-Page", result.pagination.page.toString());
    res.set("X-Limit", result.pagination.limit.toString());
    res.set("X-Total-Pages", result.pagination.totalPages.toString());
    res.set("Access-Control-Expose-Headers", "X-Total-Count, X-Page, X-Limit, X-Total-Pages");

    res.json(result.data);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách phim:", err);
    res.status(500).json({ error: "Lỗi server khi lấy danh sách phim" });
  }
};

// Lấy phim theo ID
exports.getMovieById = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movie = await movieService.getMovieById(movieId);
    
    if (!movie) {
      return res.status(404).json({ error: "Không tìm thấy phim" });
    }

    res.json(movie);
  } catch (err) {
    console.error("Lỗi khi lấy thông tin phim:", err);
    res.status(500).json({ error: "Lỗi server khi lấy thông tin phim" });
  }
};

// Lấy phim theo rạp chiếu
exports.getMoviesByCinema = async (req, res) => {
  try {
    const cinemaId = req.params.cinemaId;
    const { date } = req.query;
    
    const movies = await movieService.getMoviesByCinema(cinemaId, date);
    
    res.json(movies);
  } catch (err) {
    console.error("Lỗi khi lấy phim theo rạp:", err);
    res.status(500).json({ error: "Lỗi server khi lấy phim theo rạp" });
  }
};

// Tạo phim mới
exports.createMovie = async (req, res) => {
  try {
    const movieData = req.body;
    
    // Kiểm tra các trường bắt buộc
    if (!movieData.title || !movieData.description || !movieData.releaseDate || !movieData.poster) {
      return res.status(400).json({ error: "Thiếu thông tin bắt buộc" });
    }

    // Đảm bảo loại bỏ id nếu có
    const { id, ...movieDataWithoutId } = movieData;
    console.log("Dữ liệu phim trước khi gửi đến service:", movieDataWithoutId);

    const newMovie = await movieService.createMovie(movieDataWithoutId);

    res.status(201).json(newMovie);
  } catch (err) {
    console.error("Lỗi khi tạo phim:", err);
    res.status(500).json({ error: "Lỗi khi tạo phim", details: err.message });
  }
};

// Cập nhật phim
exports.updateMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    const movieData = req.body;

    const updatedMovie = await movieService.updateMovie(movieId, movieData);

    if (!updatedMovie) {
      return res.status(404).json({ error: "Không tìm thấy phim" });
    }

    res.json(updatedMovie);
  } catch (err) {
    console.error("Lỗi khi cập nhật phim:", err);
    res.status(500).json({ error: "Lỗi khi cập nhật phim", details: err.message });
  }
};

// Xóa phim
exports.deleteMovie = async (req, res) => {
  try {
    const movieId = req.params.id;
    
    // Kiểm tra phim có tồn tại và có lịch chiếu hay không
    const check = await movieService.checkMovieHasShowtimes(movieId);
    
    if (!check.exists) {
      return res.status(404).json({ error: "Không tìm thấy phim" });
    }

    if (check.hasShowtimes) {
      return res.status(400).json({ 
        error: "Không thể xóa phim đang có lịch chiếu",
        showtimeCount: check.showtimeCount
      });
    }

    await movieService.deleteMovie(movieId);
    
    res.json({ message: "Xóa phim thành công" });
  } catch (err) {
    console.error("Lỗi khi xóa phim:", err);
    res.status(500).json({ error: "Lỗi khi xóa phim", details: err.message });
  }
};

// Lấy phim sắp chiếu
exports.getUpcomingMovies = async (req, res) => {
  try {
    const movies = await movieService.getUpcomingMovies();
    res.json(movies);
  } catch (err) {
    console.error("Lỗi khi lấy phim sắp chiếu:", err);
    res.status(500).json({ error: "Lỗi server khi lấy phim sắp chiếu" });
  }
};

// Lấy phim đang chiếu
exports.getNowShowingMovies = async (req, res) => {
  try {
    const movies = await movieService.getNowShowingMovies();
    res.json(movies);
  } catch (err) {
    console.error("Lỗi khi lấy phim đang chiếu:", err);
    res.status(500).json({ error: "Lỗi server khi lấy phim đang chiếu" });
  }
};