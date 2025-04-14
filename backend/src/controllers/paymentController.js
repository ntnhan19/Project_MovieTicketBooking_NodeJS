// backend/src/controllers/paymentController.js
const paymentService = require('../services/paymentService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Tạo thanh toán mới (POST /api/payments)
const createPayment = async (req, res) => {
  try {
    const { ticketId, amount, method } = req.body;

    // Validate input
    if (!ticketId || !amount || !method) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const ticket = await prisma.ticket.findUnique({ 
      where: { id: ticketId },
      include: { user: true }
    });
    
    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Kiểm tra quyền truy cập (chỉ admin hoặc chủ sở hữu vé mới có thể tạo thanh toán)
    if (req.user.role !== 'ADMIN' && req.user.id !== ticket.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const payment = await paymentService.createPayment({ ticketId, amount, method });
    res.status(201).json(payment);
  } catch (error) {
    console.error('Error creating payment:', error);
    if (error.message === 'Payment already exists for this ticket') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy thông tin thanh toán theo ID (GET /api/payments/:id)
const getPaymentById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const payment = await paymentService.getPaymentById(id);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Kiểm tra quyền truy cập (chỉ admin hoặc chủ sở hữu vé mới có thể xem)
    if (req.user.role !== 'ADMIN' && req.user.id !== payment.ticket.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error getting payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Lấy thông tin thanh toán theo ID vé (GET /api/payments/ticket/:ticketId)
const getPaymentByTicketId = async (req, res) => {
  try {
    const ticketId = parseInt(req.params.ticketId);
    const payment = await paymentService.getPaymentByTicketId(ticketId);
    
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Kiểm tra quyền truy cập (chỉ admin hoặc chủ sở hữu vé mới có thể xem)
    if (req.user.role !== 'ADMIN' && req.user.id !== payment.ticket.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    res.status(200).json(payment);
  } catch (error) {
    console.error('Error getting payment by ticket:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Cập nhật trạng thái thanh toán (PUT /api/payments/:id/status)
const updatePaymentStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ message: 'Status is required' });
    }
    
    const validStatuses = ['PENDING', 'COMPLETED', 'CANCELLED', 'FAILED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    // Kiểm tra thanh toán tồn tại
    const payment = await paymentService.getPaymentById(id);
    if (!payment) {
      return res.status(404).json({ message: 'Payment not found' });
    }
    
    // Chỉ admin hoặc chủ sở hữu vé mới có thể cập nhật
    if (req.user.role !== 'ADMIN' && req.user.id !== payment.ticket.userId) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    const updatedPayment = await paymentService.updatePaymentStatus(id, status);
    res.status(200).json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mô phỏng webhook từ cổng thanh toán (POST /api/payments/webhook)
const paymentWebhook = async (req, res) => {
  try {
    const { paymentId, status, transactionId } = req.body;
    
    // Xác thực webhook (trong thực tế sẽ cần xác thực signature từ payment provider)
    // ...
    
    // Cập nhật trạng thái thanh toán
    const updatedPayment = await paymentService.updatePaymentStatus(paymentId, status);
    
    res.status(200).json({ message: 'Webhook processed successfully' });
  } catch (error) {
    console.error('Error processing payment webhook:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  createPayment,
  getPaymentById,
  getPaymentByTicketId,
  updatePaymentStatus,
  paymentWebhook
};