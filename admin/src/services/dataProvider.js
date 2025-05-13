// admin/src/services/dataProvider.js
import { checkAuth } from "./httpClient";
import movieService from "./movieService";
import genreService from "./genreService";
import showtimeService from "./showtimeService";
import promotionService from "./promotionService";
import concessionCategoryService from "./concessionCategoryService";
import concessionItemService from "./concessionItemService";
import concessionComboService from "./concessionComboService";
import concessionOrderService from "./concessionOrderService";
import ticketService from "./ticketService";
import { httpClient, apiUrl } from "./httpClient";
import {
  processApiResponse,
  processManyResponse,
  removeIdField,
  buildFormData,
} from "./utils";

// Hàm kiểm tra loại resource và chuyển hướng đến service tương ứng
const routeToService = (resource, method, params) => {
  // Thực hiện kiểm tra xác thực trước mỗi request
  checkAuth();

  switch (resource) {
    case "movies":
      return movieService[method](params);
    case "genres":
      return genreService[method](params);
    case "showtimes":
      return showtimeService[method](params);
    case "promotions":
      return promotionService[method](params);
    // Thêm các service concession mới
    case "concession-categories":
      return concessionCategoryService[method](params);
    case "concession-items":
      return concessionItemService[method](params);
    case "concession-combos":
      return concessionComboService[method](params);
    case "concession-orders":
      return concessionOrderService[method](params);
    case "tickets":
      return ticketService[method](params);
    default:
      // Xử lý các resource khác bằng phương pháp mặc định
      return null;
  }
};

// Xử lý mặc định cho các resource không có service riêng
const defaultServiceHandler = {
  getList: async (resource, { pagination, sort, filter }) => {
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

    const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  getOne: async (resource, id) => {
    const { json } = await httpClient(`${apiUrl}/${resource}/${id}`);

    // Xử lý trường hợp API trả về cấu trúc { data: {...} }
    const data = json.data || json;

    return { data };
  },

  getMany: async (resource, ids) => {
    const query = ids.map((id) => `id=${id}`).join("&");
    const { json } = await httpClient(`${apiUrl}/${resource}?${query}`);

    const resultData = processManyResponse(json);

    return { data: resultData };
  },

  getManyReference: async (
    resource,
    { target, id, pagination, sort, filter }
  ) => {
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

    const url = `${apiUrl}/${resource}?${new URLSearchParams(query)}`;
    const { json, headers } = await httpClient(url);

    return processApiResponse(json, headers);
  },

  create: async (resource, data) => {
    let cleanedData = removeIdField(data);

    const body = data.useFormData
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

    try {
      const response = await fetch(`${apiUrl}/${resource}`, {
        method: "POST",
        body,
        headers,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch((e) => ({ error: "Không thể parse response JSON" }));
        console.error("Lỗi từ server:", errorData);
        throw new Error(
          errorData.error ||
            `Có lỗi xảy ra khi tạo ${resource} (status: ${response.status})`
        );
      }

      const json = await response.json();
      return { data: { ...cleanedData, id: json.id || json._id } };
    } catch (error) {
      console.error(`Lỗi chi tiết khi tạo ${resource}:`, error);
      throw error;
    }
  },

  update: async (resource, id, data) => {
    const { id: dataId, _id, ...dataWithoutId } = data;

    const body = data.useFormData
      ? buildFormData(dataWithoutId)
      : JSON.stringify(dataWithoutId);

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

    try {
      const response = await fetch(`${apiUrl}/${resource}/${id}`, {
        method: "PUT",
        body,
        headers,
      });

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch((e) => ({ error: "Không thể parse response JSON" }));
        console.error("Lỗi từ server:", errorData);
        throw new Error(
          errorData.error ||
            `Có lỗi xảy ra khi cập nhật ${resource} (status: ${response.status})`
        );
      }

      const json = await response.json();
      return {
        data: {
          ...dataWithoutId,
          ...json,
          id: json.id || json._id || id,
        },
      };
    } catch (error) {
      console.error(`Lỗi chi tiết khi cập nhật ${resource}:`, error);
      throw error;
    }
  },

  delete: async (resource, id) => {
    const { json } = await httpClient(`${apiUrl}/${resource}/${id}`, {
      method: "DELETE",
    });
    return { data: json };
  },

  deleteMany: async (resource, ids) => {
    const promises = ids.map((id) =>
      httpClient(`${apiUrl}/${resource}/${id}`, {
        method: "DELETE",
      })
    );

    await Promise.all(promises);
    return { data: ids };
  },
};

// DataProvider chuẩn React Admin
const dataProvider = {
  getList: async (resource, params) => {
    const serviceResult = routeToService(resource, "getList", params);
    if (serviceResult) return serviceResult;
    return defaultServiceHandler.getList(resource, params);
  },

  getOne: async (resource, { id }) => {
    const serviceResult = routeToService(resource, "getOne", id);
    if (serviceResult) return serviceResult;
    return defaultServiceHandler.getOne(resource, id);
  },

  getMany: async (resource, { ids }) => {
    const serviceResult = routeToService(resource, "getMany", ids);
    if (serviceResult) return serviceResult;
    return defaultServiceHandler.getMany(resource, ids);
  },

  getManyReference: async (resource, params) => {
    const serviceResult = routeToService(resource, "getManyReference", params);
    if (serviceResult) return serviceResult;
    return defaultServiceHandler.getManyReference(resource, params);
  },

  create: async (resource, { data }) => {
    const serviceResult = routeToService(resource, "create", data);
    if (serviceResult) return serviceResult;
    return defaultServiceHandler.create(resource, data);
  },

  update: async (resource, { id, data }) => {
    const serviceResult = routeToService(resource, "update", { id, data });
    if (serviceResult) return serviceResult;
    return defaultServiceHandler.update(resource, id, data);
  },

  updateMany: async (resource, { ids, data }) => {
    const promises = ids.map((id) => {
      const serviceResult = routeToService(resource, "update", { id, data });
      if (serviceResult) return serviceResult;
      return defaultServiceHandler.update(resource, id, data);
    });

    await Promise.all(promises);
    return { data: ids };
  },

  delete: async (resource, { id }) => {
    const serviceResult = routeToService(resource, "delete", id);
    if (serviceResult) return serviceResult;
    return defaultServiceHandler.delete(resource, id);
  },

  deleteMany: async (resource, { ids }) => {
    const serviceResult = routeToService(resource, "deleteMany", ids);
    if (serviceResult) return serviceResult;
    return defaultServiceHandler.deleteMany(resource, ids);
  },

  // Một số phương thức đặc biệt cho concession order
  updateOrderStatus: async (id, status) => {
    return concessionOrderService.updateStatus(id, status);
  },
};

export default dataProvider;
