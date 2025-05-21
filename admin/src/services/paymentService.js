// admin/src/services/paymentService.js
import { apiUrl, httpClient, checkAuth } from './httpClient';
import { processApiResponse, processManyResponse } from './utils';

const paymentService = {
  // Lấy danh sách thanh toán (có phân trang, sắp xếp, lọc)
  getList: async ({ pagination, sort, filter }) => {
    const { page, perPage } = pagination;
    const { field, order } = sort || {};

    const query = {
      page,
      perPage,
    };

    // Thêm tham số tìm kiếm nếu có
    if (filter) {
      if (filter.search) {
        query.search = filter.search;
      }
      
      // Lọc theo phương thức thanh toán
      if (filter.method) {
        query.method = filter.method;
      }
      
      // Lọc theo trạng thái thanh toán
      if (filter.status) {
        query.status = filter.status;
      }
      
      // Lọc theo khoảng thời gian
      if (filter.startDate) {
        query.startDate = filter.startDate;
      }
      
      if (filter.endDate) {
        query.endDate = filter.endDate;
      }
    }

    // Thêm tham số sắp xếp
    if (field && order) {
      query.sortBy = field;
      query.sortOrder = order.toLowerCase();
    }

    try {
      const token = checkAuth();
      const url = `${apiUrl}/payments?${new URLSearchParams(query)}`;
      const { json } = await httpClient(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Backend trả về dữ liệu dạng { data: [...], total: number }
      if (json && typeof json.total === 'number') {
        return {
          data: {
            data: json.data,
            total: json.total
          }
        };
      }

      // Fallback cho trường hợp response không đúng format
      console.warn('Định dạng phản hồi API không đúng:', json);
      return {
        data: {
          data: Array.isArray(json) ? json : [],
          total: Array.isArray(json) ? json.length : 0
        }
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thanh toán:", error);
      return { data: { data: [], total: 0 } };
    }
  },

  // Lấy thông tin chi tiết của một thanh toán
  getOne: async (id) => {
    try {
      const token = checkAuth();
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        throw new Error(`ID thanh toán không hợp lệ: ${id}`);
      }

      const { json } = await httpClient(`${apiUrl}/payments/${numericId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!json) {
        throw new Error(`Không tìm thấy thanh toán với ID ${numericId}`);
      }
      
      // Xử lý trường hợp API trả về cấu trúc { data: {...} } hoặc trực tiếp đối tượng
      const data = json.data || json;
      
      return { data };
    } catch (error) {
      console.error(`Lỗi khi lấy thông tin thanh toán ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy nhiều thanh toán theo danh sách ID
  getMany: async (ids) => {
    try {
      const token = checkAuth();
      const numericIds = ids.map(id => parseInt(id)).filter(id => !isNaN(id));
      
      if (numericIds.length === 0) {
        return { data: [] };
      }
      
      const query = numericIds.map((id) => `id=${id}`).join("&");
      const { json } = await httpClient(`${apiUrl}/payments?${query}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      // Xử lý trường hợp API trả về mảng trực tiếp
      const resultData = Array.isArray(json) ? json : processManyResponse(json);
      return { data: resultData };
    } catch (error) {
      console.error("Lỗi khi lấy nhiều thanh toán:", error);
      return { data: [] };
    }
  },

  // Lấy thanh toán theo tham chiếu (ví dụ: theo người dùng, theo vé...)
  getManyReference: async ({ target, id, pagination, sort, filter }) => {
    const { page, perPage } = pagination;
    const { field, order } = sort || {};

    const query = {
      page,
      perPage,
    };
    
    // Thêm tham số lọc
    if (filter) {
      Object.keys(filter).forEach(key => {
        query[key] = filter[key];
      });
    }
    
    // Thêm tham số target (ví dụ: userId, ticketId...)
    if (target) {
      query[target] = id;
    }
    
    // Thêm tham số sắp xếp
    if (field && order) {
      query.sortBy = field;
      query.sortOrder = order.toLowerCase();
    }

    try {
      const token = checkAuth();
      const url = `${apiUrl}/payments?${new URLSearchParams(query)}`;
      const { json } = await httpClient(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      // Kiểm tra xem json đã là mảng chưa
      if (Array.isArray(json)) {
        return {
          data: {
            data: json,
            total: json.length
          }
        };
      } else if (json && json.data && Array.isArray(json.data)) {
        return {
          data: {
            data: json.data,
            total: json.total || json.data.length
          }
        };
      } else {
        console.warn('Định dạng phản hồi API không đúng:', json);
        return { data: { data: [], total: 0 } };
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tham chiếu thanh toán:", error);
      return { data: { data: [], total: 0 } };
    }
  },

  // Cập nhật trạng thái thanh toán
  update: async (id, data) => {
    try {
      const token = checkAuth();
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        throw new Error(`ID thanh toán không hợp lệ: ${id}`);
      }
      
      // Xử lý dữ liệu cập nhật
      const { id: dataId, _id, ...dataWithoutId } = data;

      const response = await fetch(`${apiUrl}/payments/${numericId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: dataWithoutId.status }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        throw new Error(errorData.message || `Có lỗi xảy ra khi cập nhật trạng thái thanh toán (status: ${response.status})`);
      }

      const json = await response.json();
      return { data: { ...json, id: json.id || numericId } };
    } catch (error) {
      console.error(`Lỗi khi cập nhật trạng thái thanh toán ID ${id}:`, error);
      throw error;
    }
  },

  // Mô phỏng thanh toán thành công (chỉ dành cho admin)
  simulatePaymentSuccess: async (id) => {
    try {
      const token = checkAuth();
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        throw new Error(`ID thanh toán không hợp lệ: ${id}`);
      }

      const response = await fetch(`${apiUrl}/payments/${numericId}/simulate-success`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        throw new Error(errorData.message || `Có lỗi xảy ra khi mô phỏng thanh toán thành công (status: ${response.status})`);
      }

      const json = await response.json();
      return { data: json };
    } catch (error) {
      console.error(`Lỗi khi mô phỏng thanh toán thành công cho ID ${id}:`, error);
      throw error;
    }
  },

  // Kiểm tra trạng thái thanh toán VNPay
  checkVNPayStatus: async (id) => {
    try {
      const token = checkAuth();
      const numericId = parseInt(id);
      
      if (isNaN(numericId)) {
        throw new Error(`ID thanh toán không hợp lệ: ${id}`);
      }

      const { json } = await httpClient(`${apiUrl}/payments/${numericId}/check-vnpay-status`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      return { data: json };
    } catch (error) {
      console.error(`Lỗi khi kiểm tra trạng thái VNPay cho thanh toán ID ${id}:`, error);
      throw error;
    }
  },

  // Lấy thống kê thanh toán
  getPaymentStatistics: async (startDate, endDate) => {
    try {
      const token = checkAuth();
      const query = {};
      
      if (startDate) {
        query.startDate = startDate;
      }
      
      if (endDate) {
        query.endDate = endDate;
      }

      const url = `${apiUrl}/payments/statistics?${new URLSearchParams(query)}`;
      const { json } = await httpClient(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      return { data: json };
    } catch (error) {
      console.error("Lỗi khi lấy thống kê thanh toán:", error);
      return { data: { 
        totalTransactions: 0,
        totalCompleted: 0,
        methodStats: [],
        statusStats: [] 
      }};
    }
  },

  // Lấy thanh toán theo ID vé
  getPaymentByTicketId: async (ticketId) => {
    try {
      const token = checkAuth();
      const numericId = parseInt(ticketId);
      
      if (isNaN(numericId)) {
        throw new Error(`ID vé không hợp lệ: ${ticketId}`);
      }

      const { json } = await httpClient(`${apiUrl}/payments/ticket/${numericId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      
      if (!json) {
        throw new Error(`Không tìm thấy thanh toán cho vé với ID ${numericId}`);
      }
      
      // Xử lý trường hợp API trả về cấu trúc { data: {...} } hoặc trực tiếp đối tượng
      const data = json.data || json;
      
      return { data };
    } catch (error) {
      console.error(`Lỗi khi lấy thanh toán theo ID vé ${ticketId}:`, error);
      throw error;
    }
  }
};

export default paymentService;