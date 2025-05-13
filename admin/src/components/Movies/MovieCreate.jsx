// admin/src/components/Movies/MovieCreate.jsx
import MovieForm from "./MovieForm";
import { createMovie } from "../../services/movieService";

const MovieCreate = () => {
  const handleCreateMovie = async (data) => {
    return await createMovie(data);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <MovieForm 
        mode="create" 
        onSubmit={handleCreateMovie}
        submitButtonText="Tạo phim mới"
        isCreate={true}
      />
    </div>
  );
};

export default MovieCreate;