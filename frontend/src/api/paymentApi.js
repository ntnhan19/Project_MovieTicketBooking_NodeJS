// frontend/src/api/paymentApi.js
import axiosInstance from "./axiosInstance";

export const paymentApi = {
  processPayment: async (paymentData) => {
    try {
      const token = sessionStorage.getItem("token");
      const userId = parseInt(sessionStorage.getItem("userId"));

      if (!token || !userId) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const payload = {
        ticketIds: Array.isArray(paymentData.ticketIds)
          ? paymentData.ticketIds
          : [paymentData.ticketIds],
        concessionOrderIds: Array.isArray(paymentData.concessionOrderIds)
          ? paymentData.concessionOrderIds
          : paymentData.concessionOrderIds
          ? [paymentData.concessionOrderIds]
          : [],
        method: paymentData.method.toUpperCase(),
      };

      const response = await axiosInstance.post("/payments", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.id) {
        const paymentInfo = {
          id: response.data.id,
          method: payload.method,
          orderToken: response.data.orderToken || "",
          amount: response.data.amount,
          createdAt: new Date().toISOString(),
          appTransId:
            response.data.appTransId || response.data.orderToken || "",
          userId: userId,
        };
        // Lưu vào sessionStorage thay vì localStorage
        sessionStorage.setItem(`lastPaymentId_${userId}`, response.data.id);
        sessionStorage.setItem(
          `lastPaymentInfo_${userId}`,
          JSON.stringify(paymentInfo)
        );
      }

      return response.data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message || "Lỗi khi xử lý thanh toán"
      );
    }
  },

  // Kiểm tra trạng thái thanh toán VNPay
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

      // Xử lý các mã phản hồi chuẩn từ VNPay
      const vnpayResponseMessages = {
        "00": "Giao dịch thành công",
        "01": "Giao dịch đã tồn tại",
        "02": "Merchant không tồn tại hoặc không hoạt động",
        "03": "Dữ liệu gửi sang không đúng định dạng",
        "04": "Khởi tạo giao dịch không thành công",
        "07": "Giao dịch bị nghi ngờ gian lận",
        "09": "Thẻ/Tài khoản hết hạn thanh toán",
        10: "Đã hết hạn chờ thanh toán",
        11: "Giao dịch thất bại",
        24: "Khách hàng đã hủy giao dịch",
        51: "Tài khoản không đủ số dư để thực hiện giao dịch",
        65: "Tài khoản của quý khách đã vượt quá hạn mức thanh toán trong ngày",
        75: "Ngân hàng thanh toán đang bảo trì",
        79: "Đã vượt quá số lần thanh toán cho phép",
        91: "Không tìm thấy giao dịch yêu cầu",
        94: "Yêu cầu bị trùng lặp trong thời gian giới hạn",
        97: "Chữ ký không hợp lệ",
        99: "Lỗi không xác định",
      };

      // Xử lý trường hợp đặc biệt cho mã lỗi 91 - Giao dịch chưa được thực hiện
      if (result.responseCode === "91") {
        // Tính toán thời gian cần đợi trước khi kiểm tra lại (15 giây)
        const nextQueryTime = new Date(Date.now() + 15000);
        return {
          ...result,
          success: false,
          status: "PENDING",
          message:
            "Giao dịch chưa được thực hiện, đang đợi người dùng thanh toán",
          nextQueryAllowed: nextQueryTime.toISOString(),
          pendingPayment: true, // Flag để biết đang chờ người dùng thực hiện thanh toán
          messageVi:
            vnpayResponseMessages[result.responseCode] || "Đang đợi thanh toán",
        };
      }

      // Xử lý trường hợp đã được cache - tuân theo lastQueryTime từ backend
      if (result.cached && result.nextQueryAllowed) {
        return {
          ...result,
          success: result.status === "COMPLETED",
          message: result.message || "Đang đợi kết quả từ cổng thanh toán",
          messageVi:
            vnpayResponseMessages[result.responseCode] || result.message,
        };
      }

      // Trả về thông tin trạng thái chuẩn hóa
      return {
        ...result,
        success:
          result.status === "COMPLETED" ||
          (result.responseCode === "00" && result.transactionStatus === "00"),
        paymentStatus:
          result.status ||
          (result.responseCode === "00" && result.transactionStatus === "00"
            ? "COMPLETED"
            : "PENDING"),
        message:
          result.message ||
          vnpayResponseMessages[result.responseCode] ||
          "Đang xử lý thanh toán",
        messageVi: vnpayResponseMessages[result.responseCode] || result.message,
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

  // Theo dõi quá trình thanh toán VNPay - CẬP NHẬT để sử dụng trạng thái mới từ backend
  trackVNPayPayment: async (
    paymentId,
    interval = 3000,
    timeout = 5 * 60 * 1000
  ) => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      let checkCount = 0;
      const maxChecks = 30; // Tăng số lần kiểm tra tối đa
      let nextCheckTime = Date.now();
      let incrementalBackoff = 0; // Bắt đầu với không có backoff

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
          if (result.responseCode === "91") {
            console.log(
              "Giao dịch chưa được thực hiện, đợi người dùng thanh toán..."
            );
            // Đặt thời gian chờ dài hơn (20 giây) cho trường hợp này
            nextCheckTime = Date.now() + 20000;
            return;
          }

          // Nếu backend báo cần đợi
          if (result.nextQueryAllowed) {
            const waitUntil = new Date(result.nextQueryAllowed);
            nextCheckTime = waitUntil.getTime();
            console.log(
              `Cần đợi đến ${waitUntil.toLocaleTimeString()} để kiểm tra lại`
            );
            return;
          }

          // Nếu thanh toán đã hoàn tất
          if (
            result.status === "COMPLETED" ||
            (result.responseCode === "00" && result.transactionStatus === "00")
          ) {
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

          // Sử dụng backoff strategy để giảm số lượng request
          // Tăng dần thời gian giữa các lần kiểm tra
          incrementalBackoff = Math.min(incrementalBackoff + 1000, 10000);
          nextCheckTime = Date.now() + interval + incrementalBackoff;

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
          incrementalBackoff = Math.min(incrementalBackoff + 3000, 15000);
          nextCheckTime = Date.now() + interval + incrementalBackoff;

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
      const vnp_TransactionNo = params.get("vnp_TransactionNo"); // ID giao dịch từ VNPay
      const vnp_ResponseCode = params.get("vnp_ResponseCode"); // Mã phản hồi từ VNPay

      // Map mã lỗi từ VNPay
      const vnpayErrorCodes = {
        "00": "Giao dịch thành công",
        "01": "Giao dịch đã tồn tại",
        "02": "Merchant không tồn tại hoặc không hoạt động",
        "03": "Dữ liệu gửi sang không đúng định dạng",
        "04": "Khởi tạo giao dịch không thành công",
        "07": "Giao dịch bị nghi ngờ gian lận",
        "09": "Thẻ/Tài khoản hết hạn thanh toán",
        10: "Đã hết hạn chờ thanh toán",
        11: "Giao dịch thất bại",
        24: "Khách hàng đã hủy giao dịch",
        51: "Tài khoản không đủ số dư để thực hiện giao dịch",
        65: "Tài khoản của quý khách đã vượt quá hạn mức thanh toán trong ngày",
        75: "Ngân hàng thanh toán đang bảo trì",
        79: "Đã vượt quá số lần thanh toán cho phép",
        91: "Không tìm thấy giao dịch yêu cầu",
        94: "Yêu cầu bị trùng lặp trong thời gian giới hạn",
        97: "Chữ ký không hợp lệ",
        99: "Lỗi không xác định",
      };

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

      // Ưu tiên xử lý response code trực tiếp từ VNPay nếu có
      if (vnp_ResponseCode) {
        const isSuccess = vnp_ResponseCode === "00";

        // Kiểm tra trạng thái hiện tại từ backend để xác nhận
        try {
          const statusCheck = await paymentApi.checkVNPayStatus(
            parseInt(paymentId)
          );
          return {
            success: isSuccess,
            paymentId: parseInt(paymentId),
            transactionId: vnp_TransactionNo,
            statusData: statusCheck,
            responseCode: vnp_ResponseCode,
            message:
              vnpayErrorCodes[vnp_ResponseCode] ||
              (isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"),
          };
        } catch {
          // Nếu không kiểm tra được, vẫn tin tưởng response code từ VNPay
          return {
            success: isSuccess,
            paymentId: parseInt(paymentId),
            transactionId: vnp_TransactionNo,
            responseCode: vnp_ResponseCode,
            message:
              vnpayErrorCodes[vnp_ResponseCode] ||
              (isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"),
          };
        }
      }

      // Xử lý theo status từ backend nếu không có response code trực tiếp
      if (status === "success") {
        try {
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

  // Hủy thanh toán
  cancelPayment: async (paymentId) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      }

      const response = await axiosInstance.post(
        `/payments/${paymentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Lỗi khi hủy thanh toán:", error);
      const errorMessage =
        error.response?.data?.message ||
        "Không thể hủy thanh toán. Vui lòng thử lại sau.";
      throw new Error(errorMessage);
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

  // Lưu thông tin thanh toán tạm thời
  saveTemporaryPaymentInfo: (paymentInfo) => {
    localStorage.setItem("tempPaymentInfo", JSON.stringify(paymentInfo));
  },

  // Lấy thông tin thanh toán tạm thời
  getTemporaryPaymentInfo: () => {
    try {
      const infoStr = localStorage.getItem("tempPaymentInfo");
      return infoStr ? JSON.parse(infoStr) : null;
    } catch (error) {
      console.error("Lỗi khi đọc thông tin thanh toán tạm thời:", error);
      return null;
    }
  },

  // Xóa cache thanh toán
  clearPaymentCache: (userId) => {
    localStorage.removeItem(`lastPaymentId_${userId}`);
    localStorage.removeItem(`lastPaymentMethod_${userId}`);
    localStorage.removeItem(`lastOrderToken_${userId}`);
    localStorage.removeItem(`lastPaymentAmount_${userId}`);
    localStorage.removeItem(`lastPaymentCreatedAt_${userId}`);
    localStorage.removeItem(`lastAppTransId_${userId}`);
    localStorage.removeItem(`lastPaymentInfo_${userId}`);
    localStorage.removeItem(`tempPaymentInfo_${userId}`);
    console.log(
      `Đã xóa cache thông tin thanh toán cho user ${userId} từ localStorage`
    );
  },
};
