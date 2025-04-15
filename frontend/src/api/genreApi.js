// frontend/src/api/genreApi.js
import axiosInstance from './axiosInstance';

export const genreApi = {
  getAllGenres: async () => {
    const response = await axiosInstance.get("/genres");
    return response.data;
  },

  getGenreById: async (id) => {
    const response = await axiosInstance.get(`/genres/${id}`);
    return response.data;
  },

  createGenre: async (data) => {
    const response = await axiosInstance.post("/genres", data);
    return response.data;
  },

  updateGenre: async (id, data) => {
    const response = await axiosInstance.put(`/genres/${id}`, data);
    return response.data;
  },

  deleteGenre: async (id) => {
    const response = await axiosInstance.delete(`/genres/${id}`);
    return response.data;
  },
};
