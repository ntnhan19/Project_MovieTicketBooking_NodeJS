// admin/src/services/dataProvider.js
import axios from 'axios';
import { fetchUtils } from "react-admin";

// URL cơ sở của API
const apiUrl = 'http://localhost:3001/api';  // Sửa thành URL backend chính xác của bạn

// HTTP client tùy chỉnh với khả năng xử lý lỗi và log
const httpClient = (url, options = {}) => {
  if (!options.headers) {
    options.headers = new Headers({ Accept: "application/json" });
  }

  // Thêm header Authorization nếu có token
  const token = localStorage.getItem("auth");
  if (token) {
    options.headers.set("Authorization", `Bearer ${token}`);
  }

  // Log request để debug
  console.log(`${options.method || "GET"} request to: ${url}`);

  return fetchUtils
    .fetchJson(url, options)
    .then((response) => {
      // Log response thành công
      console.log(`Response from ${url}:`, response);
      return response;
    })
    .catch((error) => {
      // Log lỗi để debug
      console.error(`Error in request to ${url}:`, error);
      throw error;
    });
};

const dataProvider = {
  getList: async (resource, { pagination, sort, filter }) => {
    const { page, perPage } = pagination;
    const { field, order } = sort;
  
    // Xử lý filter truyền vào URL
    const query = {
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _limit: perPage,
    };
  
    // Gộp các filter cần custom
    if (filter.title) query.title = filter.title;
    if (filter.director) query.director = filter.director;
    if (filter.releaseDate) query.releaseDate = filter.releaseDate;
    if (filter.genreId) query.genreId = filter.genreId; // để backend lọc theo thể loại
  
    const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);
  
    return {
      data: json,
      total: parseInt(headers.get("x-total-count")) || json.length,
    };
  },

  getOne: (resource, params) => {
    return httpClient(`${apiUrl}/${resource}/${params.id}`).then(({ json }) => {
      // Normalize genres về đúng định dạng
      if (json.genres && Array.isArray(json.genres)) {
        json.genres = json.genres.map((g) => g.id);
      }
  
      return { data: json };
    });
  },

  getMany: (resource, params) => {
    const query = params.ids.map((id) => `id=${id}`).join("&");
    const url = `${apiUrl}/${resource}?${query}`;

    return httpClient(url).then(({ json }) => ({
      data: json,
    }));
  },

  getManyReference: (resource, params) => {
    const { page, perPage } = params.pagination;
    const { field, order } = params.sort;

    const query = {
      ...params.filter,
      [params.target]: params.id,
      _sort: field,
      _order: order,
      _start: (page - 1) * perPage,
      _limit: perPage,
    };

    const queryString = Object.keys(query)
      .map((key) => `${key}=${query[key]}`)
      .join("&");

    const url = `${apiUrl}/${resource}?${queryString}`;

    return httpClient(url).then(({ json, headers }) => {
      const total = headers.get("x-total-count")
        ? parseInt(headers.get("x-total-count"))
        : json.length;

      return {
        data: json,
        total,
      };
    });
  },

  create: (resource, params) => {
    const data = { ...params.data };
    const isFile = data.poster instanceof File;
  
    if (isFile) {
      const formData = new FormData();
  
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'genres') {
          formData.append('genres', JSON.stringify(value.map(g => g.id || g)));
        } else {
          formData.append(key, value);
        }
      });
  
      return fetch(`${apiUrl}/${resource}`, {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth") || ""}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Server Error");
          return res.json();
        })
        .then((json) => ({
          data: { ...params.data, id: json.id || json._id },
        }));
    }
  
    // JSON bình thường
    if (data.genres) {
      data.genres = data.genres.map((g) => g.id || g);
    }
  
    return httpClient(`${apiUrl}/${resource}`, {
      method: "POST",
      body: JSON.stringify(data),
    }).then(({ json }) => ({
      data: { ...params.data, id: json.id || json._id },
    }));
  },
  

  update: (resource, params) => {
    const data = { ...params.data };
    const isFile = data.poster instanceof File;
  
    if (isFile) {
      const formData = new FormData();
  
      Object.entries(data).forEach(([key, value]) => {
        if (key === 'genres') {
          formData.append('genres', JSON.stringify(value.map((g) => g.id || g)));
        } else {
          formData.append(key, value);
        }
      });
  
      return fetch(`${apiUrl}/${resource}/${params.id}`, {
        method: "PUT",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth") || ""}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Server Error");
          return res.json();
        })
        .then((json) => ({
          data: json,
        }));
    }
  
    // JSON thường
    if (data.genres) {
      data.genres = data.genres.map((g) => g.id || g);
    }
  
    return httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }).then(({ json }) => ({
      data: json,
    }));
  },
  
  

  updateMany: (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`, {
        method: "PUT",
        body: JSON.stringify(params.data),
      })
    );

    return Promise.all(promises).then(() => ({
      data: params.ids,
    }));
  },

  delete: (resource, params) => {
    return httpClient(`${apiUrl}/${resource}/${params.id}`, {
      method: "DELETE",
    }).then(({ json }) => ({
      data: json,
    }));
  },

  deleteMany: (resource, params) => {
    const promises = params.ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`, {
        method: "DELETE",
      })
    );

    return Promise.all(promises).then(() => ({
      data: params.ids,
    }));
  },
};

export default dataProvider;