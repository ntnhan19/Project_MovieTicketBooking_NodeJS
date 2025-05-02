// frontend/src/api/paymentApi.js
import axiosInstance from "./axiosInstance";

export const paymentApi = {
  // Xử lý thanh toán với VNPay
  processPayment: async (paymentData) => {
    try {
      const token = localStorage.getItem("token");

      // Chuẩn hóa phương thức thanh toán và kiểm tra
      const validMethods = ["VNPAY"];
      const method = paymentData.method.toUpperCase();
      if (!validMethods.includes(method)) {
        throw new Error(`Phương thức thanh toán '${method}' không hợp lệ.`);
      }

      // Đảm bảo ticketIds luôn là mảng
      const ticketIds = Array.isArray(paymentData.ticketIds)
        ? paymentData.ticketIds
        : [paymentData.ticketIds];

      // Tạo payload đơn giản hơn
      const payload = { ticketIds, method };

      const response = await axiosInstance.post("/payments", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Lưu thông tin thanh toán vào localStorage
      if (response.data.id) {
        localStorage.setItem("lastPaymentId", response.data.id);
        localStorage.setItem("lastPaymentMethod", method);
        localStorage.setItem("lastOrderToken", response.data.orderToken || "");
        localStorage.setItem("lastPaymentAmount", response.data.amount);
        localStorage.setItem("lastPaymentCreatedAt", new Date().toISOString());
      }

      // Xử lý đặc biệt cho VNPay - trả về URL thanh toán
      if (method === "VNPAY" && response.data.paymentUrl) {
        return response.data;
      }

      return response.data;
    } catch (error) {
      // Xử lý chi tiết lỗi từ backend
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  // Kiểm tra trạng thái thanh toán VNPay - CẬP NHẬT theo backend mới
  checkVNPayStatus: async (paymentId) => {
    try {
      if (!paymentId) {
        return {
          success: false,
          status: "ERROR",
          message: "Thiếu thông tin ID thanh toán",
          error: true,
        };
      }

      const token = localStorage.getItem("token");
      // Thêm timestamp để tránh cache của trình duyệt
      const timestamp = Date.now();
      const response = await axiosInstance.get(
        `/payments/${paymentId}/check-vnpay-status?_t=${timestamp}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = response.data;

      // Xử lý trường hợp đặc biệt cho mã lỗi 91 - Giao dịch chưa được thực hiện
      if (result.vnp_ResponseCode === "91" || result.responseCode === "91") {
        // Tính toán thời gian cần đợi trước khi kiểm tra lại (15 giây)
        const nextQueryTime = new Date(Date.now() + 15000);
        return {
          ...result,
          success: false,
          status: "PENDING",
          message:
            "Giao dịch chưa được thực hiện, đang đợi người dùng thanh toán",
          nextQueryAllowed: nextQueryTime.toISOString(),
          pendingPayment: true, // Thêm flag để biết đang chờ người dùng thực hiện thanh toán
        };
      }

      // Đơn giản hóa logic xử lý response
      // Trạng thái COMPLETED luôn là thành công
      if (result.status === "COMPLETED") {
        return {
          ...result,
          success: true,
          paymentStatus: "COMPLETED",
        };
      }

      // Kiểm tra responseCode từ VNPay
      const isSuccessVNPay =
        result.responseCode === "00" &&
        (result.transactionStatus === "00" || !result.transactionStatus);

      return {
        ...result,
        success: isSuccessVNPay,
        paymentStatus:
          result.status || (isSuccessVNPay ? "COMPLETED" : "PENDING"),
        // Thêm thông tin cached để UI hiển thị phù hợp
        cached: result.cached || false,
      };
    } catch (error) {
      console.error("Lỗi khi kiểm tra trạng thái thanh toán VNPay:", error);
      return {
        success: false,
        status: "ERROR",
        message:
          error.response?.data?.message ||
          "Không thể kiểm tra trạng thái thanh toán",
        error: true,
      };
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

  // Hủy thanh toán
  cancelPayment: async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.put(
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

  // Mô phỏng thanh toán thành công (chỉ dùng trong môi trường development)
  simulatePaymentSuccess: async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axiosInstance.get(
        `/payments/${paymentId}/simulate-success`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi mô phỏng thanh toán thành công:", error);
      throw error;
    }
  },

  // Theo dõi quá trình thanh toán VNPay - CẬP NHẬT để sử dụng trạng thái mới từ backend
  trackVNPayPayment: async (
    paymentId,
    interval = 3000,
    timeout = 5 * 60 * 1000
  ) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let checkCount = 0;
      const maxChecks = 20; // Giới hạn số lần kiểm tra
      let nextCheckTime = Date.now();

      const checkInterval = setInterval(async () => {
        // Nếu chưa đến lúc kiểm tra tiếp theo, đợi
        if (Date.now() < nextCheckTime) {
          return;
        }

        checkCount++;

        try {
          const result = await paymentApi.checkVNPayStatus(paymentId);
          console.log(`[${checkCount}] Trạng thái thanh toán VNPay:`, result);

          // Xử lý đặc biệt cho mã lỗi 91 - Tăng thời gian chờ
          if (
            result.vnp_ResponseCode === "91" ||
            result.responseCode === "91"
          ) {
            console.log(
              "Giao dịch chưa được thực hiện, đợi người dùng thanh toán..."
            );
            // Đặt thời gian chờ dài hơn (20 giây) cho trường hợp này
            nextCheckTime = Date.now() + 20000;
            return;
          }

          // Nếu có chỉ dẫn cần đợi từ backend
          if (result.nextQueryAllowed) {
            const waitUntil = new Date(result.nextQueryAllowed);
            nextCheckTime = waitUntil.getTime();
            console.log(
              `Cần đợi đến ${waitUntil.toLocaleTimeString()} để kiểm tra lại`
            );
            return;
          }

          // Nếu thanh toán đã hoàn tất
          if (result.status === "COMPLETED" || result.success === true) {
            clearInterval(checkInterval);
            resolve({
              ...result,
              success: true,
              status: "COMPLETED",
              paymentStatus: "COMPLETED",
            });
            return;
          }

          // Nếu thanh toán đã thất bại hoặc bị hủy
          if (result.status === "FAILED" || result.status === "CANCELLED") {
            clearInterval(checkInterval);
            reject({
              ...result,
              success: false,
              message:
                result.message ||
                `Thanh toán ${
                  result.status === "FAILED" ? "thất bại" : "đã bị hủy"
                }`,
            });
            return;
          }

          // Đặt thời gian kiểm tra tiếp theo
          nextCheckTime = Date.now() + interval;

          // Kiểm tra timeout
          if (Date.now() - startTime > timeout || checkCount >= maxChecks) {
            clearInterval(checkInterval);
            reject({
              status: "TIMEOUT",
              message: "Hết thời gian chờ thanh toán",
              paymentId,
            });
          }
        } catch (error) {
          console.error(`Lỗi kiểm tra lần ${checkCount}:`, error);

          // Tăng khoảng thời gian chờ nếu gặp lỗi
          nextCheckTime = Date.now() + Math.min(interval * 2, 10000);

          // Kiểm tra timeout
          if (Date.now() - startTime > timeout || checkCount >= maxChecks) {
            clearInterval(checkInterval);
            reject({
              status: "TIMEOUT",
              message: "Hết thời gian chờ thanh toán",
              error: true,
            });
          }
        }
      }, 1000); // Kiểm tra mỗi giây nhưng chỉ gọi API theo nextCheckTime

      // Tự động dừng sau timeout
      setTimeout(() => {
        clearInterval(checkInterval);
        reject({
          status: "TIMEOUT",
          message: "Hết thời gian chờ thanh toán",
          paymentId,
        });
      }, timeout);
    });
  },

  // Xử lý kết quả thanh toán sau khi redirect từ cổng thanh toán VNPay
  handleVNPayResult: async (queryParams) => {
    try {
      const params = new URLSearchParams(queryParams);
      const status = params.get("status"); // success hoặc failed từ backend
      const paymentId =
        params.get("paymentId") || localStorage.getItem("lastPaymentId");
      const errorParam = params.get("error");
      const code = params.get("code"); // Mã phản hồi từ VNPay

      if (!paymentId) {
        return {
          success: false,
          message: "Không tìm thấy thông tin thanh toán",
          error: true,
        };
      }

      // Xử lý lỗi từ URL
      if (errorParam === "true") {
        return {
          success: false,
          message:
            params.get("message") || "Có lỗi xảy ra trong quá trình thanh toán",
          error: true,
          paymentId: parseInt(paymentId),
        };
      }

      // Kiểm tra nếu status từ backend là success
      if (status === "success") {
        try {
          // Lấy thông tin chi tiết từ backend
          const payment = await paymentApi.getPaymentById(parseInt(paymentId));
          return {
            success: true,
            paymentId: parseInt(paymentId),
            payment,
            message: "Thanh toán thành công",
          };
        } catch (error) {
          console.error("Lỗi khi lấy thông tin thanh toán:", error);

          // Gọi API kiểm tra trạng thái
          try {
            const statusCheck = await paymentApi.checkVNPayStatus(
              parseInt(paymentId)
            );
            if (statusCheck.success || statusCheck.status === "COMPLETED") {
              return {
                success: true,
                paymentId: parseInt(paymentId),
                statusData: statusCheck,
                message: "Thanh toán thành công (xác nhận từ hệ thống)",
              };
            } else {
              return {
                success: statusCheck.success,
                paymentId: parseInt(paymentId),
                statusData: statusCheck,
                message:
                  statusCheck.message || "Đang xác nhận kết quả thanh toán",
              };
            }
          } catch {
            // Nếu không kiểm tra được, vẫn tin tưởng kết quả từ URL
            return {
              success: status === "success",
              paymentId: parseInt(paymentId),
              message:
                status === "success"
                  ? "Thanh toán thành công (đang đồng bộ dữ liệu)"
                  : "Có lỗi khi xác nhận kết quả thanh toán",
              pendingSync: true,
            };
          }
        }
      }

      // Xử lý khi thanh toán thất bại
      if (status === "failed") {
        // Map mã lỗi từ VNPay
        const vnpayErrorCodes = {
          "01": "Giao dịch đã tồn tại",
          "02": "Merchant không tồn tại hoặc không hoạt động",
          "03": "Dữ liệu gửi sang không đúng định dạng",
          "04": "Khởi tạo giao dịch không thành công",
          24: "Khách hàng đã hủy giao dịch",
          51: "Tài khoản không đủ số dư để thực hiện giao dịch",
          97: "Chữ ký không hợp lệ",
          99: "Lỗi không xác định",
        };

        let message = "Thanh toán thất bại";
        if (code && vnpayErrorCodes[code]) {
          message = `Thanh toán thất bại: ${vnpayErrorCodes[code]}`;
        }

        return {
          success: false,
          paymentId: parseInt(paymentId),
          message,
          responseCode: code,
        };
      }

      // Nếu không xác định được từ URL, kiểm tra trạng thái từ backend
      try {
        const statusCheck = await paymentApi.checkVNPayStatus(
          parseInt(paymentId)
        );

        // Nếu transactionStatus là 00 hoặc responseCode là 00 và status là COMPLETED
        if (
          (statusCheck.transactionStatus === "00" ||
            statusCheck.responseCode === "00") &&
          statusCheck.status === "COMPLETED"
        ) {
          return {
            success: true,
            paymentId: parseInt(paymentId),
            statusData: statusCheck,
            message: "Thanh toán thành công",
          };
        }

        // Nếu có status là COMPLETED thì chắc chắn là thành công
        if (statusCheck.status === "COMPLETED") {
          return {
            success: true,
            paymentId: parseInt(paymentId),
            statusData: statusCheck,
            message: "Thanh toán thành công",
          };
        }

        // Các trường hợp không thành công
        return {
          success: false,
          paymentId: parseInt(paymentId),
          statusData: statusCheck,
          message:
            statusCheck.message ||
            (statusCheck.status === "FAILED"
              ? "Thanh toán thất bại"
              : statusCheck.status === "CANCELLED"
              ? "Thanh toán đã bị hủy"
              : "Đang xử lý thanh toán"),
        };
      } catch (error) {
        console.error("Lỗi khi kiểm tra trạng thái thanh toán:", error);

        // Nếu không thể kiểm tra trạng thái, thử lấy thông tin thanh toán
        try {
          const payment = await paymentApi.getPaymentById(parseInt(paymentId));

          if (payment.status === "COMPLETED") {
            return {
              success: true,
              paymentId: parseInt(paymentId),
              payment,
              message: "Thanh toán thành công",
            };
          } else {
            return {
              success: false,
              paymentId: parseInt(paymentId),
              payment,
              message:
                payment.status === "FAILED"
                  ? "Thanh toán thất bại"
                  : payment.status === "CANCELLED"
                  ? "Thanh toán đã bị hủy"
                  : "Đang xử lý thanh toán",
            };
          }
        } catch {
          return {
            success: false,
            paymentId: parseInt(paymentId),
            message: "Không thể xác định trạng thái thanh toán",
            error: true,
            pendingSync: true,
          };
        }
      }
    } catch (error) {
      console.error("Lỗi khi xử lý kết quả thanh toán:", error);
      return {
        success: false,
        message: "Có lỗi xảy ra khi xử lý kết quả thanh toán",
        error: true,
      };
    }
  },

  clearPaymentCache: () => {
    localStorage.removeItem("lastPaymentId");
    localStorage.removeItem("lastPaymentMethod");
    localStorage.removeItem("lastOrderToken");
    localStorage.removeItem("lastPaymentAmount");
    localStorage.removeItem("lastPaymentCreatedAt");
    console.log("Đã xóa cache thông tin thanh toán từ localStorage");
  },
};
