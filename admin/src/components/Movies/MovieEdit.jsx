// admin/src/components/Movies/MovieEdit.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import MovieForm from "./MovieForm";
import movieService from "../../services/movieService";

const MovieEdit = () => {
  // Lấy id từ URL params - /movies/:id/edit
  const { id } = useParams();
  const navigate = useNavigate();

  const handleUpdateMovie = async (data) => {
    try {
      // Kiểm tra id hợp lệ trước khi cập nhật
      if (!id || isNaN(parseInt(id))) {
        throw new Error('ID phim không hợp lệ');
      }
      await movieService.update(id, data);
      navigate('/movies'); // Chuyển về trang danh sách sau khi cập nhật thành công
      return true;
    } catch (error) {
      console.error("Lỗi khi cập nhật phim:", error);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <MovieForm
        mode="edit"
        movieId={id} // Truyền id trực tiếp từ URL params
        onSubmit={handleUpdateMovie}
        submitButtonText="Cập nhật phim"
      />
    </div>
  );
};

export default MovieEdit;