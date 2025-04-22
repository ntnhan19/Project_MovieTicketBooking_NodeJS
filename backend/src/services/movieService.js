// backend/src/services/movieService.js
const prisma = require("../../prisma/prisma");

// Hàm trợ giúp phân tích mảng thể loại
const parseGenres = (genres) => {
  if (!genres) return [];
  if (typeof genres === "string") {
    try {
      return JSON.parse(genres).map((g) => ({
        id: typeof g === "object" ? g.id : Number(g),
      }));
    } catch (e) {
      return [];
    }
  }
  return genres.map((g) => ({ id: typeof g === "object" ? g.id : Number(g) }));
};

// Lấy tất cả phim với các điều kiện lọc
exports.getAllMovies = async (filter) => {
  const {
    title,
    genreId,
    releaseDate,
    director,
    page = 1,
    limit = 10,
    sortBy = "releaseDate",
    sortOrder = "desc",
  } = filter;

  // Tạo điều kiện lọc
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

  // Điều kiện lọc theo thể loại
  const genreFilter = genreId
    ? {
        some: {
          id: Number(genreId),
        },
      }
    : undefined;

  // Tính toán phân trang
  const skip = (Number(page) - 1) * Number(limit);

  // Lấy tổng số phim để phân trang
  const totalMovies = await prisma.movie.count({
    where: {
      ...filters,
      genres: genreFilter,
    },
  });

  // Tạo đối tượng sắp xếp
  const orderBy = {};
  orderBy[sortBy] = sortOrder.toLowerCase();

  // Lấy danh sách phim với phân trang và sắp xếp
  const movies = await prisma.movie.findMany({
    where: {
      ...filters,
      genres: genreFilter,
    },
    include: {
      genres: true,
      reviews: {
        select: {
          rating: true,
        },
      },
      showtimes: {
        select: {
          id: true,
        },
      },
    },
    skip,
    take: Number(limit),
    orderBy,
  });

  // Tính điểm đánh giá trung bình cho mỗi phim
  const moviesWithRating = movies.map((movie) => {
    const ratings = movie.reviews.map((review) => review.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    return {
      ...movie,
      avgRating: parseFloat(avgRating.toFixed(1)),
      reviewCount: ratings.length,
      showtimeCount: movie.showtimes.length,
      reviews: undefined, // Xóa thông tin chi tiết đánh giá
      showtimes: undefined, // Xóa thông tin chi tiết lịch chiếu
    };
  });

  return {
    data: moviesWithRating,
    pagination: {
      total: totalMovies,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(totalMovies / Number(limit)),
    },
  };
};

// Lấy thông tin chi tiết phim theo ID
exports.getMovieById = async (id) => {
  const movieId = Number(id);

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      genres: true,
      reviews: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 10,
      },
      showtimes: {
        include: {
          hall: {
            include: {
              cinema: true,
            },
          },
        },
        where: {
          startTime: {
            gte: new Date(),
          },
        },
        orderBy: {
          startTime: "asc",
        },
      },
    },
  });

  if (!movie) {
    return null;
  }

  // Tính điểm đánh giá trung bình
  const ratings = movie.reviews.map((review) => review.rating);
  const avgRating =
    ratings.length > 0
      ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
      : 0;

  // Định dạng dữ liệu trả về
  return {
    ...movie,
    avgRating: parseFloat(avgRating.toFixed(1)),
    reviewCount: ratings.length,
    // Nhóm lịch chiếu theo ngày và rạp
    showtimesByDate: Object.entries(
      movie.showtimes.reduce((acc, showtime) => {
        const date = showtime.startTime.toISOString().split("T")[0];
        if (!acc[date]) acc[date] = [];
        acc[date].push(showtime);
        return acc;
      }, {})
    ).map(([date, showtimes]) => ({
      date,
      showtimes: showtimes,
    })),
  };
};

// Lấy danh sách phim theo rạp chiếu
exports.getMoviesByCinema = async (cinemaId, date) => {
  const cinemaIdNum = Number(cinemaId);

  console.log(
    `getMoviesByCinema called with: cinemaId=${cinemaId}, date=${date}`
  );
  console.log(`Date type:`, typeof date);

  let dateFilter = {};
  if (date) {
    try {
      // Parse ngày từ chuỗi YYYY-MM-DD
      const [year, month, day] = date.split("-").map(Number);

      // Tạo đối tượng Date với năm, tháng (0-11), ngày
      // Đặt giờ là 00:00:00 cho startOfDay
      const startOfDay = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

      // Đặt giờ là 23:59:59 cho endOfDay
      const endOfDay = new Date(
        Date.UTC(year, month - 1, day, 23, 59, 59, 999)
      );

      console.log("Date range for filter:", {
        startOfDay,
        endOfDay,
      });

      dateFilter = {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        },
      };

      console.log("Using date filter:", JSON.stringify(dateFilter, null, 2));
    } catch (error) {
      console.error("Error parsing date:", error);
      return []; // Trả về mảng rỗng nếu có lỗi với định dạng ngày
    }
  } else {
    // Nếu không có ngày được chọn, lấy phim trong 14 ngày tới
    const now = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(now.getDate() + 14);

    dateFilter = {
      startTime: {
        gte: now,
        lt: twoWeeksLater,
      },
    };
  }

  try {
    const movies = await prisma.movie.findMany({
      where: {
        showtimes: {
          some: {
            hall: {
              cinemaId: cinemaIdNum,
            },
            ...dateFilter,
          },
        },
      },
      include: {
        genres: true,
        showtimes: {
          where: {
            hall: {
              cinemaId: cinemaIdNum,
            },
            ...dateFilter,
          },
          include: {
            hall: true,
          },
          orderBy: {
            startTime: "asc",
          },
        },
        reviews: {
          select: {
            rating: true,
          },
        },
      },
    });

    console.log(
      `Found ${movies.length} movies for cinema ${cinemaId} on date ${date}`
    );

    // Định dạng dữ liệu trả về
    return movies.map((movie) => {
      // Tính điểm đánh giá trung bình
      const ratings = movie.reviews.map((review) => review.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
          : 0;

      // Nhóm lịch chiếu theo phòng
      const showtimesByHall = movie.showtimes.reduce((acc, showtime) => {
        const hallId = showtime.hall.id;
        if (!acc[hallId]) {
          acc[hallId] = {
            hall: showtime.hall,
            times: [],
          };
        }
        acc[hallId].times.push({
          id: showtime.id,
          startTime: showtime.startTime,
          endTime: showtime.endTime,
        });
        return acc;
      }, {});

      return {
        id: movie.id,
        title: movie.title,
        poster: movie.poster,
        duration: movie.duration,
        genres: movie.genres,
        avgRating: parseFloat(avgRating.toFixed(1)),
        reviewCount: ratings.length,
        showtimes: Object.values(showtimesByHall),
      };
    });
  } catch (error) {
    console.error(`Error in getMoviesByCinema: ${error.message}`);
    throw error;
  }
};

// Các hàm khác giữ nguyên...
// Tạo phim mới
exports.createMovie = async (movieData) => {
  let {
    title,
    description,
    releaseDate,
    genres,
    poster,
    trailerUrl,
    duration,
    director,
    mainActors,
  } = movieData;

  // Phân tích mảng thể loại
  genres = parseGenres(genres);

  if (releaseDate) releaseDate = new Date(releaseDate);

  return await prisma.movie.create({
    data: {
      title,
      description,
      releaseDate,
      poster,
      trailerUrl,
      duration: Number(duration || 90),
      director: director || "",
      mainActors: mainActors || "",
      genres: {
        connect: genres,
      },
    },
    include: { genres: true },
  });
};

// Cập nhật thông tin phim
exports.updateMovie = async (id, movieData) => {
  const movieId = Number(id);
  let {
    title,
    description,
    releaseDate,
    genres,
    poster,
    trailerUrl,
    duration,
    director,
    mainActors,
  } = movieData;

  // Kiểm tra phim tồn tại
  const existingMovie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!existingMovie) {
    return null;
  }

  // Phân tích mảng thể loại
  genres = parseGenres(genres);

  if (releaseDate) releaseDate = new Date(releaseDate);

  // Cập nhật phim với các trường được cung cấp
  return await prisma.movie.update({
    where: { id: movieId },
    data: {
      ...(title && { title }),
      ...(description && { description }),
      ...(releaseDate && { releaseDate }),
      ...(poster && { poster }),
      ...(trailerUrl !== undefined && { trailerUrl }),
      ...(duration && { duration: Number(duration) }),
      ...(director !== undefined && { director }),
      ...(mainActors !== undefined && { mainActors }),
      ...(genres.length > 0 && {
        genres: {
          set: [],
          connect: genres,
        },
      }),
    },
    include: { genres: true },
  });
};

// Kiểm tra phim có lịch chiếu hay không
exports.checkMovieHasShowtimes = async (id) => {
  const movieId = Number(id);

  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
    include: {
      showtimes: {
        select: { id: true },
      },
    },
  });

  if (!movie) {
    return { exists: false };
  }

  return {
    exists: true,
    hasShowtimes: movie.showtimes.length > 0,
    showtimeCount: movie.showtimes.length,
  };
};

// Xóa phim
exports.deleteMovie = async (id) => {
  const movieId = Number(id);

  // Xóa các đánh giá liên quan
  await prisma.review.deleteMany({
    where: { movieId },
  });

  // Xóa phim
  return await prisma.movie.delete({
    where: { id: movieId },
  });
};

// Lấy danh sách phim sắp chiếu
exports.getUpcomingMovies = async () => {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  return await prisma.movie.findMany({
    where: {
      releaseDate: {
        gte: today,
        lt: nextMonth,
      },
    },
    include: {
      genres: true,
    },
    orderBy: {
      releaseDate: "asc",
    },
  });
};

// Lấy danh sách phim đang chiếu
exports.getNowShowingMovies = async () => {
  const now = new Date();

  const movies = await prisma.movie.findMany({
    where: {
      showtimes: {
        some: {
          startTime: {
            gte: now,
          },
        },
      },
      releaseDate: {
        lte: now,
      },
    },
    include: {
      genres: true,
      reviews: {
        select: {
          rating: true,
        },
      },
    },
    orderBy: {
      releaseDate: "desc",
    },
  });

  // Tính điểm đánh giá trung bình cho mỗi phim
  return movies.map((movie) => {
    const ratings = movie.reviews.map((review) => review.rating);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    return {
      ...movie,
      avgRating: parseFloat(avgRating.toFixed(1)),
      reviewCount: ratings.length,
      reviews: undefined, // Xóa thông tin chi tiết đánh giá
    };
  });
};
