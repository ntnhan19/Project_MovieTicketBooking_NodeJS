// backend/src/controllers/concessionItemController.js
const concessionItemService = require('../services/concessionItemService');
const concessionCategoryService = require('../services/concessionCategoryService');

// Get all items
exports.getAllItems = async (req, res) => {
  try {
    const items = await concessionItemService.getAllItems();
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm',
      error: error.message
    });
  }
};

// Get items by category
exports.getItemsByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    
    // Check if category exists
    const category = await concessionCategoryService.getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }
    
    const items = await concessionItemService.getItemsByCategory(categoryId);
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm theo danh mục',
      error: error.message
    });
  }
};

// Get item by ID
exports.getItemById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const item = await concessionItemService.getItemById(id);
    
    if (!item) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    res.status(200).json({
      success: true,
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin sản phẩm',
      error: error.message
    });
  }
};

// Create new item
exports.createItem = async (req, res) => {
  try {
    const { name, description, price, image, isAvailable, categoryId, size } = req.body;
    
    // Validate required fields
    if (!name || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Tên, giá và danh mục là các trường bắt buộc'
      });
    }
    
    // Check if category exists
    const category = await concessionCategoryService.getCategoryById(parseInt(categoryId));
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }
    
    const item = await concessionItemService.createItem({
      name,
      description,
      price: parseFloat(price),
      image,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      categoryId: parseInt(categoryId),
      size
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo sản phẩm thành công',
      data: item
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo sản phẩm',
      error: error.message
    });
  }
};

// Update item
exports.updateItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, price, image, isAvailable, categoryId, size } = req.body;
    
    // Check if item exists
    const existingItem = await concessionItemService.getItemById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Check if category exists if provided
    if (categoryId) {
      const category = await concessionCategoryService.getCategoryById(parseInt(categoryId));
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Không tìm thấy danh mục'
        });
      }
    }
    
    const updatedItem = await concessionItemService.updateItem(id, {
      name,
      description,
      price: price ? parseFloat(price) : undefined,
      image,
      isAvailable,
      categoryId: categoryId ? parseInt(categoryId) : undefined,
      size,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: 'Cập nhật sản phẩm thành công',
      data: updatedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật sản phẩm',
      error: error.message
    });
  }
};

// Delete item
exports.deleteItem = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if item exists
    const existingItem = await concessionItemService.getItemById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    // Check if item is used in any combo
    const isUsedInCombo = await concessionItemService.isItemUsedInCombo(id);
    if (isUsedInCombo) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa sản phẩm vì đang được sử dụng trong combo'
      });
    }
    
    // Check if item is used in any order
    const isUsedInOrder = await concessionItemService.isItemUsedInOrder(id);
    if (isUsedInOrder) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa sản phẩm vì đã có đơn hàng sử dụng sản phẩm này'
      });
    }
    
    await concessionItemService.deleteItem(id);
    
    res.status(200).json({
      success: true,
      message: 'Xóa sản phẩm thành công'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa sản phẩm',
      error: error.message
    });
  }
};

// Toggle item availability
exports.toggleItemAvailability = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    // Check if item exists
    const existingItem = await concessionItemService.getItemById(id);
    if (!existingItem) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy sản phẩm'
      });
    }
    
    const updatedItem = await concessionItemService.updateItem(id, {
      isAvailable: !existingItem.isAvailable,
      updatedAt: new Date()
    });
    
    res.status(200).json({
      success: true,
      message: `Sản phẩm đã được ${updatedItem.isAvailable ? 'bật' : 'tắt'} trạng thái có sẵn`,
      data: updatedItem
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật trạng thái sản phẩm',
      error: error.message
    });
  }
};

exports.getPopularItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 5;
    const items = await concessionItemService.getPopularItems(limit);
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm phổ biến',
      error: error.message
    });
  }
};

// Get all available items
exports.getAllAvailableItems = async (req, res) => {
  try {
    const items = await concessionItemService.getAllAvailableItems();
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm có sẵn',
      error: error.message
    });
  }
};

// Get available items by category
exports.getAvailableItemsByCategory = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.categoryId);
    
    // Check if category exists
    const category = await concessionCategoryService.getCategoryById(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy danh mục'
      });
    }
    
    const items = await concessionItemService.getAvailableItemsByCategory(categoryId);
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách sản phẩm có sẵn theo danh mục',
      error: error.message
    });
  }
};

// Search items by name
exports.searchItems = async (req, res) => {
  try {
    const searchTerm = req.query.term || '';
    const items = await concessionItemService.searchItems(searchTerm);
    res.status(200).json({
      success: true,
      data: items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm sản phẩm',
      error: error.message
    });
  }
};