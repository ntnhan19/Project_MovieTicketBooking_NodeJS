// backend/src/services/promotionService.js
const prisma = require("../../prisma/prisma");

/**
 * Chuyển đổi và xác thực ID khuyến mãi
 * @param {string|number} id - ID khuyến mãi cần xử lý
 * @returns {number} ID đã được chuyển đổi thành số
 */
const validatePromotionId = (id) => {
  const promotionId = parseInt(id, 10);
  if (isNaN(promotionId)) {
    throw new Error("ID khuyến mãi không hợp lệ");
  }
  return promotionId;
};

/**
 * Lấy các giá trị hợp lệ cho PromoType
 * @returns {Array<string>} Mảng chứa các giá trị hợp lệ của enum PromoType
 */
const getValidPromoTypes = async () => {
  try {
    // Có thể mở rộng để truy vấn trực tiếp từ database nếu cần
    return ["PERCENTAGE", "FIXED_AMOUNT"];
  } catch (error) {
    console.error("Lỗi khi lấy các giá trị PromoType:", error);
    return ["PERCENTAGE", "FIXED_AMOUNT"]; // Giá trị mặc định
  }
};

/**
 * Xác thực và chuẩn hóa loại khuyến mãi
 * @param {string} type - Loại khuyến mãi cần xác thực
 * @returns {string} Loại khuyến mãi đã được chuẩn hóa
 */
const validatePromotionType = async (type) => {
  const promoTypeValues = await getValidPromoTypes();
  
  if (promoTypeValues.includes(type)) {
    return type;
  }
  
  // Nếu không hợp lệ, ánh xạ sang giá trị hợp lệ nếu có thể
  const typeMapping = {
    percentage: "PERCENTAGE",
    fixed: "FIXED_AMOUNT",
  };
  
  return typeMapping[type?.toLowerCase()] || "PERCENTAGE";
};

/**
 * Tạo khuyến mãi mới (Admin only)
 * @param {Object} promotionData - Dữ liệu khuyến mãi cần tạo
 * @returns {Promise<Object>} Khuyến mãi đã được tạo
 */
const createPromotion = async (promotionData) => {
  // Kiểm tra mã khuyến mãi đã tồn tại chưa
  const existingPromotion = await prisma.promotion.findUnique({
    where: { code: promotionData.code },
  });

  if (existingPromotion) {
    throw new Error("Mã khuyến mãi đã tồn tại");
  }

  // Chuẩn hóa dữ liệu
  const validatedData = { 
    ...promotionData,
    type: await validatePromotionType(promotionData.type)
  };

  return await prisma.promotion.create({
    data: validatedData,
  });
};

/**
 * Lấy danh sách tất cả khuyến mãi
 * @param {boolean} isActive - Lọc theo trạng thái hoạt động (không bắt buộc)
 * @returns {Promise<Array<Object>>} Danh sách khuyến mãi
 */
const getAllPromotions = async (isActive) => {
  const where = {};

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  return await prisma.promotion.findMany({
    where,
    orderBy: {
      validUntil: "desc",
    },
  });
};

/**
 * Lấy khuyến mãi theo ID
 * @param {string|number} id - ID của khuyến mãi
 * @returns {Promise<Object>} Thông tin khuyến mãi
 */
const getPromotionById = async (id) => {
  try {
    const promotionId = validatePromotionId(id);
    
    return await prisma.promotion.findUnique({
      where: { id: promotionId },
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin khuyến mãi theo ID:", error);
    throw error;
  }
};

/**
 * Lấy khuyến mãi theo mã
 * @param {string} code - Mã khuyến mãi
 * @returns {Promise<Object>} Thông tin khuyến mãi
 */
const getPromotionByCode = async (code) => {
  return await prisma.promotion.findUnique({
    where: { code },
  });
};

/**
 * Cập nhật khuyến mãi
 * @param {string|number} id - ID khuyến mãi cần cập nhật
 * @param {Object} updateData - Dữ liệu cập nhật
 * @returns {Promise<Object>} Khuyến mãi sau khi cập nhật
 */
const updatePromotion = async (id, updateData) => {
  const promotionId = validatePromotionId(id);

  // Kiểm tra mã khuyến mãi đã tồn tại chưa
  if (updateData.code) {
    const existingPromotion = await prisma.promotion.findUnique({
      where: { code: updateData.code },
    });

    if (existingPromotion && existingPromotion.id !== promotionId) {
      throw new Error("Mã khuyến mãi đã tồn tại");
    }
  }

  // Chuẩn hóa dữ liệu cập nhật
  const validatedData = { ...updateData };
  
  if (updateData.type) {
    validatedData.type = await validatePromotionType(updateData.type);
  }

  return await prisma.promotion.update({
    where: { id: promotionId },
    data: validatedData,
  });
};

/**
 * Xóa khuyến mãi
 * @param {string|number} id - ID khuyến mãi cần xóa
 * @returns {Promise<Object>} Kết quả xóa khuyến mãi
 */
const deletePromotion = async (id) => {
  const promotionId = validatePromotionId(id);

  // Kiểm tra xem khuyến mãi có tồn tại không
  const promotion = await prisma.promotion.findUnique({
    where: { id: promotionId },
    include: {
      Ticket: true,
    },
  });

  if (!promotion) {
    throw new Error("Không tìm thấy khuyến mãi");
  }

  if (promotion.Ticket && promotion.Ticket.length > 0) {
    throw new Error("Không thể xóa khuyến mãi này vì có vé đang sử dụng nó");
  }

  return await prisma.promotion.delete({
    where: { id: promotionId },
  });
};

/**
 * Xác thực mã khuyến mãi
 * @param {string} code - Mã khuyến mãi cần xác thực
 * @returns {Promise<Object>} Kết quả xác thực mã khuyến mãi
 */
const validatePromotionCode = async (code) => {
  const promotion = await prisma.promotion.findUnique({
    where: { code },
  });

  if (!promotion) {
    throw new Error("Không tìm thấy mã khuyến mãi");
  }

  // Kiểm tra xem khuyến mãi có đang hoạt động không
  if (!promotion.isActive) {
    throw new Error("Mã khuyến mãi không hoạt động");
  }

  // Kiểm tra xem khuyến mãi có trong khoảng thời gian hiệu lực không
  const now = new Date();
  if (now < promotion.validFrom || now > promotion.validUntil) {
    throw new Error("Mã khuyến mãi đã hết hạn");
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
      validUntil: promotion.validUntil,
    },
  };
};

module.exports = {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  getPromotionByCode,
  updatePromotion,
  deletePromotion,
  validatePromotionCode,
};