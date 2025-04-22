// backend/src/controllers/reviewController.js
const reviewService = require('../services/reviewService');

// Tạo đánh giá phim mới
const createReview = async (req, res) => {
  try {
    const { userId, movieId, rating, comment, isAnonymous } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!userId || !movieId || !rating) {
      return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    }

    // Chỉ cho phép người dùng đánh giá với tài khoản của họ hoặc admin
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    // Kiểm tra xếp hạng hợp lệ (1-5)
    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Xếp hạng phải từ 1 đến 5' });
    }

    const newReview = await reviewService.createReview({
      userId,
      movieId,
      rating,
      comment,
      isAnonymous: isAnonymous || false
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error('Lỗi khi tạo đánh giá:', error);
    if (error.message === 'Người dùng đã đánh giá phim này') {
      return res.status(400).json({ message: error.message });
    }
    if (error.message === 'Không tìm thấy người dùng' || error.message === 'Không tìm thấy phim') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy tất cả đánh giá
const getAllReviews = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const movieId = req.query.movieId ? parseInt(req.query.movieId) : undefined;
    
    const reviews = await reviewService.getAllReviews(page, limit, movieId);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đánh giá:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy đánh giá theo ID
const getReviewById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const review = await reviewService.getReviewById(id);
    
    if (!review) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    res.status(200).json(review);
  } catch (error) {
    console.error('Lỗi khi lấy thông tin đánh giá:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy đánh giá theo phim
const getReviewsByMovie = async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    const reviews = await reviewService.getReviewsByMovie(movieId, page, limit);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá theo phim:', error);
    if (error.message === 'Không tìm thấy phim') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy đánh giá theo người dùng
const getReviewsByUser = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Chỉ cho phép người dùng xem đánh giá của họ hoặc admin
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    const reviews = await reviewService.getReviewsByUser(userId);
    res.status(200).json(reviews);
  } catch (error) {
    console.error('Lỗi khi lấy đánh giá theo người dùng:', error);
    if (error.message === 'Không tìm thấy người dùng') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Cập nhật đánh giá
const updateReview = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { rating, comment, isAnonymous } = req.body;

    // Lấy thông tin đánh giá hiện tại
    const existingReview = await reviewService.getReviewById(id);
    
    if (!existingReview) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    // Chỉ cho phép người dùng cập nhật đánh giá của họ hoặc admin
    if (req.user.role !== 'ADMIN' && req.user.id !== existingReview.userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }

    const updateData = {};
    
    // Chỉ cập nhật những trường được cung cấp
    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'Xếp hạng phải từ 1 đến 5' });
      }
      updateData.rating = rating;
    }
    
    if (comment !== undefined) updateData.comment = comment;
    if (isAnonymous !== undefined) updateData.isAnonymous = isAnonymous;

    const updatedReview = await reviewService.updateReview(id, updateData);
    res.status(200).json(updatedReview);
  } catch (error) {
    console.error('Lỗi khi cập nhật đánh giá:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Xóa đánh giá
const deleteReview = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Lấy thông tin đánh giá hiện tại
    const existingReview = await reviewService.getReviewById(id);
    
    if (!existingReview) {
      return res.status(404).json({ message: 'Không tìm thấy đánh giá' });
    }
    
    // Chỉ cho phép người dùng xóa đánh giá của họ hoặc admin
    if (req.user.role !== 'ADMIN' && req.user.id !== existingReview.userId) {
      return res.status(403).json({ message: 'Không có quyền truy cập' });
    }
    
    await reviewService.deleteReview(id);
    res.status(200).json({ message: 'Xóa đánh giá thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa đánh giá:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

// Lấy thống kê đánh giá theo phim
const getReviewStatsByMovie = async (req, res) => {
  try {
    const movieId = parseInt(req.params.movieId);
    const stats = await reviewService.getReviewStatsByMovie(movieId);
    res.status(200).json(stats);
  } catch (error) {
    console.error('Lỗi khi lấy thống kê đánh giá:', error);
    if (error.message === 'Không tìm thấy phim') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
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
  getReviewStatsByMovie
};