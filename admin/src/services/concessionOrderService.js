import { apiUrl, httpClient, checkAuth } from "./httpClient";
import { processApiResponse, processManyResponse } from "./utils";

const concessionOrderService = {
  getList: async ({ pagination, sort, filter }) => {
    const { page, perPage } = pagination;
    const { field, order } = sort;

    const { startDate, endDate, ...otherFilters } = filter || {};

    const query = {
      page,
      limit: perPage,
      ...otherFilters,
    };

    if (field && order) {
      query.sort = field;
      query.order = order;
    }

    if (startDate) {
      query.startDate = new Date(startDate).toISOString();
    }

    if (endDate) {
      query.endDate = new Date(endDate).toISOString();
    }

    const stringQuery = {};
    for (const key in query) {
      if (query[key] !== undefined && query[key] !== null) {
        stringQuery[key] = String(query[key]);
      }
    }

    const url = `${apiUrl}/concession/orders?${new URLSearchParams(
      stringQuery
    )}`;
    try {
      const { json, headers } = await httpClient(url);
      return processApiResponse(json, headers);
    } catch (error) {
      console.error("Lỗi khi gọi API danh sách đơn hàng:", error);
      throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
    }
  },

  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/concession/orders/${id}`);
    const data = json.data || json;
    return { data };
  },

  getMany: async (ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/concession/orders?${query}`);
    const resultData = processManyResponse(json);
    return { data: resultData };
  },

  getManyReference: async ({ target, id, pagination, sort, filter }) => {
    const { page, perPage } = pagination;
    const { field, order } = sort;

    const query = {
      ...filter,
      [target]: id,
      page,
      limit: perPage,
    };

    if (field && order) {
      query._sort = field;
      query._order = order;
    }

    const url = `${apiUrl}/concession/orders?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);
    return processApiResponse(json, headers);
  },

  create: async (record) => {
    const token = checkAuth();
    const data = { ...record };

    if (data.items && data.items.length > 0) {
      data.items = data.items.map((item) => ({
        itemId: parseInt(item.itemId),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
      }));
    }

    if (data.combos && data.combos.length > 0) {
      data.combos = data.combos.map((combo) => ({
        comboId: parseInt(combo.comboId),
        quantity: parseInt(combo.quantity),
        price: parseFloat(combo.price),
      }));
    }

    if (data.ticketIds && data.ticketIds.length > 0) {
      data.ticketIds = data.ticketIds.map((id) => parseInt(id));
    }

    data.orderType = data.orderType || "STANDALONE";
    data.status = data.status || "PENDING";

    if (data.totalAmount) {
      data.totalAmount = parseFloat(data.totalAmount);
    }

    if (data.pickupTime) {
      data.pickupTime = new Date(data.pickupTime).toISOString();
    }

    const response = await fetch(`${apiUrl}/concession/orders`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Không thể tạo đơn hàng đồ ăn (status: ${response.status})`
      );
    }

    const json = await response.json();
    return { data: json.data || json };
  },

  update: async (id, record) => {
    const token = checkAuth();
    const response = await fetch(`${apiUrl}/concession/orders/${id}`, {
      method: "PUT",
      body: JSON.stringify(record),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message ||
          `Không thể cập nhật đơn hàng đồ ăn (status: ${response.status})`
      );
    }

    const json = await response.json();
    return { data: json.data || json };
  },

  updateStatus: async (id, status) => {
    const token = checkAuth();
    const validStatuses = [
      "PENDING",
      "CONFIRMED",
      "PAID",
      "PREPARING",
      "READY",
      "COMPLETED",
      "CANCELLED",
    ];
    if (!validStatuses.includes(status)) {
      throw new Error(
        `Trạng thái không hợp lệ. Các trạng thái hợp lệ là: ${validStatuses.join(
          ", "
        )}`
      );
    }

    const response = await fetch(`${apiUrl}/concession/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(
        errorData.message ||
          `Không thể cập nhật trạng thái đơn hàng (status: ${response.status})`
      );
    }

    const json = await response.json();
    return { data: json.data || json };
  },

  delete: async (id) => {
    const token = checkAuth();
    const response = await fetch(`${apiUrl}/concession/orders/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(
        errorData.message ||
          `Không thể xóa đơn hàng (status: ${response.status})`
      );
    }

    const json = await response.json();
    return { data: json };
  },

  deleteMany: async (ids) => {
    const token = checkAuth();
    const promises = ids.map((id) =>
      fetch(`${apiUrl}/concession/orders/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },

  getStatistics: async (startDate, endDate) => {
    const token = checkAuth();

    if (!(startDate instanceof Date) || isNaN(startDate)) {
      console.warn("[getStatistics] Invalid startDate:", startDate);
      startDate = new Date();
      startDate.setDate(1);
      startDate.setHours(0, 0, 0, 0);
    }
    if (!(endDate instanceof Date) || isNaN(endDate)) {
      console.warn("[getStatistics] Invalid endDate:", endDate);
      endDate = new Date();
    }

    try {
      const query = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        status: "PAID", // Chỉ lấy đơn hàng đã thanh toán
      }).toString();

      const url = `${apiUrl}/concession/orders/statistics?${query}`;
      console.log("[getStatistics] Request URL:", url);

      const { json } = await httpClient(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!json.data || typeof json.data.totalSales !== "number") {
        console.warn("[getStatistics] Invalid response data:", json);
        return { totalSales: 0, totalOrders: 0 };
      }

      return {
        totalSales: json.data.totalSales || 0,
        totalOrders: json.data.totalOrders || 0,
      };
    } catch (error) {
      console.error("[getStatistics] Error fetching statistics:", {
        error: error.message,
        response: error.response ? error.response.data : null,
        status: error.response ? error.response.status : null,
      });
      throw new Error(`Không thể lấy thống kê doanh thu bắp nước: ${error.message}`);
    }
  },

  getOrderStatusOptions: () => {
    return [
      { id: "PENDING", name: "Chờ xác nhận" },
      { id: "CONFIRMED", name: "Đã xác nhận" },
      { id: "PAID", name: "Đã thanh toán" },
      { id: "PREPARING", name: "Đang chuẩn bị" },
      { id: "READY", name: "Sẵn sàng giao" },
      { id: "COMPLETED", name: "Đã hoàn thành" },
      { id: "CANCELLED", name: "Đã hủy" },
    ];
  },

  getPaymentStatusOptions: () => {
    return [
      { id: "PENDING", name: "Chờ thanh toán" },
      { id: "COMPLETED", name: "Đã thanh toán" },
      { id: "CANCELLED", name: "Đã hủy" },
      { id: "FAILED", name: "Thanh toán thất bại" },
    ];
  },

  getPaymentMethodOptions: () => {
    return [
      { id: "CREDIT_CARD", name: "Thẻ tín dụng" },
      { id: "BANK_TRANSFER", name: "Chuyển khoản ngân hàng" },
      { id: "E_WALLET", name: "Ví điện tử" },
      { id: "CASH", name: "Tiền mặt" },
      { id: "ZALOPAY", name: "ZaloPay" },
      { id: "VNPAY", name: "VNPay" },
      { id: "MOMO", name: "MoMo" },
    ];
  },

  getOrderTypeOptions: () => {
    return [
      { id: "STANDALONE", name: "Đơn hàng đồ ăn độc lập" },
      { id: "WITH_TICKET", name: "Đơn hàng kèm vé" },
    ];
  },

  createOrderWithTickets: async (record) => {
    const orderData = {
      ...record,
      orderType: "WITH_TICKET",
    };

    if (!orderData.ticketIds || !orderData.ticketIds.length) {
      throw new Error("Đơn hàng kèm vé phải chọn ít nhất một vé");
    }

    return await concessionOrderService.create(orderData);
  },
};

export default concessionOrderService;