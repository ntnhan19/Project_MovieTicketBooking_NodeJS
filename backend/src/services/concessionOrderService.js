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
  const validSortFields = [
    "id",
    "status",
    "totalAmount",
    "createdAt",
    "updatedAt",
    "orderType",
  ];
  const sortField = validSortFields.includes(sort) ? sort : "createdAt";

  // Validate order
  const sortOrder = order.toLowerCase() === "asc" ? "asc" : "desc";

  // Tạo object orderBy động
  const orderBy = {
    [sortField]: sortOrder,
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
    totalAmount: clientTotalAmount,
    note,
    orderType = "STANDALONE",
    ticketIds = [],
    status,
  } = orderData;

  // Tính lại totalAmount từ items và combos
  let calculatedTotalAmount = 0;
  if (items && items.length > 0) {
    calculatedTotalAmount += items.reduce(
      (sum, item) => sum + (item.price || 0) * (item.quantity || 0),
      0
    );
  }
  if (combos && combos.length > 0) {
    calculatedTotalAmount += combos.reduce(
      (sum, combo) => sum + (combo.price || 0) * (combo.quantity || 0),
      0
    );
  }

  // Làm tròn đến 2 chữ số thập phân
  calculatedTotalAmount = Math.round(calculatedTotalAmount * 100) / 100;

  // So sánh với totalAmount từ client
  if (
    clientTotalAmount &&
    Math.abs(calculatedTotalAmount - clientTotalAmount) > 0.01
  ) {
    console.warn(
      `Total amount mismatch: Client provided ${clientTotalAmount}, calculated ${calculatedTotalAmount}`
    );
  }

  return await prisma.$transaction(async (prisma) => {
    console.log("Creating concession order with data:", orderData);

    const order = await prisma.concessionOrder.create({
      data: {
        userId,
        totalAmount: calculatedTotalAmount,
        note,
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

    console.log("Created order:", order);

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

    if (combos && combos.length > 0) {
      const orderCombosData = combos.map((combo) => {
        if (!combo.comboId) {
          throw new Error(
            `Invalid comboId for combo: ${JSON.stringify(combo)}`
          );
        }
        return {
          orderId: order.id,
          comboId: combo.comboId,
          quantity: combo.quantity,
          price: combo.price,
        };
      });
      console.log("Creating order combos:", orderCombosData);
      await prisma.concessionOrderItem.createMany({
        data: orderCombosData,
      });
    }

    const finalOrder = await prisma.concessionOrder.findUnique({
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

    console.log("Final order with includes:", finalOrder);
    return finalOrder;
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

// Cập nhật thông tin đơn hàng
exports.updateOrder = async (id, updateData) => {
  const { ticketIds, orderType } = updateData;

  return await prisma.$transaction(async (prisma) => {
    const updateData = {};

    // Cập nhật orderType nếu được cung cấp
    if (orderType) {
      updateData.orderType = orderType;
    }

    // Cập nhật ticketIds nếu được cung cấp
    if (ticketIds && Array.isArray(ticketIds)) {
      // Ngắt kết nối các ticket hiện tại (nếu có)
      await prisma.concessionOrder.update({
        where: { id },
        data: {
          tickets: {
            set: [], // Ngắt kết nối tất cả tickets
          },
        },
      });

      // Kết nối lại các ticket mới
      updateData.tickets = {
        connect: ticketIds.map((ticketId) => ({ id: ticketId })),
      };
    }

    // Cập nhật đơn hàng
    const updatedOrder = await prisma.concessionOrder.update({
      where: { id },
      data: updateData,
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

    return updatedOrder;
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
  try {
    // Set default date range if not provided
    const start =
      startDate || new Date(new Date().setDate(new Date().getDate() - 30));
    const end = endDate || new Date();

    console.log("[getOrderStatistics] Date range:", { start, end });

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new Error("Ngày không hợp lệ");
    }

    // Build where condition for date range
    const where = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    // Build where condition for PAID orders
    const paidWhere = {
      ...where,
      status: "PAID",
    };

    console.log("[getOrderStatistics] Where conditions:", { where, paidWhere });

    // Get total PAID orders
    const totalOrders = await prisma.concessionOrder.count({
      where: paidWhere,
    });

    console.log("[getOrderStatistics] Total orders:", totalOrders);

    // Get total revenue for PAID orders
    const revenueResult = await prisma.concessionOrder.aggregate({
      where: paidWhere,
      _sum: {
        totalAmount: true,
      },
    });

    console.log("[getOrderStatistics] Revenue result:", revenueResult);

    const totalRevenue = revenueResult._sum.totalAmount || 0;

    // Get orders by status (tất cả status trong khoảng thời gian)
    const ordersByStatus = await prisma.concessionOrder.groupBy({
      by: ["status"],
      where: where, // Không filter theo status ở đây
      _count: {
        id: true,
      },
    });

    console.log("[getOrderStatistics] Orders by status:", ordersByStatus);

    // Format status counts với default values
    const statusCounts = {
      PENDING: 0,
      CONFIRMED: 0,
      PAID: 0,
      PREPARING: 0,
      READY: 0,
      COMPLETED: 0,
      CANCELLED: 0,
    };

    ordersByStatus.forEach((item) => {
      statusCounts[item.status] = item._count.id;
    });

    // Get top selling items for PAID orders only
    const topItems = await prisma.concessionOrderItem.groupBy({
      by: ["itemId"],
      where: {
        order: paidWhere,
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
      take: 5,
    });

    console.log("[getOrderStatistics] Top items raw:", topItems);

    // Get item details for top items
    const topItemsWithDetails = await Promise.all(
      topItems.map(async (item) => {
        try {
          const itemDetails = await prisma.concessionItem.findUnique({
            where: { id: item.itemId },
            include: {
              category: true,
            },
          });
          return {
            id: item.itemId,
            name: itemDetails?.name || "Unknown Item",
            category: itemDetails?.category || { name: "Không xác định" },
            quantitySold: item._sum.quantity || 0,
            price: itemDetails?.price || 0,
          };
        } catch (error) {
          console.error(
            "[getOrderStatistics] Error getting item details:",
            error
          );
          return {
            id: item.itemId,
            name: "Unknown Item",
            category: { name: "Không xác định" },
            quantitySold: item._sum.quantity || 0,
            price: 0,
          };
        }
      })
    );

    // Get top selling combos for PAID orders only
    const topCombos = await prisma.concessionOrderItem.groupBy({
      by: ["comboId"],
      where: {
        order: paidWhere,
        comboId: { not: null },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: "desc",
        },
      },
      take: 5,
    });

    console.log("[getOrderStatistics] Top combos raw:", topCombos);

    // Get combo details for top combos
    const topCombosWithDetails = await Promise.all(
      topCombos.map(async (combo) => {
        try {
          const comboDetails = await prisma.concessionCombo.findUnique({
            where: { id: combo.comboId },
            include: {
              category: true,
            },
          });
          return {
            id: combo.comboId,
            name: comboDetails?.name || "Unknown Combo",
            category: comboDetails?.category || { name: "Không xác định" },
            quantitySold: combo._sum.quantity || 0,
            price: comboDetails?.price || 0,
          };
        } catch (error) {
          console.error(
            "[getOrderStatistics] Error getting combo details:",
            error
          );
          return {
            id: combo.comboId,
            name: "Unknown Combo",
            category: { name: "Không xác định" },
            quantitySold: combo._sum.quantity || 0,
            price: 0,
          };
        }
      })
    );

    const result = {
      totalOrders,
      totalRevenue,
      statusCounts,
      topItems: topItemsWithDetails,
      topCombos: topCombosWithDetails,
    };

    console.log("[getOrderStatistics] Final result:", result);
    return result;
  } catch (error) {
    console.error("[getOrderStatistics] Error:", error);
    console.error("[getOrderStatistics] Error stack:", error.stack);
    throw new Error(`Lỗi khi lấy thống kê đơn hàng: ${error.message}`);
  }
};

// Check if order exists
exports.orderExists = async (id) => {
  const count = await prisma.concessionOrder.count({
    where: { id },
  });

  return count > 0;
};
