// backend/src/services/vnpayService.js
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  getDateInGMT7,
  dateFormat,
} = require('vnpay');
const prisma = require('../../prisma/prisma');
const paymentService = require('./paymentService');
const seatService = require('./seatService');
const crypto = require('crypto');
const { URLSearchParams } = require('url');

const initVNPay = () => {
  return new VNPay({
    tmnCode: process.env.VNPAY_TMN_CODE || 'XMXDOF6C',
    secureSecret: process.env.VNPAY_SECRET_KEY || 'PTURY5JJM1OHGNOH8VVFZ0OAKCHE53EY',
    vnpayHost: process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn',
    paymentGateway: '/paymentv2/vpcpay.html',
    testMode: process.env.NODE_ENV !== 'production',
    hashAlgorithm: 'SHA512',
    enableLog: true,
  });
};

const createVNPaySignature = (params, secretKey) => {
  const sortedParams = {};
  const sortedKeys = Object.keys(params).sort();
  sortedKeys.forEach((key) => {
    if (
      params[key] !== undefined &&
      params[key] !== null &&
      params[key] !== '' &&
      key.startsWith('vnp_') &&
      key !== 'vnp_SecureHash' &&
      key !== 'vnp_SecureHashType'
    ) {
      sortedParams[key] = String(params[key]);
    }
  });

  const signData = Object.keys(sortedParams)
    .map((key) => `${key}=${encodeURIComponent(sortedParams[key]).replace(/%20/g, '+')}`)
    .join('&');

  const hmac = crypto.createHmac('sha512', secretKey);
  const signature = hmac.update(signData).digest('hex');
  return signature;
};

const verifyVNPaySignature = (params) => {
  const secureSecret = process.env.VNPAY_SECRET_KEY || 'PTURY5JJM1OHGNOH8VVFZ0OAKCHE53EY';
  const receivedSignature = params.vnp_SecureHash;
  const paramsForSigning = { ...params };
  delete paramsForSigning.vnp_SecureHash;
  delete paramsForSigning.vnp_SecureHashType;

  const calculatedSignature = createVNPaySignature(paramsForSigning, secureSecret);
  return receivedSignature === calculatedSignature;
};

const createVNPayOrder = async (payment, ticket, ipAddr) => {
  try {
    const orderId = `${payment.id}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const amount = Math.round(payment.amount);
    const movieInfo = ticket?.showtime?.movie?.title || 'Vé xem phim';
    const returnUrl = process.env.VNPAY_RETURN_URL || `${process.env.BACKEND_URL}/payments/vnpay-return`;
    const safeIpAddr = ipAddr === '::1' || ipAddr === '::ffff:127.0.0.1' ? '127.0.0.1' : ipAddr;
    const now = new Date();
    const vnp_CreateDate = dateFormat(getDateInGMT7(now));

    const paymentParams = {
      vnp_Version: '2.1.0',
      vnp_Command: 'pay',
      vnp_TmnCode: process.env.VNPAY_TMN_CODE || 'XMXDOF6C',
      vnp_Amount: String(amount * 100),
      vnp_CurrCode: 'VND',
      vnp_TxnRef: orderId,
      vnp_OrderInfo: `Thanh toan ve xem phim ${orderId}`,
      vnp_OrderType: '190000',
      vnp_Locale: 'vn',
      vnp_ReturnUrl: returnUrl,
      vnp_IpAddr: safeIpAddr,
      vnp_CreateDate: String(vnp_CreateDate),
    };

    const secureSecret = process.env.VNPAY_SECRET_KEY || 'PTURY5JJM1OHGNOH8VVFZ0OAKCHE53EY';
    const signature = createVNPaySignature(paymentParams, secureSecret);
    paymentParams.vnp_SecureHash = signature;
    paymentParams.vnp_SecureHashType = 'SHA512';

    const baseUrl = `${process.env.VNPAY_HOST || 'https://sandbox.vnpayment.vn'}/paymentv2/vpcpay.html`;
    const queryParams = new URLSearchParams();
    Object.keys(paymentParams).forEach((key) => {
      queryParams.append(key, paymentParams[key]);
    });

    const paymentUrl = `${baseUrl}?${queryParams.toString()}`;

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
    console.error('Error creating VNPay order:', error);
    throw new Error(`Lỗi tạo đơn hàng VNPay: ${error.message}`);
  }
};

const processVNPayReturn = async (returnData) => {
  try {
    const isValidSignature = verifyVNPaySignature(returnData);
    if (!isValidSignature) {
      throw new Error('Chữ ký không hợp lệ, dữ liệu có thể đã bị thay đổi');
    }

    const orderId = returnData.vnp_TxnRef;
    const responseCode = returnData.vnp_ResponseCode;
    const transactionId = returnData.vnp_TransactionNo;
    const paymentId = parseInt(orderId.split('-')[0]);

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: {
        tickets: {
          include: {
            seat: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error('Không tìm thấy thông tin thanh toán');
    }

    const seatIds = payment.tickets.map((ticket) => ticket.seat.id);
    const userId = payment.tickets[0]?.userId;
    const showtimeId = payment.tickets[0]?.showtimeId;

    if (responseCode === '00') {
      if (payment.status !== 'COMPLETED') {
        await paymentService.updatePaymentStatus(paymentId, 'COMPLETED');
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            transactionId: transactionId,
            paymentDate: new Date(),
            additionalData: JSON.stringify({
              ...JSON.parse(payment.additionalData || '{}'),
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
        message: 'Thanh toán thành công',
        seatIds,
      };
    } else {
      if (payment.status === 'PENDING') {
        await paymentService.updatePaymentStatus(paymentId, 'FAILED');
        await prisma.payment.update({
          where: { id: paymentId },
          data: {
            additionalData: JSON.stringify({
              ...JSON.parse(payment.additionalData || '{}'),
              vnpResponseCode: responseCode,
              failedAt: new Date().toISOString(),
            }),
          },
        });
        if (seatIds.length > 0 && userId) {
          const unlockResult = await seatService.unlockMultipleSeats(seatIds, userId);
          if (unlockResult.seatIds.length > 0 && showtimeId) {
            // Gửi thông báo real-time sẽ xử lý trong paymentController
          }
        }
      }

      return {
        success: false,
        paymentId,
        message: 'Thanh toán thất bại',
        responseCode,
        seatIds,
      };
    }
  } catch (error) {
    console.error('Error processing VNPay return data:', error);
    throw new Error(`Lỗi xử lý dữ liệu trả về từ VNPay: ${error.message}`);
  }
};

const processVNPayIPN = async (ipnData) => {
  try {
    const isValidSignature = verifyVNPaySignature(ipnData);
    if (!isValidSignature) {
      return {
        RspCode: '97',
        Message: 'Invalid signature',
      };
    }

    const orderId = ipnData.vnp_TxnRef;
    const responseCode = ipnData.vnp_ResponseCode;
    const transactionId = ipnData.vnp_TransactionNo;
    const paymentId = parseInt(orderId.split('-')[0]);

    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return {
        RspCode: '01',
        Message: 'Order not found',
      };
    }

    const additionalData = payment.additionalData ? JSON.parse(payment.additionalData) : {};
    if (ipnData.vnp_Amount && parseInt(ipnData.vnp_Amount) !== additionalData.amount) {
      return {
        RspCode: '04',
        Message: 'Invalid amount',
      };
    }

    if (responseCode === '00') {
      if (payment.status !== 'COMPLETED') {
        await paymentService.updatePaymentStatus(paymentId, 'COMPLETED');
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
      if (payment.status === 'PENDING') {
        await paymentService.updatePaymentStatus(paymentId, 'FAILED');
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

    return {
      RspCode: '00',
      Message: 'Confirm success',
    };
  } catch (error) {
    console.error('Error processing VNPay IPN:', error);
    return {
      RspCode: '99',
      Message: 'Unknown error',
    };
  }
};

const checkTransactionStatus = async (payment, ipAddress) => {
  try {
    if (!payment.appTransId || payment.method !== 'VNPAY') {
      throw new Error('Giao dịch này không được xử lý bởi VNPay');
    }

    const vnpay = initVNPay();
    const additionalData = payment.additionalData ? JSON.parse(payment.additionalData) : {};
    const lastQueryTime = additionalData.lastQueryTime ? new Date(additionalData.lastQueryTime) : null;
    const currentTime = new Date();

    if (lastQueryTime && currentTime - lastQueryTime < 30000) {
      return {
        responseCode: additionalData.lastQueryResponseCode || '99',
        message: 'Đã truy vấn gần đây, vui lòng thử lại sau 30 giây',
        transactionStatus: additionalData.lastQueryTransactionStatus || 'Unknown',
        transactionId: additionalData.lastQueryTransactionId || payment.transactionId,
        paymentId: payment.id,
        appTransId: payment.appTransId,
        status: payment.status,
        cached: true,
        nextQueryAllowed: new Date(lastQueryTime.getTime() + 30000).toISOString(),
      };
    }

    if (
      additionalData.queryResult &&
      additionalData.queryResult.responseCode === '00' &&
      additionalData.queryResult.transactionStatus === '00'
    ) {
      return {
        responseCode: additionalData.queryResult.responseCode,
        message: 'Giao dịch đã xác nhận thành công trước đó',
        transactionStatus: additionalData.queryResult.transactionStatus,
        transactionId: additionalData.queryResult.transactionId || payment.transactionId,
        paymentId: payment.id,
        appTransId: payment.appTransId,
        status: payment.status,
        cached: true,
      };
    }

    const safeIpAddr = ipAddress === '::1' || ipAddress === '::ffff:127.0.0.1' ? '127.0.0.1' : ipAddress;
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

    const requestId = `REQ_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const queryParams = {
      vnp_RequestId: requestId,
      vnp_TxnRef: payment.appTransId,
      vnp_OrderInfo: `Truy van giao dich ${payment.appTransId}`,
      vnp_TransactionDate: transDate,
      vnp_IpAddr: safeIpAddr,
      vnp_CreateDate: dateFormat(getDateInGMT7(new Date())),
    };

    const result = await vnpay.queryDr(queryParams);

    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        additionalData: JSON.stringify({
          ...additionalData,
          lastQueryTime: new Date().toISOString(),
          lastQueryResponseCode: result.vnp_ResponseCode || '99',
          lastQueryTransactionStatus: result.vnp_TransactionStatus || 'Unknown',
          lastQueryTransactionId: result.vnp_TransactionNo || null,
        }),
      },
    });

    if (result.vnp_ResponseCode === '00' && result.vnp_TransactionStatus) {
      if (result.vnp_TransactionStatus === '00' && payment.status !== 'COMPLETED') {
        await paymentService.updatePaymentStatus(payment.id, 'COMPLETED');
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
      } else if (result.vnp_TransactionStatus !== '00' && payment.status === 'PENDING') {
        await paymentService.updatePaymentStatus(payment.id, 'FAILED');
      }
    }

    return {
      responseCode: result.vnp_ResponseCode || '99',
      message: result.vnp_Message || 'Không xác định',
      transactionStatus: result.vnp_TransactionStatus || 'Unknown',
      transactionId: result.vnp_TransactionNo || null,
      paymentId: payment.id,
      appTransId: payment.appTransId,
      status: payment.status,
    };
  } catch (error) {
    console.error('Error checking VNPay transaction status:', error);
    return {
      responseCode: '99',
      message: `Lỗi kiểm tra trạng thái giao dịch VNPay: ${error.message}`,
      status: payment?.status || 'UNKNOWN',
      paymentId: payment?.id,
      appTransId: payment?.appTransId,
      error: true,
    };
  }
};

const simulatePaymentSuccess = async (paymentId) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new Error('Payment not found');
    }

    if (payment.method !== 'VNPAY') {
      throw new Error('This payment is not using VNPay');
    }

    const simulatedTransactionId = `VNPAY_SIM_${Date.now()}`;
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'COMPLETED',
        transactionId: simulatedTransactionId,
        paymentDate: new Date(),
        additionalData: JSON.stringify({
          ...JSON.parse(payment.additionalData || '{}'),
          simulatedAt: new Date().toISOString(),
          simulatedTransactionId: simulatedTransactionId,
        }),
      },
    });

    await paymentService.updatePaymentStatus(paymentId, 'COMPLETED');

    return {
      success: true,
      message: 'Đã mô phỏng thanh toán thành công',
      paymentId,
      transactionId: simulatedTransactionId,
    };
  } catch (error) {
    console.error('Error simulating VNPay payment success:', error);
    throw new Error(`Lỗi mô phỏng thanh toán thành công: ${error.message}`);
  }
};

module.exports = {
  createVNPayOrder,
  processVNPayReturn,
  processVNPayIPN,
  checkTransactionStatus,
  simulatePaymentSuccess,
  verifyVNPaySignature,
  createVNPaySignature,
};