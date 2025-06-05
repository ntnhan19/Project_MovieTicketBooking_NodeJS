// backend/src/services/reviewService.js
const prisma = require("../../prisma/prisma");

// Tạo đánh giá phim mới
const createReview = async (reviewData) => {
  const { userId, movieId, rating, comment, isAnonymous } = reviewData;

  console.log(
    "Service processing - userId:",
    userId,
    "movieId:",
    movieId,
    "Full data:",
    reviewData
  );

  if (!userId) {
    throw new Error("Không có thông tin userId");
  }

  // Check user tồn tại
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  // Check movie tồn tại
  const movie = await prisma.movie.findUnique({
    where: { id: parseInt(movieId) }, // Đảm bảo parse thành số nguyên
  });
  if (!movie) {
    throw new Error("Không tìm thấy phim");
  }

  // Check user đã review chưa
  const existingReview = await prisma.review.findFirst({
    where: {
      userId,
      movieId,
    },
  });
  if (existingReview) {
    throw new Error("Người dùng đã đánh giá phim này");
  }

  // Tạo review mới
  const newReview = await prisma.review.create({
    data: {
      userId,
      movieId,
      rating,
      comment: comment || null, // nếu comment rỗng thì set null
      isAnonymous: isAnonymous || false, // default false
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
    },
  });

  return newReview;
};

// Lấy tất cả đánh giá với phân trang
const getAllReviews = async (page = 1, limit = 10, movieId = undefined) => {
  const skip = (page - 1) * limit;

  const whereClause = {};
  if (movieId !== undefined) {
    whereClause.movieId = movieId;
  }

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: whereClause,
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
        movie: {
          select: {
            id: true,
            title: true,
            poster: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.review.count({ where: whereClause }),
  ]);

  // Xử lý ẩn danh
  const formattedReviews = reviews.map((review) => {
    if (review.isAnonymous) {
      review.user = {
        id: null,
        name: "Người dùng ẩn danh",
        avatar: null,
      };
    }
    return review;
  });

  return {
    data: formattedReviews,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy đánh giá theo ID
const getReviewById = async (id) => {
  const review = await prisma.review.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      movie: {
        select: {
          id: true,
          title: true,
          poster: true,
        },
      },
    },
  });

  if (review && review.isAnonymous) {
    review.user = {
      id: null,
      name: "Người dùng ẩn danh",
      avatar: null,
    };
  }

  return review;
};

// Lấy đánh giá theo phim
const getReviewsByMovie = async (movieId, page = 1, limit = 10) => {
  // Kiểm tra xem phim có tồn tại không
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) {
    throw new Error("Không tìm thấy phim");
  }

  const skip = (page - 1) * limit;

  const [reviews, total] = await prisma.$transaction([
    prisma.review.findMany({
      where: { movieId },
      skip,
      take: limit,
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
    }),
    prisma.review.count({ where: { movieId } }),
  ]);

  // Xử lý ẩn danh
  const formattedReviews = reviews.map((review) => {
    if (review.isAnonymous) {
      review.user = {
        id: null,
        name: "Người dùng ẩn danh",
        avatar: null,
      };
    }
    return review;
  });

  return {
    data: formattedReviews,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// Lấy đánh giá theo người dùng
const getReviewsByUser = async (userId) => {
  // Kiểm tra xem người dùng có tồn tại không
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  return await prisma.review.findMany({
    where: { userId },
    include: {
      movie: {
        select: {
          id: true,
          title: true,
          poster: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

// Cập nhật đánh giá
const updateReview = async (id, updateData) => {
  return await prisma.review.update({
    where: { id },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          avatar: true,
        },
      },
      movie: {
        select: {
          id: true,
          title: true,
          poster: true,
        },
      },
    },
  });
};

// Xóa đánh giá
const deleteReview = async (id) => {
  return await prisma.review.delete({
    where: { id },
  });
};

// Lấy thống kê đánh giá theo phim
const getReviewStatsByMovie = async (movieId) => {
  // Kiểm tra xem phim có tồn tại không
  const movie = await prisma.movie.findUnique({
    where: { id: movieId },
  });

  if (!movie) {
    throw new Error("Không tìm thấy phim");
  }

  // Lấy tất cả đánh giá cho phim
  const reviews = await prisma.review.findMany({
    where: { movieId },
  });

  // Nếu không có đánh giá
  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingDistribution: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
      },
    };
  }

  // Tính toán phân phối đánh giá
  const ratingDistribution = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  // Tính tổng điểm và phân phối
  let totalRating = 0;
  reviews.forEach((review) => {
    totalRating += review.rating;
    ratingDistribution[review.rating]++;
  });

  // Tính điểm trung bình
  const averageRating = totalRating / reviews.length;

  return {
    totalReviews: reviews.length,
    averageRating: parseFloat(averageRating.toFixed(1)),
    ratingDistribution,
  };
};

const checkUserHasTicket = async (userId, movieId) => {
  try {
    console.log("=== CHECKING USER TICKET ===");
    console.log(
      "Input - userId:",
      userId,
      "movieId:",
      movieId,
      "movieId type:",
      typeof movieId
    );

    // Đảm bảo movieId là số nguyên
    const parsedMovieId = parseInt(movieId);
    const parsedUserId = parseInt(userId);

    console.log("Parsed - userId:", parsedUserId, "movieId:", parsedMovieId);

    // Debug: Kiểm tra tất cả vé của user
    const allUserTickets = await prisma.ticket.findMany({
      where: {
        userId: parsedUserId,
      },
      include: {
        payment: true,
        showtime: {
          include: {
            movie: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    });

    console.log("All user tickets count:", allUserTickets.length);
    allUserTickets.forEach((ticket, index) => {
      console.log(`Ticket ${index + 1}:`, {
        ticketId: ticket.id,
        ticketStatus: ticket.status,
        movieId: ticket.showtime?.movieId,
        movieTitle: ticket.showtime?.movie?.title,
        paymentId: ticket.payment?.id,
        paymentStatus: ticket.payment?.status,
        paymentAmount: ticket.payment?.totalAmount,
        createdAt: ticket.createdAt,
      });
    });

    // Kiểm tra vé cho phim cụ thể với các điều kiện khác nhau
    console.log("--- Checking specific movie tickets ---");

    // Cách 1: Kiểm tra với điều kiện cơ bản
    const basicTickets = await prisma.ticket.findMany({
      where: {
        userId: parsedUserId,
        showtime: {
          movieId: parsedMovieId,
        },
      },
      include: {
        payment: true,
        showtime: {
          include: {
            movie: true,
          },
        },
      },
    });

    console.log("Basic tickets for movie:", basicTickets.length);

    // Cách 2: Kiểm tra với điều kiện payment hoàn thành
    const paidTickets = await prisma.ticket.findMany({
      where: {
        userId: parsedUserId,
        showtime: {
          movieId: parsedMovieId,
        },
        payment: {
          status: "COMPLETED",
        },
      },
      include: {
        payment: true,
        showtime: {
          include: {
            movie: true,
          },
        },
      },
    });

    console.log("Paid tickets for movie:", paidTickets.length);

    // Cách 3: Kiểm tra vé hợp lệ (không bị hủy và đã thanh toán)
    const validTickets = await prisma.ticket.findMany({
      where: {
        userId: parsedUserId,
        showtime: {
          movieId: parsedMovieId,
        },
        status: {
          not: "CANCELLED", // Không bị hủy
        },
        payment: {
          status: "COMPLETED",
        },
      },
      include: {
        payment: true,
        showtime: {
          include: {
            movie: true,
          },
        },
      },
    });

    console.log("Valid tickets for movie:", validTickets.length);

    validTickets.forEach((ticket, index) => {
      console.log(`Valid Ticket ${index + 1}:`, {
        ticketId: ticket.id,
        ticketStatus: ticket.status,
        seatNumber: ticket.seatNumber,
        paymentStatus: ticket.payment?.status,
        paymentAmount: ticket.payment?.totalAmount,
        showtimeId: ticket.showtimeId,
        movieId: ticket.showtime?.movieId,
        movieTitle: ticket.showtime?.movie?.title,
      });
    });

    const hasValidTicket = validTickets.length > 0;

    console.log("=== FINAL TICKET CHECK RESULT ===");
    console.log("Has valid ticket:", hasValidTicket);
    console.log("================================");

    return hasValidTicket;
  } catch (error) {
    console.error("Error in checkUserHasTicket:", error);
    return false;
  }
};

// Kiểm tra người dùng đã đánh giá phim chưa
// Kiểm tra người dùng đã đánh giá phim chưa
const checkUserHasReviewed = async (userId, movieId) => {
  try {
    console.log("=== CHECKING USER REVIEW ===");
    console.log("Input - userId:", userId, "movieId:", movieId);

    const parsedUserId = parseInt(userId);
    const parsedMovieId = parseInt(movieId);

    console.log("Parsed - userId:", parsedUserId, "movieId:", parsedMovieId);

    const existingReview = await prisma.review.findFirst({
      where: {
        userId: parsedUserId,
        movieId: parsedMovieId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    console.log(
      "Existing review found:",
      existingReview
        ? {
            reviewId: existingReview.id,
            rating: existingReview.rating,
            comment: existingReview.comment,
            createdAt: existingReview.createdAt,
            userName: existingReview.user?.name,
          }
        : null
    );

    const hasReviewed = existingReview !== null;

    console.log("=== REVIEW CHECK RESULT ===");
    console.log("Has reviewed:", hasReviewed);
    console.log("===========================");

    return hasReviewed;
  } catch (error) {
    console.error("Error in checkUserHasReviewed:", error);
    return false;
  }
};

const debugUserTickets = async (userId, movieId) => {
  try {
    console.log("=== DEBUG USER TICKETS ===");
    console.log("userId:", userId, "movieId:", movieId);

    // Kiểm tra tất cả vé của user
    const allUserTickets = await prisma.ticket.findMany({
      where: {
        userId: userId,
      },
      include: {
        payment: true,
        showtime: {
          include: {
            movie: true,
          },
        },
      },
    });

    console.log("All user tickets:", allUserTickets.length);
    allUserTickets.forEach((ticket, index) => {
      console.log(`Ticket ${index + 1}:`, {
        id: ticket.id,
        status: ticket.status,
        movieId: ticket.showtime?.movieId,
        movieTitle: ticket.showtime?.movie?.title,
        paymentStatus: ticket.payment?.status,
      });
    });

    // Kiểm tra vé cho phim cụ thể
    const movieTickets = await prisma.ticket.findMany({
      where: {
        userId: userId,
        showtime: {
          movieId: parseInt(movieId),
        },
      },
      include: {
        payment: true,
        showtime: {
          include: {
            movie: true,
          },
        },
      },
    });

    console.log("Movie specific tickets:", movieTickets.length);
    movieTickets.forEach((ticket, index) => {
      console.log(`Movie Ticket ${index + 1}:`, {
        id: ticket.id,
        status: ticket.status,
        paymentStatus: ticket.payment?.status,
        paymentId: ticket.payment?.id,
      });
    });

    console.log("=== END DEBUG ===");

    return movieTickets;
  } catch (error) {
    console.error("Debug error:", error);
    return [];
  }
};

const debugUserEligibility = async (userId, movieId) => {
  try {
    console.log("=== COMPREHENSIVE DEBUG FOR USER ELIGIBILITY ===");
    console.log("userId:", userId, "movieId:", movieId);
    console.log("Time:", new Date().toISOString());

    const parsedUserId = parseInt(userId);
    const parsedMovieId = parseInt(movieId);

    // 1. Kiểm tra user tồn tại
    const user = await prisma.user.findUnique({
      where: { id: parsedUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    console.log(
      "1. User exists:",
      user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          }
        : null
    );

    // 2. Kiểm tra movie tồn tại
    const movie = await prisma.movie.findUnique({
      where: { id: parsedMovieId },
      select: {
        id: true,
        title: true,
        releaseDate: true,
      },
    });

    console.log(
      "2. Movie exists:",
      movie
        ? {
            id: movie.id,
            title: movie.title,
            releaseDate: movie.releaseDate,
          }
        : null
    );

    // 3. Kiểm tra vé chi tiết
    const hasTicket = await checkUserHasTicket(parsedUserId, parsedMovieId);

    // 4. Kiểm tra review
    const hasReviewed = await checkUserHasReviewed(parsedUserId, parsedMovieId);

    // 5. Kết quả cuối cùng
    const canReview = hasTicket && !hasReviewed && user && movie;

    console.log("=== FINAL ELIGIBILITY SUMMARY ===");
    console.log("User exists:", !!user);
    console.log("Movie exists:", !!movie);
    console.log("Has ticket:", hasTicket);
    console.log("Has reviewed:", hasReviewed);
    console.log("Can review:", canReview);
    console.log("================================");

    return {
      userExists: !!user,
      movieExists: !!movie,
      hasTicket,
      hasReviewed,
      canReview,
    };
  } catch (error) {
    console.error("Error in debugUserEligibility:", error);
    return {
      userExists: false,
      movieExists: false,
      hasTicket: false,
      hasReviewed: false,
      canReview: false,
      error: error.message,
    };
  }
};

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByMovie,
  getReviewsByUser,
  updateReview,
  deleteReview,
  getReviewStatsByMovie,
  checkUserHasTicket,
  checkUserHasReviewed,
  debugUserTickets,
  debugUserEligibility 
};
