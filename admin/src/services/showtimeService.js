import { apiUrl, httpClient, isFile } from "./httpClient";
import {
  buildFormData,
  removeIdField,
  processApiResponse,
  processManyResponse,
  VIETNAM_TIMEZONE,
  convertToUTC,
  convertToVietnamTime
} from "./utils";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Cấu hình dayjs để hỗ trợ múi giờ
dayjs.extend(utc);
dayjs.extend(timezone);

const normalizeShowtimeData = (data) => {
  const normalizedData = { ...data };

  // XỬ LÝ ĐÚNG: Giữ nguyên thời điểm mà người dùng chọn
  // Người dùng chọn giờ theo múi giờ Việt Nam, chúng ta cần chuyển đổi ĐÚNG sang UTC
  if (normalizedData.startTime) {
    if (normalizedData.startTime instanceof Date) {
      // Dùng hàm convertToUTC để đảm bảo đúng múi giờ
      normalizedData.startTime = convertToUTC(normalizedData.startTime);
    } else if (typeof normalizedData.startTime === "string") {
      // Đảm bảo startTime được xử lý như múi giờ Việt Nam nếu chưa có định dạng UTC (Z ở cuối)
      if (!normalizedData.startTime.endsWith("Z")) {
        normalizedData.startTime = convertToUTC(normalizedData.startTime);
      }
      // Nếu đã có định dạng UTC, giữ nguyên
    }
  }

  if (normalizedData.endTime) {
    if (normalizedData.endTime instanceof Date) {
      normalizedData.endTime = convertToUTC(normalizedData.endTime);
    } else if (typeof normalizedData.endTime === "string" && !normalizedData.endTime.endsWith("Z")) {
      normalizedData.endTime = convertToUTC(normalizedData.endTime);
    }
  }

  // Chuyển đổi các trường số
  if (normalizedData.movieId) {
    normalizedData.movieId = parseInt(normalizedData.movieId, 10);
  }

  if (normalizedData.hallId) {
    normalizedData.hallId = parseInt(normalizedData.hallId, 10);
  }

  if (normalizedData.price !== undefined && normalizedData.price !== null) {
    normalizedData.price = parseFloat(normalizedData.price);
  }

  return normalizedData;
};

/**
 * Định dạng dữ liệu thời gian từ server để hiển thị
 * Đảm bảo các trường date là đối tượng Date và hiển thị đúng múi giờ Việt Nam
 */
const formatShowtimeDisplayData = (data) => {
  const formattedData = { ...data };

  // Chuyển đổi các trường thời gian từ UTC sang múi giờ Việt Nam
  if (formattedData.startTime && typeof formattedData.startTime === 'string') {
    formattedData.startTime = convertToVietnamTime(formattedData.startTime);
  }

  if (formattedData.endTime && typeof formattedData.endTime === 'string') {
    formattedData.endTime = convertToVietnamTime(formattedData.endTime);
  }

  return formattedData;
};

// Đối tượng service cho showtime
const showtimeService = {
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

    const url = `${apiUrl}/showtimes?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    // Xử lý định dạng thời gian cho các bản ghi
    if (json && json.data && Array.isArray(json.data)) {
      json.data = json.data.map((item) => formatShowtimeDisplayData(item));
    }

    return processApiResponse(json, headers);
  },

  getOne: async (id) => {
    const { json } = await httpClient(`${apiUrl}/showtimes/${id}`);
    const data = json.data || json;

    return { data: formatShowtimeDisplayData(data) };
  },

  getMany: async (ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/showtimes?${query}`);

    // Xử lý kết quả và định dạng ngày giờ
    let resultData = processManyResponse(json);
    resultData = resultData.map((item) => formatShowtimeDisplayData(item));

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

    const url = `${apiUrl}/showtimes?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    // Xử lý định dạng thời gian
    if (json && json.data && Array.isArray(json.data)) {
      json.data = json.data.map((item) => formatShowtimeDisplayData(item));
      return {
        data: json.data,
        total: json.meta?.total || 0,
      };
    }

    let resultData = Array.isArray(json) ? json : [];
    resultData = resultData.map((item) => formatShowtimeDisplayData(item));
    
    return {
      data: resultData,
      total: parseInt(headers.get("x-total-count")) || resultData.length,
    };
  },

  create: async (data) => {
    // Xử lý đặc biệt cho showtime
    // 1. Loại bỏ trường id
    let cleanedData = removeIdField(data);
    // 2. Chuẩn hóa dữ liệu ngày giờ và các trường số
    cleanedData = normalizeShowtimeData(cleanedData);

    console.log("Dữ liệu đã làm sạch cho showtime:", cleanedData);

    const body =
      isFile(cleanedData.poster) || cleanedData.useFormData
        ? buildFormData(cleanedData)
        : JSON.stringify(cleanedData);

    const headers =
      body instanceof FormData ? {} : { "Content-Type": "application/json" };

    try {
      console.log(`Gửi request đến: ${apiUrl}/showtimes`);
      console.log("Headers:", headers);
      console.log(
        "Body (stringified):",
        typeof body === "string" ? body : "[FormData]"
      );

      const token = localStorage.getItem("auth")
        ? JSON.parse(localStorage.getItem("auth")).token
        : null;

      const response = await fetch(`${apiUrl}/showtimes`, {
        method: "POST",
        body,
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch((e) => ({ error: "Không thể parse response JSON" }));
        console.error("Lỗi từ server:", errorData);
        throw new Error(
          errorData.message || errorData.error ||
            `Có lỗi xảy ra khi tạo showtime (status: ${response.status})`
        );
      }

      const json = await response.json();
      let result = { ...cleanedData, id: json.id || json._id };
      result = formatShowtimeDisplayData(result);

      return { data: result };
    } catch (error) {
      console.error("Lỗi chi tiết khi tạo showtime:", error);
      throw error;
    }
  },

  update: async (id, data) => {
    // Xử lý đặc biệt cho showtime
    const { id: dataId, _id, ...dataWithoutId } = data;
    // Chuẩn hóa dữ liệu ngày giờ và các trường số
    let processedData = normalizeShowtimeData(dataWithoutId);

    console.log("Dữ liệu đã chuẩn hóa cho cập nhật showtime:", processedData);

    const body =
      isFile(processedData.poster) || processedData.useFormData
        ? buildFormData(processedData)
        : JSON.stringify(processedData);

    const headers =
      body instanceof FormData ? {} : { "Content-Type": "application/json" };

    try {
      console.log(`Gửi request cập nhật đến: ${apiUrl}/showtimes/${id}`);
      console.log("Headers:", headers);
      console.log(
        "Body:",
        typeof body === "string" ? JSON.parse(body) : "[FormData]"
      );

      const token = localStorage.getItem("auth")
        ? JSON.parse(localStorage.getItem("auth")).token
        : null;

      const response = await fetch(`${apiUrl}/showtimes/${id}`, {
        method: "PUT",
        body,
        headers: {
          ...headers,
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch((e) => ({ error: "Không thể parse response JSON" }));
        console.error("Lỗi từ server:", errorData);
        throw new Error(
          errorData.message || errorData.error ||
            `Có lỗi xảy ra khi cập nhật showtime (status: ${response.status})`
        );
      }

      const json = await response.json();
      let result = {
        ...processedData,
        ...json,
        id: json.id || json._id || id,
      };
      result = formatShowtimeDisplayData(result);

      return { data: result };
    } catch (error) {
      console.error("Lỗi chi tiết khi cập nhật showtime:", error);
      throw error;
    }
  },

  updateMany: async (ids, data) => {
    const { id, _id, ...dataWithoutId } = data;
    const processedData = normalizeShowtimeData(dataWithoutId);

    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/showtimes/${id}`, {
        method: "PUT",
        body: JSON.stringify(processedData),
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },

  delete: async (id) => {
    const { json } = await httpClient(`${apiUrl}/showtimes/${id}`, {
      method: "DELETE",
    });
    return { data: json };
  },

  deleteMany: async (ids) => {
    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/showtimes/${id}`, {
        method: "DELETE",
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },
};

// Export named functions
export { normalizeShowtimeData, formatShowtimeDisplayData, showtimeService };

// Default export for compatibility
export default showtimeService;