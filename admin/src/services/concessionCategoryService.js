// admin/src/services/concessionCategoryService.js
import { apiUrl, httpClient, checkAuth } from './httpClient';
import { processApiResponse, processManyResponse } from './utils';

const concessionCategoryService = {
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

    const url = `${apiUrl}/concession/categories?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/concession/categories/${id}`);

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
    const data = json.data || json;
    
    return { data };
  },

  getMany: async (ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/concession/categories?${query}`);
    
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

    const url = `${apiUrl}/concession/categories?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  create: async (data) => {
    const token = checkAuth();
    
    // Đảm bảo không gửi id
    const { id, _id, ...dataWithoutId } = data;
    console.log("Dữ liệu gửi đi cho concession category:", dataWithoutId);

    const response = await fetch(`${apiUrl}/concession/categories`, {
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
      throw new Error(errorData.message || "Có lỗi xảy ra khi tạo danh mục bắp nước");
    }

    const json = await response.json();
    return { data: { ...dataWithoutId, id: json.data?.id || json.id || json._id } };
  },

  update: async (id, data) => {
    const token = checkAuth();
    
    // Đảm bảo không gửi id trong phần thân của dữ liệu cập nhật
    const { id: dataId, _id, ...dataWithoutId } = data;

    const response = await fetch(`${apiUrl}/concession/categories/${id}`, {
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
      throw new Error(errorData.message || `Có lỗi xảy ra khi cập nhật danh mục bắp nước (status: ${response.status})`);
    }

    const json = await response.json();
    return { data: { ...dataWithoutId, id: json.data?.id || json.id || json._id || id } };
  },

  updateMany: async (ids, data) => {
    const { id, _id, ...dataWithoutId } = data;

    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/concession/categories/${id}`, {
        method: "PUT",
        body: JSON.stringify(dataWithoutId),
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },

  delete: async (id) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/concession/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi xóa danh mục bắp nước");
    }
    
    return { data: { id } };
  },

  deleteMany: async (ids) => {
    const token = checkAuth();
    
    const promises = ids.map((id) =>
      fetch(`${apiUrl}/concession/categories/${id}`, {
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
  
  toggleStatus: async (id) => {
    const token = checkAuth();
    
    // Thay đổi từ concession-categories thành concession/categories
    const response = await fetch(`${apiUrl}/concession/categories/${id}/toggle-status`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi thay đổi trạng thái danh mục");
    }

    const json = await response.json();
    return { data: json.data || json };
  }
};

export default concessionCategoryService;