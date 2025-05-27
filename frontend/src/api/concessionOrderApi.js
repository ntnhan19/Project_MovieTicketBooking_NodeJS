// frontend/src/api/concessionOrderApi.js
import axiosInstance from "./axiosInstance";

export const concessionOrderApi = {
  // Lấy danh sách đơn hàng của người dùng đang đăng nhập
  getUserOrders: async (options = {}) => {
    try {
      const { status, page = 1, limit = 10 } = options;
      const params = { page, limit };

      if (status) {
        params.status = status;
      }

      const response = await axiosInstance.get("/concession/orders/my-orders", {
        params,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách đơn hàng:", error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết một đơn hàng theo ID
  getUserOrderById: async (orderId) => {
    try {
      const response = await axiosInstance.get(
        `/concession/orders/my-orders/${orderId}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin đơn hàng ${orderId}:`, error);
      throw error;
    }
  },

  // Tạo đơn hàng đồ ăn mới (không kèm vé)
  createOrder: async (orderData) => {
    try {
      const response = await axiosInstance.post(
        "/concession/orders",
        orderData
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng:", error);
      throw error;
    }
  },

  // Tạo đơn hàng đồ ăn kèm theo vé
  createOrderWithTickets: async (orderData) => {
    try {
      const response = await axiosInstance.post(
        "/concession/orders/with-tickets",
        orderData
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo đơn hàng kèm vé:", error);
      throw error;
    }
  },

  // Hủy đơn hàng
  cancelOrder: async (orderId) => {
    try {
      const response = await axiosInstance.patch(
        `/concession/orders/${orderId}/cancel`
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi hủy đơn hàng ${orderId}:`, error);
      throw error;
    }
  },

  // Kiểm tra trạng thái đơn hàng
  checkOrderStatus: async (orderId) => {
    try {
      const response = await axiosInstance.get(
        `/concession/orders/my-orders/${orderId}`
      );
      return {
        status: response.data.data.status,
        message: getStatusMessage(response.data.data.status),
      };
    } catch (error) {
      console.error(`Lỗi khi kiểm tra trạng thái đơn hàng ${orderId}:`, error);
      throw error;
    }
  },

  updateOrder: async (orderId, updateData) => {
    try {
      const response = await axiosInstance.patch(
        `/concession/orders/${orderId}`,
        updateData
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật đơn hàng ${orderId}:`, error);
      throw error;
    }
  },
};

// Hàm trợ giúp để chuyển đổi trạng thái đơn hàng sang thông báo tiếng Việt
function getStatusMessage(status) {
  const statusMessages = {
    PENDING: "Đang chờ xác nhận",
    CONFIRMED: "Đã xác nhận",
    PREPARING: "Đang chuẩn bị",
    READY: "Sẵn sàng để lấy",
    COMPLETED: "Đã hoàn thành",
    CANCELLED: "Đã hủy",
  };

  return statusMessages[status] || "Không xác định";
}
