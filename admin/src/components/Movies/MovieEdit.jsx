// admin/src/components/Movies/MovieEdit.jsx
import { useParams } from "react-router-dom";
import MovieForm from "./MovieForm";
import { updateMovie } from "../../services/movieService";

const MovieEdit = () => {
  const { id } = useParams();
  
  const handleUpdateMovie = async (data) => {
    return await updateMovie(id, data);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <MovieForm 
        mode="edit" 
        id={id} 
        onSubmit={handleUpdateMovie}
        submitButtonText="Cập nhật phim"
      />
    </div>
  );
};

export default MovieEdit;