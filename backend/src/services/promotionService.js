// backend/src/services/promotionService.js
const prisma = require('../../prisma/prisma');

// Tạo khuyến mãi mới (Admin only)
const createPromotion = async (promotionData) => {
  // Kiểm tra mã khuyến mãi đã tồn tại chưa
  const existingPromotion = await prisma.promotion.findUnique({
    where: { code: promotionData.code }
  });
  
  if (existingPromotion) {
    throw new Error('Mã khuyến mãi đã tồn tại');
  }
  
  return await prisma.promotion.create({
    data: promotionData
  });
};

// Lấy danh sách tất cả khuyến mãi (Admin only)
const getAllPromotions = async (isActive) => {
  const where = {};
  
  if (isActive !== undefined) {
    where.isActive = isActive;
  }
  
  return await prisma.promotion.findMany({
    where,
    orderBy: {
      validUntil: 'desc'
    }
  });
};

// Lấy khuyến mãi theo ID (Admin only)
const getPromotionById = async (id) => {
  return await prisma.promotion.findUnique({
    where: { id }
  });
};

// Lấy khuyến mãi theo mã (Admin only)
const getPromotionByCode = async (code) => {
  return await prisma.promotion.findUnique({
    where: { code }
  });
};

// Cập nhật khuyến mãi (Admin only)
const updatePromotion = async (id, updateData) => {
  // Kiểm tra mã khuyến mãi đã tồn tại chưa
  if (updateData.code) {
    const existingPromotion = await prisma.promotion.findUnique({
      where: { code: updateData.code }
    });
    
    if (existingPromotion && existingPromotion.id !== id) {
      throw new Error('Mã khuyến mãi đã tồn tại');
    }
  }
  
  return await prisma.promotion.update({
    where: { id },
    data: updateData
  });
};

// Xóa khuyến mãi (Admin only)
const deletePromotion = async (id) => {
  // Kiểm tra xem khuyến mãi có tồn tại không
  const promotion = await prisma.promotion.findUnique({
    where: { id },
    include: {
      Ticket: true
    }
  });
  
  if (!promotion) {
    throw new Error('Không tìm thấy khuyến mãi');
  }
  
  if (promotion.Ticket.length > 0) {
    throw new Error('Không thể xóa khuyến mãi này vì có vé đang sử dụng nó');
  }
  
  return await prisma.promotion.delete({
    where: { id }
  });
};

const validatePromotionCode = async (code) => {
  const promotion = await prisma.promotion.findUnique({
    where: { code }
  });
  
  if (!promotion) {
    throw new Error('Không tìm thấy mã khuyến mãi');
  }
  
  // Kiểm tra xem khuyến mãi có đang hoạt động không
  if (!promotion.isActive) {
    throw new Error('Mã khuyến mãi không hoạt động');
  }
  
  // Kiểm tra xem khuyến mãi có trong khoảng thời gian hiệu lực không
  const now = new Date();
  if (now < promotion.validFrom || now > promotion.validUntil) {
    throw new Error('Mã khuyến mãi đã hết hạn');
  }
  
  return {
    valid: true,
    promotion: {
      id: promotion.id,
      title: promotion.title,
      description: promotion.description,
      type: promotion.type,
      discount: promotion.discount,
      validFrom: promotion.validFrom,
      validUntil: promotion.validUntil
    }
  };
};

module.exports = {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  getPromotionByCode,
  updatePromotion,
  deletePromotion,
  validatePromotionCode
};