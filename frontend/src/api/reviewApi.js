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
      const token = sessionStorage.getItem("token");
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
      const token = sessionStorage.getItem("token");
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
      sessionStorage.setItem(`myReviews_${userData.id}`, JSON.stringify(reviews));
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

  // Kiểm tra quyền đánh giá phim - Version cải tiến
  checkReviewEligibilityDebug: async (movieId) => {
    try {
      console.log("=== FRONTEND: Checking eligibility ===");
      console.log("MovieId:", movieId);

      // Kiểm tra token
      const token = sessionStorage.getItem("token");
      console.log("Token exists:", !!token);

      if (!token) {
        console.log("No token found");
        return {
          canReview: false,
          hasTicket: false,
          hasReviewed: false,
          error: "No authentication token",
        };
      }

      // Kiểm tra user info
      const userStr = sessionStorage.getItem("user");
      const user = userStr ? JSON.parse(userStr) : null;
      console.log("User info:", user ? { id: user.id, name: user.name } : null);

      if (!user?.id) {
        console.log("No user info found");
        return {
          canReview: false,
          hasTicket: false,
          hasReviewed: false,
          error: "No user information",
        };
      }

      console.log("Making API call to check eligibility...");

      const response = await axiosInstance.get(
        `/reviews/check-eligibility/${movieId}`
      );

      console.log("API Response:", response.data);
      console.log("Response status:", response.status);

      const result = {
        // ✅ Sửa lại logic kiểm tra canReview
        canReview: !!response.data.canReview, // Kiểm tra truthy thay vì === true
        // Hoặc có thể dùng: canReview: response.data.canReview ? true : false,

        hasTicket: response.data.hasTicket === true,
        hasReviewed: response.data.hasReviewed === true,
        message: response.data.message || "",
        userExists: response.data.userExists,
        movieExists: response.data.movieExists,

        // ✅ Thêm thông tin chi tiết từ API nếu cần
        movieInfo: response.data.canReview || null,
      };

      console.log("Processed result:", result);
      console.log("=====================================");

      return result;
    } catch (error) {
      console.error("=== FRONTEND ERROR ===");
      console.error("Error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("=====================");

      // Xử lý các loại lỗi khác nhau
      if (error.response?.status === 401) {
        console.log("Unauthorized - clearing tokens");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");

        notification.warning({
          message: "Phiên đăng nhập hết hạn",
          description: "Vui lòng đăng nhập lại",
        });
      } else if (error.response?.status === 404) {
        notification.error({
          message: "Không tìm thấy",
          description: "Không tìm thấy thông tin phim",
        });
      } else {
        notification.error({
          message: "Lỗi kiểm tra quyền đánh giá",
          description:
            error.response?.data?.message ||
            "Không thể kiểm tra quyền đánh giá",
        });
      }

      return {
        canReview: false,
        hasTicket: false,
        hasReviewed: false,
        error: error.response?.data?.message || error.message,
      };
    }
  },

  // Giữ lại function cũ để tương thích
  checkReviewEligibility: async (movieId) => {
    return await reviewApi.checkReviewEligibilityDebug(movieId);
  },

  // Thêm function debug riêng
  debugEligibility: async (movieId) => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) {
        return { error: "No token" };
      }

      const response = await axiosInstance.get(
        `/reviews/debug-eligibility/${movieId}`
      );
      return response.data;
    } catch (error) {
      console.error("Debug eligibility error:", error);
      return { error: error.message };
    }
  },

  // Thêm function kiểm tra trạng thái user và token
  checkAuthStatus: () => {
    const token = sessionStorage.getItem("token");
    const userStr = sessionStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;

    console.log("=== AUTH STATUS CHECK ===");
    console.log("Token exists:", !!token);
    console.log(
      "Token preview:",
      token ? token.substring(0, 20) + "..." : null
    );
    console.log("User exists:", !!user);
    console.log(
      "User info:",
      user ? { id: user.id, name: user.name, email: user.email } : null
    );
    console.log("========================");

    return {
      hasToken: !!token,
      hasUser: !!user,
      userId: user?.id,
      userName: user?.name,
      userEmail: user?.email,
    };
  },

  // Tạo đánh giá mới
  createReview: async (reviewData) => {
    try {
      const token = sessionStorage.getItem("token");
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
      const token = sessionStorage.getItem("token");
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
      const token = sessionStorage.getItem("token");
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
