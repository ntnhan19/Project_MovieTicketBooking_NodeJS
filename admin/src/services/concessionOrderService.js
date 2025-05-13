// admin/src/services/concessionOrderService.js
import { apiUrl, httpClient, checkAuth } from "./httpClient";
import { processApiResponse, processManyResponse } from "./utils";

const concessionOrderService = {
  getList: async ({ pagination, sort, filter }) => {
    const { page, perPage } = pagination;
    const { field, order } = sort;

    // Xử lý các tham số filter đặc biệt nếu có
    const { startDate, endDate, ...otherFilters } = filter || {};

    const query = {
      page,
      limit: perPage,
      ...otherFilters,
    };

    // Xử lý sort
    if (field && order) {
      // Sửa cách đặt tên tham số sort để phù hợp với backend
      query.sort = field;
      query.order = order;
    }

    // Xử lý filter ngày
    if (startDate) {
      query.startDate = new Date(startDate).toISOString();
    }

    if (endDate) {
      query.endDate = new Date(endDate).toISOString();
    }

    // Convert các giá trị query thành string để tránh lỗi URLSearchParams
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
      console.error("Lỗi khi gọi API:", error);
      throw new Error(`Lỗi khi lấy danh sách đơn hàng: ${error.message}`);
    }
  },

  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/concession/orders/${id}`);

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
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

    // Xử lý dữ liệu trước khi gửi đi
    const data = { ...record };

    // Xử lý items nếu có
    if (data.items && data.items.length > 0) {
      data.items = data.items.map((item) => ({
        itemId: parseInt(item.itemId),
        quantity: parseInt(item.quantity),
        price: parseFloat(item.price),
      }));
    }

    // Xử lý combos nếu có
    if (data.combos && data.combos.length > 0) {
      data.combos = data.combos.map((combo) => ({
        comboId: parseInt(combo.comboId),
        quantity: parseInt(combo.quantity),
        price: parseFloat(combo.price),
      }));
    }

    // Xử lý ticketIds nếu có
    if (data.ticketIds && data.ticketIds.length > 0) {
      data.ticketIds = data.ticketIds.map((id) => parseInt(id));
    }

    // Đảm bảo có orderType, mặc định là STANDALONE
    data.orderType = data.orderType || "STANDALONE";

    // Đảm bảo có status, mặc định là PENDING
    data.status = data.status || "PENDING";

    // Đảm bảo totalAmount là số
    if (data.totalAmount) {
      data.totalAmount = parseFloat(data.totalAmount);
    }

    // Xử lý pickupTime nếu có
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

  // Cập nhật trạng thái đơn hàng
  updateStatus: async (id, status) => {
    const token = checkAuth();

    // Đảm bảo status là một trong các giá trị hợp lệ từ schema Prisma
    const validStatuses = [
      "PENDING",
      "CONFIRMED", // Thêm trạng thái CONFIRMED từ backend
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

  // Xóa đơn hàng (chỉ dành cho Admin)
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

  // Lấy thống kê đơn hàng
  getStatistics: async (startDate, endDate) => {
    const token = checkAuth();

    let query = "";
    if (startDate) {
      query += `startDate=${new Date(startDate).toISOString()}`;
    }

    if (endDate) {
      query += query
        ? `&endDate=${new Date(endDate).toISOString()}`
        : `endDate=${new Date(endDate).toISOString()}`;
    }

    const url = `${apiUrl}/concession/orders/statistics${
      query ? `?${query}` : ""
    }`;

    const response = await fetch(url, {
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
          `Không thể lấy thống kê đơn hàng (status: ${response.status})`
      );
    }

    const json = await response.json();
    return json.data || json;
  },

  // Phương thức tùy chỉnh cho dropdown trạng thái đơn hàng
  getOrderStatusOptions: () => {
    return [
      { id: "PENDING", name: "Chờ xác nhận" },
      { id: "CONFIRMED", name: "Đã xác nhận" }, // Thêm trạng thái CONFIRMED
      { id: "PAID", name: "Đã thanh toán" },
      { id: "PREPARING", name: "Đang chuẩn bị" },
      { id: "READY", name: "Sẵn sàng giao" },
      { id: "COMPLETED", name: "Đã hoàn thành" },
      { id: "CANCELLED", name: "Đã hủy" },
    ];
  },

  // Phương thức tùy chỉnh cho dropdown trạng thái thanh toán
  getPaymentStatusOptions: () => {
    return [
      { id: "PENDING", name: "Chờ thanh toán" },
      { id: "COMPLETED", name: "Đã thanh toán" },
      { id: "CANCELLED", name: "Đã hủy" },
      { id: "FAILED", name: "Thanh toán thất bại" },
    ];
  },

  // Phương thức tùy chỉnh cho dropdown phương thức thanh toán
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

  // Thêm phương thức mới cho loại đơn hàng
  getOrderTypeOptions: () => {
    return [
      { id: "STANDALONE", name: "Đơn hàng đồ ăn độc lập" },
      { id: "WITH_TICKET", name: "Đơn hàng kèm vé" },
    ];
  },

  // Tạo đơn hàng kèm vé
  createOrderWithTickets: async (record) => {
    // Tự động set orderType = 'WITH_TICKET'
    const orderData = {
      ...record,
      orderType: "WITH_TICKET",
    };

    // Kiểm tra ticketIds
    if (!orderData.ticketIds || !orderData.ticketIds.length) {
      throw new Error("Đơn hàng kèm vé phải chọn ít nhất một vé");
    }

    // Gọi lại phương thức create
    return await concessionOrderService.create(orderData);
  },
};

export default concessionOrderService;
