// backend/src/services/paymentService.js
const prisma = require('../../prisma/prisma');

const createPayment = async ({ ticketId, amount, method }) => {
  // Kiểm tra xem vé có tồn tại không
  const ticket = await prisma.ticket.findUnique({
    where: { id: ticketId }
  });

  if (!ticket) {
    throw new Error('Ticket not found');
  }

  // Kiểm tra xem vé đã có thanh toán chưa
  const existingPayment = await prisma.payment.findUnique({
    where: { ticketId }
  });

  if (existingPayment) {
    throw new Error('Payment already exists for this ticket');
  }

  // Tạo thanh toán mới
  const payment = await prisma.payment.create({
    data: {
      ticketId,
      amount,
      method,
      status: 'PENDING'
    }
  });

  return payment;
};

const getPaymentById = async (id) => {
  return await prisma.payment.findUnique({
    where: { id },
    include: {
      ticket: {
        include: {
          user: true,
          showtime: {
            include: {
              movie: true,
              hall: true
            }
          }
        }
      }
    }
  });
};

const getPaymentByTicketId = async (ticketId) => {
  return await prisma.payment.findUnique({
    where: { ticketId },
    include: {
      ticket: {
        include: {
          user: true,
          showtime: {
            include: {
              movie: true,
              hall: true
            }
          }
        }
      }
    }
  });
};

const updatePaymentStatus = async (id, status) => {
  const payment = await prisma.payment.update({
    where: { id },
    data: { status }
  });

  // Nếu thanh toán thành công, cập nhật trạng thái vé thành CONFIRMED
  if (status === 'COMPLETED') {
    await prisma.ticket.update({
      where: { id: payment.ticketId },
      data: { status: 'CONFIRMED' }
    });
  }

  // Nếu thanh toán bị hủy, cập nhật trạng thái vé thành CANCELLED và mở khóa ghế
  if (status === 'CANCELLED') {
    const ticket = await prisma.ticket.update({
      where: { id: payment.ticketId },
      data: { status: 'CANCELLED' },
      include: { seat: true }
    });

    // Mở khóa ghế
    await prisma.seat.update({
      where: { id: ticket.seatId },
      data: { status: 'AVAILABLE' }
    });
  }

  return payment;
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentByTicketId,
  updatePaymentStatus
};