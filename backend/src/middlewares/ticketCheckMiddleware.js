// backend/src/middlewares/ticketCheckMiddleware.js
const prisma = require('../../prisma/prisma');

// Middleware kiểm tra người dùng đã mua vé xem phim chưa
const checkTicketPurchase = async (req, res, next) => {
  try {
    const userId = req.user?.userId || req.user?.id; // lấy từ token đã xác thực
    const movieId = parseInt(req.body.movieId); // lấy từ body thay vì params

    console.log('Debug - userId:', userId, 'movieId:', movieId);

    if (!userId || !movieId) {
      return res.status(400).json({ message: 'Thiếu thông tin userId hoặc movieId' });
    }

    const ticket = await prisma.ticket.findFirst({
      where: {
        userId: userId,
        showtime: {
          movieId: movieId,
        },
        status: {
          in: ['PENDING', 'CONFIRMED'], // loại CANCELLED ra cho hợp lý
        },
        payment: {
          status: 'COMPLETED',
        },
      },
    });

    if (!ticket) {
      return res.status(403).json({ 
        message: 'Bạn cần mua vé và thanh toán để thực hiện hành động này.'
      });
    }

    next();
  } catch (error) {
    console.error('Lỗi khi kiểm tra lịch sử mua vé:', error);
    res.status(500).json({ message: 'Lỗi máy chủ nội bộ' });
  }
};

module.exports = {
  checkTicketPurchase
};
