import axiosInstance from "./axiosInstance";
import { notification } from "antd";

const reviewApi = {
  // Lấy tất cả đánh giá (có thể lọc theo phim)
  getAllReviews: async (page = 1, limit = 10, movieId = null) => {
    try {
      const params = { page, limit };
      if (movieId) params.movieId = movieId;

      const response = await axiosInstance.get("/reviews", { params });
      return response.data;
    } catch (error) {
      console.error("API Error - getAllReviews:", error);
      throw error;
    }
  },

  // Lấy chi tiết một đánh giá theo ID
  getReviewById: async (reviewId) => {
    try {
      const response = await axiosInstance.get(`/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error("API Error - getReviewById:", error);
      throw error;
    }
  },

  // Lấy danh sách đánh giá theo phim
  getReviewsByMovie: async (movieId, page = 1, limit = 10) => {
    try {
      const response = await axiosInstance.get(`/reviews/movie/${movieId}`, {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("API Error - getReviewsByMovie:", error);
      notification.error({
        message: "Lỗi",
        description:
          error.response?.data?.message || "Không thể lấy danh sách đánh giá",
      });
      throw error;
    }
  },

  // Lấy đánh giá của người dùng
  getReviewsByUser: async (userId) => {
    try {
      // Kiểm tra token trước khi gửi request
      const token = localStorage.getItem("token");
      if (!token) {
        notification.warning({
          message: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để xem đánh giá",
        });
        return [];
      }

      const response = await axiosInstance.get(`/reviews/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("API Error - getReviewsByUser:", error);

      if (error.response?.status === 403) {
        notification.error({
          message: "Lỗi quyền truy cập",
          description: "Bạn không có quyền xem đánh giá của người dùng này",
        });
      } else if (error.response?.status === 404) {
        notification.error({
          message: "Không tìm thấy",
          description: "Không tìm thấy người dùng",
        });
      } else {
        notification.error({
          message: "Lỗi",
          description:
            error.response?.data?.message || "Không thể lấy danh sách đánh giá",
        });
      }

      return [];
    }
  },

  // Lấy đánh giá của người dùng hiện tại
  getMyReviews: async () => {
    try {
      const token = sessionStorage.getItem("token"); // Sử dụng sessionStorage
      if (!token) {
        notification.warning({
          message: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để xem đánh giá của bạn",
        });
        return [];
      }

      const userData = JSON.parse(sessionStorage.getItem("user"));
      if (!userData?.id) {
        notification.warning({
          message: "Không có thông tin người dùng",
          description: "Vui lòng đăng nhập lại",
        });
        return [];
      }

      const reviews = await reviewApi.getReviewsByUser(userData.id);
      // Lưu tạm vào localStorage với tiền tố userId nếu cần
      localStorage.setItem(`myReviews_${userData.id}`, JSON.stringify(reviews));
      return reviews;
    } catch (error) {
      console.error("API Error - getMyReviews:", error);
      return [];
    }
  },

  // Lấy thống kê đánh giá theo phim
  getReviewStatsByMovie: async (movieId) => {
    try {
      const response = await axiosInstance.get(
        `/reviews/stats/movie/${movieId}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error - getReviewStatsByMovie:", error);

      if (error.response?.status === 404) {
        notification.error({
          message: "Không tìm thấy",
          description: "Không tìm thấy phim",
        });
      }

      throw error;
    }
  },

  // Kiểm tra quyền đánh giá phim
  checkReviewEligibility: async (movieId) => {
    try {
      // Kiểm tra token trước khi gửi request
      const token = localStorage.getItem("token");
      if (!token) {
        return { canReview: false, hasTicket: false, hasReviewed: false };
      }

      const response = await axiosInstance.get(
        `/reviews/check-eligibility/${movieId}`
      );
      return response.data;
    } catch (error) {
      console.error("API Error - checkReviewEligibility:", error);
      return {
        canReview: false,
        hasTicket: false,
        hasReviewed: false,
        error:
          error.response?.data?.message || "Không thể kiểm tra quyền đánh giá",
      };
    }
  },

  // Tạo đánh giá mới
  createReview: async (reviewData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Chưa đăng nhập");
      }

      const response = await axiosInstance.post("/reviews", reviewData);
      return response.data;
    } catch (error) {
      console.error("API Error - createReview:", error);
      throw error;
    }
  },

  // Cập nhật đánh giá
  updateReview: async (reviewId, reviewData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Chưa đăng nhập");
      }

      const response = await axiosInstance.put(
        `/reviews/${reviewId}`,
        reviewData
      );
      return response.data;
    } catch (error) {
      console.error("API Error - updateReview:", error);
      throw error;
    }
  },

  // Xóa đánh giá
  deleteReview: async (reviewId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        notification.warning({
          message: "Chưa đăng nhập",
          description: "Vui lòng đăng nhập để xóa đánh giá",
        });
        throw new Error("Chưa đăng nhập");
      }

      const response = await axiosInstance.delete(`/reviews/${reviewId}`);
      notification.success({
        message: "Thành công",
        description: "Đã xóa đánh giá",
      });
      return response.data;
    } catch (error) {
      console.error("API Error - deleteReview:", error);

      if (error.response?.status === 403) {
        notification.error({
          message: "Không có quyền",
          description: "Bạn không có quyền xóa đánh giá này",
        });
      } else if (error.response?.status === 404) {
        notification.error({
          message: "Không tìm thấy",
          description: "Không tìm thấy đánh giá",
        });
      } else {
        notification.error({
          message: "Lỗi",
          description:
            error.response?.data?.message || "Không thể xóa đánh giá",
        });
      }

      throw error;
    }
  },
};

export default reviewApi;
