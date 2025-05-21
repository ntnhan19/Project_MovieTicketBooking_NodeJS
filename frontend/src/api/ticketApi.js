// frontend/src/api/ticketApi.js
import axiosInstance from "./axiosInstance";

export const ticketApi = {
  // Tạo vé mới
  createTicket: async (ticketData) => {
    try {
      // Đảm bảo dữ liệu được định dạng đúng trước khi gửi
      const payload = {
        userId: parseInt(ticketData.userId) || parseInt(localStorage.getItem("userId")),
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
      throw error;
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

  // Lấy danh sách vé của người dùng đang đăng nhập (bao gồm thông tin chi tiết)
  getMyTickets: async () => {
    try {
      const userId = localStorage.getItem("userId");
      const response = await axiosInstance.get(`/tickets/user/${userId}?includeDetails=true`);
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
        paymentId
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
        status: 'CANCELLED'
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi hủy vé:', error);
      throw error;
    }
  },
  
  // Cập nhật trạng thái nhiều vé cùng lúc
  updateTicketsStatus: async (ticketIds, status) => {
    try {
      const response = await axiosInstance.put(`/tickets/batch-status`, {
        ticketIds,
        status
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi cập nhật trạng thái vé:', error);
      throw error;
    }
  },

  // Áp dụng mã khuyến mãi cho vé
  applyPromotion: async (ticketId, promotionCode) => {
    try {
      const response = await axiosInstance.post(`/tickets/${ticketId}/promotion`, {
        promotionCode
      });
      return response.data;
    } catch (error) {
      console.error('Lỗi khi áp dụng mã khuyến mãi:', error);
      throw error;
    }
  },

  // Lấy danh sách ghế theo suất chiếu
  getSeatsByShowtime: async (showtimeId) => {
    try {
      const response = await axiosInstance.get(`/tickets/showtime/${showtimeId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi lấy danh sách ghế:', error);
      throw error;
    }
  },

  // Khóa ghế tạm thời (15 phút)
  lockSeat: async (seatId) => {
    try {
      const response = await axiosInstance.post(`/tickets/lock/${seatId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi khóa ghế:', error);
      throw error;
    }
  },

  // Mở khóa ghế
  unlockSeat: async (seatId) => {
    try {
      const response = await axiosInstance.post(`/tickets/unlock/${seatId}`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi mở khóa ghế:', error);
      throw error;
    }
  },

  // Tạo QR code cho vé - Phương thức mới dựa vào thông tin vé hiện có
  generateTicketQR: async (ticketId) => {
    try {
      // Đầu tiên, lấy chi tiết vé từ API
      const ticket = await ticketApi.getTicketById(ticketId);
      
      // Nếu vé không tồn tại hoặc không có showtime, trả về lỗi
      if (!ticket || !ticket.showtime) {
        throw new Error('Không thể tạo mã QR: Thiếu thông tin vé');
      }
      
      // Lấy thông tin cần thiết từ vé
      const { showtime, seat } = ticket;
      const cinema = showtime.hall.cinema;
      const movie = showtime.movie;
      
      // Tạo dữ liệu QR theo cùng định dạng như phía client
      const qrData = JSON.stringify({
        ticketCode: `T${ticket.id}`,
        movieTitle: movie.title,
        cinema: cinema.name,
        hall: showtime.hall.name,
        time: new Date(showtime.startTime).toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        date: new Date(showtime.startTime).toLocaleDateString("vi-VN"),
        seat: `${seat.row}${seat.column || seat.number}`
      });
      
      return qrData;
    } catch (error) {
      console.error('Lỗi khi tạo QR code cho vé:', error);
      throw error;
    }
  },
  
  // Xác thực vé (sử dụng khi quét QR)
  validateTicket: async (ticketId) => {
    try {
      const response = await axiosInstance.put(`/tickets/${ticketId}/validate`);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi xác thực vé:', error);
      throw error;
    }
  },

  getTicketWithPayment: async (ticketId) => {
    try {
      const [ticket, payment] = await Promise.all([
        axiosInstance.get(`/tickets/${ticketId}`),
        axiosInstance.get(`/payments/ticket/${ticketId}`)
      ]);
      
      return {
        ticket: ticket.data,
        payment: payment.data
      };
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vé và thanh toán:", error);
      throw error;
    }
  },

  // Lấy thông tin nhiều vé kèm payment
  getTicketsWithPayment: async (ticketIds) => {
    try {
      const tickets = await Promise.all(
        ticketIds.map(id => axiosInstance.get(`/tickets/${id}`))
      );
      
      // Lấy payment từ ticket đầu tiên
      const payment = await axiosInstance.get(`/payments/ticket/${ticketIds[0]}`);
      
      return {
        tickets: tickets.map(response => response.data),
        payment: payment.data
      };
    } catch (error) {
      console.error("Lỗi khi lấy thông tin vé và thanh toán:", error);
      throw error;
    }
  }
};

