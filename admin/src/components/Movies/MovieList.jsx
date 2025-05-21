import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import movieService from "../../services/movieService";
import Pagination from "../Common/Pagination";
import DeleteConfirmation from "../Common/DeleteConfirmation";

const MovieList = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [movieToDelete, setMovieToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await movieService.getList({
        pagination: { page: currentPage, perPage: itemsPerPage },
        sort: { field: 'title', order: 'ASC' },
        filter: {}
      });
      
      if (Array.isArray(response.data)) {
        setMovies(response.data);
        setTotalItems(response.total || response.data.length);
      } else if (Array.isArray(response.data.data)) {
        setMovies(response.data.data);
        setTotalItems(response.data.total || response.data.data.length);
      } else {
        setMovies([]);
        setTotalItems(0);
      }
      
      // Extract unique genres from all movies
      const uniqueGenres = Array.from(
        new Set(response.data.flatMap(movie => movie.genres?.map(g => g.name) || []))
      );
      setGenres(uniqueGenres);
    } catch (err) {
      console.error("Lỗi khi tải danh sách phim:", err);
      setError(err.message || "Không thể tải danh sách phim. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (movie) => {
    setMovieToDelete(movie);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!movieToDelete) return;
    
    try {
      await movieService.delete(movieToDelete.id);
      setMovies(movies.filter(movie => movie.id !== movieToDelete.id));
      setTotalItems(prev => prev - 1);
      setError(null);
    } catch (err) {
      console.error("Lỗi khi xóa phim:", err);
      setError(err.message || "Không thể xóa phim. Vui lòng thử lại sau.");
    } finally {
      setIsDeleteModalOpen(false);
      setMovieToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setMovieToDelete(null);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const filteredMovies = movies.filter(movie => {
    const matchTitle = movie.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchGenre = selectedGenre === "" || 
      movie.genres?.some(g => g.name === selectedGenre);
    return matchTitle && matchGenre;
  });

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Danh sách phim
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Tổng số: {totalItems} phim
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button
            onClick={() => navigate("/movies/create")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Thêm phim mới
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4 pb-6">
        <div className="col-span-3">
          <label htmlFor="search" className="sr-only">Tìm kiếm</label>
          <div className="relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-text-secondary dark:text-text-secondary-dark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <input
              type="text"
              id="search"
              placeholder="Tìm theo tên phim..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
            />
          </div>
        </div>
        <div>
          <label htmlFor="genre" className="sr-only">Thể loại</label>
          <select
            id="genre"
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="block w-full pl-3 pr-10 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
          >
            <option value="">Tất cả thể loại</option>
            {genres.map((genre, index) => (
              <option key={index} value={genre}>{genre}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Movie list - Card View for Mobile */}
      <div className="lg:hidden space-y-4">
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-background-paper-dark rounded-lg shadow-card">
            <svg className="mx-auto h-12 w-12 text-text-secondary dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-text-primary dark:text-text-primary-dark">Không tìm thấy phim</h3>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
              Không có phim nào phù hợp với tiêu chí tìm kiếm của bạn.
            </p>
          </div>
        ) : (
          filteredMovies.map((movie) => (
            <div key={movie.id} className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-4">
              <div className="flex space-x-4">
                <div className="flex-shrink-0">
                  <img 
                    className="h-20 w-16 object-cover rounded-sm shadow-sm" 
                    src={movie.poster || "https://via.placeholder.com/120x160?text=No+Image"} 
                    alt={movie.title} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link 
                    to={`/movies/${movie.id}`}
                    className="text-primary hover:text-primary-dark hover:underline font-medium"
                  >
                    <h3 className="text-base font-semibold truncate">{movie.title}</h3>
                  </Link>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {movie.genres && movie.genres.length > 0 ? (
                      movie.genres.slice(0, 2).map((genre) => (
                        <span
                          key={genre.id}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        >
                          {genre.name}
                        </span>
                      ))
                    ) : (
                      <span className="text-text-secondary dark:text-text-secondary-dark text-xs">
                        Chưa phân loại
                      </span>
                    )}
                    {movie.genres && movie.genres.length > 2 && (
                      <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                        +{movie.genres.length - 2}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark">
                    <span className="inline-block mr-3">{movie.duration} phút</span>
                    <span className="inline-block">{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <div className="mt-2 text-sm text-text-secondary dark:text-text-secondary-dark truncate">
                    Đạo diễn: {movie.director || "Chưa có thông tin"}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end space-x-3">
                <Link
                  to={`/movies/${movie.id}`}
                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span className="text-xs">Xem</span>
                </Link>                <Link
                  to={`/movies/${movie.id}/edit`}
                  className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="text-xs">Sửa</span>
                </Link>
                <button
                  onClick={() => handleDeleteClick(movie)}
                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  <span className="text-xs">Xóa</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Movie list - Table View for Desktop */}
      <div className="hidden lg:block">
        {filteredMovies.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-background-paper-dark rounded-lg shadow-card">
            <svg className="mx-auto h-12 w-12 text-text-secondary dark:text-text-secondary-dark" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-text-primary dark:text-text-primary-dark">Không tìm thấy phim</h3>
            <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
              Không có phim nào phù hợp với tiêu chí tìm kiếm của bạn.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-background-paper-dark shadow-card rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-border dark:divide-border-dark">
              <thead>
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                    Thông tin phim
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider w-40">
                    Thể loại
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider w-20">
                    Thời lượng
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider w-28">
                    Ngày phát hành
                  </th>
                  <th className="px-3 py-3 text-right text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider w-24">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-border-dark">{
                filteredMovies.map((movie) => (
                  <tr key={movie.id} className="hover:bg-gray-50 dark:hover:bg-secondary-dark/10">
                    <td className="px-3 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-12 mr-3">
                          <img 
                            className="h-16 w-12 object-cover rounded-sm shadow-sm" 
                            src={movie.poster || "https://via.placeholder.com/120x160?text=No+Image"} 
                            alt={movie.title} 
                          />
                        </div>
                        <div>
                          <Link 
                            to={`/movies/${movie.id}`}
                            className="text-primary hover:text-primary-dark hover:underline font-medium"
                          >
                            <div className="font-medium" title={movie.title}>
                              {movie.title}
                            </div>
                          </Link>
                          <div className="text-sm text-text-secondary dark:text-text-secondary-dark truncate max-w-xs" title={movie.director}>
                            {movie.director || "Chưa có đạo diễn"}
                          </div>
                          <div className="text-xs text-text-secondary dark:text-text-secondary-dark">
                            ID: {movie.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4 relative group">
                      <div className="flex flex-wrap gap-1">
                        {movie.genres && movie.genres.length > 0 ? (
                          <>
                            {movie.genres.slice(0, 2).map((genre) => (
                              <span
                                key={genre.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              >
                                {genre.name}
                              </span>
                            ))}
                            {movie.genres.length > 2 && (
                              <span className="text-xs text-text-secondary dark:text-text-secondary-dark">
                                +{movie.genres.length - 2}
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="text-text-secondary dark:text-text-secondary-dark text-sm">
                            Chưa phân loại
                          </span>
                        )}
                      </div>
                      {movie.genres && movie.genres.length > 2 && (
                        <div className="invisible group-hover:visible absolute z-10 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg p-2 text-xs text-text-primary dark:text-text-primary-dark mt-1 left-0">
                          <div className="font-semibold mb-1">Tất cả thể loại:</div>
                          <div className="flex flex-wrap gap-1">
                            {movie.genres.map((genre) => (
                              <span
                                key={genre.id}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 mb-1"
                              >
                                {genre.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {movie.duration} phút
                    </td>
                    <td className="px-3 py-4 text-sm">
                      {new Date(movie.releaseDate).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-3 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <Link
                          to={`/movies/${movie.id}`}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-200 p-1"
                          title="Xem chi tiết"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </Link>
                        <Link
                          to={`/movies/${movie.id}/edit`}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-200 p-1"
                          title="Chỉnh sửa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDeleteClick(movie)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-200 p-1"
                          title="Xóa"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}</tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          maxPageButtons={5}
        />
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmation 
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa phim"
        message={`Bạn có chắc chắn muốn xóa phim "${movieToDelete?.title}"? Hành động này không thể hoàn tác.`}
      />
    </div>
  );
};

export default MovieList;