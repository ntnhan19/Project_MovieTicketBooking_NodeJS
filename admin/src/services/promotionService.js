// admin/src/services/promotionService.js
import { httpClient, apiUrl } from "./httpClient";
import {
  processApiResponse,
  processManyResponse,
  removeIdField,
} from "./utils";

/**
 * Xử lý ID khuyến mãi đảm bảo định dạng phù hợp với API
 * @param {string|number} id - ID khuyến mãi cần xử lý
 * @returns {number} ID đã được xử lý
 */
const processPromotionId = (id) => {
  if (typeof id === 'string' && isNaN(parseInt(id, 10))) {
    const matches = id.match(/\d+/);
    if (matches && matches.length > 0) {
      return parseInt(matches[0], 10);
    }
    throw new Error("ID khuyến mãi không hợp lệ");
  }
  const numericId = parseInt(id, 10);
  if (isNaN(numericId)) {
    throw new Error("ID khuyến mãi không hợp lệ");
  }
  return numericId;
};

/**
 * Chuẩn hóa dữ liệu khuyến mãi trước khi gửi đến API
 * @param {Object} data - Dữ liệu khuyến mãi cần chuẩn hóa
 * @returns {Object} Dữ liệu đã được chuẩn hóa
 */
const normalizePromotionData = (data) => {
  const normalizedData = { ...data };

  // Xử lý các trường ngày tháng
  if (normalizedData.validFrom && typeof normalizedData.validFrom === "string") {
    normalizedData.validFrom = new Date(normalizedData.validFrom).toISOString();
  }

  if (normalizedData.validUntil && typeof normalizedData.validUntil === "string") {
    normalizedData.validUntil = new Date(normalizedData.validUntil).toISOString();
  }

  // Xử lý các trường số và boolean
  if (normalizedData.discount !== undefined) {
    normalizedData.discount = parseFloat(normalizedData.discount);
  }

  if (normalizedData.isActive !== undefined) {
    normalizedData.isActive = Boolean(normalizedData.isActive);
  }

  return normalizedData;
};

/**
 * Lấy token xác thực từ localStorage
 * @returns {string|null} Token xác thực hoặc null nếu không có
 */
const getAuthToken = () => {
  return localStorage.getItem("auth")
    ? JSON.parse(localStorage.getItem("auth")).token
    : null;
};

/**
 * Tạo headers chuẩn cho các request cần xác thực
 * @returns {Object} Headers với token xác thực
 */
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

const promotionService = {
  // Lấy danh sách khuyến mãi
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

    const url = `${apiUrl}/promotions?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  // Lấy một khuyến mãi theo ID
  getOne: async (id) => {
    try {
      const promotionId = processPromotionId(id);
      const { json } = await httpClient(`${apiUrl}/promotions/${promotionId}`);

      // Xử lý trường hợp API trả về cấu trúc { data: {...} }
      const data = json.data || json;

      return { data };
    } catch (error) {
      console.error("Lỗi khi lấy thông tin khuyến mãi:", error);
      throw error;
    }
  },

  // Lấy nhiều khuyến mãi theo danh sách ID
  getMany: async (ids) => {
    try {
      const processedIds = ids.map(id => processPromotionId(id));
      const query = processedIds.map((id) => `id=${id}`).join("&");
      const { json } = await httpClient(`${apiUrl}/promotions?${query}`);

      const resultData = processManyResponse(json);

      return { data: resultData };
    } catch (error) {
      console.error("Lỗi khi lấy nhiều khuyến mãi:", error);
      throw error;
    }
  },

  // Lấy các khuyến mãi theo tham chiếu
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

    const url = `${apiUrl}/promotions?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  // Tạo khuyến mãi mới
  create: async (data) => {
    try {
      const cleanedData = removeIdField(data);
      const normalizedData = normalizePromotionData(cleanedData);
      
      const response = await fetch(`${apiUrl}/promotions`, {
        method: "POST",
        body: JSON.stringify(normalizedData),
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Không thể parse response JSON" }));
        
        throw new Error(
          errorData.message ||
            `Có lỗi xảy ra khi tạo khuyến mãi (status: ${response.status})`
        );
      }

      const json = await response.json();
      return { data: { ...normalizedData, id: json.id || json._id } };
    } catch (error) {
      console.error("Lỗi chi tiết khi tạo khuyến mãi:", error);
      throw error;
    }
  },

  // Cập nhật khuyến mãi
  update: async ({ id, data }) => {
    try {
      const { id: dataId, _id, ...dataWithoutId } = data;
      const promotionId = processPromotionId(id);
      const normalizedData = normalizePromotionData(dataWithoutId);

      const response = await fetch(`${apiUrl}/promotions/${promotionId}`, {
        method: "PUT",
        body: JSON.stringify(normalizedData),
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Không thể parse response JSON" }));
        
        throw new Error(
          errorData.message ||
            `Có lỗi xảy ra khi cập nhật khuyến mãi (status: ${response.status})`
        );
      }

      const json = await response.json();
      return {
        data: {
          ...normalizedData,
          ...json,
          id: json.id || json._id || promotionId,
        },
      };
    } catch (error) {
      console.error("Lỗi chi tiết khi cập nhật khuyến mãi:", error);
      throw error;
    }
  },

  // Xoá khuyến mãi
  delete: async (id) => {
    try {
      const promotionId = processPromotionId(id);
      
      const response = await fetch(`${apiUrl}/promotions/${promotionId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Không thể parse response JSON" }));
        
        throw new Error(
          errorData.message ||
            `Có lỗi xảy ra khi xóa khuyến mãi (status: ${response.status})`
        );
      }

      return { data: { id: promotionId } };
    } catch (error) {
      console.error("Lỗi chi tiết khi xóa khuyến mãi:", error);
      throw error;
    }
  },

  // Xoá nhiều khuyến mãi
  deleteMany: async (ids) => {
    try {
      // Xử lý mỗi ID trong mảng để đảm bảo định dạng đúng
      const processedIds = ids.map(id => processPromotionId(id));
      
      const promises = processedIds.map((id) =>
        fetch(`${apiUrl}/promotions/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        })
      );

      await Promise.all(promises);
      return { data: processedIds };
    } catch (error) {
      console.error("Lỗi chi tiết khi xóa nhiều khuyến mãi:", error);
      throw error;
    }
  },

  // Xác thực mã khuyến mãi
  validatePromotionCode: async (code) => {
    try {
      const response = await fetch(`${apiUrl}/promotions/validate/${code}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: "Không thể parse response JSON" }));
        
        throw new Error(
          errorData.message ||
            `Có lỗi xảy ra khi xác thực mã khuyến mãi (status: ${response.status})`
        );
      }

      const json = await response.json();
      return { data: json };
    } catch (error) {
      console.error("Lỗi chi tiết khi xác thực mã khuyến mãi:", error);
      throw error;
    }
  },
};

export default promotionService;