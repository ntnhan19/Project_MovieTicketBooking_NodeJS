// backend/src/services/concessionCategoryService.js
const prisma = require("../../prisma/prisma");

const mapStatusToBoolean = (status) => {
  if (typeof status === "boolean") return status;

  if (status === "ACTIVE") return true;
  if (status === "INACTIVE") return false;

  // Mặc định là active nếu không xác định
  return true;
};

// Hàm ánh xạ boolean thành trạng thái để trả về frontend
const mapBooleanToStatus = (isActive) => {
  return isActive ? "ACTIVE" : "INACTIVE";
};

// Get all categories
exports.getAllCategories = async () => {
  const categories = await prisma.concessionCategory.findMany({
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Chuyển đổi isActive thành ACTIVE/INACTIVE
  return categories.map((category) => ({
    ...category,
    status: mapBooleanToStatus(category.isActive), // Thêm trường status
  }));
};

// Get category by ID
exports.getCategoryById = async (id) => {
  const category = await prisma.concessionCategory.findUnique({
    where: { id },
    include: {
      items: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
  });

  if (category) {
    return {
      ...category,
      status: mapBooleanToStatus(category.isActive),
    };
  }

  return category;
};

// Create new category
exports.createCategory = async (categoryData) => {
  const { name, description, image, isActive, status } = categoryData;
  
  // Ưu tiên sử dụng isActive, nếu không có thì sử dụng status
  const activeStatus = isActive !== undefined ? 
    isActive : 
    (status ? mapStatusToBoolean(status) : true);
  
  return await prisma.concessionCategory.create({
    data: {
      name,
      description,
      image,
      isActive: activeStatus
    }
  });
};

// Update category
exports.updateCategory = async (id, categoryData) => {
  const { status, ...restData } = categoryData;
  
  // Filter out undefined values
  const updateData = {};
  
  Object.keys(restData).forEach(key => {
    if (restData[key] !== undefined) {
      updateData[key] = restData[key];
    }
  });
  
  // Nếu có status thì chuyển đổi thành isActive
  if (status !== undefined) {
    updateData.isActive = mapStatusToBoolean(status);
  }
  
  const updated = await prisma.concessionCategory.update({
    where: { id },
    data: updateData
  });
  
  return {
    ...updated,
    status: mapBooleanToStatus(updated.isActive)
  };
};

// Delete category
exports.deleteCategory = async (id) => {
  return await prisma.concessionCategory.delete({
    where: { id },
  });
};

// Check if category has items
exports.categoryHasItems = async (id) => {
  const itemCount = await prisma.concessionItem.count({
    where: {
      categoryId: id,
    },
  });

  return itemCount > 0;
};

// Get categories with items count
exports.getCategoriesWithItemsCount = async () => {
  return await prisma.concessionCategory.findMany({
    select: {
      id: true,
      name: true,
      description: true,
      image: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};

// Get active categories
exports.getActiveCategories = async () => {
  const activeCategories = await prisma.concessionCategory.findMany({
    where: {
      isActive: true,
    },
    include: {
      items: {
        where: {
          isAvailable: true,
        },
        orderBy: {
          name: "asc",
        },
      },
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });

  // Chuyển đổi isActive thành ACTIVE/INACTIVE để đồng nhất với phần frontend
  return activeCategories.map((category) => ({
    ...category,
    status: mapBooleanToStatus(category.isActive),
  }));
};

// Check if category exists
exports.categoryExists = async (id) => {
  const count = await prisma.concessionCategory.count({
    where: { id },
  });

  return count > 0;
};

// Get category with available items
exports.getCategoryWithAvailableItems = async (id) => {
  return await prisma.concessionCategory.findUnique({
    where: {
      id,
      isActive: true,
    },
    include: {
      items: {
        where: {
          isAvailable: true,
        },
        orderBy: {
          name: "asc",
        },
      },
    },
  });
};

// Search categories by name
exports.searchCategories = async (searchTerm) => {
  return await prisma.concessionCategory.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    include: {
      _count: {
        select: {
          items: true,
        },
      },
    },
    orderBy: {
      name: "asc",
    },
  });
};
