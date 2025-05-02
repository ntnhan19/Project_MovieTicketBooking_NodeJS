// backend/src/services/vnpayService.js
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  getDateInGMT7,
  dateFormat,
} = require("vnpay");
const prisma = require("../../prisma/prisma");
const paymentService = require("./paymentService");

/**
 * Khởi tạo instance VNPay với cấu hình
 * @returns {VNPay} Instance VNPay
 */
const initVNPay = () => {
  return new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE || "XMXDOF6C",
    secureSecret:
      process.env.VNPAY_SECRET_KEY || "PTURY5JJM1OHGNOH8VVFZ0OAKCHE53EY",
    vnpayHost: process.env.VNPAY_HOST || "https://sandbox.vnpayment.vn",
    paymentGateway: "/paymentv2/vpcpay.html",
    testMode: process.env.NODE_ENV !== "production",
    hashAlgorithm: "SHA512",
    enableLog: true,
  });
};

/**
 * Tạo đơn hàng VNPay và trả về URL thanh toán
 * @param {Object} payment - Thông tin payment từ DB
 * @param {Object} ticket - Thông tin vé (có thể là đại diện nếu có nhiều vé)
 * @param {string} ipAddr - Địa chỉ IP của người dùng
 * @returns {Object} Thông tin URL thanh toán và mã đơn hàng
 */
const createVNPayOrder = async (payment, ticket, ipAddr) => {
  try {
    const vnpay = initVNPay();

    // Tạo mã đơn hàng duy nhất theo format yêu cầu
    const orderId = `${payment.id}-${Date.now()}-${Math.random()
      .toString(36)
      .substring(2, 7)}`;
    const amount = Math.round(payment.amount); // VNPay yêu cầu số tiền là VNĐ (không phải xu)

    // Thông tin movie cho orderInfo
    const movieInfo = ticket?.showtime?.movie?.title || "Vé xem phim";

    // URL để VNPay callback sau khi thanh toán
    const returnUrl =
      process.env.VNPAY_RETURN_URL ||
      `${process.env.BACKEND_URL}/payments/vnpay-return`;

    // Xử lý địa chỉ IP
    const safeIpAddr =
      ipAddr === "::1" || ipAddr === "::ffff:127.0.0.1" ? "127.0.0.1" : ipAddr;

    // Tạo URL thanh toán sử dụng phương thức buildPaymentUrl của thư viện
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount * 100, // VNPay yêu cầu số tiền * 100
      vnp_IpAddr: safeIpAddr,
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan ${movieInfo}, ma don hang: ${orderId}`,
      vnp_OrderType: "190000", // Mã danh mục hàng hóa - Dịch vụ giải trí
      vnp_ReturnUrl: returnUrl,
      vnp_BankCode: "", // Để trống để hiển thị tất cả các phương thức thanh toán
      vnp_Locale: "vn", // Ngôn ngữ hiển thị: vn hoặc en
    });

    // Lưu ID đơn hàng vào payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        appTransId: orderId,
        additionalData: JSON.stringify({
          vnpayOrderId: orderId,
          amount: amount * 100,
          createdAt: new Date().toISOString(),
        }),
      },
    });

    return {
      paymentUrl,
      orderToken: orderId,
    };
  } catch (error) {
    console.error("Error creating VNPay order:", error);
    throw new Error(`Lỗi tạo đơn hàng VNPay: ${error.message}`);
  }
};

/**
 * Xử lý kết quả thanh toán từ VNPay (Return URL)
 * @param {Object} returnData - Dữ liệu trả về từ VNPay
 * @returns {Object} Kết quả xử lý
 */
const processVNPayReturn = async (returnData) => {
  try {
    console.log("VNPay return data for verification:", returnData);

    const vnpay = initVNPay();

    // Kiểm tra chữ ký sử dụng thư viện
    const isValidSignature = vnpay.verifyReturnUrl(returnData);

    if (!isValidSignature) {
      console.error("Invalid signature detected:", returnData.vnp_SecureHash);
      throw new Error("Chữ ký không hợp lệ, dữ liệu có thể đã bị thay đổi");
    }

    // Lấy thông tin giao dịch
    const orderId = returnData.vnp_TxnRef;
    const responseCode = returnData.vnp_ResponseCode;
    const transactionId = returnData.vnp_TransactionNo;

    // Tìm payment dựa trên orderId (trích xuất payment ID từ orderId)
    const paymentId = parseInt(orderId.split("-")[0]);
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error("Không tìm thấy thông tin thanh toán");
    }

    // Xử lý theo response code từ VNPay
    if (responseCode === "00") {
      // Thanh toán thành công
      if (payment.status !== "COMPLETED") {
        await paymentService.updatePaymentStatus(paymentId, "COMPLETED");
        // Cập nhật transactionId từ VNPay
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            transactionId: transactionId,
            paymentDate: new Date(),
            additionalData: JSON.stringify({
              ...JSON.parse(payment.additionalData || "{}"),
              vnpResponseCode: responseCode,
              vnpTransactionId: transactionId,
              completedAt: new Date().toISOString(),
            }),
          },
        });
      }

      return {
        success: true,
        paymentId,
        message: "Thanh toán thành công",
      };
    } else {
      // Thanh toán thất bại
      if (payment.status === "PENDING") {
        await paymentService.updatePaymentStatus(paymentId, "FAILED");
        // Cập nhật thông tin lỗi
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            additionalData: JSON.stringify({
              ...JSON.parse(payment.additionalData || "{}"),
              vnpResponseCode: responseCode,
              failedAt: new Date().toISOString(),
            }),
          },
        });
      }

      return {
        success: false,
        paymentId,
        message: "Thanh toán thất bại",
        responseCode,
      };
    }
  } catch (error) {
    console.error("Error processing VNPay return data:", error);
    throw new Error(`Lỗi xử lý dữ liệu trả về từ VNPay: ${error.message}`);
  }
};

/**
 * Xử lý IPN (Instant Payment Notification) từ VNPay
 * @param {Object} ipnData - Dữ liệu IPN từ VNPay
 * @returns {Object} Kết quả xử lý theo định dạng yêu cầu của VNPay
 */
const processVNPayIPN = async (ipnData) => {
  try {
    console.log("IPN data received:", ipnData);

    const vnpay = initVNPay();

    // Xác thực chữ ký từ VNPay
    const isValidSignature = vnpay.verifyReturnUrl(ipnData);

    if (!isValidSignature) {
      console.error("IPN - Invalid signature detected");
      return {
        RspCode: "97",
        Message: "Invalid signature",
      };
    }

    // Lấy thông tin giao dịch
    const orderId = ipnData.vnp_TxnRef;
    const responseCode = ipnData.vnp_ResponseCode;
    const transactionId = ipnData.vnp_TransactionNo;

    // Tìm payment dựa trên orderId
    const paymentId = parseInt(orderId.split("-")[0]);
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return {
        RspCode: "01",
        Message: "Order not found",
      };
    }

    // Kiểm tra số tiền thanh toán
    const additionalData = payment.additionalData
      ? JSON.parse(payment.additionalData)
      : {};

    if (
      ipnData.vnp_Amount &&
      parseInt(ipnData.vnp_Amount) !== additionalData.amount
    ) {
      return {
        RspCode: "04",
        Message: "Invalid amount",
      };
    }

    // Xử lý theo response code từ VNPay
    if (responseCode === "00") {
      // Thanh toán thành công
      if (payment.status !== "COMPLETED") {
        await paymentService.updatePaymentStatus(paymentId, "COMPLETED");
        // Cập nhật transactionId và thông tin bổ sung
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            transactionId: transactionId,
            paymentDate: new Date(),
            additionalData: JSON.stringify({
              ...additionalData,
              vnpResponseCode: responseCode,
              vnpTransactionId: transactionId,
              ipnProcessedAt: new Date().toISOString(),
            }),
          },
        });
      }
    } else {
      // Thanh toán thất bại
      if (payment.status === "PENDING") {
        await paymentService.updatePaymentStatus(paymentId, "FAILED");
        // Cập nhật thông tin lỗi
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            additionalData: JSON.stringify({
              ...additionalData,
              vnpResponseCode: responseCode,
              ipnProcessedAt: new Date().toISOString(),
              failedReason: `ResponseCode: ${responseCode}`,
            }),
          },
        });
      }
    }

    // VNPay yêu cầu trả về mã 00 để xác nhận đã nhận được IPN
    return {
      RspCode: "00",
      Message: "Confirm success",
    };
  } catch (error) {
    console.error("Error processing VNPay IPN:", error);
    return {
      RspCode: "99",
      Message: "Unknown error",
    };
  }
};

/**
 * Kiểm tra trạng thái giao dịch VNPay
 * @param {Object} payment - Thông tin payment từ DB
 * @param {string} ipAddress - Địa chỉ IP của người dùng
 * @returns {Object} Kết quả kiểm tra trạng thái
 */
const checkTransactionStatus = async (payment, ipAddress) => {
  try {
    if (!payment.appTransId || payment.method !== "VNPAY") {
      throw new Error("Giao dịch này không được xử lý bởi VNPay");
    }

    // Khởi tạo vnpay
    const vnpay = initVNPay();

    // Kiểm tra xem đã có kết quả cache chưa (để tránh duplicate request)
    const additionalData = payment.additionalData
      ? JSON.parse(payment.additionalData)
      : {};

    // Thêm kiểm tra thời gian truy vấn gần đây
    const lastQueryTime = additionalData.lastQueryTime
      ? new Date(additionalData.lastQueryTime)
      : null;
    const currentTime = new Date();

    // Nếu đã truy vấn trong vòng 30 giây, trả về kết quả đã lưu
    if (lastQueryTime && currentTime - lastQueryTime < 30000) {
      return {
        responseCode: additionalData.lastQueryResponseCode || "99",
        message: "Đã truy vấn gần đây, vui lòng thử lại sau 30 giây",
        transactionStatus:
          additionalData.lastQueryTransactionStatus || "Unknown",
        transactionId:
          additionalData.lastQueryTransactionId || payment.transactionId,
        paymentId: payment.id,
        appTransId: payment.appTransId,
        status: payment.status,
        cached: true,
        nextQueryAllowed: new Date(
          lastQueryTime.getTime() + 30000
        ).toISOString(),
      };
    }

    // Nếu giao dịch đã hoàn tất, trả về thông tin từ cache
    if (
      additionalData.queryResult &&
      additionalData.queryResult.responseCode === "00" &&
      additionalData.queryResult.transactionStatus === "00"
    ) {
      return {
        responseCode: additionalData.queryResult.responseCode,
        message: "Giao dịch đã xác nhận thành công trước đó",
        transactionStatus: additionalData.queryResult.transactionStatus,
        transactionId:
          additionalData.queryResult.transactionId || payment.transactionId,
        paymentId: payment.id,
        appTransId: payment.appTransId,
        status: payment.status,
        cached: true,
      };
    }

    // Xử lý địa chỉ IP
    const safeIpAddr =
      ipAddress === "::1" || ipAddress === "::ffff:127.0.0.1"
        ? "127.0.0.1"
        : ipAddress;

    // Lấy thời gian tạo từ additionalData hoặc payment
    // Sử dụng các hàm đúng từ thư viện vnpay
    let transDate;
    if (additionalData.createdAt) {
      const createdAt = new Date(additionalData.createdAt);
      transDate = dateFormat(getDateInGMT7(createdAt));
    } else if (payment.createdAt) {
      const createdAt = new Date(payment.createdAt);
      transDate = dateFormat(getDateInGMT7(createdAt));
    } else {
      transDate = dateFormat(getDateInGMT7(new Date()));
    }

    // Tạo một ID request ngẫu nhiên
    const requestId = `REQ_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 7)}`;

    // Sử dụng phương thức queryDr của thư viện
    const result = await vnpay.queryDr({
      vnp_RequestId: requestId,
      vnp_TxnRef: payment.appTransId,
      vnp_OrderInfo: `Truy van giao dich ${payment.appTransId}`,
      vnp_TransactionDate: transDate,
      vnp_IpAddr: safeIpAddr,
      vnp_CreateDate: dateFormat(getDateInGMT7(new Date())), // Thêm thời gian hiện tại
    });

    console.log("VNPay API response:", result);

    // Cập nhật thời gian truy vấn cuối để tránh request trùng lặp
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        additionalData: JSON.stringify({
          ...additionalData,
          lastQueryTime: new Date().toISOString(),
          lastQueryResponseCode: result.vnp_ResponseCode || "99",
          lastQueryTransactionStatus: result.vnp_TransactionStatus || "Unknown",
          lastQueryTransactionId: result.vnp_TransactionNo || null,
        }),
      },
    });

    // Cập nhật trạng thái payment nếu cần
    if (result.vnp_ResponseCode === "00" && result.vnp_TransactionStatus) {
      if (
        result.vnp_TransactionStatus === "00" &&
        payment.status !== "COMPLETED"
      ) {
        await paymentService.updatePaymentStatus(payment.id, "COMPLETED");
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            transactionId: result.vnp_TransactionNo,
            additionalData: JSON.stringify({
              ...additionalData,
              queryResult: {
                responseCode: result.vnp_ResponseCode,
                transactionStatus: result.vnp_TransactionStatus,
                transactionId: result.vnp_TransactionNo,
                checkAt: new Date().toISOString(),
              },
            }),
          },
        });
      } else if (
        result.vnp_TransactionStatus !== "00" &&
        payment.status === "PENDING"
      ) {
        await paymentService.updatePaymentStatus(payment.id, "FAILED");
      }
    }

    // Phân tích kết quả truy vấn
    return {
      responseCode: result.vnp_ResponseCode || "99",
      message: result.vnp_Message || "Không xác định",
      transactionStatus: result.vnp_TransactionStatus || "Unknown",
      transactionId: result.vnp_TransactionNo || null,
      paymentId: payment.id,
      appTransId: payment.appTransId,
      status: payment.status,
    };
  } catch (error) {
    console.error("Error checking VNPay transaction status:", error);
    return {
      responseCode: "99",
      message: `Lỗi kiểm tra trạng thái giao dịch VNPay: ${error.message}`,
      status: payment?.status || "UNKNOWN",
      paymentId: payment?.id,
      appTransId: payment?.appTransId,
      error: true,
    };
  }
};

/**
 * Mô phỏng thanh toán thành công (cho môi trường test)
 * @param {number} paymentId - ID của payment
 * @returns {Object} Kết quả mô phỏng
 */
const simulatePaymentSuccess = async (paymentId) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error("Payment not found");
    }

    if (payment.method !== "VNPAY") {
      throw new Error("This payment is not using VNPay");
    }

    // Giả lập transactionId từ VNPay
    const simulatedTransactionId = `VNPAY_SIM_${Date.now()}`;

    // Cập nhật trạng thái thanh toán và thêm transactionId
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: "COMPLETED",
        transactionId: simulatedTransactionId,
        paymentDate: new Date(),
        additionalData: JSON.stringify({
          ...JSON.parse(payment.additionalData || "{}"),
          simulatedAt: new Date().toISOString(),
          simulatedTransactionId: simulatedTransactionId,
        }),
      },
    });

    // Cập nhật trạng thái các vé
    await paymentService.updatePaymentStatus(paymentId, "COMPLETED");

    return {
      success: true,
      message: "Đã mô phỏng thanh toán thành công",
      paymentId,
      transactionId: simulatedTransactionId,
    };
  } catch (error) {
    console.error("Error simulating VNPay payment success:", error);
    throw new Error(`Lỗi mô phỏng thanh toán thành công: ${error.message}`);
  }
};

module.exports = {
  createVNPayOrder,
  processVNPayReturn,
  processVNPayIPN,
  checkTransactionStatus,
  simulatePaymentSuccess,
};
