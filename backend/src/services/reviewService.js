// backend/src/services/reviewService.js
const prisma = require("../../prisma/prisma");

// Tạo đánh giá phim mới
const createReview = async (reviewData) => {
  const { userId, movieId, rating, comment, isAnonymous } = reviewData;
  
  console.log("Service processing - userId:", userId, "movieId:", movieId, "Full data:", reviewData);
  
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
  const ticket = await prisma.ticket.findFirst({
    where: {
      userId: userId,
      showtime: {
        movieId: movieId,
      },
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
      payment: {
        status: "COMPLETED",
      },
    },
  });

  return ticket !== null;
};

// Kiểm tra người dùng đã đánh giá phim chưa
const checkUserHasReviewed = async (userId, movieId) => {
  const review = await prisma.review.findFirst({
    where: {
      userId: userId,
      movieId: movieId,
    },
  });

  return review !== null;
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
};
