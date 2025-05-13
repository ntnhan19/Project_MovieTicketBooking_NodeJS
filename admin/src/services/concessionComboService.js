// admin/src/services/concessionComboService.js
import { apiUrl, httpClient, checkAuth } from './httpClient';
import { processApiResponse, processManyResponse } from './utils';

const concessionComboService = {
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

    const url = `${apiUrl}/concession/combos?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/concession/combos/${id}`);

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
    const data = json.data || json;
    
    return { data };
  },

  getMany: async (ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/concession/combos?${query}`);
    
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

    const url = `${apiUrl}/concession/combos?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  create: async (data) => {
    const token = checkAuth();
    
    // Loại bỏ id khỏi dữ liệu gửi đi
    const { id, _id, ...dataWithoutId } = data;
    
    // Chuyển đổi items từ mảng id thành định dạng dữ liệu phù hợp
    const formattedData = {
      ...dataWithoutId,
      price: parseFloat(dataWithoutId.price || 0),
      discountPercent: parseFloat(dataWithoutId.discountPercent || 0),
      items: dataWithoutId.items && Array.isArray(dataWithoutId.items) 
        ? dataWithoutId.items.map(item => ({
            itemId: parseInt(item.itemId),
            quantity: parseInt(item.quantity || 1)
          }))
        : []
    };

    console.log("Dữ liệu gửi đi cho combo:", formattedData);

    const response = await fetch(`${apiUrl}/concession/combos`, {
      method: "POST",
      body: JSON.stringify(formattedData),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || "Có lỗi xảy ra khi tạo combo");
    }

    const json = await response.json();
    return { data: { ...formattedData, id: json.data?.id || json.id || json._id } };
  },

  update: async (id, data) => {
    const token = checkAuth();
    
    // Loại bỏ id khỏi dữ liệu gửi đi
    const { id: dataId, _id, ...dataWithoutId } = data;

    // Chuyển đổi các giá trị số nếu có
    const formattedData = { ...dataWithoutId };
    if (formattedData.price !== undefined) {
      formattedData.price = parseFloat(formattedData.price);
    }
    if (formattedData.discountPercent !== undefined) {
      formattedData.discountPercent = parseFloat(formattedData.discountPercent);
    }
    if (formattedData.items && Array.isArray(formattedData.items)) {
      formattedData.items = formattedData.items.map(item => ({
        itemId: parseInt(item.itemId),
        quantity: parseInt(item.quantity || 1)
      }));
    }

    const response = await fetch(`${apiUrl}/concession/combos/${id}`, {
      method: "PUT",
      body: JSON.stringify(formattedData),
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || `Có lỗi xảy ra khi cập nhật combo (status: ${response.status})`);
    }

    const json = await response.json();
    return { data: { ...formattedData, id: json.data?.id || json.id || id } };
  },

  updateMany: async (ids, data) => {
    const { id, _id, ...dataWithoutId } = data;

    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/concession/combos/${id}`, {
        method: "PUT",
        body: JSON.stringify(dataWithoutId),
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },

  delete: async (id) => {
    const token = checkAuth();
    
    const response = await fetch(`${apiUrl}/concession/combos/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || `Không thể xóa combo (status: ${response.status})`);
    }

    const json = await response.json();
    return { data: json };
  },

  deleteMany: async (ids) => {
    const token = checkAuth();
    
    const promises = ids.map((id) =>
      fetch(`${apiUrl}/concession/combos/${id}`, {
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
    
    const response = await fetch(`${apiUrl}/concession/combos/${id}/toggle-availability`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Lỗi từ server:", errorData);
      throw new Error(errorData.message || `Không thể thay đổi trạng thái combo (status: ${response.status})`);
    }

    const json = await response.json();
    return { data: json.data || json };
  }
};

export default concessionComboService;