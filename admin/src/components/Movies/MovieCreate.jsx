// admin/src/components/Movies/MovieCreate.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieForm from "./MovieForm";
import { createMovie } from "../../services/movieService";

const MovieCreate = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateMovie = async (data) => {
    setIsSubmitting(true);
    try {
      const result = await createMovie(data);
      setIsSubmitting(false);
      return result;
    } catch (error) {
      setIsSubmitting(false);
      throw error;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <MovieForm
        mode="create"
        onSubmit={handleCreateMovie}
        submitButtonText={isSubmitting ? "Đang tạo phim..." : "Tạo phim mới"}
      />
    </div>
  );
};

export default MovieCreate;