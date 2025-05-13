// backend/src/controllers/promotionController.js
const promotionService = require("../services/promotionService");

/**
 * Xử lý lỗi và trả về response phù hợp
 * @param {Error} error - Lỗi cần xử lý
 * @param {Object} res - Response object
 */
const handlePromotionError = (error, res) => {
  console.error("Lỗi xử lý promotion:", error);
  
  // Danh sách các lỗi được xác định trước
  const knownErrors = {
    "Mã khuyến mãi đã tồn tại": 400,
    "ID khuyến mãi không hợp lệ": 400,
    "Không tìm thấy khuyến mãi": 404,
    "Mã khuyến mãi đã hết hạn": 400,
    "Mã khuyến mãi không hoạt động": 400,
    "Không thể xóa khuyến mãi này vì có vé đang sử dụng nó": 400,
    "Thiếu mã khuyến mãi": 400,
    "Thiếu ID khuyến mãi": 400,
    "Missing required fields": 400
  };

  const statusCode = knownErrors[error.message] || 500;
  const message = statusCode === 500 ? "Lỗi máy chủ" : error.message;
  
  res.status(statusCode).json({ message });
};

/**
 * Tạo khuyến mãi mới (Admin only)
 */
const createPromotion = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      code,
      discount,
      validFrom,
      validUntil,
      image,
      isActive,
    } = req.body;

    if (!title || !type || !code || !discount || !validFrom || !validUntil) {
      return handlePromotionError(new Error("Missing required fields"), res);
    }

    const newPromotion = await promotionService.createPromotion({
      title,
      description,
      type,
      code,
      discount,
      validFrom: new Date(validFrom),
      validUntil: new Date(validUntil),
      image,
      isActive: isActive !== undefined ? isActive : true,
    });

    res.status(201).json(newPromotion);
  } catch (error) {
    handlePromotionError(error, res);
  }
};

/**
 * Lấy danh sách tất cả khuyến mãi
 */
const getAllPromotions = async (req, res) => {
  try {
    const { active } = req.query;
    let isActive = undefined;

    if (active === "true") isActive = true;
    if (active === "false") isActive = false;

    const promotions = await promotionService.getAllPromotions(isActive);
    res.status(200).json(promotions);
  } catch (error) {
    handlePromotionError(error, res);
  }
};

/**
 * Lấy khuyến mãi theo ID
 */
const getPromotionById = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return handlePromotionError(new Error("Thiếu ID khuyến mãi"), res);
    }

    const promotion = await promotionService.getPromotionById(id);

    if (!promotion) {
      return handlePromotionError(new Error("Không tìm thấy khuyến mãi"), res);
    }

    res.status(200).json(promotion);
  } catch (error) {
    handlePromotionError(error, res);
  }
};

/**
 * Lấy khuyến mãi theo mã code
 */
const getPromotionByCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return handlePromotionError(new Error("Thiếu mã khuyến mãi"), res);
    }

    const promotion = await promotionService.getPromotionByCode(code);

    if (!promotion) {
      return handlePromotionError(new Error("Không tìm thấy khuyến mãi"), res);
    }

    res.status(200).json(promotion);
  } catch (error) {
    handlePromotionError(error, res);
  }
};

/**
 * Cập nhật khuyến mãi
 */
const updatePromotion = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      description,
      type,
      code,
      discount,
      validFrom,
      validUntil,
      image,
      isActive,
    } = req.body;

    // Chuẩn bị dữ liệu cập nhật
    const updatedData = {};

    // Chỉ cập nhật các trường được cung cấp
    if (title !== undefined) updatedData.title = title;
    if (description !== undefined) updatedData.description = description;
    if (type !== undefined) updatedData.type = type;
    if (code !== undefined) updatedData.code = code;
    if (discount !== undefined) updatedData.discount = discount;
    if (validFrom !== undefined) updatedData.validFrom = new Date(validFrom);
    if (validUntil !== undefined) updatedData.validUntil = new Date(validUntil);
    if (image !== undefined) updatedData.image = image;
    if (isActive !== undefined) updatedData.isActive = isActive;

    const updatedPromotion = await promotionService.updatePromotion(
      id,
      updatedData
    );

    res.status(200).json(updatedPromotion);
  } catch (error) {
    handlePromotionError(error, res);
  }
};

/**
 * Xóa khuyến mãi
 */
const deletePromotion = async (req, res) => {
  try {
    const id = req.params.id;
    await promotionService.deletePromotion(id);
    res.status(200).json({ message: "Xóa khuyến mãi thành công" });
  } catch (error) {
    handlePromotionError(error, res);
  }
};

/**
 * Xác thực mã khuyến mãi
 */
const validatePromotionCode = async (req, res) => {
  try {
    const { code } = req.params;

    if (!code) {
      return handlePromotionError(new Error("Thiếu mã khuyến mãi"), res);
    }

    const result = await promotionService.validatePromotionCode(code);
    res.status(200).json(result);
  } catch (error) {
    handlePromotionError(error, res);
  }
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