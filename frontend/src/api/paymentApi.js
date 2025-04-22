// frontend/src/api/paymentApi.js
import axiosInstance from "./axiosInstance";

export const paymentApi = {
  // Xử lý thanh toán
  processPayment: async (paymentData) => {
    try {
      const token = localStorage.getItem("token");
  
      const validMethods = [
        "CREDIT_CARD",
        "BANK_TRANSFER",
        "E_WALLET",
        "CASH",
        "ZALOPAY",
        "VNPAY",
        "MOMO",
      ];
  
      const method = paymentData.method.toUpperCase();
      if (!validMethods.includes(method)) {
        console.error(`Phương thức thanh toán không hợp lệ: ${method}`);
        console.error("Các phương thức hợp lệ:", validMethods);
        throw new Error(`Phương thức thanh toán '${method}' không hợp lệ.`);
      }
  
      console.log("Gửi yêu cầu thanh toán với dữ liệu:", paymentData);
  
      // Tạo payload cho request
      const payload = {
        ticketIds: Array.isArray(paymentData.ticketId)
          ? paymentData.ticketId
          : [paymentData.ticketId],
        method: paymentData.method,
        amount: paymentData.amount, // Thêm amount vào payload
      };
  
      // Thêm các trường khác tùy theo phương thức thanh toán
      if (paymentData.bankInfo) {
        payload.bankInfo = paymentData.bankInfo;
      }
      if (paymentData.cardInfo) {
        payload.cardInfo = paymentData.cardInfo;
      }
      if (paymentData.phoneNumber) {
        payload.phoneNumber = paymentData.phoneNumber;
      }
  
      const response = await axiosInstance.post(
        "/payments/user-payment",
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data && response.data.message && 
          response.data.message.includes('đang được phát triển')) {
        // Phương thức thanh toán đang được phát triển
        console.log("Phương thức thanh toán đang được phát triển:", response.data);
        
        // Thực hiện mô phỏng thanh toán thành công cho mục đích demo
        if (response.data.id) {
          try {
            // Tự động gọi webhook để cập nhật trạng thái thanh toán thành công
            await axiosInstance.post("/payments/webhook", {
              paymentId: response.data.id,
              status: "COMPLETED",
              transactionId: `DEMO-${Date.now()}`
            }, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            console.log("Tự động cập nhật trạng thái thanh toán thành công");
          } catch (webhookError) {
            console.warn("Không thể tự động cập nhật trạng thái:", webhookError);
          }
        }
      }
  
      return response.data;
    } catch (error) {
      console.error("Lỗi chi tiết khi xử lý thanh toán:", error);
      console.error("Dữ liệu gửi:", paymentData);
  
      if (error.response?.status === 403) {
        throw new Error("Không có quyền truy cập. Vui lòng đăng nhập lại.");
      } else if (error.response?.status === 500) {
        throw new Error(
          `Lỗi máy chủ: ${error.response?.data?.message || "Không xác định"}`
        );
      } else if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Kiểm tra trạng thái thanh toán ZaloPay
  checkZaloPayStatus: async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(
        `/payments/${paymentId}/check-status`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán ZaloPay:", error);
      throw error;
    }
  },

  // Lấy thông tin thanh toán theo ID
  getPaymentById: async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin thanh toán:", error);
      throw error;
    }
  },

  // Lấy thông tin thanh toán theo ID vé
  getPaymentByTicketId: async (ticketId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(`/payments/ticket/${ticketId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Lỗi khi lấy thông tin thanh toán theo ID vé:", error);
      throw error;
    }
  },

  // Cập nhật trạng thái thanh toán (chỉ hỗ trợ hủy thanh toán cho user)
  cancelPayment: async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.patch(
        `/payments/${paymentId}/status`,
        {
          status: "CANCELLED",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi hủy thanh toán:", error);
      throw error;
    }
  },

  // Theo dõi quá trình thanh toán
  trackPayment: async (paymentId, interval = 3000) => {
    return new Promise((resolve, reject) => {
      const checkInterval = setInterval(async () => {
        try {
          const result = await paymentApi.checkZaloPayStatus(paymentId);

          if (result.status === "COMPLETED") {
            clearInterval(checkInterval);
            resolve(result);
          } else if (
            result.status === "FAILED" ||
            result.status === "CANCELLED"
          ) {
            clearInterval(checkInterval);
            reject(result);
          }
          // Nếu vẫn PENDING thì tiếp tục kiểm tra
        } catch (error) {
          clearInterval(checkInterval);
          reject(error);
        }
      }, interval);

      // Tự động dừng sau 5 phút
      setTimeout(() => {
        clearInterval(checkInterval);
        reject(new Error("Hết thời gian chờ thanh toán"));
      }, 5 * 60 * 1000);
    });
  },
};
