// backend/src/controllers/promotionController.js
const promotionService = require('../services/promotionService');

// Tạo khuyến mãi mới (Admin only)
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
      isActive 
    } = req.body;

    if (!title || !type || !code || !discount || !validFrom || !validUntil) {
      return res.status(400).json({ message: 'Missing required fields' });
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
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json(newPromotion);
  } catch (error) {
    console.error('Lỗi tạo khuyến mãi:', error);
    if (error.message === 'Mã khuyến mãi đã tồn tại') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy danh sách tất cả khuyến mãi (Admin only)
const getAllPromotions = async (req, res) => {
  try {
    const { active } = req.query;
    let isActive = undefined;
    
    if (active === 'true') isActive = true;
    if (active === 'false') isActive = false;
    
    const promotions = await promotionService.getAllPromotions(isActive);
    res.status(200).json(promotions);
  } catch (error) {
    console.error('Lỗi lấy khuyến mãi:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy khuyến mãi theo id (Admin only)
const getPromotionById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const promotion = await promotionService.getPromotionById(id);
    
    if (!promotion) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }
    
    res.status(200).json(promotion);
  } catch (error) {
    console.error('Error getting promotion:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Lấy khuyến mãi theo mã (Admin only)
const getPromotionByCode = async (req, res) => {
  try {
    const { code } = req.params;
    const promotion = await promotionService.getPromotionByCode(code);
    
    if (!promotion) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }
    
    res.status(200).json(promotion);
  } catch (error) {
    console.error('Error getting promotion by code:', error);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cập nhật khuyến mãi (Admin only)
const updatePromotion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { 
      title, 
      description, 
      type, 
      code, 
      discount, 
      validFrom, 
      validUntil, 
      image, 
      isActive 
    } = req.body;

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

    const updatedPromotion = await promotionService.updatePromotion(id, updatedData);
    
    if (!updatedPromotion) {
      return res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }
    
    res.status(200).json(updatedPromotion);
  } catch (error) {
    console.error('Lỗi cập nhật khuyến mãi:', error);
    if (error.message === 'Mã khuyến mãi đã tồn tại') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Xóa khuyến mãi (Admin only)
const deletePromotion = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    await promotionService.deletePromotion(id);
    res.status(200).json({ message: 'Xóa khuyến mãi thành công' });
  } catch (error) {
    console.error('Lỗi xóa khuyến mãi:', error);
    if (error.message === 'Không tìm thấy khuyến mãi') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Không thể xóa khuyến mãi đang hoạt động') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Xác thực mã khuyến mãi (Admin only)
const validatePromotionCode = async (req, res) => {
  try {
    const { code } = req.params;
    const result = await promotionService.validatePromotionCode(code);
    res.status(200).json(result);
  } catch (error) {
    console.error('Lỗi xác thực mã khuyến mãi:', error);
    if (error.message === 'Không tìm thấy khuyến mãi' || 
        error.message === 'Khuyến mãi đã hết hạn' || 
        error.message === 'Khuyến mãi không hoạt động') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
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