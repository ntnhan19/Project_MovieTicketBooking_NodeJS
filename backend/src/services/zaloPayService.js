const axios = require('axios');
const CryptoJS = require('crypto-js');
const uuid = require('uuid');
const { promisify } = require('util');
const prisma = require('../../prisma/prisma');

// Thông tin cấu hình ZaloPay - thay thế bằng thông tin từ tài khoản ZaloPay Merchant của bạn
const config = {
  app_id: "553",           // ID ứng dụng ZaloPay (sandbox)
  key1: "9phuAOYhan4urywHTh0ndEXiV3pKHr5Q",  // Key 1 (sandbox)
  key2: "Iyz2habzyr7AG8SgvoBCbKwKi3UzlLi3", // Key 2 (sandbox)
  endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder", // Endpoint tạo đơn hàng (sandbox)
  callback_url: "https://your-server-url.com/api/payments/zalopay-callback",  // URL callback
  redirect_url: "https://your-frontend-url.com/payment/result" // URL điều hướng sau khi thanh toán
};

// Cập nhật hàm để hỗ trợ nhiều ticket trong một payment
const createZaloPayOrder = async (payment, tickets) => {
  try {
    // Sử dụng tickets là một mảng thay vì một ticket duy nhất
    if (!Array.isArray(tickets) || tickets.length === 0) {
      throw new Error('Phải có ít nhất một vé để tạo đơn hàng');
    }

    // Tạo mã đơn hàng unique
    const appTransId = `${config.app_id}_${uuid.v4()}`; 
    
    // Thông tin đơn hàng
    const embed_data = {
      ticketIds: tickets.map(ticket => ticket.id), // Lưu tất cả ID của vé
      redirecturl: config.redirect_url,
      // Thông tin khuyến mãi nếu có
      promotioninfo: tickets[0].promotion ? JSON.stringify(tickets[0].promotion) : ""
    };

    // Tạo mô tả đơn hàng dựa trên các vé
    let orderInfo = "Thanh toan ve xem phim";
    if (tickets[0].showtime && tickets[0].showtime.movie) {
      // Nếu tất cả vé cùng xem một phim
      const movieTitle = tickets[0].showtime.movie.title;
      if (tickets.length > 1) {
        orderInfo = `Thanh toan ${tickets.length} ve xem phim ${movieTitle}`;
      } else {
        orderInfo = `Thanh toan ve xem phim ${movieTitle}`;
      }
    }
    
    // Tạo thông tin chi tiết về các ghế
    let seatInfo = tickets.map(ticket => {
      if (ticket.seat) {
        return `Ghế ${ticket.seat.row}${ticket.seat.column || ticket.seat.number}`;
      }
      return "";
    }).filter(info => info !== "").join(", ");
    
    // Thông tin các món hàng
    const items = tickets.map(ticket => ({
      itemid: `ticket_${ticket.id}`,
      itemname: ticket.showtime?.movie?.title || "Vé xem phim",
      itemprice: ticket.price * 100, // ZaloPay yêu cầu số tiền tính bằng đơn vị xu (1đ = 100 xu)
      itemquantity: 1,
      itemdescription: ticket.seat ? `Ghế ${ticket.seat.row}${ticket.seat.column || ticket.seat.number}` : ""
    }));

    // Data để tạo order
    const order = {
      app_id: config.app_id,
      app_trans_id: appTransId,
      app_user: tickets[0].userId.toString(),
      app_time: Date.now(), // Thời gian đặt đơn
      amount: payment.amount * 100, // Chuyển đổi đơn vị từ VNĐ sang Xu
      item: JSON.stringify(items),
      description: orderInfo,
      embed_data: JSON.stringify(embed_data),
      bank_code: "zalopayapp", // Mặc định qua ví ZaloPay
      callback_url: config.callback_url
    };

    // Tạo MAC
    const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" 
            + order.app_time + "|" + order.embed_data + "|" + order.item;
    order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    // Gọi API ZaloPay để tạo đơn hàng
    const response = await axios.post(config.endpoint, order);
    
    // Cập nhật thông tin ZaloPay vào payment
    await prisma.payment.update({
      where: { id: payment.id },
      data: { 
        appTransId: appTransId,
        orderToken: response.data.order_token,
        zaloPayOrderData: JSON.stringify(response.data),
        paymentUrl: response.data.order_url
      }
    });

    return {
      paymentUrl: response.data.order_url,
      appTransId: appTransId,
      orderToken: response.data.order_token,
      return_code: response.data.return_code,
      return_message: response.data.return_message
    };
  } catch (error) {
    console.error("ZaloPay Create Order Error:", error);
    throw new Error(`Không thể tạo đơn hàng ZaloPay: ${error.message}`);
  }
};

// Kiểm tra trạng thái thanh toán
const checkPaymentStatus = async (appTransId) => {
  try {
    // Mac = Hmac_SHA256(AppId + "|" + AppTransId + "|" + Key1)
    const data = config.app_id + "|" + appTransId + "|" + config.key1;
    const mac = CryptoJS.HmacSHA256(data, config.key1).toString();

    const response = await axios.post('https://sandbox.zalopay.com.vn/v001/tpe/getstatusbyapptransid', {
      app_id: config.app_id,
      app_trans_id: appTransId,
      mac: mac
    });

    return response.data;
  } catch (error) {
    console.error("ZaloPay Check Status Error:", error);
    throw error;
  }
};

// Xác minh callback từ ZaloPay
const verifyCallback = (requestData) => {
  try {
    const { data, mac } = requestData;
    
    // Tạo chuỗi dùng để kiểm tra chữ ký
    const dataStr = JSON.stringify(data);
    
    // Tính toán HMAC
    const mac2 = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
    
    // So sánh MAC từ ZaloPay với MAC tính toán
    if (mac !== mac2) {
      console.error("ZaloPay callback verification failed: MAC mismatch");
      return { verified: false };
    }
    
    return { 
      verified: true,
      data: data
    };
  } catch (error) {
    console.error("ZaloPay callback verification error:", error);
    return { verified: false };
  }
};

// Xử lý dữ liệu callback từ ZaloPay
const processZaloPayCallback = async (callbackData) => {
  try {
    const verifyResult = verifyCallback(callbackData);
    
    if (!verifyResult.verified) {
      return {
        return_code: 3, // ZaloPay error code for verification failure
        return_message: "MAC not match"
      };
    }
    
    const { data } = verifyResult;
    const { app_trans_id, amount, embed_data, status } = data;
    
    // Parse embed_data để lấy ticketIds
    const embedData = JSON.parse(embed_data);
    const ticketIds = embedData.ticketIds || [];
    
    // Tìm payment theo app_trans_id
    const payment = await prisma.payment.findFirst({
      where: { appTransId: app_trans_id },
      include: {
        ticket: true
      }
    });
    
    if (!payment) {
      return {
        return_code: 2, // ZaloPay error code for order not found
        return_message: "Order not found"
      };
    }
    
    // Cập nhật trạng thái thanh toán
    const paymentStatus = status === 1 ? 'COMPLETED' : 'FAILED';
    
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: paymentStatus,
        transactionId: app_trans_id,
        paymentDate: status === 1 ? new Date() : null,
        updatedAt: new Date()
      }
    });
    
    // Cập nhật trạng thái tất cả các vé liên quan đến payment này
    if (status === 1) {
      // Nếu thanh toán thành công, chuyển trạng thái vé thành CONFIRMED
      await prisma.ticket.updateMany({
        where: { 
          paymentId: payment.id 
        },
        data: { status: "CONFIRMED" }
      });
    } else {
      // Nếu thanh toán thất bại, chuyển trạng thái vé thành CANCELLED
      await prisma.ticket.updateMany({
        where: { 
          paymentId: payment.id 
        },
        data: { status: "CANCELLED" }
      });
      
      // Mở khóa các ghế của các vé bị hủy
      const tickets = await prisma.ticket.findMany({
        where: { paymentId: payment.id },
        select: { seatId: true }
      });
      
      const seatIds = tickets.map(ticket => ticket.seatId).filter(id => id !== null);
      
      if (seatIds.length > 0) {
        await prisma.seat.updateMany({
          where: { id: { in: seatIds } },
          data: { status: "AVAILABLE" }
        });
      }
    }
    
    return {
      return_code: 1, // ZaloPay success code
      return_message: "success"
    };
  } catch (error) {
    console.error("Error processing ZaloPay callback:", error);
    return {
      return_code: 0,
      return_message: "Unknown error"
    };
  }
};

// Thêm hàm kiểm tra kết quả callback
const isValidCallback = (data) => {
  // Kiểm tra các trường bắt buộc
  const requiredFields = ['app_id', 'app_trans_id', 'amount', 'status'];
  for (const field of requiredFields) {
    if (!data[field]) {
      console.error(`Missing required field: ${field}`);
      return false;
    }
  }
  
  // Kiểm tra app_id có khớp với cấu hình không
  if (data.app_id !== config.app_id) {
    console.error(`Invalid app_id: ${data.app_id}`);
    return false;
  }
  
  return true;
};

// Thêm hàm mô phỏng thanh toán thành công để test
const simulatePaymentSuccess = async (paymentId) => {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(paymentId) },
      include: { ticket: true }
    });
    
    if (!payment || !payment.appTransId) {
      throw new Error('Payment not found or not processed by ZaloPay');
    }
    
    // Cập nhật trạng thái thanh toán
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'COMPLETED',
        transactionId: payment.appTransId,
        paymentDate: new Date(),
        updatedAt: new Date()
      }
    });
    
    // Cập nhật trạng thái tất cả các vé liên quan
    await prisma.ticket.updateMany({
      where: { paymentId: payment.id },
      data: { status: "CONFIRMED" }
    });
    
    return {
      success: true,
      message: 'Payment simulated successfully'
    };
  } catch (error) {
    console.error('Error simulating payment:', error);
    throw error;
  }
};

// Xuất hàm mới
module.exports = {
  createZaloPayOrder,
  checkPaymentStatus,
  verifyCallback,
  processZaloPayCallback,
  simulatePaymentSuccess,
  isValidCallback
};