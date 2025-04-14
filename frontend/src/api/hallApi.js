import axiosInstance from './axiosInstance';

export const hallApi = {
  getAllHalls: async () => {
    const response = await axiosInstance.get("/halls");
    return response.data;
  },

  getHallById: async (id) => {
    const response = await axiosInstance.get(`/halls/${id}`);
    return response.data;
  },

  createHall: async (data) => {
    const response = await axiosInstance.post("/halls", data);
    return response.data;
  },

  updateHall: async (id, data) => {
    const response = await axiosInstance.put(`/halls/${id}`, data);
    return response.data;
  },

  deleteHall: async (id) => {
    const response = await axiosInstance.delete(`/halls/${id}`);
    return response.data;
  },
};
