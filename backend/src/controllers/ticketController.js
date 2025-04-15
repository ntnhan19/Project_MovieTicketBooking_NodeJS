const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const ticketService = require('../services/ticketService');

// Tạo vé mới (POST /api/tickets)
const createTicket = async (req, res) => {
  try {
    const { userId, showtimeId, seatId, price } = req.body;

    // Validate input
    if (!userId || !showtimeId || !seatId || !price) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const showtime = await prisma.showtime.findUnique({ where: { id: showtimeId } });
    if (!showtime) return res.status(404).json({ message: 'Showtime not found' });

    const seat = await prisma.seat.findUnique({ where: { id: seatId } });
    if (!seat) return res.status(404).json({ message: 'Seat not found' });

    const newTicket = await ticketService.createTicket({ userId, showtimeId, seatId, price });
    res.status(201).json(newTicket);
  } catch (error) {
    console.error('Error creating ticket:', error);
    if (error.message === 'Seat is not available') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy tất cả vé (GET /api/tickets) - Admin only
const getAllTickets = async (req, res) => {
  try {
    const tickets = await ticketService.getAllTickets();
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error getting tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy vé theo ID (GET /api/tickets/:id)
const getTicketById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const ticket = await ticketService.getTicketById(id);
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }
    
    // Kiểm tra quyền truy cập (chỉ admin hoặc chủ sở hữu mới có thể xem)
    if (req.user.role !== 'ADMIN' && req.user.id !== ticket.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.status(200).json(ticket);
  } catch (error) {
    console.error('Error getting ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy vé theo ID người dùng (GET /api/tickets/user/:userId)
const getTicketsByUserId = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    
    // Kiểm tra quyền truy cập (chỉ admin hoặc chủ sở hữu mới có thể xem)
    if (req.user.role !== 'ADMIN' && req.user.id !== userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const tickets = await ticketService.getTicketsByUserId(userId);
    res.status(200).json(tickets);
  } catch (error) {
    console.error('Error getting user tickets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cập nhật trạng thái vé (PUT /api/tickets/:id/status)
const updateTicketStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const updatedTicket = await ticketService.updateTicketStatus(id, status);
    res.status(200).json(updatedTicket);
  } catch (error) {
    console.error('Error updating ticket status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Khóa ghế tạm thời (POST /api/seats/:id/lock)
const lockSeat = async (req, res) => {
  try {
    const seatId = parseInt(req.params.id);
    const result = await ticketService.lockSeat(seatId);
    
    // Đặt hẹn giờ để mở khóa ghế sau 15 phút nếu không hoàn tất đặt vé
    setTimeout(async () => {
      try {
        const seat = await prisma.seat.findUnique({ where: { id: seatId } });
        if (seat && seat.status === 'LOCKED') {
          await ticketService.unlockSeat(seatId);
        }
      } catch (error) {
        console.error('Error unlocking seat:', error);
      }
    }, 15 * 60 * 1000); // 15 phút
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Error locking seat:', error);
    if (error.message === 'Seat is not available' || error.message === 'Seat not found') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mở khóa ghế (POST /api/seats/:id/unlock)
const unlockSeat = async (req, res) => {
  try {
    const seatId = parseInt(req.params.id);
    const result = await ticketService.unlockSeat(seatId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error unlocking seat:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy tất cả ghế của một suất chiếu (GET /api/seats/showtime/:showtimeId)
const getSeatsByShowtime = async (req, res) => {
  try {
    const showtimeId = req.params.showtimeId;
    const seats = await ticketService.getSeatsByShowtime(showtimeId);
    res.status(200).json(seats);
  } catch (error) {
    console.error('Error getting seats by showtime:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createTicket,
  getAllTickets,
  getTicketById,
  getTicketsByUserId,
  updateTicketStatus,
  lockSeat,
  unlockSeat,
  getSeatsByShowtime
};