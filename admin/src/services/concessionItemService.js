// admin/src/services/concessionItemService.js
import { apiUrl, httpClient, checkAuth } from './httpClient';
import { processApiResponse, processManyResponse } from './utils';

const concessionItemService = {
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

    const url = `${apiUrl}/concession/items?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/concession/items/${id}`);

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
    const data = json.data || json;
    
    return { data };
  },

  getMany: async (ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/concession/items?${query}`);
    
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

    const url = `${apiUrl}/concession/items?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  create: async (data) => {
    const token = checkAuth();
    
    // Đảm bảo không gửi id
    const { id, _id, ...dataWithoutId } = data;
    console.log("Dữ liệu gửi đi cho concession item:", dataWithoutId);

    const response = await fetch(`${apiUrl}/concession/items`, {
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
      throw new Error(errorData.message || "Có lỗi xảy ra khi tạo sản phẩm bắp nước");
    }

    const json = await response.json();
    return { data: { ...dataWithoutId, id: json.data?.id || json.id || json._id } };
  },

  update: async (id, data) => {
    const token = checkAuth();
    
    // Đảm bảo không gửi id trong phần thân của dữ liệu cập nhật
    const { id: dataId, _id, ...dataWithoutId } = data;

    const response = await fetch(`${apiUrl}/concession/items/${id}`, {
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
      throw new Error(errorData.message || `Có lỗi xảy ra khi cập nhật sản phẩm bắp nước (status: ${response.status})`);
    }

    const json = await response.json();
    return { data: { ...dataWithoutId, id: json.data?.id || json.id || json._id || id } };
  },

  updateMany: async (ids, data) => {
    const { id, _id, ...dataWithoutId } = data;

    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/concession/items/${id}`, {
        method: "PUT",
        body: JSON.stringify(dataWithoutId),
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },

  delete: async (id) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/concession/items/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi xóa sản phẩm bắp nước");
    }
    
    return { data: { id } };
  },

  deleteMany: async (ids) => {
    const token = checkAuth();
    
    const promises = ids.map((id) =>
      fetch(`${apiUrl}/concession/items/${id}`, {
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
  
  toggleAvailability: async (id) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/concession/items/${id}/toggle-availability`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi thay đổi trạng thái sản phẩm");
    }

    const json = await response.json();
    return { data: json.data || json };
  },

  getItemsByCategory: async (categoryId) => {
    const url = `${apiUrl}/concession/items/category/${categoryId}`;
    const { json } = await httpClient(url);
    
    // Xử lý trường hợp API trả về cấu trúc { data: [...] }
    const data = json.data || json;
    
    return { data };
  },
  
  getPopularItems: async (limit = 5) => {
    const url = `${apiUrl}/concession/items/popular?limit=${limit}`;
    const { json } = await httpClient(url);
    
    // Xử lý trường hợp API trả về cấu trúc { data: [...] }
    const data = json.data || json;
    
    return { data };
  },
  
  searchItems: async (searchTerm) => {
    const url = `${apiUrl}/concession/items/search?q=${encodeURIComponent(searchTerm)}`;
    const { json } = await httpClient(url);
    
    // Xử lý trường hợp API trả về cấu trúc { data: [...] }
    const data = json.data || json;
    
    return { data };
  },
  
  bulkCreate: async (items) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/concession/items/bulk`, {
      method: "POST",
      body: JSON.stringify({ items }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi tạo nhiều sản phẩm");
    }

    const json = await response.json();
    return { data: json.data || json };
  },
  
  updateAvailability: async (ids, isAvailable) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/concession/items/availability`, {
      method: "PATCH",
      body: JSON.stringify({ ids, isAvailable }),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi cập nhật trạng thái sản phẩm");
    }

    const json = await response.json();
    return { data: json.data || json };
  },
  
  getAllAvailable: async () => {
    const url = `${apiUrl}/concession/items/available`;
    const { json } = await httpClient(url);
    
    // Xử lý trường hợp API trả về cấu trúc { data: [...] }
    const data = json.data || json;
    
    return { data };
  }
};

export default concessionItemService;