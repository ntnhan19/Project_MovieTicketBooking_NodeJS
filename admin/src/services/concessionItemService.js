import { apiUrl, httpClient, checkAuth } from "./httpClient";
import { formatError, formatSearchParams, processApiResponse, processManyResponse } from './utils';

const concessionItemService = {
  getList: async ({ pagination = { page: 1, perPage: 10 }, sort = {}, filter = {} }) => {
    try {
      const { page, perPage } = pagination;
      const { field, order } = sort;

      const query = {
        page,
        limit: perPage,
        ...filter,
      };

      if (field && order) {
        query._sort = field;
        query._order = order.toUpperCase(); // Đảm bảo order là uppercase (ASC/DESC)
      }

      const url = `${apiUrl}/concession/items?${formatSearchParams(query)}`;
      const { json, headers } = await httpClient(url);

      return processApiResponse(json, headers);
    } catch (error) {
      throw formatError("Lỗi khi lấy danh sách sản phẩm bắp nước", error);
    }
  },

  getOne: async (id) => {
    try {
      if (!id) throw new Error("ID sản phẩm không được để trống");
      const { json } = await httpClient(`${apiUrl}/concession/items/${id}`);
      return { data: json.data || json };
    } catch (error) {
      throw formatError("Lỗi khi lấy thông tin sản phẩm bắp nước", error);
    }
  },

  getMany: async (ids) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        return { data: [] };
      }
      const query = formatSearchParams({ id: ids });
      const { json } = await httpClient(`${apiUrl}/concession/items?${query}`);
      return { data: processManyResponse(json) };
    } catch (error) {
      throw formatError("Lỗi khi lấy nhiều sản phẩm bắp nước", error);
    }
  },

  getManyReference: async ({ target, id, pagination = { page: 1, perPage: 10 }, sort = {}, filter = {} }) => {
    try {
      if (!target || !id) throw new Error("Target hoặc ID không được để trống");
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
        query._order = order.toUpperCase();
      }

      const url = `${apiUrl}/concession/items?${formatSearchParams(query)}`;
      const { json, headers } = await httpClient(url);

      return processApiResponse(json, headers);
    } catch (error) {
      throw formatError("Lỗi khi lấy sản phẩm theo tham chiếu", error);
    }
  },

  create: async (data) => {
    try {
      const token = checkAuth();
      const { id, _id, ...dataWithoutId } = data;

      if (!dataWithoutId.name || !dataWithoutId.price) {
        throw new Error("Tên và giá sản phẩm là bắt buộc");
      }

      const { json } = await httpClient(`${apiUrl}/concession/items`, {
        method: "POST",
        body: JSON.stringify(dataWithoutId),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        data: {
          ...dataWithoutId,
          id: json.data?.id || json.id || json._id,
        },
      };
    } catch (error) {
      throw formatError("Lỗi khi tạo sản phẩm bắp nước", error);
    }
  },

  update: async (id, data) => {
    try {
      if (!id) throw new Error("ID sản phẩm không được để trống");
      const token = checkAuth();
      const { id: dataId, _id, ...dataWithoutId } = data;

      const { json } = await httpClient(`${apiUrl}/concession/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(dataWithoutId),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return {
        data: {
          ...dataWithoutId,
          id: json.data?.id || json.id || json._id || id,
        },
      };
    } catch (error) {
      throw formatError("Lỗi khi cập nhật sản phẩm bắp nước", error);
    }
  },

  updateMany: async (ids, data) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("Danh sách ID không hợp lệ");
      }
      const token = checkAuth();
      const { id, _id, ...dataWithoutId } = data;

      const promises = ids.map((id) =>
        httpClient(`${apiUrl}/concession/items/${id}`, {
          method: "PUT",
          body: JSON.stringify(dataWithoutId),
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      );

      await Promise.all(promises);
      return { data: ids };
    } catch (error) {
      throw formatError("Lỗi khi cập nhật nhiều sản phẩm bắp nước", error);
    }
  },

  delete: async (id) => {
    try {
      if (!id) throw new Error("ID sản phẩm không được để trống");
      const token = checkAuth();

      await httpClient(`${apiUrl}/concession/items/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return { data: { id } };
    } catch (error) {
      throw formatError("Lỗi khi xóa sản phẩm bắp nước", error);
    }
  },

  deleteMany: async (ids) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("Danh sách ID không hợp lệ");
      }
      const token = checkAuth();

      const promises = ids.map((id) =>
        httpClient(`${apiUrl}/concession/items/${id}`, {
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
      throw formatError("Lỗi khi xóa nhiều sản phẩm bắp nước", error);
    }
  },

  toggleAvailability: async (id) => {
    try {
      if (!id) throw new Error("ID sản phẩm không được để trống");
      const token = checkAuth();

      const { json } = await httpClient(
        `${apiUrl}/concession/items/${id}/toggle-availability`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return { data: json.data || json };
    } catch (error) {
      throw formatError("Lỗi khi thay đổi trạng thái sản phẩm", error);
    }
  },

  getItemsByCategory: async (categoryId) => {
    try {
      if (!categoryId) throw new Error("ID danh mục không được để trống");
      const { json } = await httpClient(`${apiUrl}/concession/items/category/${categoryId}`);
      return { data: json.data || json };
    } catch (error) {
      throw formatError("Lỗi khi lấy sản phẩm theo danh mục", error);
    }
  },

  getPopularItems: async (limit = 5) => {
    try {
      if (limit < 1) throw new Error("Giới hạn phải lớn hơn 0");
      const url = `${apiUrl}/concession/items/popular?${formatSearchParams({ limit })}`;
      const { json } = await httpClient(url);
      return { data: json.data || json };
    } catch (error) {
      throw formatError("Lỗi khi lấy danh sách sản phẩm phổ biến", error);
    }
  },

  searchItems: async (searchTerm) => {
    try {
      if (!searchTerm) throw new Error("Từ khóa tìm kiếm không được để trống");
      const url = `${apiUrl}/concession/items/search?${formatSearchParams({
        q: searchTerm,
      })}`;
      const { json } = await httpClient(url);
      return { data: json.data || json };
    } catch (error) {
      throw formatError("Lỗi khi tìm kiếm sản phẩm bắp nước", error);
    }
  },

  bulkCreate: async (items) => {
    try {
      if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Danh sách sản phẩm không hợp lệ");
      }
      const token = checkAuth();
      const cleanedItems = items.map(({ id, _id, ...item }) => item);

      const { json } = await httpClient(`${apiUrl}/concession/items/bulk`, {
        method: "POST",
        body: JSON.stringify({ items: cleanedItems }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return { data: json.data || json };
    } catch (error) {
      throw formatError("Lỗi khi tạo nhiều sản phẩm bắp nước", error);
    }
  },

  updateAvailability: async (ids, isAvailable) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        throw new Error("Danh sách ID không hợp lệ");
      }
      if (typeof isAvailable !== "boolean") {
        throw new Error("Trạng thái isAvailable phải là boolean");
      }
      const token = checkAuth();

      const { json } = await httpClient(`${apiUrl}/concession/items/availability`, {
        method: "PATCH",
        body: JSON.stringify({ ids, isAvailable }),
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      return { data: json.data || json };
    } catch (error) {
      throw formatError("Lỗi khi cập nhật trạng thái sản phẩm", error);
    }
  },

  getAllAvailable: async () => {
    try {
      const { json } = await httpClient(`${apiUrl}/concession/items/available`);
      return { data: json.data || json };
    } catch (error) {
      throw formatError("Lỗi khi lấy danh sách sản phẩm có sẵn", error);
    }
  },
};

export default concessionItemService;