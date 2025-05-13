// backend/src/services/concessionComboService.js
const prisma = require('../../prisma/prisma');

// Lấy danh sách combo với phân trang và tìm kiếm
exports.getAllCombosWithPagination = async (options) => {
  const { page, limit, sortField, sortOrder, searchTerm, isAvailable } = options;
  
  // Tính offset cho phân trang
  const skip = (page - 1) * limit;
  
  // Xây dựng điều kiện where
  const where = {};
  
  // Thêm điều kiện tìm kiếm nếu có
  if (searchTerm) {
    where.name = {
      contains: searchTerm,
      mode: 'insensitive'
    };
  }
  
  // Thêm điều kiện lọc theo trạng thái nếu có
  if (isAvailable !== undefined) {
    where.isAvailable = isAvailable;
  }
  
  // Xây dựng điều kiện sắp xếp
  const orderBy = {};
  orderBy[sortField] = sortOrder.toLowerCase();
  
  // Đếm tổng số bản ghi
  const total = await prisma.concessionCombo.count({ where });
  
  // Lấy dữ liệu có phân trang
  const data = await prisma.concessionCombo.findMany({
    where,
    include: {
      items: {
        include: {
          item: true
        }
      }
    },
    orderBy,
    skip,
    take: limit
  });
  
  return {
    data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  };
};

// Get all combos
exports.getAllCombos = async () => {
  return await prisma.concessionCombo.findMany({
    include: {
      items: {
        include: {
          item: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
};

// Get available combos
exports.getAvailableCombos = async () => {
  return await prisma.concessionCombo.findMany({
    where: {
      isAvailable: true
    },
    include: {
      items: {
        include: {
          item: {
            select: {
              id: true,
              name: true,
              description: true,
              price: true,
              image: true,
              size: true,
              isAvailable: true,
              categoryId: true,
              category: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
};

// Get combo by ID
exports.getComboById = async (id) => {
  return await prisma.concessionCombo.findUnique({
    where: { id },
    include: {
      items: {
        include: {
          item: true
        }
      }
    }
  });
};

// Create new combo
exports.createCombo = async (comboData) => {
  const { name, description, price, image, isAvailable, items } = comboData;

  return await prisma.$transaction(async (prisma) => {
    // Create combo
    const combo = await prisma.concessionCombo.create({
      data: {
        name,
        description,
        price,
        image,
        isAvailable: isAvailable === undefined ? true : isAvailable
      }
    });

    // Create combo items
    if (items && items.length > 0) {
      await Promise.all(
        items.map(async (item) => {
          await prisma.concessionComboItem.create({
            data: {
              comboId: combo.id,
              itemId: item.itemId,
              quantity: item.quantity
            }
          });
        })
      );
    }

    // Return combo with items
    return await prisma.concessionCombo.findUnique({
      where: { id: combo.id },
      include: {
        items: {
          include: {
            item: true
          }
        }
      }
    });
  });
};

// Update combo
exports.updateCombo = async (id, comboData) => {
  const { name, description, price, image, isAvailable, items } = comboData;

  return await prisma.$transaction(async (prisma) => {
    // Update combo details
    const updateData = {};
    
    Object.keys(comboData).forEach(key => {
      if (comboData[key] !== undefined && key !== 'items') {
        updateData[key] = comboData[key];
      }
    });
    
    // Add updatedAt if there are fields to update
    if (Object.keys(updateData).length > 0) {
      updateData.updatedAt = new Date();
      
      // Update combo
      await prisma.concessionCombo.update({
        where: { id },
        data: updateData
      });
    }

    // Update combo items if provided
    if (items !== undefined) {
      // Delete existing combo items
      await prisma.concessionComboItem.deleteMany({
        where: { comboId: id }
      });

      // Create new combo items
      if (items && items.length > 0) {
        await Promise.all(
          items.map(async (item) => {
            await prisma.concessionComboItem.create({
              data: {
                comboId: id,
                itemId: item.itemId,
                quantity: item.quantity
              }
            });
          })
        );
      }
    }

    // Return updated combo with items
    return await prisma.concessionCombo.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            item: true
          }
        }
      }
    });
  });
};

// Delete combo
exports.deleteCombo = async (id) => {
  return await prisma.$transaction(async (prisma) => {
    // Delete combo items first
    await prisma.concessionComboItem.deleteMany({
      where: { comboId: id }
    });

    // Delete combo
    return await prisma.concessionCombo.delete({
      where: { id }
    });
  });
};

// Check if combo is used in any order
exports.isComboUsedInOrder = async (id) => {
  const orderItemCount = await prisma.concessionOrderItem.count({
    where: {
      comboId: id
    }
  });
  
  return orderItemCount > 0;
};

// Get popular combos
exports.getPopularCombos = async (limit = 5) => {
  // Get most ordered combos
  const popularCombos = await prisma.concessionOrderItem.groupBy({
    by: ['comboId'],
    _sum: {
      quantity: true
    },
    where: {
      comboId: {
        not: null
      }
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: limit
  });
  
  // Get details of popular combos
  const comboIds = popularCombos.map(combo => combo.comboId);
  
  return await prisma.concessionCombo.findMany({
    where: {
      id: {
        in: comboIds
      },
      isAvailable: true
    },
    include: {
      items: {
        include: {
          item: true
        }
      }
    }
  });
};

// Search combos by name
exports.searchCombos = async (searchTerm) => {
  return await prisma.concessionCombo.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: 'insensitive'
      }
    },
    include: {
      items: {
        include: {
          item: true
        }
      }
    },
    orderBy: {
      name: 'asc'
    }
  });
};

// Update combo availability
exports.updateComboAvailability = async (id, isAvailable) => {
  return await prisma.concessionCombo.update({
    where: { id },
    data: {
      isAvailable,
      updatedAt: new Date()
    },
    include: {
      items: {
        include: {
          item: true
        }
      }
    }
  });
};

// Get combos by IDs
exports.getCombosByIds = async (ids) => {
  return await prisma.concessionCombo.findMany({
    where: {
      id: {
        in: ids
      }
    },
    include: {
      items: {
        include: {
          item: true
        }
      }
    }
  });
};

// Check if combo exists
exports.comboExists = async (id) => {
  const count = await prisma.concessionCombo.count({
    where: { id }
  });
  
  return count > 0;
};

// Validate combo items
exports.validateComboItems = async (items) => {
  if (!items || !Array.isArray(items) || items.length === 0) {
    return {
      valid: false,
      message: 'Combo phải có ít nhất một sản phẩm'
    };
  }
  
  // Check if all items exist and are available
  const itemIds = items.map(item => item.itemId);
  const existingItems = await prisma.concessionItem.findMany({
    where: {
      id: {
        in: itemIds
      }
    },
    select: {
      id: true,
      isAvailable: true
    }
  });
  
  if (existingItems.length !== itemIds.length) {
    return {
      valid: false,
      message: 'Một số sản phẩm không tồn tại'
    };
  }
  
  const unavailableItems = existingItems.filter(item => !item.isAvailable);
  if (unavailableItems.length > 0) {
    return {
      valid: false,
      message: 'Một số sản phẩm không khả dụng',
      unavailableItems: unavailableItems.map(item => item.id)
    };
  }
  
  return {
    valid: true
  };
};