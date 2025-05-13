// admin/src/services/genreService.js
import { apiUrl, httpClient, checkAuth } from './httpClient';
import { processApiResponse, processManyResponse } from './utils';

const genreService = {
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

    const url = `${apiUrl}/genres?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/genres/${id}`);

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
    const data = json.data || json;
    
    return { data };
  },

  getMany: async (ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/genres?${query}`);
    
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

    const url = `${apiUrl}/genres?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  create: async (data) => {
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
  },

  update: async (id, data) => {
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
  },

  updateMany: async (ids, data) => {
    const { id, _id, ...dataWithoutId } = data;

    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/genres/${id}`, {
        method: "PUT",
        body: JSON.stringify(dataWithoutId),
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },

  delete: async (id) => {
    const { json } = await httpClient(`${apiUrl}/genres/${id}`, {
      method: "DELETE",
    });
    return { data: json };
  },

  deleteMany: async (ids) => {
    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/genres/${id}`, {
        method: "DELETE",
      })
    );

    await Promise.all(promises);
    return { data: ids };
  }
};

export default genreService;