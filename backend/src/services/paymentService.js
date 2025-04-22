// frontend/src/services/paymentService.js
const prisma = require("../../prisma/prisma");

const createPayment = async ({ tickets, method }) => {
  // Kiểm tra xem có ticket nào không
  if (!tickets || !Array.isArray(tickets) || tickets.length === 0) {
    throw new Error('Không có vé để thanh toán');
  }

  // Lấy ticket IDs
  const ticketIds = tickets.map(ticket => ticket.id);
  
  // Kiểm tra xem có payment nào đã tồn tại cho các vé này chưa
  const existingPayment = await prisma.payment.findFirst({
    where: {
      tickets: {  // Sửa từ ticket thành tickets để khớp với schema Prisma
        some: {
          id: { in: ticketIds }
        }
      }
    }
  });

  if (existingPayment) {
    throw new Error('Payment already exists for one or more tickets');
  }

  // Kiểm tra method hợp lệ
  const validMethods = ['CREDIT_CARD', 'BANK_TRANSFER', 'E_WALLET', 'CASH', 'ZALOPAY', 'VNPAY', 'MOMO'];
  if (!validMethods.includes(method)) {
    method = 'CREDIT_CARD'; // Mặc định là CREDIT_CARD nếu method không hợp lệ
  }

  // Tính tổng số tiền thanh toán từ tất cả các vé
  let totalAmount = 0;
  
  tickets.forEach(ticket => {
    let amount = ticket.price || 0;
    
    // Đảm bảo giá không âm
    amount = Math.max(0, amount);
    
    // Cộng vào tổng số tiền
    totalAmount += amount;
  });
  
  // Làm tròn số tiền đến 2 chữ số thập phân
  totalAmount = Math.round(totalAmount * 100) / 100;

  // Tạo thanh toán mới
  const payment = await prisma.payment.create({
    data: {
      amount: totalAmount,
      method,
      status: 'PENDING',
      createdAt: new Date(),
      tickets: {  // Sửa từ ticket thành tickets
        connect: ticketIds.map(id => ({ id }))
      }
    },
    include: {
      tickets: {  // Sửa từ ticket thành tickets
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          showtime: {
            include: {
              movie: true,
              hall: true
            }
          },
          seat: true,
          promotion: true
        }
      }
    }
  });

  return payment;
};

// Lấy thông tin thanh toán theo ID
const getPaymentById = async (id) => {
  return await prisma.payment.findUnique({
    where: { id },
    include: {
      tickets: {  // Sửa từ ticket thành tickets
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          showtime: {
            include: {
              movie: true,
              hall: true,
            },
          },
          seat: true,
          promotion: true
        },
      },
    },
  });
};

// Lấy thông tin thanh toán theo ticketId
const getPaymentByTicketId = async (ticketId) => {
  return await prisma.payment.findFirst({
    where: {
      tickets: {  // Sửa từ ticket thành tickets
        some: {
          id: ticketId
        }
      }
    },
    include: {
      tickets: {  // Sửa từ ticket thành tickets
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true
            }
          },
          showtime: {
            include: {
              movie: true,
              hall: true,
            },
          },
          seat: true,
          promotion: true
        },
      },
    },
  });
};

// Cập nhật trạng thái thanh toán
const updatePaymentStatus = async (id, status) => {
  const payment = await prisma.payment.update({
    where: { id },
    data: { 
      status,
      updatedAt: new Date(),
      ...(status === 'COMPLETED' ? { paymentDate: new Date() } : {})
    },
    include: {
      tickets: {  // Sửa từ ticket thành tickets
        include: {
          seat: true
        }
      }
    }
  });

  // Nếu thanh toán thành công, cập nhật trạng thái tất cả các vé thành CONFIRMED
  if (status === "COMPLETED") {
    await prisma.ticket.updateMany({
      where: { 
        id: {
          in: payment.tickets.map(ticket => ticket.id)  // Sửa từ ticket thành tickets
        }
      },
      data: { status: "CONFIRMED" },
    });
  }

  // Nếu thanh toán bị hủy hoặc thất bại, cập nhật trạng thái vé thành CANCELLED và mở khóa ghế
  if (status === "CANCELLED" || status === "FAILED") {
    const ticketIds = payment.tickets.map(ticket => ticket.id);  // Sửa từ ticket thành tickets
    
    // Cập nhật trạng thái các vé
    await prisma.ticket.updateMany({
      where: { 
        id: {
          in: ticketIds
        }
      },
      data: { status: "CANCELLED" },
    });

    // Mở khóa tất cả các ghế
    for (const ticket of payment.tickets) {  // Sửa từ ticket thành tickets
      if (ticket.seat) {
        await prisma.seat.update({
          where: { id: ticket.seat.id },
          data: { status: "AVAILABLE" },
        });
      }
    }
  }

  return await getPaymentById(id);
};

// Lấy tất cả thanh toán của một người dùng
const getPaymentsByUserId = async (userId) => {
  return await prisma.payment.findMany({
    where: {
      tickets: {  // Sửa từ ticket thành tickets
        some: {
          userId: userId
        }
      }
    },
    include: {
      tickets: {  // Sửa từ ticket thành tickets
        include: {
          showtime: {
            include: {
              movie: true,
              hall: true
            }
          },
          seat: true,
          promotion: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentByTicketId,
  updatePaymentStatus,
  getPaymentsByUserId
};