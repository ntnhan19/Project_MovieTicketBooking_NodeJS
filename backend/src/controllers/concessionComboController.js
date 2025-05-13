// backend/src/controllers/concessionComboController.js
const concessionComboService = require('../services/concessionComboService');
const concessionItemService = require('../services/concessionItemService');

// Get all combos
exports.getAllCombos = async (req, res) => {
  try {
    // Xử lý các tham số phân trang và sắp xếp từ query
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortField = req.query._sort || 'name';
    const sortOrder = req.query._order || 'ASC';
    const searchTerm = req.query.q || '';
    const isAvailable = req.query.isAvailable !== undefined ? 
      req.query.isAvailable === 'true' : undefined;

    // Tạo options cho service
    const options = {
      page, 
      limit,
      sortField,
      sortOrder,
      searchTerm,
      isAvailable
    };

    const result = await concessionComboService.getAllCombosWithPagination(options);
    
    // Thêm header phân trang
    res.setHeader('X-Total-Count', result.total);
    
    // Trả về kết quả
    res.status(200).json(result.data);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách combo:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách combo',
      error: error.message
    });
  }
};

// Get combo by ID
exports.getComboById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const combo = await concessionComboService.getComboById(id);
    
    if (!combo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy combo'
      });
    }
    
    res.status(200).json({
      success: true,
      data: combo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin combo',
      error: error.message
    });
  }
};

// Create new combo
exports.createCombo = async (req, res) => {
  try {
    const { name, description, price, image, isAvailable, discountPercent, items } = req.body;
    
    // Validate required fields
    if (!name || !price || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Tên, giá và các sản phẩm trong combo là các trường bắt buộc'
      });
    }
    
    // Validate items
    for (const item of items) {
      if (!item.itemId || !item.quantity || item.quantity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Mỗi sản phẩm trong combo phải có ID và số lượng lớn hơn 0'
        });
      }
      
      // Check if item exists
      const existingItem = await concessionItemService.getItemById(parseInt(item.itemId));
      if (!existingItem) {
        return res.status(404).json({
          success: false,
          message: `Không tìm thấy sản phẩm với ID ${item.itemId}`
        });
      }
    }
    
    const combo = await concessionComboService.createCombo({
      name,
      description,
      price: parseFloat(price),
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      discountPercent: discountPercent ? parseFloat(discountPercent) : 0,
      items: items.map(item => ({
        itemId: parseInt(item.itemId),
        quantity: parseInt(item.quantity)
      }))
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo combo thành công',
      data: combo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo combo',
      error: error.message
    });
  }
};

// Update combo
exports.updateCombo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, image, isAvailable, discountPercent, items } = req.body;
    
    // Check if combo exists
    const existingCombo = await concessionComboService.getComboById(id);
    if (!existingCombo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy combo'
      });
    }
    
    // Validate items if provided
    if (items) {
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Combo phải có ít nhất một sản phẩm'
        });
      }
      
      for (const item of items) {
        if (!item.itemId || !item.quantity || item.quantity <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Mỗi sản phẩm trong combo phải có ID và số lượng lớn hơn 0'
          });
        }
        
        // Check if item exists
        const existingItem = await concessionItemService.getItemById(parseInt(item.itemId));
        if (!existingItem) {
          return res.status(404).json({
            success: false,
            message: `Không tìm thấy sản phẩm với ID ${item.itemId}`
          });
        }
      }
    }
    
    const updatedCombo = await concessionComboService.updateCombo(id, {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      image,
      isAvailable,
      discountPercent: discountPercent !== undefined ? parseFloat(discountPercent) : undefined,
      items: items ? items.map(item => ({
        itemId: parseInt(item.itemId),
        quantity: parseInt(item.quantity)
      })) : undefined,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật combo thành công',
      data: updatedCombo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật combo',
      error: error.message
    });
  }
};

// Delete combo
exports.deleteCombo = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if combo exists
    const existingCombo = await concessionComboService.getComboById(id);
    if (!existingCombo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy combo'
      });
    }
    
    // Check if combo is used in any order
    const isUsedInOrder = await concessionComboService.isComboUsedInOrder(id);
    if (isUsedInOrder) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa combo vì đã có đơn hàng sử dụng combo này'
      });
    }
    
    await concessionComboService.deleteCombo(id);
    
    res.status(200).json({
      success: true,
      message: 'Xóa combo thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa combo',
      error: error.message
    });
  }
};

// Toggle combo availability
exports.toggleComboAvailability = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if combo exists
    const existingCombo = await concessionComboService.getComboById(id);
    if (!existingCombo) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy combo'
      });
    }
    
    const updatedCombo = await concessionComboService.updateCombo(id, {
      isAvailable: !existingCombo.isAvailable,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: `Combo đã được ${updatedCombo.isAvailable ? 'bật' : 'tắt'} trạng thái có sẵn`,
      data: updatedCombo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái combo',
      error: error.message
    });
  }
};

exports.getPopularCombos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const combos = await concessionComboService.getPopularCombos(limit);
    
    res.status(200).json(combos);
  } catch (error) {
    console.error('Lỗi khi lấy danh sách combo phổ biến:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách combo phổ biến',
      error: error.message
    });
  }
};