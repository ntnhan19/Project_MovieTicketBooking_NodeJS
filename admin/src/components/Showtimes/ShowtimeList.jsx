// src/components/Showtimes/ShowtimeList.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { showtimeService } from "../../services/showtimeService";
import Pagination from "../Common/Pagination";
import { debounce } from "lodash";
import { apiUrl } from "../../services/httpClient"; 

const ShowtimeList = () => {
  const navigate = useNavigate();
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("startTime");
  const [sortOrder, setSortOrder] = useState("DESC");
  const [filter, setFilter] = useState({});
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const perPage = 10;

  // Tải danh sách suất chiếu
  const fetchShowtimes = async () => {
    setLoading(true);
    setError(null);
    try {
      const filterWithSearch = searchTerm
        ? { ...filter, q: searchTerm }
        : filter;

      const response = await showtimeService.getList({
        pagination: { page: currentPage, perPage },
        sort: { field: sortField, order: sortOrder },
        filter: filterWithSearch,
      });

      console.log("Dữ liệu suất chiếu nhận được:", response); // Debug
      setShowtimes(response.data);

      // Fix: Kiểm tra và đặt giá trị mặc định cho totalPages nếu undefined
      setTotalPages(response.totalPages || Math.ceil(response.total / perPage));
      setTotalItems(response.total);
    } catch (err) {
      console.error("Lỗi khi tải danh sách suất chiếu:", err);
      setError("Không thể tải danh sách suất chiếu. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  // Tải dữ liệu liên quan: phim, phòng chiếu, rạp
  const fetchRelatedData = async () => {
    setLoadingRelated(true);
    try {
      const token = localStorage.getItem("auth")
        ? JSON.parse(localStorage.getItem("auth")).token
        : null;

      const headers = {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      // Sử dụng apiUrl từ httpClient thay vì hardcode
      const [moviesResponse, hallsResponse, cinemasResponse] =
        await Promise.all([
          fetch(`${apiUrl}/movies?limit=100`, { headers }).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          }),
          fetch(`${apiUrl}/halls?limit=100`, { headers }).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          }),
          fetch(`${apiUrl}/cinemas?limit=100`, { headers }).then((res) => {
            if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
            return res.json();
          }),
        ]);

      console.log("Dữ liệu phim nhận được:", moviesResponse); // Debug
      console.log("Dữ liệu phòng chiếu nhận được:", hallsResponse); // Debug
      console.log("Dữ liệu rạp nhận được:", cinemasResponse); // Debug

      // Xử lý đúng cấu trúc API response
      setMovies(moviesResponse.data || moviesResponse || []);
      setHalls(hallsResponse.data || hallsResponse || []);
      setCinemas(cinemasResponse.data || cinemasResponse || []);
    } catch (err) {
      console.error("Lỗi khi tải dữ liệu liên quan:", err);
      setError(
        (prev) =>
          prev ||
          "Không thể tải đầy đủ thông tin phim và rạp. Một số thông tin có thể hiển thị không đầy đủ."
      );
    } finally {
      setLoadingRelated(false);
    }
  };

  // Gọi API khi component được mount hoặc khi các dependencies thay đổi
  useEffect(() => {
    fetchShowtimes();
  }, [currentPage, sortField, sortOrder, filter]);

  useEffect(() => {
    fetchRelatedData();
  }, []);

  // Xử lý tìm kiếm với debounce
  const debouncedSearch = debounce((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // Reset về trang đầu tiên khi tìm kiếm
    fetchShowtimes();
  }, 500);

  const handleSearchChange = (e) => {
    debouncedSearch(e.target.value);
  };

  // Xử lý xóa suất chiếu
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa suất chiếu này không?")) {
      try {
        await showtimeService.delete(id);
        // Cập nhật lại danh sách sau khi xóa
        fetchShowtimes();
      } catch (err) {
        console.error("Lỗi khi xóa suất chiếu:", err);
        setError("Không thể xóa suất chiếu. Vui lòng thử lại sau.");
      }
    }
  };

  // Xử lý thay đổi sắp xếp
  const handleSort = (field) => {
    const newOrder =
      field === sortField && sortOrder === "DESC" ? "ASC" : "DESC";
    setSortField(field);
    setSortOrder(newOrder);
  };

  // Xử lý lọc theo phim
  const handleFilterByMovie = (movieId) => {
    if (movieId === "all") {
      const { movieId, ...restFilter } = filter;
      setFilter(restFilter);
    } else {
      setFilter({ ...filter, movieId });
    }
    setCurrentPage(1);
  };

  // Xử lý lọc theo phòng chiếu
  const handleFilterByHall = (hallId) => {
    if (hallId === "all") {
      const { hallId, ...restFilter } = filter;
      setFilter(restFilter);
    } else {
      setFilter({ ...filter, hallId });
    }
    setCurrentPage(1);
  };

  // Xóa tất cả bộ lọc
  const handleClearFilters = () => {
    setFilter({});
    setSearchTerm("");
    setCurrentPage(1);
    document.getElementById("search-input").value = "";
  };

  // Format thời gian hiển thị
  const formatDateTime = (dateString) => {
    if (!dateString) return "---";
    try {
      return format(new Date(dateString), "dd/MM/yyyy HH:mm", { locale: vi });
    } catch (error) {
      console.error("Lỗi định dạng ngày:", error, dateString);
      return "---";
    }
  };

  // Lấy tên phim từ ID
  const getMovieTitle = (movieId) => {
    if (!movieId) return "---";
    const movie = movies.find(
      (m) => m.id === movieId || m.id === Number(movieId)
    );
    if (!movie) {
      console.log(`Không tìm thấy phim với ID: ${movieId}`, movies); // Debug
      return "---";
    }
    return movie.title || movie.name || "---";
  };

  // Lấy tên phòng chiếu từ ID
  const getHallName = (hallId) => {
    if (!hallId) return "---";
    const hall = halls.find((h) => h.id === hallId || h.id === Number(hallId));
    if (!hall) {
      console.log(`Không tìm thấy phòng chiếu với ID: ${hallId}`, halls); // Debug
      return "---";
    }
    return hall.name || "---";
  };

  // Lấy tên rạp từ ID phòng chiếu
  const getCinemaName = (hallId) => {
    if (!hallId) return "---";
    const hall = halls.find((h) => h.id === hallId || h.id === Number(hallId));
    if (!hall) {
      return "---";
    }

    const cinemaId = hall.cinemaId;
    if (!cinemaId) {
      console.log(`Không có cinemaId trong phòng chiếu: ${hallId}`, hall); // Debug
      return "---";
    }

    const cinema = cinemas.find(
      (c) => c.id === cinemaId || c.id === Number(cinemaId)
    );
    if (!cinema) {
      console.log(`Không tìm thấy rạp với ID: ${cinemaId}`, cinemas); // Debug
      return "---";
    }
    return cinema.name || "---";
  };

  // Format giá tiền
  const formatPrice = (price) => {
    if (price === null || price === undefined) return "---";
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

  return (
    <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
          Quản lý suất chiếu
        </h1>

        {/* Thanh công cụ */}
        <div className="flex items-center space-x-4">
          <Link
            to="/showtimes/create"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            Thêm suất chiếu mới
          </Link>
        </div>
      </div>

      {/* Filter và Search */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div className="flex-grow max-w-md">
            <input
              id="search-input"
              type="text"
              placeholder="Tìm kiếm suất chiếu..."
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              onChange={handleSearchChange}
            />
          </div>

          <div className="flex space-x-2">
            <select
              className="px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              onChange={(e) => handleFilterByMovie(e.target.value)}
              value={filter.movieId || "all"}
              disabled={loadingRelated || movies.length === 0}
            >
              <option value="all">Tất cả phim</option>
              {movies.map((movie) => (
                <option key={movie.id} value={movie.id}>
                  {movie.title || movie.name}
                </option>
              ))}
            </select>

            <select
              className="px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              onChange={(e) => handleFilterByHall(e.target.value)}
              value={filter.hallId || "all"}
              disabled={loadingRelated || halls.length === 0}
            >
              <option value="all">Tất cả phòng chiếu</option>
              {halls.map((hall) => (
                <option key={hall.id} value={hall.id}>
                  {hall.name} ({getCinemaName(hall.id)})
                </option>
              ))}
            </select>

            <button
              onClick={handleClearFilters}
              className="px-3 py-2 bg-gray-100 dark:bg-secondary-dark/20 text-text-primary dark:text-text-primary-dark hover:bg-gray-200 dark:hover:bg-secondary-dark/30 rounded-md transition-colors duration-300"
            >
              Xóa bộ lọc
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      {/* Loading Message for Related Data */}
      {loadingRelated && !loading && (
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Đang tải thông tin phim và rạp...</p>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : showtimes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-secondary-dark/10 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-text-secondary dark:text-text-secondary-dark"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="mt-2 text-text-secondary dark:text-text-secondary-dark">
            Không tìm thấy suất chiếu nào.
          </p>
          <Link
            to="/showtimes/create"
            className="mt-4 inline-block px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            Thêm suất chiếu mới
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border dark:divide-border-dark">
            <thead>
              <tr>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center space-x-1">
                    <span>ID</span>
                    {sortField === "id" && (
                      <span>
                        {sortOrder === "ASC" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("movieId")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Phim</span>
                    {sortField === "movieId" && (
                      <span>
                        {sortOrder === "ASC" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("hallId")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Phòng chiếu</span>
                    {sortField === "hallId" && (
                      <span>
                        {sortOrder === "ASC" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Rạp
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("startTime")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Thời gian bắt đầu</span>
                    {sortField === "startTime" && (
                      <span>
                        {sortOrder === "ASC" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("endTime")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Thời gian kết thúc</span>
                    {sortField === "endTime" && (
                      <span>
                        {sortOrder === "ASC" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("price")}
                >
                  <div className="flex items-center space-x-1">
                    <span>Giá vé</span>
                    {sortField === "price" && (
                      <span>
                        {sortOrder === "ASC" ? (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 15l7-7 7 7"
                            />
                          </svg>
                        ) : (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 9l-7 7-7-7"
                            />
                          </svg>
                        )}
                      </span>
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-text-secondary dark:text-text-secondary-dark uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-border-dark">
              {showtimes.map((showtime) => (
                <tr
                  key={showtime.id}
                  className="hover:bg-gray-50 dark:hover:bg-secondary-dark/10"
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                    {showtime.id}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-text-primary dark:text-text-primary-dark">
                    <Link
                      to={`/showtimes/${showtime.id}`}
                      className="hover:text-primary dark:hover:text-primary-light transition-colors duration-300"
                    >
                      {getMovieTitle(showtime.movieId)}
                    </Link>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                    {getHallName(showtime.hallId)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                    {getCinemaName(showtime.hallId)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                    {formatDateTime(showtime.startTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                    {formatDateTime(showtime.endTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                    {formatPrice(showtime.price)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-text-primary dark:text-text-primary-dark">
                    <div className="flex justify-center space-x-2">
                      <Link
                        to={`/showtimes/${showtime.id}`}
                        className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light"
                        title="Xem chi tiết"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      </Link>
                      <Link
                        to={`/showtimes/${showtime.id}/edit`}
                        className="text-gray-500 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light"
                        title="Chỉnh sửa"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(showtime.id)}
                        className="text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                        title="Xóa"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {!loading && showtimes.length > 0 && (
        <div className="mt-6">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            totalItems={totalItems}
            itemsPerPage={perPage}
          />
        </div>
      )}
    </div>
  );
};

export default ShowtimeList;
