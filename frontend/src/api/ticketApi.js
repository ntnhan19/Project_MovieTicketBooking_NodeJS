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
      };

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
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi tạo vé. Vui lòng thử lại sau.");
      }
      throw new Error("Không thể tạo vé. Vui lòng kiểm tra lại.");
    }
  },

  // Lấy thông tin vé theo ID
  getTicketById: async (ticketId) => {
    try {
      const response = await axiosInstance.get(`/tickets/${ticketId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vé:", error);
      throw error;
    }
  },

  // Lấy vé theo seatId và userId
  getTicketBySeatId: async (seatId, userId) => {
    try {
      const response = await axiosInstance.get(`/tickets/seat/${seatId}`, {
        params: { userId, status: "PENDING" },
      });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy vé cho ghế ${seatId}:`, error);
      if (error.response?.status === 404) {
        return null; // Không tìm thấy vé, trả về null thay vì ném lỗi
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi lấy thông tin vé.");
      }
      throw new Error(`Không thể lấy vé cho ghế ${seatId}. Vui lòng thử lại.`);
    }
  },

  // Lấy danh sách vé của người dùng đang đăng nhập (bao gồm thông tin chi tiết)
  getMyTickets: async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const response = await axiosInstance.get(
        `/tickets/user/${userId}?includeDetails=true`
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vé:", error);
      throw error;
    }
  },

  // Lấy danh sách vé theo ID của payment
  getTicketsByPaymentId: async (paymentId) => {
    try {
      const response = await axiosInstance.get(`/tickets/payment/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy danh sách vé theo mã thanh toán:", error);
      throw error;
    }
  },

  // Cập nhật ID thanh toán cho nhiều vé
  updateTicketsPayment: async (ticketIds, paymentId) => {
    try {
      const response = await axiosInstance.put(`/tickets/update-payment`, {
        ticketIds,
        paymentId,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi cập nhật mã thanh toán cho vé:", error);
      throw error;
    }
  },

  // Hủy vé
  cancelTicket: async (ticketId) => {
    try {
      const response = await axiosInstance.put(`/tickets/${ticketId}/status`, {
        status: "CANCELLED",
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi hủy vé:", error);
      if (error.response?.status === 400) {
        throw new Error(
          error.response.data.message || "Dữ liệu không hợp lệ khi hủy vé."
        );
      } else if (error.response?.status === 404) {
        throw new Error("Không tìm thấy vé để hủy.");
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
      const response = await axiosInstance.put(`/tickets/batch-status`, {
        ticketIds,
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
      } else if (error.response?.status === 500) {
        throw new Error("Lỗi máy chủ khi cập nhật trạng thái vé.");
      }
      throw new Error("Không thể cập nhật trạng thái vé. Vui lòng thử lại.");
    }
  },

  // Áp dụng mã khuyến mãi cho vé
  applyPromotion: async (ticketId, promotionCode) => {
    try {
      const response = await axiosInstance.post(
        `/tickets/${ticketId}/promotion`,
        {
          promotionCode,
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi áp dụng mã khuyến mãi:", error);
      throw error;
    }
  },

  // Tạo QR code cho vé
  generateTicketQR: async (ticketId) => {
    try {
      const response = await axiosInstance.get(`/tickets/${ticketId}/qr`);
      return response.data;
    } catch (error) {
      console.error("Lỗi khi tạo mã QR:", error);
      throw new Error("Không thể tạo mã QR");
    }
  },

  // Xác thực mã QR của vé
  validateTicketQR: async (qrData) => {
    try {
      const response = await axiosInstance.post("/tickets/validate-qr", {
        qrData,
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi xác thực mã QR:", error);
      throw new Error(error.response?.data?.message || "Xác thực thất bại");
    }
  },

  getTicketWithPayment: async (ticketId) => {
    try {
      const [ticket, payment] = await Promise.all([
        axiosInstance.get(`/tickets/${ticketId}`),
        axiosInstance.get(`/payments/ticket/${ticketId}`),
      ]);
      return {
        ticket: ticket.data,
        payment: payment.data,
      };
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vé và thanh toán:", error);
      throw error;
    }
  },

  getTicketsWithPayment: async (ticketIds) => {
    try {
      const tickets = await Promise.all(
        ticketIds.map((id) => axiosInstance.get(`/tickets/${id}`))
      );
      const payment = await axiosInstance.get(
        `/payments/ticket/${ticketIds[0]}`
      );
      return {
        tickets: tickets.map((response) => response.data),
        payment: payment.data,
      };
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vé và thanh toán:", error);
      throw error;
    }
  },
};
