// backend/src/controllers/concessionCategoryController.js
const concessionCategoryService = require("../services/concessionCategoryService");

// Lấy danh sách danh mục với sản phẩm có sẵn
exports.getCategoryWithAvailableItems = async (req, res) => {
  try {
    const categoryId = parseInt(req.params.id);
    
    // Kiểm tra danh mục tồn tại
    const categoryExists = await concessionCategoryService.categoryExists(categoryId);
    if (!categoryExists) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục"
      });
    }
    
    const category = await concessionCategoryService.getCategoryWithAvailableItems(categoryId);
    
    // Nếu danh mục không hoạt động
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Danh mục không hoạt động hoặc không tồn tại"
      });
    }
    
    // Chuyển đổi isActive thành status
    const result = {
      ...category,
      status: category.isActive ? "ACTIVE" : "INACTIVE"
    };
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin danh mục với sản phẩm có sẵn',
      error: error.message
    });
  }
};

// Get active categories
exports.getActiveCategories = async (req, res) => {
  try {
    const activeCategories = await concessionCategoryService.getActiveCategories();
    
    res.status(200).json({
      success: true,
      data: activeCategories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục đang hoạt động',
      error: error.message
    });
  }
};

// Get all categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await concessionCategoryService.getAllCategories();
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách danh mục bắp nước',
      error: error.message
    });
  }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
  try {
    const category = await concessionCategoryService.getCategoryById(
      parseInt(req.params.id)
    );

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin danh mục",
      error: error.message,
    });
  }
};

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, description, image, isActive, status } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục là trường bắt buộc",
      });
    }

    // Đảm bảo có thể sử dụng trường status từ frontend
    const categoryData = {
      name,
      description,
      image,
    };

    // Ưu tiên isActive, nếu không có thì sử dụng status
    if (isActive !== undefined) {
      categoryData.isActive = isActive;
    } else if (status !== undefined) {
      categoryData.status = status;
    }

    const category = await concessionCategoryService.createCategory(
      categoryData
    );

    res.status(201).json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục đã tồn tại",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo danh mục",
      error: error.message,
    });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, description, image, isActive, status } = req.body;

    // Check if category exists
    const existingCategory = await concessionCategoryService.getCategoryById(
      id
    );
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      name,
      description,
      image,
      updatedAt: new Date(),
    };

    // Xử lý trường status và isActive
    if (isActive !== undefined) {
      updateData.isActive = isActive;
    } else if (status !== undefined) {
      updateData.status = status;
    }

    const updatedCategory = await concessionCategoryService.updateCategory(
      id,
      updateData
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật danh mục thành công",
      data: updatedCategory,
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(400).json({
        success: false,
        message: "Tên danh mục đã tồn tại",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật danh mục",
      error: error.message,
    });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if category exists
    const existingCategory = await concessionCategoryService.getCategoryById(
      id
    );
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Check if category has items
    const hasItems = await concessionCategoryService.categoryHasItems(id);
    if (hasItems) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa danh mục vì có sản phẩm liên quan",
      });
    }

    await concessionCategoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: "Xóa danh mục thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa danh mục",
      error: error.message,
    });
  }
};

// Toggle category status
exports.toggleCategoryStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if category exists
    const existingCategory = await concessionCategoryService.getCategoryById(
      id
    );
    if (!existingCategory) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    const updatedCategory = await concessionCategoryService.updateCategory(id, {
      isActive: !existingCategory.isActive,
      updatedAt: new Date(),
    });

    res.status(200).json({
      success: true,
      message: `Danh mục đã được ${
        updatedCategory.isActive ? "kích hoạt" : "vô hiệu hóa"
      }`,
      data: updatedCategory,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái danh mục",
      error: error.message,
    });
  }
};

// Tìm kiếm danh mục
exports.searchCategories = async (req, res) => {
  try {
    const { term } = req.query;
    
    if (!term) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp từ khóa tìm kiếm'
      });
    }
    
    const categories = await concessionCategoryService.searchCategories(term);
    
    // Chuyển đổi isActive thành status để thống nhất với frontend
    const results = categories.map(category => ({
      ...category,
      status: category.isActive ? "ACTIVE" : "INACTIVE"
    }));
    
    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tìm kiếm danh mục',
      error: error.message
    });
  }
};