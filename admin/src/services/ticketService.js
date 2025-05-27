// admin/src/services/ticketService.js
import { apiUrl, httpClient, checkAuth } from "./httpClient";
import { processApiResponse, processManyResponse } from "./utils";

const ticketService = {
  /**
   * Lấy danh sách vé với các tùy chọn lọc, sắp xếp và phân trang
   * @param {Object} options - Các tùy chọn
   * @param {Object} options.pagination - Thông tin phân trang
   * @param {Object} options.sort - Thông tin sắp xếp
   * @param {Object} options.filter - Thông tin lọc (status, fromDate, toDate, searchTerm)
   * @returns {Promise<Object>} Danh sách vé và metadata
   */ getList: async ({ pagination, sort, filter }) => {
    try {
      const { page, perPage } = pagination || { page: 1, perPage: 10 };
      const { field, order } = sort || {};

      const query = {
        page,
        limit: perPage,
      };

      // Thêm các điều kiện lọc
      if (filter) {
        if (filter.status) query.status = filter.status;
        if (filter.fromDate) query.fromDate = filter.fromDate;
        if (filter.toDate) query.toDate = filter.toDate;
      }

      // Thêm sắp xếp
      if (field) query._sort = field;
      if (order) query._order = order;

      const { json } = await httpClient(
        `${apiUrl}/tickets?${new URLSearchParams(query)}`
      );

      return {
        data: {
          data: json.data || [],
          total: json.total || 0,
        },
      };
    } catch (error) {
      console.error("Error fetching tickets:", error);
      throw error;
    }
  },

  /**
   * Lấy thông tin chi tiết của một vé
   * @param {string} id - ID của vé
   * @returns {Promise<Object>} Thông tin vé
   */
  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/tickets/${id}`);

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
    const data = json.data || json;

    return { data };
  },

  /**
   * Lấy nhiều vé dựa trên danh sách ID
   * @param {Array<string>} ids - Danh sách ID vé
   * @returns {Promise<Object>} Danh sách vé
   */
  getMany: async (ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/tickets?${query}`);

    const resultData = processManyResponse(json);
    return { data: resultData };
  },

  /**
   * Lấy vé dựa theo tham chiếu (như theo người dùng)
   * @param {Object} options - Các tùy chọn
   * @param {string} options.target - Trường tham chiếu
   * @param {string} options.id - ID tham chiếu
   * @param {Object} options.pagination - Thông tin phân trang
   * @param {Object} options.sort - Thông tin sắp xếp
   * @param {Object} options.filter - Thông tin lọc
   * @returns {Promise<Object>} Danh sách vé
   */
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

    const url = `${apiUrl}/tickets/user/${id}?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  /**
   * Xóa một vé
   * @param {string} id - ID của vé
   * @returns {Promise<Object>} Kết quả xóa
   */
  delete: async (id) => {
    const { json } = await httpClient(`${apiUrl}/tickets/${id}`, {
      method: "DELETE",
    });

    return { data: { id } };
  },

  /**
   * Cập nhật trạng thái của một vé
   * @param {string} id - ID của vé
   * @param {string} status - Trạng thái mới
   * @returns {Promise<Object>} Thông tin vé đã cập nhật
   */
  updateStatus: async (id, status) => {
    const { json } = await httpClient(`${apiUrl}/tickets/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    });

    return { data: json };
  },

  /**
   * Cập nhật hàng loạt trạng thái của nhiều vé
   * @param {Array<string>} ticketIds - Danh sách ID vé
   * @param {string} status - Trạng thái mới
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updateBatchStatus: async (ticketIds, status) => {
    const { json } = await httpClient(`${apiUrl}/tickets/batch-status`, {
      method: "PUT",
      body: JSON.stringify({ ticketIds, status }),
    });

    return { data: { ticketIds, status } };
  },

  /**
   * Áp dụng mã khuyến mãi cho vé
   * @param {string} id - ID của vé
   * @param {string} promotionCode - Mã khuyến mãi
   * @returns {Promise<Object>} Thông tin vé sau khi áp dụng khuyến mãi
   */
  applyPromotion: async (id, promotionCode) => {
    const { json } = await httpClient(`${apiUrl}/tickets/${id}/promotion`, {
      method: "POST",
      body: JSON.stringify({ promotionCode }),
    });

    return { data: json };
  },

  /**
   * Lấy danh sách vé của một người dùng
   * @param {string} userId - ID của người dùng
   * @param {Object} options - Các tùy chọn
   * @returns {Promise<Object>} Danh sách vé của người dùng
   */
  getTicketsByUser: async (userId, { pagination, sort, filter } = {}) => {
    const { page, perPage } = pagination || { page: 1, perPage: 10 };
    const { field, order } = sort || {};

    const query = {
      page,
      limit: perPage,
      ...filter,
    };

    if (field && order) {
      query._sort = field;
      query._order = order;
    }

    const url = `${apiUrl}/tickets/user/${userId}?${new URLSearchParams(
      query
    )}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  /**
   * Lấy danh sách vé liên quan đến một giao dịch thanh toán
   * @param {string} paymentId - ID của giao dịch thanh toán
   * @returns {Promise<Object>} Danh sách vé
   */
  getTicketsByPayment: async (paymentId) => {
    const { json } = await httpClient(`${apiUrl}/tickets/payment/${paymentId}`);
    return { data: json };
  },

  /**
   * Cập nhật thông tin thanh toán cho nhiều vé
   * @param {Array<string>} ticketIds - Danh sách ID vé
   * @param {string} paymentId - ID của giao dịch thanh toán
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  updatePayment: async (ticketIds, paymentId) => {
    const { json } = await httpClient(`${apiUrl}/tickets/update-payment`, {
      method: "PUT",
      body: JSON.stringify({ ticketIds, paymentId }),
    });

    return { data: json };
  },

  /**
   * Khóa ghế tạm thời khi người dùng đang chọn
   * @param {string} seatId - ID của ghế
   * @returns {Promise<Object>} Kết quả khóa ghế
   */
  lockSeat: async (seatId) => {
    const { json } = await httpClient(`${apiUrl}/tickets/lock-seat`, {
      method: "POST",
      body: JSON.stringify({ seatId }),
    });

    return { data: json };
  },

  /**
   * Mở khóa ghế sau khi hết thời gian giữ hoặc người dùng hủy chọn
   * @param {string} seatId - ID của ghế
   * @returns {Promise<Object>} Kết quả mở khóa ghế
   */
  unlockSeat: async (seatId) => {
    const { json } = await httpClient(`${apiUrl}/tickets/unlock-seat`, {
      method: "POST",
      body: JSON.stringify({ seatId }),
    });

    return { data: json };
  },

  /**
   * Lấy thống kê vé theo trạng thái
   * @param {Object} filter - Bộ lọc thời gian (fromDate, toDate)
   * @returns {Promise<Object>} Thống kê vé theo trạng thái
   */
  getTicketStats: async (filter = {}) => {
    const query = new URLSearchParams(filter);
    const { json } = await httpClient(`${apiUrl}/tickets/stats?${query}`);
    return { data: json };
  },

  /**
   * Xuất dữ liệu vé ra file
   * @param {Object} filter - Bộ lọc (status, fromDate, toDate, userId, etc.)
   * @returns {Promise<Blob>} File dữ liệu dạng Blob
   */
  exportTickets: async (filter = {}) => {
    const query = new URLSearchParams(filter);
    const { blob } = await httpClient(`${apiUrl}/tickets/export?${query}`, {
      method: "GET",
      responseType: "blob",
    });

    return blob;
  },

  /**
   * Tạo vé mới
   * @param {Object} ticketData - Dữ liệu vé (userId, showtimeId, seatId, price, etc.)
   * @returns {Promise<Object>} Thông tin vé mới
   */
  create: async (ticketData) => {
    const { json } = await httpClient(`${apiUrl}/tickets`, {
      method: "POST",
      body: JSON.stringify(ticketData),
    });

    return { data: json };
  },

  /**
   * Cập nhật vé
   * @param {string} id - ID của vé
   * @param {Object} ticketData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Thông tin vé đã cập nhật
   */
  update: async (id, ticketData) => {
    const { json } = await httpClient(`${apiUrl}/tickets/${id}`, {
      method: "PUT",
      body: JSON.stringify(ticketData),
    });

    return { data: json };
  },
};

export default ticketService;
