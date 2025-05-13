import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import movieService from "../../services/movieService";

const MovieShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await movieService.getOne(id);
        setMovie(data);
      } catch (err) {
        console.error("Lỗi khi tải thông tin phim:", err);
        setError("Không thể tải thông tin phim. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa phim "${movie.title}"?`)) {
      try {
        await movieService.delete(id);
        navigate("/movies");
      } catch (err) {
        console.error("Lỗi khi xóa phim:", err);
        setError("Không thể xóa phim. Vui lòng thử lại sau.");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 bg-white dark:bg-background-paper-dark rounded-lg shadow-card animate-fadeIn">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">{error || "Không tìm thấy phim này."}</p>
        </div>
        <div className="mt-4 flex justify-end">
          <Link
            to="/movies"
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
          >
            Quay lại danh sách
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Chi tiết phim: {movie.title}
        </h1>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Link
            to={`/movies/edit/${id}`}
            className="flex items-center px-3 py-1.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-md transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Chỉnh sửa
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center px-3 py-1.5 bg-red-600 text-white hover:bg-red-700 rounded-md transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Xóa
          </button>
          <Link
            to="/movies"
            className="flex items-center px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md transition-colors duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Quay lại
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card overflow-hidden">
        {/* Poster and basic info section */}
        <div className="md:flex">
          {/* Poster column */}
          <div className="md:w-1/3 p-6 flex justify-center">
            <div className="w-full max-w-xs">
              <img
                src={movie.poster || "https://via.placeholder.com/300x400?text=No+Image"}
                alt={movie.title}
                className="w-full rounded-md shadow-md object-cover"
              />
            </div>
          </div>
          
          {/* Info column */}
          <div className="md:w-2/3 p-6">
            <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
              Thông tin cơ bản
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Tên phim
                </p>
                <p className="text-text-primary dark:text-text-primary-dark">
                  {movie.title}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Ngày ra mắt
                </p>
                <p className="text-text-primary dark:text-text-primary-dark">
                  {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Thời lượng
                </p>
                <p className="text-text-primary dark:text-text-primary-dark">
                  {movie.duration} phút
                </p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Đạo diễn
                </p>
                <p className="text-text-primary dark:text-text-primary-dark">
                  {movie.director}
                </p>
              </div>
              
              {movie.mainActors && (
                <div className="col-span-1 md:col-span-2">
                  <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                    Diễn viên chính
                  </p>
                  <p className="text-text-primary dark:text-text-primary-dark">
                    {movie.mainActors}
                  </p>
                </div>
              )}
              
              <div className="col-span-1 md:col-span-2">
                <p className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                  Thể loại
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {movie.genres?.map((genre) => (
                    <span
                      key={genre.id}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {genre.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Description section */}
        <div className="p-6 border-t border-border dark:border-border-dark">
          <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark mb-4">
            Mô tả
          </h2>
          <div className="prose dark:prose-invert max-w-none text-text-primary dark:text-text-primary-dark">
            {/* If description is HTML content, you might need to render it safely */}
            <div dangerouslySetInnerHTML={{ __html: movie.description }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieShow;