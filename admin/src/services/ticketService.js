// admin/src/services/ticketService.js
import { apiUrl, httpClient, checkAuth } from './httpClient';
import { processApiResponse, processManyResponse } from './utils';

const ticketService = {
  getList: async ({ pagination, sort, filter }) => {
    const { page, perPage } = pagination;
    const { field, order } = sort;
    const query = {
      page,
      limit: perPage,
      ...filter,
    };

    if (field && order) {
      query._sort = field;
      query._order = order;
    }

    const url = `${apiUrl}/tickets?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/tickets/${id}`);

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
    const data = json.data || json;
    
    return { data };
  },

  getMany: async (ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/tickets?${query}`);
    
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

    const url = `${apiUrl}/tickets/user/${id}?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  delete: async (id) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/tickets/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi xóa vé");
    }
    
    return { data: { id } };
  },

  updateStatus: async (id, status) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/tickets/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi cập nhật trạng thái vé");
    }

    const json = await response.json();
    return { data: json };
  },

  updateBatchStatus: async (ticketIds, status) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/tickets/batch-status`, {
      method: "PUT",
      body: JSON.stringify({ ticketIds, status }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi cập nhật hàng loạt trạng thái vé");
    }

    const json = await response.json();
    return { data: { ticketIds, status } };
  },

  applyPromotion: async (id, promotionCode) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/tickets/${id}/promotion`, {
      method: "POST",
      body: JSON.stringify({ promotionCode }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi áp dụng khuyến mãi");
    }

    const json = await response.json();
    return { data: json };
  },

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

    const url = `${apiUrl}/tickets/user/${userId}?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  getTicketsByPayment: async (paymentId) => {
    const { json } = await httpClient(`${apiUrl}/tickets/payment/${paymentId}`);
    return { data: json };
  },

  updatePayment: async (ticketIds, paymentId) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/tickets/update-payment`, {
      method: "PUT",
      body: JSON.stringify({ ticketIds, paymentId }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi cập nhật thanh toán vé");
    }

    const json = await response.json();
    return { data: json };
  }
};

export default ticketService;