//backend/src/services/promotionService.js
const prisma = require('../../prisma/prisma');

//Lấy danh sách tất cả các khuyến mãi
const getAllPromotions = async () => {
  return await prisma.promotion.findMany();
};

//Lấy danh sách khuyến mãi theo id
const getPromotionById = async (id) => {
  return await prisma.promotion.findUnique({ where: { id: parseInt(id) } });
};

//Tạo khuyến mãi mới
const createPromotion = async (data) => {
  return await prisma.promotion.create({ data });
};

//Cập nhật khuyến mãi theo id
const updatePromotion = async (id, data) => {
  return await prisma.promotion.update({ where: { id: parseInt(id) }, data });
};

//Xóa khuyến mãi theo id
const deletePromotion = async (id) => {
  return await prisma.promotion.delete({ where: { id: parseInt(id) } });
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
};
