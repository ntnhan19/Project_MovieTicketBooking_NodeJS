// backend/src/services/concessionItemService.js
const prisma = require("../../prisma/prisma");

// Get all items
exports.getAllItems = async () => {
  return await prisma.concessionItem.findMany({
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

// Get items by category
exports.getItemsByCategory = async (categoryId) => {
  return await prisma.concessionItem.findMany({
    where: {
      categoryId,
    },
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

// Get available items by category
exports.getAvailableItemsByCategory = async (categoryId) => {
  return await prisma.concessionItem.findMany({
    where: {
      categoryId,
      isAvailable: true,
    },
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

// Get item by ID
exports.getItemById = async (id) => {
  return await prisma.concessionItem.findUnique({
    where: { id },
    include: {
      category: true,
    },
  });
};

// Create new item
exports.createItem = async (itemData) => {
  const { name, description, price, image, isAvailable, categoryId, size } =
    itemData;

  return await prisma.concessionItem.create({
    data: {
      name,
      description,
      price,
      image,
      isAvailable: isAvailable === undefined ? true : isAvailable,
      categoryId,
      size,
    },
    include: {
      category: true,
    },
  });
};

// Update item
exports.updateItem = async (id, itemData) => {
  // Filter out undefined values
  const updateData = {};

  Object.keys(itemData).forEach((key) => {
    if (itemData[key] !== undefined) {
      updateData[key] = itemData[key];
    }
  });

  return await prisma.concessionItem.update({
    where: { id },
    data: updateData,
    include: {
      category: true,
    },
  });
};

// Delete item
exports.deleteItem = async (id) => {
  return await prisma.concessionItem.delete({
    where: { id },
  });
};

// Check if item is used in any combo
exports.isItemUsedInCombo = async (id) => {
  const comboItemCount = await prisma.concessionComboItem.count({
    where: {
      itemId: id,
    },
  });

  return comboItemCount > 0;
};

// Check if item is used in any order
exports.isItemUsedInOrder = async (id) => {
  const orderItemCount = await prisma.concessionOrderItem.count({
    where: {
      itemId: id,
    },
  });

  return orderItemCount > 0;
};

// Search items by name
exports.searchItems = async (searchTerm) => {
  return await prisma.concessionItem.findMany({
    where: {
      name: {
        contains: searchTerm,
        mode: "insensitive",
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

// Get all available items
exports.getAllAvailableItems = async () => {
  return await prisma.concessionItem.findMany({
    where: {
      isAvailable: true,
      category: {
        isActive: true,
      },
    },
    include: {
      category: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

// Get items by IDs
exports.getItemsByIds = async (ids) => {
  return await prisma.concessionItem.findMany({
    where: {
      id: {
        in: ids,
      },
    },
    include: {
      category: true,
    },
  });
};

// Get popular items
exports.getPopularItems = async (limit = 5) => {
  try {
    // Get most ordered items from PAID orders
    const popularItems = await prisma.concessionOrderItem.groupBy({
      by: ["itemId"],
      where: {
        order: {
          status: "PAID", // Chỉ lấy items từ các đơn hàng có trạng thái PAID
        },
        itemId: { not: null },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: limit,
    });

    // Get item IDs
    const itemIds = popularItems
      .map((item) => item.itemId)
      .filter((id) => id !== null);

    if (itemIds.length === 0) {
      return []; // Return empty array if no popular items
    }

    // Get details of popular items
    const items = await prisma.concessionItem.findMany({
      where: {
        id: {
          in: itemIds,
        },
        isAvailable: true,
      },
      include: {
        category: true,
      },
    });

    // Map items to include quantity sold
    const result = items.map((item) => ({
      ...item,
      quantitySold:
        popularItems.find((pi) => pi.itemId === item.id)?._sum.quantity || 0,
    }));

    // Sort items to maintain order based on quantity
    return result.sort((a, b) => {
      const aQuantity =
        popularItems.find((pi) => pi.itemId === a.id)?._sum.quantity || 0;
      const bQuantity =
        popularItems.find((pi) => pi.itemId === b.id)?._sum.quantity || 0;
      return bQuantity - aQuantity;
    });
  } catch (error) {
    console.error("Error in getPopularItems:", error);
    throw new Error("Lỗi khi lấy danh sách sản phẩm phổ biến");
  }
};

// Update multiple items' availability
exports.updateItemsAvailability = async (ids, isAvailable) => {
  return await prisma.concessionItem.updateMany({
    where: {
      id: {
        in: ids,
      },
    },
    data: {
      isAvailable,
      updatedAt: new Date(),
    },
  });
};

// Bulk create items
exports.bulkCreateItems = async (items) => {
  return await prisma.$transaction(
    items.map((item) =>
      prisma.concessionItem.create({
        data: {
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          isAvailable: item.isAvailable === undefined ? true : item.isAvailable,
          categoryId: item.categoryId,
          size: item.size,
        },
      })
    )
  );
};

// Check if item exists
exports.itemExists = async (id) => {
  const count = await prisma.concessionItem.count({
    where: { id },
  });

  return count > 0;
};
