// admin/src/services/genreService.js
import { apiUrl, httpClient, checkAuth } from './httpClient';
import { processApiResponse, processManyResponse } from './utils';

const genreService = {
  getList: async ({ pagination, sort, filter }) => {
    const { page, perPage } = pagination;

    const query = {
      page,
      perPage,
    };

    // Thêm search parameter nếu có
    if (filter && filter.search) {
      query.search = filter.search;
    }

    try {
      const url = `${apiUrl}/genres?${new URLSearchParams(query)}`;
      const { json } = await httpClient(url);

      // Backend trả về dữ liệu dạng { data: [...], total: number }
      if (json && typeof json.total === 'number') {
        // Đảm bảo dữ liệu được giữ nguyên thứ tự từ backend
        return {
          data: {
            data: json.data,
            total: json.total
          }
        };
      }

      // Fallback cho trường hợp response không đúng format
      console.warn('Unexpected API response format:', json);
      return {
        data: {
          data: Array.isArray(json) ? json : [],
          total: Array.isArray(json) ? json.length : 0
        }
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách thể loại:", error);
      return { data: { data: [], total: 0 } };
    }
  },

  getOne: async (id) => {
    try {
      // Đảm bảo id là số
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`Invalid genre ID: ${id}`);
      }

      const { json } = await httpClient(`${apiUrl}/genres/${numericId}`);
      
      // Kiểm tra nếu json là null hoặc undefined
      if (!json) {
        throw new Error(`Genre with ID ${numericId} not found`);
      }
      
      // Xử lý trường hợp API trả về cấu trúc { data: {...} } hoặc trực tiếp đối tượng
      const data = json.data || json;
      
      return { data };
    } catch (error) {
      console.error(`Lỗi khi lấy thể loại ID ${id}:`, error);
      throw error;
    }
  },

  getMany: async (ids) => {
    try {
      const query = ids.map((id) => `id=${id}`).join("&");
      const { json } = await httpClient(`${apiUrl}/genres?${query}`);
      
      // Xử lý trường hợp API trả về mảng trực tiếp
      const resultData = Array.isArray(json) ? json : processManyResponse(json);
      return { data: resultData };
    } catch (error) {
      console.error("Lỗi khi lấy nhiều thể loại:", error);
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
      const url = `${apiUrl}/genres?${new URLSearchParams(query)}`;
      const { json, headers } = await httpClient(url);

      // Kiểm tra xem json đã là mảng chưa
      if (Array.isArray(json)) {
        return {
          data: {
            data: json,
            total: parseInt(headers.get('X-Total-Count') || json.length)
          }
        };
      } else {
        return processApiResponse(json, headers);
      }
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tham chiếu thể loại:", error);
      return { data: { data: [], total: 0 } };
    }
  },

  create: async (data) => {
    try {
      const token = checkAuth();
      
      // Đảm bảo chỉ gửi name và không gửi id
      const { id, _id, ...dataWithoutId } = data;
      console.log("Dữ liệu gửi đi cho genres:", dataWithoutId);

      const response = await fetch(`${apiUrl}/genres`, {
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
        throw new Error(errorData.error || "Có lỗi xảy ra khi tạo thể loại");
      }

      const json = await response.json();
      return { data: { ...dataWithoutId, id: json.id || json._id } };
    } catch (error) {
      console.error("Lỗi khi tạo thể loại:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const token = checkAuth();
      
      // Đảm bảo không gửi id trong phần thân của dữ liệu cập nhật
      const { id: dataId, _id, ...dataWithoutId } = data;

      const response = await fetch(`${apiUrl}/genres/${id}`, {
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
        throw new Error(errorData.error || `Có lỗi xảy ra khi cập nhật thể loại (status: ${response.status})`);
      }

      const json = await response.json();
      return { data: { ...dataWithoutId, id: json.id || json._id || id } };
    } catch (error) {
      console.error(`Lỗi khi cập nhật thể loại ID ${id}:`, error);
      throw error;
    }
  },

  updateMany: async (ids, data) => {
    try {
      const { id, _id, ...dataWithoutId } = data;

      const promises = ids.map((id) =>
        httpClient(`${apiUrl}/genres/${id}`, {
          method: "PUT",
          body: JSON.stringify(dataWithoutId),
        })
      );

      await Promise.all(promises);
      return { data: ids };
    } catch (error) {
      console.error("Lỗi khi cập nhật nhiều thể loại:", error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const token = checkAuth();
      
      const response = await fetch(`${apiUrl}/genres/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        throw new Error(errorData.error || `Có lỗi xảy ra khi xóa thể loại (status: ${response.status})`);
      }

      const json = await response.json();
      return { data: json };
    } catch (error) {
      console.error(`Lỗi khi xóa thể loại ID ${id}:`, error);
      throw error;
    }
  },

  deleteMany: async (ids) => {
    try {
      const promises = ids.map((id) =>
        httpClient(`${apiUrl}/genres/${id}`, {
          method: "DELETE",
        })
      );

      await Promise.all(promises);
      return { data: ids };
    } catch (error) {
      console.error("Lỗi khi xóa nhiều thể loại:", error);
      throw error;
    }
  }
};

export default genreService;