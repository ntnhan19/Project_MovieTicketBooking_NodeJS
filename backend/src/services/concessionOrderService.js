// backend/src/services/concessionOrderService.js
const prisma = require("../../prisma/prisma");

// Get all orders with pagination and filters (admin)
exports.getAllOrders = async (options) => {
  const {
    status,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sort = "createdAt", // Thêm mặc định sort by createdAt
    order = "desc", // Thêm mặc định order by desc
  } = options;

  const skip = (page - 1) * limit;

  // Build filter conditions
  const where = {};

  if (status) {
    where.status = status;
  }

  if (startDate || endDate) {
    where.createdAt = {};

    if (startDate) {
      where.createdAt.gte = startDate;
    }

    if (endDate) {
      where.createdAt.lte = endDate;
    }
  }

  // Validate sort field để tránh lỗi Prisma
  const validSortFields = ['id', 'status', 'totalAmount', 'createdAt', 'updatedAt', 'paymentMethod', 'orderType'];
  const sortField = validSortFields.includes(sort) ? sort : 'createdAt';
  
  // Validate order
  const sortOrder = order.toLowerCase() === 'asc' ? 'asc' : 'desc';

  // Tạo object orderBy động
  const orderBy = {
    [sortField]: sortOrder
  };

  // Count total orders with filter
  const totalOrders = await prisma.concessionOrder.count({ where });

  try {
    // Get orders with pagination
    const orders = await prisma.concessionOrder.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
        items: {
          include: {
            item: true,
            combo: true,
          },
        },
        tickets: true,
        payment: true,
      },
      orderBy,
      skip,
      take: limit,
    });
    
    return {
      data: orders,
      pagination: {
        page,
        limit,
        totalItems: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
    };
  } catch (error) {
    throw error;
  }
};

// Get order by ID (admin)
exports.getOrderById = async (id) => {
  return await prisma.concessionOrder.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          phone: true,
        },
      },
      items: {
        include: {
          item: true,
          combo: true,
        },
      },
      tickets: true,
      payment: true,
    },
  });
};

// Get user's orders with pagination and filters
exports.getUserOrders = async (userId, options) => {
  const { status, page = 1, limit = 10 } = options;
  const skip = (page - 1) * limit;

  // Build filter conditions
  const where = { userId };

  if (status) {
    where.status = status;
  }

  // Count total orders with filter
  const totalOrders = await prisma.concessionOrder.count({ where });

  // Get orders with pagination
  const orders = await prisma.concessionOrder.findMany({
    where,
    include: {
      items: {
        include: {
          item: true,
          combo: true,
        },
      },
      tickets: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
    skip,
    take: limit,
  });

  return {
    data: orders,
    pagination: {
      page,
      limit,
      totalItems: totalOrders,
      totalPages: Math.ceil(totalOrders / limit),
    },
  };
};

// Get user's order by ID
exports.getUserOrderById = async (userId, orderId) => {
  return await prisma.concessionOrder.findFirst({
    where: {
      id: orderId,
      userId,
    },
    include: {
      items: {
        include: {
          item: true,
          combo: true,
        },
      },
      tickets: true,
      payment: true,
    },
  });
};

// Create new order
exports.createOrder = async (orderData) => {
  const {
    userId,
    items,
    combos,
    totalAmount,
    paymentMethod,
    note,
    pickupTime,
    orderType = "STANDALONE",
    ticketIds = [],
    status,
  } = orderData;

  return await prisma.$transaction(async (prisma) => {
    // Tạo đơn hàng
    const order = await prisma.concessionOrder.create({
      data: {
        userId,
        totalAmount,
        paymentMethod,
        note,
        pickupTime,
        orderType,
        status,
        tickets:
          ticketIds.length > 0
            ? {
                connect: ticketIds.map((id) => ({ id })),
              }
            : undefined,
      },
    });

    // Create order items if provided
    if (items && items.length > 0) {
      const orderItemsData = items.map((item) => ({
        orderId: order.id,
        itemId: item.itemId,
        quantity: item.quantity,
        price: item.price,
      }));

      await prisma.concessionOrderItem.createMany({
        data: orderItemsData,
      });
    }

    // Create order combos if provided
    if (combos && combos.length > 0) {
      const orderCombosData = combos.map((combo) => ({
        orderId: order.id,
        comboId: combo.comboId,
        quantity: combo.quantity,
        price: combo.price,
      }));

      await prisma.concessionOrderItem.createMany({
        data: orderCombosData,
      });
    }

    // Return created order with items and combos
    return await prisma.concessionOrder.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            item: true,
            combo: true,
          },
        },
        tickets: true,
        payment: true,
      },
    });
  });
};

// Update order status
exports.updateOrderStatus = async (id, status) => {
  return await prisma.concessionOrder.update({
    where: { id },
    data: {
      status,
      updatedAt: new Date(),
    },
    include: {
      items: {
        include: {
          item: true,
          combo: true,
        },
      },
      tickets: true,
      payment: true,
    },
  });
};

// Delete order (admin only)
exports.deleteOrder = async (id) => {
  // First delete related records
  await prisma.$transaction([
    // Delete order items
    prisma.concessionOrderItem.deleteMany({
      where: { orderId: id },
    }),

    // Delete the order itself
    prisma.concessionOrder.delete({
      where: { id },
    }),
  ]);

  return true;
};

// Get order statistics
exports.getOrderStatistics = async (startDate, endDate) => {
  // Set default date range if not provided
  const start =
    startDate || new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate || new Date();

  // Build where condition for date range
  const where = {
    createdAt: {
      gte: start,
      lte: end,
    },
  };

  // Get total orders
  const totalOrders = await prisma.concessionOrder.count({ where });

  // Get total revenue
  const revenueResult = await prisma.concessionOrder.aggregate({
    where: {
      ...where,
      status: { in: ["COMPLETED", "READY"] }, // Only count completed orders
    },
    _sum: {
      totalAmount: true,
    },
  });

  const totalRevenue = revenueResult._sum.totalAmount || 0;

  // Get orders by status
  const ordersByStatus = await prisma.concessionOrder.groupBy({
    by: ["status"],
    where,
    _count: {
      id: true,
    },
  });

  // Format status counts
  const statusCounts = ordersByStatus.reduce(
    (acc, curr) => {
      acc[curr.status] = curr._count.id;
      return acc;
    },
    {
      PENDING: 0,
      CONFIRMED: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    }
  );

  // Get top selling items
  const topItems = await prisma.concessionOrderItem.groupBy({
    by: ["itemId"],
    where: {
      order: where,
      itemId: { not: null }, // Đảm bảo chỉ lấy items, không phải combos
    },
    _sum: {
      quantity: true,
    },
  });

  // Get item details for top items
  const topItemsWithDetails = await Promise.all(
    topItems
      .sort((a, b) => b._sum.quantity - a._sum.quantity)
      .slice(0, 5) // Get top 5
      .map(async (item) => {
        const itemDetails = await prisma.concessionItem.findUnique({
          where: { id: item.itemId },
        });

        return {
          id: item.itemId,
          name: itemDetails?.name || "Unknown Item",
          quantity: item._sum.quantity,
        };
      })
  );

  // Get top selling combos
  const topCombos = await prisma.concessionOrderItem.groupBy({
    by: ["comboId"],
    where: {
      order: where,
      comboId: { not: null }, // Đảm bảo chỉ lấy combos
    },
    _sum: {
      quantity: true,
    },
  });

  // Get combo details for top combos
  const topCombosWithDetails = await Promise.all(
    topCombos
      .sort((a, b) => b._sum.quantity - a._sum.quantity)
      .slice(0, 5) // Get top 5
      .map(async (combo) => {
        const comboDetails = await prisma.concessionCombo.findUnique({
          where: { id: combo.comboId },
        });

        return {
          id: combo.comboId,
          name: comboDetails?.name || "Unknown Combo",
          quantity: combo._sum.quantity,
        };
      })
  );

  return {
    totalOrders,
    totalRevenue,
    statusCounts,
    topItems: topItemsWithDetails,
    topCombos: topCombosWithDetails,
  };
};


// Check if order exists
exports.orderExists = async (id) => {
  const count = await prisma.concessionOrder.count({
    where: { id },
  });

  return count > 0;
};
