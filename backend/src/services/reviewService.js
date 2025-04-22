// backend/src/services/reviewService.js
const prisma = require("../../prisma/prisma");

// Tạo đánh giá phim mới
const createReview = async (reviewData) => {
  // Kiểm tra xem người dùng có tồn tại không
  const user = await prisma.user.findUnique({
    where: { id: reviewData.userId },
  });

  if (!user) {
    throw new Error("Không tìm thấy người dùng");
  }

  // Kiểm tra xem phim có tồn tại không
  const movie = await prisma.movie.findUnique({
    where: { id: reviewData.movieId },
  });

  if (!movie) {
    throw new Error("Không tìm thấy phim");
  }

  // Kiểm tra xem người dùng đã đánh giá phim này chưa
  const existingReview = await prisma.review.findFirst({
    where: {
      userId: reviewData.userId,
      movieId: reviewData.movieId,
    },
  });

  if (existingReview) {
    throw new Error("Người dùng đã đánh giá phim này");
  }

  return await prisma.review.create({
    data: reviewData,
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

module.exports = {
  createReview,
  getAllReviews,
  getReviewById,
  getReviewsByMovie,
  getReviewsByUser,
  updateReview,
  deleteReview,
  getReviewStatsByMovie,
};
