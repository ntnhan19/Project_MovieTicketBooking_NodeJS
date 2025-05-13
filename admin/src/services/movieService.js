// admin/src/services/movieService.js
import { apiUrl, httpClient, isFile } from "./httpClient";
import {
  buildFormData,
  removeIdField,
  processApiResponse,
  processManyResponse,
} from "./utils";

// Hàm hỗ trợ lấy thông tin chi tiết phim
export const getMovie = async (id) => {
  try {
    const response = await fetch(`${apiUrl}/movies/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
    const data = json.data || json;

    return data;
  } catch (error) {
    console.error("Chi tiết lỗi khi lấy thông tin phim:", error);
    throw error;
  }
};

// Hàm tạo phim mới
export const createMovie = async (movieData) => {
  try {
    // Loại bỏ ID khỏi dữ liệu nếu có
    const cleanedData = removeIdField(movieData);

    // Xử lý thể loại
    if (cleanedData.genreIds) {
      cleanedData.genres = cleanedData.genreIds;
      delete cleanedData.genreIds;
    }

    console.log("Dữ liệu gửi đi khi tạo phim:", JSON.stringify(cleanedData));

    const body =
      isFile(cleanedData.poster) || cleanedData.useFormData
        ? buildFormData(cleanedData)
        : JSON.stringify(cleanedData);

    const token = localStorage.getItem("auth")
      ? JSON.parse(localStorage.getItem("auth")).token
      : null;

    const headers =
      body instanceof FormData
        ? { Authorization: `Bearer ${token}` }
        : {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

    const response = await fetch(`${apiUrl}/movies`, {
      method: "POST",
      body,
      headers,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch((e) => ({ error: "Không thể parse response JSON" }));
      throw new Error(
        errorData.error ||
          `Có lỗi xảy ra khi tạo phim (status: ${response.status})`
      );
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Lỗi chi tiết khi tạo phim:", error);
    throw error;
  }
};

// Hàm cập nhật phim
export const updateMovie = async (id, movieData) => {
  try {
    // Đảm bảo không gửi id trong phần thân của dữ liệu cập nhật
    const { id: dataId, _id, ...dataWithoutId } = movieData;

    // Xử lý thể loại
    let processedData = { ...dataWithoutId };
    if (processedData.genreIds) {
      processedData.genres = processedData.genreIds;
      delete processedData.genreIds;
    }

    console.log(
      "Dữ liệu gửi đi khi cập nhật phim:",
      JSON.stringify(processedData)
    );

    const body =
      isFile(processedData.poster) || processedData.useFormData
        ? buildFormData(processedData)
        : JSON.stringify(processedData);

    const token = localStorage.getItem("auth")
      ? JSON.parse(localStorage.getItem("auth")).token
      : null;

    const headers =
      body instanceof FormData
        ? { Authorization: `Bearer ${token}` }
        : {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          };

    const response = await fetch(`${apiUrl}/movies/${id}`, {
      method: "PUT",
      body,
      headers,
    });

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch((e) => ({ error: "Không thể parse response JSON" }));
      throw new Error(
        errorData.error ||
          `Có lỗi xảy ra khi cập nhật phim (status: ${response.status})`
      );
    }

    const json = await response.json();
    return json;
  } catch (error) {
    console.error("Lỗi chi tiết khi cập nhật phim:", error);
    throw error;
  }
};

const movieService = {
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

    const url = `${apiUrl}/movies?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/movies/${id}`);

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
    const data = json.data || json;

    // Xử lý trường hợp đặc biệt cho genres
    if (data.genres && Array.isArray(data.genres)) {
      data.genres = data.genres.map((g) => g.id || g);
    }

    return { data };
  },

  getMany: async (ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/movies?${query}`);

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

    const url = `${apiUrl}/movies?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  create: async (data) => {
    const result = await createMovie(data);
    return { data: result };
  },

  update: async (id, data) => {
    const result = await updateMovie(id, data);
    return { data: result };
  },

  delete: async (id) => {
    const { json } = await httpClient(`${apiUrl}/movies/${id}`, {
      method: "DELETE",
    });
    return { data: json };
  },

  deleteMany: async (ids) => {
    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/movies/${id}`, {
        method: "DELETE",
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },
};

export default movieService;
