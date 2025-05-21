// admin/src/services/hallService.js
import { apiUrl, httpClient, checkAuth } from './httpClient';
import { processApiResponse, processManyResponse } from './utils';

const hallService = {
  getList: async ({ pagination, sort, filter }) => {
    const { page, perPage } = pagination;

    const query = {
      page,
      limit: perPage,
    };

    // Thêm search parameter nếu có
    if (filter && filter.search) {
      query.search = filter.search;
    }

    // Thêm cinemaId nếu có yêu cầu lọc theo rạp
    if (filter && filter.cinemaId) {
      query.cinemaId = filter.cinemaId;
    }

    try {
      const url = `${apiUrl}/halls?${new URLSearchParams(query)}`;
      const { json } = await httpClient(url);

      // Backend trả về dữ liệu dạng { data: [...], meta: { total, page, limit, totalPages } }
      if (json && json.meta && typeof json.meta.total === 'number') {
        return {
          data: {
            data: json.data,
            total: json.meta.total
          }
        };
      }

      // Fallback cho trường hợp response không đúng format
      console.warn('Unexpected API response format:', json);
      return {
        data: {
          data: Array.isArray(json) ? json : (json.data || []),
          total: Array.isArray(json) ? json.length : (json.meta?.total || 0)
        }
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách phòng chiếu:", error);
      return { data: { data: [], total: 0 } };
    }
  },

  getOne: async (id) => {
    try {
      // Đảm bảo id là số
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID phòng chiếu không hợp lệ: ${id}`);
      }

      const { json } = await httpClient(`${apiUrl}/halls/${numericId}`);
      
      // Kiểm tra nếu json là null hoặc undefined
      if (!json) {
        throw new Error(`Không tìm thấy phòng chiếu với ID ${numericId}`);
      }
      
      return { data: json };
    } catch (error) {
      console.error(`Lỗi khi lấy phòng chiếu ID ${id}:`, error);
      throw error;
    }
  },

  getMany: async (ids) => {
    try {
      const query = ids.map((id) => `id=${id}`).join("&");
      const { json } = await httpClient(`${apiUrl}/halls?${query}`);
      
      // Xử lý kết quả trả về
      if (Array.isArray(json)) {
        return { data: json };
      } else if (json && Array.isArray(json.data)) {
        return { data: json.data };
      }
      
      return { data: [] };
    } catch (error) {
      console.error("Lỗi khi lấy nhiều phòng chiếu:", error);
      return { data: [] };
    }
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

    try {
      const url = `${apiUrl}/halls?${new URLSearchParams(query)}`;
      const { json, headers } = await httpClient(url);

      // Kiểm tra xem json có phải cấu trúc có meta không
      if (json && json.meta && typeof json.meta.total === 'number') {
        return {
          data: {
            data: json.data,
            total: json.meta.total
          }
        };
      } else if (Array.isArray(json)) {
        // Nếu json là mảng
        return {
          data: {
            data: json,
            total: parseInt(headers.get('X-Total-Count') || json.length)
          }
        };
      } 
      
      // Fallback
      return processApiResponse(json, headers);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tham chiếu phòng chiếu:", error);
      return { data: { data: [], total: 0 } };
    }
  },

  getByCinema: async (cinemaId) => {
    try {
      const { json } = await httpClient(`${apiUrl}/cinemas/${cinemaId}/halls`);
      return { data: Array.isArray(json) ? json : (json.data || []) };
    } catch (error) {
      console.error(`Lỗi khi lấy phòng chiếu theo rạp ID ${cinemaId}:`, error);
      return { data: [] };
    }
  },

  create: async (data) => {
    try {
      const token = checkAuth();
      
      // Đảm bảo không gửi id
      const { id, _id, ...dataWithoutId } = data;
      console.log("Dữ liệu gửi đi cho phòng chiếu:", dataWithoutId);

      const response = await fetch(`${apiUrl}/halls`, {
        method: "POST",
        body: JSON.stringify(dataWithoutId),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // Xử lý lỗi từ server
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        throw new Error(errorData.message || "Có lỗi xảy ra khi tạo phòng chiếu");
      }

      const json = await response.json();
      return { data: { ...dataWithoutId, id: json.id || json._id } };
    } catch (error) {
      console.error("Lỗi khi tạo phòng chiếu:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const token = checkAuth();
      
      // Đảm bảo không gửi id trong phần thân của dữ liệu cập nhật
      const { id: dataId, _id, ...dataWithoutId } = data;

      const response = await fetch(`${apiUrl}/halls/${id}`, {
        method: "PUT",
        body: JSON.stringify(dataWithoutId),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        throw new Error(errorData.message || `Có lỗi xảy ra khi cập nhật phòng chiếu (status: ${response.status})`);
      }

      const json = await response.json();
      return { data: { ...dataWithoutId, id: json.id || json._id || id } };
    } catch (error) {
      console.error(`Lỗi khi cập nhật phòng chiếu ID ${id}:`, error);
      throw error;
    }
  },

  updateMany: async (ids, data) => {
    try {
      const { id, _id, ...dataWithoutId } = data;

      const promises = ids.map((id) =>
        httpClient(`${apiUrl}/halls/${id}`, {
          method: "PUT",
          body: JSON.stringify(dataWithoutId),
        })
      );

      await Promise.all(promises);
      return { data: ids };
    } catch (error) {
      console.error("Lỗi khi cập nhật nhiều phòng chiếu:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const token = checkAuth();
      
      const response = await fetch(`${apiUrl}/halls/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        throw new Error(errorData.message || `Có lỗi xảy ra khi xóa phòng chiếu (status: ${response.status})`);
      }

      const json = await response.json();
      return { data: json };
    } catch (error) {
      console.error(`Lỗi khi xóa phòng chiếu ID ${id}:`, error);
      throw error;
    }
  },

  deleteMany: async (ids) => {
    try {
      const token = checkAuth();
      
      const promises = ids.map((id) =>
        fetch(`${apiUrl}/halls/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      );

      await Promise.all(promises);
      return { data: ids };
    } catch (error) {
      console.error("Lỗi khi xóa nhiều phòng chiếu:", error);
      throw error;
    }
  }
};

export default hallService;