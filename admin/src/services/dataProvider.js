// admin/src/services/dataProvider.js
import { fetchUtils } from "react-admin";

// URL cơ sở của API
const apiUrl = 'http://localhost:3000/api';  // Cập nhật lại URL API backend (3000)

// Hàm lấy token từ localStorage
const getToken = () => {
  return localStorage.getItem("token");
};

// HTTP client tùy chỉnh với khả năng đính kèm token
const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }

  const token = getToken();
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }

  return fetchUtils.fetchJson(url, options);
};

// Kiểm tra xem giá trị có phải là file không
const isFile = (value) => value instanceof File;

// Chuyển đổi dữ liệu sang FormData nếu cần
const buildFormData = (data) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === "genres") {
      formData.append("genres", JSON.stringify(value.map((g) => g.id || g)));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};

// DataProvider chuẩn React Admin
const dataProvider = {
  getList: async (resource, { pagination, sort, filter }) => {
    const { page, perPage } = pagination;
    const { field, order } = sort;

    const query = {
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _limit: perPage,
      ...filter,
    };

    const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return {
      data: json,
      total: parseInt(headers.get("x-total-count")) || json.length,
    };
  },

  getOne: async (resource, { id }) => {
    const { json } = await httpClient(`${apiUrl}/${resource}/${id}`);

    if (json.genres && Array.isArray(json.genres)) {
      json.genres = json.genres.map((g) => g.id);
    }

    return { data: json };
  },

  getMany: async (resource, { ids }) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/${resource}?${query}`);
    return { data: json };
  },

  getManyReference: async (resource, { target, id, pagination, sort, filter }) => {
    const { page, perPage } = pagination;
    const { field, order } = sort;

    const query = {
      ...filter,
      [target]: id,
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _limit: perPage,
    };

    const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return {
      data: json,
      total: parseInt(headers.get("x-total-count")) || json.length,
    };
  },

  create: async (resource, { data }) => {
    const body =
      isFile(data.poster) || data.useFormData
        ? buildFormData(data)
        : JSON.stringify({
            ...data,
            genres: data.genres?.map((g) => g.id || g),
          });

    const token = getToken();
    const headers =
      body instanceof FormData
        ? { Authorization: `Bearer ${token}` }
        : {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

    const response = await fetch(`${apiUrl}/${resource}`, {
      method: "POST",
      body,
      headers,
    });

    const json = await response.json();
    return { data: { ...data, id: json.id || json._id } };
  },

  update: async (resource, { id, data }) => {
    const body =
      isFile(data.poster) || data.useFormData
        ? buildFormData(data)
        : JSON.stringify({
            ...data,
            genres: data.genres?.map((g) => g.id || g),
          });

    const token = getToken();
    const headers =
      body instanceof FormData
        ? { Authorization: `Bearer ${token}` }
        : {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

    const response = await fetch(`${apiUrl}/${resource}/${id}`, {
      method: "PUT",
      body,
      headers,
    });

    const json = await response.json();
    return { data: json };
  },

  updateMany: async (resource, { ids, data }) => {
    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },

  delete: async (resource, { id }) => {
    const { json } = await httpClient(`${apiUrl}/${resource}/${id}`, {
      method: "DELETE",
    });
    return { data: json };
  },

  deleteMany: async (resource, { ids }) => {
    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`, {
        method: "DELETE",
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },
};

export default dataProvider;