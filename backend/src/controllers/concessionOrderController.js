// backend/src/controllers/concessionOrderController.js
const concessionOrderService = require("../services/concessionOrderService");

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, startDate, endDate, page, limit, sort, order } = req.query;

    const options = {
      status,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      sort: sort || "createdAt",
      order: order || "desc",
    };

    const orders = await concessionOrderService.getAllOrders(options);

    res.status(200).json({
      success: true,
      data: orders.data,
      pagination: orders.pagination,
    });
  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
};

// Get order by ID (admin only)
exports.getOrderById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await concessionOrderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin đơn hàng",
      error: error.message,
    });
  }
};

// Get user's own orders
exports.getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, page, limit } = req.query;

    const options = {
      status,
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    };

    const orders = await concessionOrderService.getUserOrders(userId, options);

    res.status(200).json({
      success: true,
      data: orders.data,
      pagination: orders.pagination,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng của bạn",
      error: error.message,
    });
  }
};

// Get user's order by ID
exports.getUserOrderById = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id);

    const order = await concessionOrderService.getUserOrderById(
      userId,
      orderId
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin đơn hàng",
      error: error.message,
    });
  }
};

// Create new order
exports.createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      items,
      combos,
      totalAmount,
      note,
      ticketIds, // Thêm mảng ticketIds thay vì showId
      orderType = "STANDALONE", // Thêm orderType
    } = req.body;

    // Validate required fields
    if ((!items || !items.length) && (!combos || !combos.length)) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng phải có ít nhất một sản phẩm hoặc combo",
      });
    }

    // Validate orderType và ticketIds
    if (orderType === "WITH_TICKET" && (!ticketIds || !ticketIds.length)) {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng kèm vé phải chọn ít nhất một vé",
      });
    }

    if (!totalAmount || totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Tổng tiền phải lớn hơn 0",
      });
    }

    // Format items if provided
    const formattedItems = items
      ? items.map((item) => ({
          itemId: parseInt(item.itemId),
          quantity: parseInt(item.quantity),
          price: parseFloat(item.price),
        }))
      : [];

    // Format combos if provided
    const formattedCombos = combos
      ? combos.map((combo) => ({
          comboId: parseInt(combo.id),
          quantity: parseInt(combo.quantity),
          price: parseFloat(combo.price),
        }))
      : [];

    // Validate comboIds
    for (const combo of formattedCombos) {
      if (!combo.comboId || isNaN(combo.comboId)) {
        return res.status(400).json({
          success: false,
          message: `ID combo không hợp lệ: ${JSON.stringify(combo)}`,
        });
      }
    }

    const formattedTicketIds = ticketIds
      ? ticketIds.map((id) => parseInt(id))
      : [];

    const order = await concessionOrderService.createOrder({
      userId,
      items: formattedItems,
      combos: formattedCombos,
      totalAmount: parseFloat(totalAmount),
      note,
      orderType,
      ticketIds: formattedTicketIds,
      status: "PENDING", // Default status
    });

    res.status(201).json({
      success: true,
      message: "Đặt hàng thành công",
      data: order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo đơn hàng",
      error: error.message,
    });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    // Validate status
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PREPARING",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    // Check if order exists
    const existingOrder = await concessionOrderService.getOrderById(id);
    if (!existingOrder) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Check if order is already cancelled or completed
    if (existingOrder.status === "CANCELLED") {
      return res.status(400).json({
        success: false,
        message: "Đơn hàng đã bị hủy và không thể cập nhật",
      });
    }

    if (existingOrder.status === "COMPLETED" && status !== "CANCELLED") {
      return res.status(400).json({
        success: false,
        message:
          "Đơn hàng đã hoàn thành và không thể cập nhật trạng thái khác ngoại trừ hủy",
      });
    }

    const updatedOrder = await concessionOrderService.updateOrderStatus(
      id,
      status
    );

    res.status(200).json({
      success: true,
      message: "Cập nhật trạng thái đơn hàng thành công",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
};

// Cập nhật thông tin đơn hàng (user sở hữu đơn hàng)
exports.updateOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const userId = req.user.id;
    const { ticketIds, orderType } = req.body;

    // Kiểm tra đơn hàng tồn tại và thuộc về user
    const order = await concessionOrderService.getUserOrderById(userId, id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng hoặc bạn không có quyền truy cập",
      });
    }

    // Kiểm tra trạng thái đơn hàng
    const updatableStatuses = ["PENDING", "CONFIRMED"];
    if (!updatableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Không thể cập nhật đơn hàng ở trạng thái hiện tại",
      });
    }

    // Kiểm tra orderType hợp lệ
    const validOrderTypes = ["STANDALONE", "WITH_TICKET"];
    if (orderType && !validOrderTypes.includes(orderType)) {
      return res.status(400).json({
        success: false,
        message: "Loại đơn hàng không hợp lệ",
      });
    }

    // Kiểm tra ticketIds
    if (ticketIds && !Array.isArray(ticketIds)) {
      return res.status(400).json({
        success: false,
        message: "ticketIds phải là một mảng",
      });
    }

    // Cập nhật đơn hàng
    const updatedOrder = await concessionOrderService.updateOrder(id, {
      ticketIds,
      orderType,
    });

    res.status(200).json({
      success: true,
      message: "Cập nhật đơn hàng thành công",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Error in updateOrder:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật đơn hàng",
      error: error.message,
    });
  }
};

// Cancel order (user can cancel their own orders)
exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = parseInt(req.params.id);

    // Check if order exists and belongs to user
    const order = await concessionOrderService.getUserOrderById(
      userId,
      orderId
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Check if order can be cancelled
    const cancelableStatuses = ["PENDING", "CONFIRMED"];
    if (!cancelableStatuses.includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy đơn hàng ở trạng thái hiện tại",
      });
    }

    const updatedOrder = await concessionOrderService.updateOrderStatus(
      orderId,
      "CANCELLED"
    );

    res.status(200).json({
      success: true,
      message: "Hủy đơn hàng thành công",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi hủy đơn hàng",
      error: error.message,
    });
  }
};

// Delete order (admin only)
exports.deleteOrder = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // Check if order exists
    const order = await concessionOrderService.getOrderById(id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    // Delete order
    await concessionOrderService.deleteOrder(id);

    res.status(200).json({
      success: true,
      message: "Xóa đơn hàng thành công",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa đơn hàng",
      error: error.message,
    });
  }
};

exports.createOrderWithTickets = async (req, res) => {
  // Tự động set orderType = 'WITH_TICKET'
  req.body.orderType = "WITH_TICKET";

  // Validate thêm về ticketIds
  if (!req.body.ticketIds || !req.body.ticketIds.length) {
    return res.status(400).json({
      success: false,
      message: "Đơn hàng kèm vé phải chọn ít nhất một vé",
    });
  }

  // Gọi lại hàm createOrder
  return await this.createOrder(req, res);
};

exports.getOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    console.log('[getOrderStatistics] Request params:', { startDate, endDate });

    // Validate và convert dates
    let start, end;
    
    if (startDate) {
      start = new Date(startDate);
      if (isNaN(start.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Ngày bắt đầu không hợp lệ",
        });
      }
    }

    if (endDate) {
      end = new Date(endDate);
      if (isNaN(end.getTime())) {
        return res.status(400).json({
          success: false,
          message: "Ngày kết thúc không hợp lệ",
        });
      }
    }

    const statistics = await concessionOrderService.getOrderStatistics(start, end);

    console.log('[getOrderStatistics] Statistics result:', statistics);

    // Đảm bảo format response đúng như frontend mong đợi
    res.status(200).json({
      success: true,
      data: {
        totalSales: statistics.totalRevenue || 0,
        totalOrders: statistics.totalOrders || 0,
        // Có thể thêm các thông tin khác nếu cần
        statusCounts: statistics.statusCounts || {},
        topItems: statistics.topItems || [],
        topCombos: statistics.topCombos || []
      },
    });
  } catch (error) {
    console.error("Error in getOrderStatistics:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê đơn hàng",
      error: error.message,
    });
  }
};
