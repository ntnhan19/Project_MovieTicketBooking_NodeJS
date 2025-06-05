// frontend/src/api/ticketApi.js
import axiosInstance from "./axiosInstance";

export const ticketApi = {
  // Tạo vé mới
  createTicket: async (ticketData) => {
    try {
      const payload = {
        userId:
          parseInt(ticketData.userId) ||
          parseInt(sessionStorage.getItem("userId")),
        showtimeId: parseInt(ticketData.showtimeId),
        seats: Array.isArray(ticketData.seats)
          ? ticketData.seats.map((seatId) =>
              typeof seatId === "number" ? seatId : parseInt(seatId)
            )
          : [],
        promotionId: ticketData.promotionId
          ? parseInt(ticketData.promotionId)
          : null,
        // Cập nhật để hỗ trợ concessionOrders từ backend
        concessionOrders: ticketData.concessionOrders || [],
      };

      if (
        !payload.userId ||
        !payload.showtimeId ||
        payload.seats.length === 0
      ) {
        throw new Error(
          "Thiếu thông tin bắt buộc: userId, showtimeId hoặc seats"
        );
      }

      console.log("Payload được gửi đến API:", payload);

      const response = await axiosInstance.post("/tickets", payload);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo vé:", error);
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message ||
            "Không thể tạo vé: Ghế không khả dụng hoặc dữ liệu không hợp lệ"
        );
      } else if (error.response?.status === 409) {
        throw new Error(
          error.response.data.message || "Ghế đã được đặt bởi người dùng khác"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi tạo vé. Vui lòng thử lại sau.");
      }
      throw new Error("Không thể tạo vé. Vui lòng kiểm tra lại.");
    }
  },

  // Lấy thông tin vé theo ID
  getTicketById: async (ticketId) => {
    try {
      const response = await axiosInstance.get(
        `/tickets/${parseInt(ticketId)}?include=concessionOrders,qr`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vé:", error);
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy vé");
      } else if (error.response?.status === 403) {
        throw new Error("Truy cập bị từ chối: Bạn không có quyền xem vé này");
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi lấy thông tin vé");
      }
      throw new Error("Không thể lấy thông tin vé. Vui lòng thử lại.");
    }
  },

  getTicketWithFullDetails: async (ticketId) => {
    try {
      const response = await axiosInstance.get(
        `/tickets/${parseInt(ticketId)}/full-details`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin chi tiết vé:", error);
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy vé");
      } else if (error.response?.status === 403) {
        throw new Error("Truy cập bị từ chối: Bạn không có quyền xem vé này");
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi lấy thông tin chi tiết vé");
      }
      throw new Error("Không thể lấy thông tin chi tiết vé. Vui lòng thử lại.");
    }
  },

  // Lấy vé theo seatId và userId
  getTicketBySeatId: async (seatId, userId, status = "PENDING") => {
    try {
      const response = await axiosInstance.get(
        `/tickets/seat/${parseInt(seatId)}`,
        {
          params: { userId: parseInt(userId), status },
        }
      );
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy vé cho ghế ${seatId}:`, error);
      if (error.response?.status === 404) {
        return null; // Không tìm thấy vé, trả về null thay vì ném lỗi
      } else if (error.response?.status === 403) {
        throw new Error("Truy cập bị từ chối: Bạn không có quyền xem vé này");
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi lấy thông tin vé.");
      }
      throw new Error(`Không thể lấy vé cho ghế ${seatId}. Vui lòng thử lại.`);
    }
  },

  // Lấy danh sách vé của người dùng đang đăng nhập
  getMyTickets: async (filter = {}) => {
    try {
      const userId = parseInt(sessionStorage.getItem("userId"));
      if (!userId) {
        throw new Error("Không tìm thấy userId trong sessionStorage");
      }

      // Thêm hỗ trợ filter
      const params = new URLSearchParams();
      if (filter.status) params.append("status", filter.status);
      if (filter.fromDate) params.append("fromDate", filter.fromDate);
      if (filter.toDate) params.append("toDate", filter.toDate);

      const queryString = params.toString();
      const url = `/tickets/user/${userId}${
        queryString ? `?${queryString}` : ""
      }`;

      const response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vé:", error);
      if (error.response?.status === 403) {
        throw new Error("Truy cập bị từ chối: Bạn không có quyền xem vé này");
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi lấy danh sách vé");
      }
      throw new Error("Không thể lấy danh sách vé. Vui lòng thử lại.");
    }
  },

  // Lấy danh sách vé theo ID của payment
  getTicketsByPaymentId: async (paymentId) => {
    try {
      const response = await axiosInstance.get(
        `/tickets/payment/${parseInt(paymentId)}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vé theo mã thanh toán:", error);
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy vé cho mã thanh toán này");
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi lấy danh sách vé");
      }
      throw new Error("Không thể lấy danh sách vé. Vui lòng thử lại.");
    }
  },

  // Cập nhật ID thanh toán cho nhiều vé
  updateTicketsPayment: async (ticketIds, paymentId) => {
    try {
      if (!Array.isArray(ticketIds) || !ticketIds.length || !paymentId) {
        throw new Error("Thiếu ticketIds hoặc paymentId");
      }
      const response = await axiosInstance.put(`/tickets/update-payment`, {
        ticketIds: ticketIds.map((id) => parseInt(id)),
        paymentId: parseInt(paymentId),
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật mã thanh toán cho vé:", error);
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message ||
            "Dữ liệu không hợp lệ khi cập nhật mã thanh toán"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi cập nhật mã thanh toán");
      }
      throw new Error("Không thể cập nhật mã thanh toán. Vui lòng thử lại.");
    }
  },

  // Hủy vé
  cancelTicket: async (ticketId) => {
    try {
      const response = await axiosInstance.put(
        `/tickets/${parseInt(ticketId)}/status`,
        {
          status: "CANCELLED",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi hủy vé:", error);
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Dữ liệu không hợp lệ khi hủy vé."
        );
      } else if (error.response?.status === 404) {
        throw new Error("Không tìm thấy vé để hủy.");
      } else if (error.response?.status === 403) {
        throw new Error("Truy cập bị từ chối: Bạn không có quyền hủy vé này");
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi hủy vé.");
      }
      throw new Error("Không thể hủy vé. Vui lòng thử lại.");
    }
  },

  // Cập nhật trạng thái nhiều vé cùng lúc
  updateTicketsStatus: async (ticketIds, status) => {
    const validStatuses = ["PENDING", "CONFIRMED", "USED", "CANCELLED"];
    if (!validStatuses.includes(status)) {
      throw new Error("Trạng thái vé không hợp lệ");
    }
    try {
      if (!Array.isArray(ticketIds) || !ticketIds.length) {
        throw new Error("Thiếu ticketIds hoặc ticketIds không hợp lệ");
      }
      const response = await axiosInstance.put(`/tickets/batch-status`, {
        ticketIds: ticketIds.map((id) => parseInt(id)),
        status,
      });
      if (response.data.count === 0) {
        console.warn("Không có vé nào được cập nhật trạng thái.");
      }
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái vé:", error);
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message ||
            "Dữ liệu không hợp lệ khi cập nhật trạng thái vé."
        );
      } else if (error.response?.status === 403) {
        throw new Error(
          "Truy cập bị từ chối: Bạn không có quyền cập nhật vé này"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi cập nhật trạng thái vé.");
      }
      throw new Error("Không thể cập nhật trạng thái vé. Vui lòng thử lại.");
    }
  },

  // Áp dụng mã khuyến mãi cho vé
  applyPromotion: async (ticketId, promotionCode) => {
    try {
      if (!promotionCode) {
        throw new Error("Mã khuyến mãi là bắt buộc");
      }
      const response = await axiosInstance.post(
        `/tickets/${parseInt(ticketId)}/promotion`,
        {
          promotionCode,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi áp dụng mã khuyến mãi:", error);
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message ||
            "Mã khuyến mãi không hợp lệ hoặc đã hết hạn"
        );
      } else if (error.response?.status === 403) {
        throw new Error(
          "Truy cập bị từ chối: Bạn không có quyền áp dụng khuyến mãi"
        );
      } else if (error.response?.status === 404) {
        throw new Error("Không tìm thấy vé để áp dụng khuyến mãi");
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi áp dụng khuyến mãi");
      }
      throw new Error("Không thể áp dụng khuyến mãi. Vui lòng thử lại.");
    }
  },

  // Tạo QR code cho vé
  generateTicketQR: async (ticketId) => {
    try {
      const response = await axiosInstance.get(
        `/tickets/${parseInt(ticketId)}/qr/generate`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo mã QR:", error);
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy vé để tạo mã QR");
      } else if (error.response?.status === 403) {
        throw new Error("Truy cập bị từ chối: Bạn không có quyền tạo mã QR");
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message ||
            "Chỉ có thể tạo mã QR cho vé đã được xác nhận thanh toán"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi tạo mã QR");
      }
      throw new Error("Không thể tạo mã QR. Vui lòng thử lại.");
    }
  },

  validateQR: async (qrData) => {
    try {
      if (!qrData) {
        throw new Error("Dữ liệu QR là bắt buộc");
      }
      const response = await axiosInstance.post("/tickets/qr/validate", {
        qrData,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xác thực QR:", error);
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Mã QR không hợp lệ hoặc đã hết hạn"
        );
      } else if (error.response?.status === 403) {
        throw new Error(
          "Truy cập bị từ chối: Bạn không có quyền xác thực QR này"
        );
      } else if (error.response?.status === 409) {
        throw new Error(
          error.response.data.message ||
            "Vé đã được sử dụng hoặc không còn hiệu lực"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi xác thực QR");
      }
      throw new Error("Không thể xác thực QR. Vui lòng thử lại.");
    }
  },

  deleteTicket: async (ticketId) => {
    try {
      const response = await axiosInstance.delete(
        `/tickets/${parseInt(ticketId)}`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xóa vé:", error);
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy vé để xóa");
      } else if (error.response?.status === 403) {
        throw new Error("Truy cập bị từ chối: Bạn không có quyền xóa vé này");
      } else if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Không thể xóa vé đã được xác nhận"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi xóa vé");
      }
      throw new Error("Không thể xóa vé. Vui lòng thử lại.");
    }
  },

  getMyTicketStats: async () => {
    try {
      const userId = parseInt(sessionStorage.getItem("userId"));
      if (!userId) {
        throw new Error("Không tìm thấy userId trong sessionStorage");
      }
      const response = await axiosInstance.get(`/tickets/stats/user/${userId}`);

      return response.data.data || response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thống kê vé:", error);
      if (error.response?.status === 403) {
        throw new Error(
          "Truy cập bị từ chối: Bạn không có quyền xem thống kê này"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi lấy thống kê vé");
      }
      throw new Error("Không thể lấy thống kê vé. Vui lòng thử lại.");
    }
  },

  // Lấy thông tin QR (không check-in)
  getQRInfo: async (qrData) => {
    try {
      if (!qrData) {
        throw new Error("Dữ liệu QR là bắt buộc");
      }
      const response = await axiosInstance.post("/tickets/qr-info", {
        qrData,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin QR:", error);
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Không thể đọc thông tin mã QR"
        );
      } else if (error.response?.status === 403) {
        throw new Error(
          "Truy cập bị từ chối: Bạn không có quyền xem thông tin QR"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi lấy thông tin QR");
      }
      throw new Error("Không thể lấy thông tin QR. Vui lòng thử lại.");
    }
  },

  // Kiểm tra trạng thái QR
  checkQRStatus: async (ticketId) => {
    try {
      const response = await axiosInstance.get(
        `/tickets/${parseInt(ticketId)}/qr-status`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái QR:", error);
      if (error.response?.status === 400) {
        throw new Error(error.response.data.message || "ID vé không hợp lệ");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Truy cập bị từ chối: Bạn không có quyền kiểm tra trạng thái QR"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi kiểm tra trạng thái QR");
      }
      throw new Error("Không thể kiểm tra trạng thái QR. Vui lòng thử lại.");
    }
  },

  canCancelTicket: async (ticketId) => {
    try {
      const response = await axiosInstance.get(
        `/tickets/${parseInt(ticketId)}/can-cancel`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi kiểm tra khả năng hủy vé:", error);
      if (error.response?.status === 404) {
        throw new Error("Không tìm thấy vé");
      } else if (error.response?.status === 403) {
        throw new Error(
          "Truy cập bị từ chối: Bạn không có quyền kiểm tra vé này"
        );
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi kiểm tra khả năng hủy vé");
      }
      throw new Error("Không thể kiểm tra khả năng hủy vé. Vui lòng thử lại.");
    }
  },
};
