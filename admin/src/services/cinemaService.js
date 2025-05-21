import { apiUrl, httpClient, checkAuth } from './httpClient';
import { processApiResponse, processManyResponse } from './utils';

const cinemaService = {
  getList: async ({ pagination, sort, filter }) => {
    const { page, perPage } = pagination;

    const query = {
      page,
      perPage,
    };

    // Thêm search parameter nếu có
    if (filter && filter.search) {
      query.search = filter.search;
    }    try {
      const url = `${apiUrl}/cinemas?${new URLSearchParams(query)}`;
      const { json } = await httpClient(url);

      // Nếu response là một mảng trực tiếp
      if (Array.isArray(json)) {
        return {
          data: {
            data: json,
            total: json.length
          }
        };
      }

      // Nếu response có format { data: [...], total: number }
      if (json && json.data) {
        return {
          data: {
            data: json.data,
            total: json.total || json.data.length
          }
        };
      }

      // Fallback cho các trường hợp khác
      return {
        data: {
          data: [],
          total: 0
        }
      };
    } catch (error) {
      console.error("Lỗi khi lấy danh sách rạp chiếu phim:", error);
      return { data: { data: [], total: 0 } };
    }
  },

  getOne: async (id) => {
    try {
      // Đảm bảo id là số
      const numericId = parseInt(id);
      if (isNaN(numericId)) {
        throw new Error(`ID rạp chiếu phim không hợp lệ: ${id}`);
      }

      const { json } = await httpClient(`${apiUrl}/cinemas/${numericId}`);
      
      // Kiểm tra nếu json là null hoặc undefined
      if (!json) {
        throw new Error(`Không tìm thấy rạp chiếu phim với ID ${numericId}`);
      }
      
      // Xử lý trường hợp API trả về cấu trúc { data: {...} } hoặc trực tiếp đối tượng
      const data = json.data || json;
      
      return { data };
    } catch (error) {
      console.error(`Lỗi khi lấy rạp chiếu phim ID ${id}:`, error);
      throw error;
    }
  },

  create: async (data) => {
    try {
      const token = checkAuth();
      
      // Đảm bảo không gửi id trong dữ liệu
      const { id, _id, ...dataWithoutId } = data;

      const response = await fetch(`${apiUrl}/cinemas`, {
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
        throw new Error(errorData.message || "Có lỗi xảy ra khi tạo rạp chiếu phim");
      }

      const json = await response.json();
      return { data: { ...dataWithoutId, id: json.id || json._id } };
    } catch (error) {
      console.error("Lỗi khi tạo rạp chiếu phim:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      const token = checkAuth();
      
      // Đảm bảo không gửi id trong phần thân của dữ liệu cập nhật
      const { id: dataId, _id, ...dataWithoutId } = data;

      const response = await fetch(`${apiUrl}/cinemas/${id}`, {
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
        throw new Error(errorData.message || `Có lỗi xảy ra khi cập nhật rạp chiếu phim (status: ${response.status})`);
      }

      const json = await response.json();
      return { data: { ...dataWithoutId, id: json.id || json._id || id } };
    } catch (error) {
      console.error(`Lỗi khi cập nhật rạp chiếu phim ID ${id}:`, error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const token = checkAuth();
      
      const response = await fetch(`${apiUrl}/cinemas/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        throw new Error(errorData.message || `Có lỗi xảy ra khi xóa rạp chiếu phim (status: ${response.status})`);
      }

      const json = await response.json();
      return { data: json };
    } catch (error) {
      console.error(`Lỗi khi xóa rạp chiếu phim ID ${id}:`, error);
      throw error;
    }
  },

  // Phương thức riêng cho cinema - lấy danh sách halls theo cinema
  getHallsByCinema: async (cinemaId) => {
    try {
      const numericId = parseInt(cinemaId);
      if (isNaN(numericId)) {
        throw new Error(`ID rạp chiếu phim không hợp lệ: ${cinemaId}`);
      }

      const { json } = await httpClient(`${apiUrl}/cinemas/${numericId}/halls`);
      
      if (!json) {
        return { data: [] };
      }
      
      // Xử lý trường hợp API trả về cấu trúc { data: [...] } hoặc trực tiếp mảng
      const data = json.data || json;
      
      return { data };
    } catch (error) {
      console.error(`Lỗi khi lấy danh sách phòng chiếu của rạp ${cinemaId}:`, error);
      return { data: [] };
    }
  },

  // Phương thức tạo hall mới cho cinema
  createHall: async (cinemaId, hallData) => {
    try {
      const token = checkAuth();
      
      // Đảm bảo không gửi id trong dữ liệu
      const { id, _id, ...dataWithoutId } = hallData;
      
      const response = await fetch(`${apiUrl}/cinemas/${cinemaId}/halls`, {
        method: "POST",
        body: JSON.stringify(dataWithoutId),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Lỗi từ server:", errorData);
        throw new Error(errorData.message || "Có lỗi xảy ra khi tạo phòng chiếu");
      }

      const json = await response.json();
      return { data: { ...dataWithoutId, id: json.id || json._id, cinemaId } };
    } catch (error) {
      console.error(`Lỗi khi tạo phòng chiếu cho rạp ID ${cinemaId}:`, error);
      throw error;
    }
  }
};

export default cinemaService;