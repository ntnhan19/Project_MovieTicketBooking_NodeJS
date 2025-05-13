import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

// Cấu hình dayjs để hỗ trợ múi giờ
dayjs.extend(utc);
dayjs.extend(timezone);

// Thiết lập múi giờ Việt Nam
const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh'; // UTC+7

/**
 * Chuyển đổi thời gian từ giờ địa phương sang UTC đúng cách
 * @param {Date|string} localTime - Thời gian địa phương (múi giờ Việt Nam)
 * @returns {string} - Chuỗi ISO UTC
 */
const convertToUTC = (localTime) => {
  if (!localTime) return null;
  
  try {
    return dayjs.tz(localTime, VIETNAM_TIMEZONE).utc().format();
  } catch (error) {
    console.error("Lỗi khi chuyển đổi sang UTC:", error);
    return null;
  }
};

/**
 * Chuyển đổi thời gian từ UTC sang giờ Việt Nam
 * @param {string|Date} utcTime - Thời gian UTC
 * @returns {Date} - Đối tượng Date đã được chuyển đổi sang múi giờ Việt Nam
 */
const convertToVietnamTime = (utcTime) => {
  if (!utcTime) return null;
  
  try {
    return dayjs(utcTime).tz(VIETNAM_TIMEZONE).toDate();
  } catch (error) {
    console.error("Lỗi khi chuyển đổi sang giờ Việt Nam:", error);
    return null;
  }
};

// Chuyển đổi dữ liệu sang FormData nếu cần
const buildFormData = (data) => {
  const formData = new FormData();
  // Đảm bảo loại bỏ trường id nếu có
  const { id, ...dataWithoutId } = data;
  Object.entries(dataWithoutId).forEach(([key, value]) => {
    // Bỏ qua nếu key là 'id'
    if (key === "id") return;
    // Xử lý mảng thể loại
    if (key === "genres" && value) {
      formData.append(
        "genres",
        JSON.stringify(value.map((g) => (typeof g === "object" ? g.id : g)))
      );
    } else if (value !== null && value !== undefined) {
      formData.append(key, value);
    }
  });
  return formData;
};

// Hàm lọc bỏ trường id khỏi dữ liệu một cách triệt để
const removeIdField = (data) => {
  // Tạo một bản sao để không ảnh hưởng đến dữ liệu gốc
  const cleanedData = { ...data };
  // Loại bỏ trường id ở cấp cao nhất
  if ("id" in cleanedData) {
    delete cleanedData.id;
  }
  // Loại bỏ trường _id nếu có
  if ("_id" in cleanedData) {
    delete cleanedData._id;
  }
  return cleanedData;
};

// Xử lý phản hồi API cho các trường hợp khác nhau
const processApiResponse = (json, headers = {}) => {
  // Xử lý trường hợp API trả về cấu trúc { data: [...] }
  if (json && json.data && Array.isArray(json.data)) {
    return {
      data: json.data,
      total: json.meta?.total || 0,
    };
  }
  // Xử lý trường hợp thông thường
  return {
    data: Array.isArray(json) ? json : [],
    total:
      parseInt(headers.get("x-total-count")) ||
      (Array.isArray(json) ? json.length : 0),
  };
};

// Xử lý trường hợp đặc biệt khi lấy nhiều bản ghi
const processManyResponse = (json) => {
  // Xử lý trường hợp API trả về đối tượng có cấu trúc { data: [...] }
  if (json && json.data && Array.isArray(json.data)) {
    return json.data;
  }
  // Xử lý trường hợp API trả về mảng trực tiếp
  else if (Array.isArray(json)) {
    return json;
  }
  // Trường hợp API trả về một đối tượng duy nhất (với 1 id)
  else if (json && typeof json === "object" && !Array.isArray(json)) {
    return [json];
  }
  // Trường hợp không có dữ liệu
  else {
    return [];
  }
};

// Format lỗi để hiển thị nhất quán
export const formatError = (message, error) => {
  console.error(message, error);
  
  // Nếu error có response từ server
  if (error.response) {
    const serverError = error.response.data.error || error.response.data.message;
    return new Error(serverError || message);
  }
  
  // Nếu là lỗi network
  if (error.message === 'Network Error') {
    return new Error('Không thể kết nối đến server');
  }
  
  return new Error(message);
};

// Format dữ liệu trả về thành công
export const formatSuccess = (data, message = '') => {
  return {
    success: true,
    data,
    message
  };
};

// Format các tham số tìm kiếm và phân trang
export const formatSearchParams = (params) => {
  // Loại bỏ các giá trị undefined, null hoặc empty string
  const filteredParams = Object.entries(params).reduce((acc, [key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      acc[key] = value;
    }
    return acc;
  }, {});
  
  return new URLSearchParams(filteredParams);
};

// Format dữ liệu cho select options
export const formatSelectOptions = (data, labelKey = 'name', valueKey = 'id') => {
  return data.map(item => ({
    label: item[labelKey],
    value: item[valueKey]
  }));
};

// Format tiền tệ
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
};

export {
  VIETNAM_TIMEZONE,
  buildFormData,
  removeIdField,
  processApiResponse,
  processManyResponse,
  convertToUTC,
  convertToVietnamTime
};