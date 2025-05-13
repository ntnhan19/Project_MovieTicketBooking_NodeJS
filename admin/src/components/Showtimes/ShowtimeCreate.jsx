// admin/src/components/Showtimes/ShowtimeCreate.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet';
import { useNavigate } from "react-router-dom";
import { showtimeService } from "../../services/showtimeService";
import movieService from "../../services/movieService"; 
import ShowtimeForm from "./ShowtimeForm";

const ShowtimeCreate = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [cinemas, setCinemas] = useState([]);

  // Tải dữ liệu cần thiết
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Sử dụng movieService thay vì gọi API trực tiếp
        const [moviesResponse, hallsResponse, cinemasResponse] = await Promise.all([
          movieService.getList({
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'title', order: 'ASC' },
            filter: {}
          }),
          fetch('/api/halls').then(res => res.json()),
          fetch('/api/cinemas').then(res => res.json())
        ]);

        // Lấy mảng data từ kết quả trả về của movieService
        setMovies(moviesResponse.data || []);
        setHalls(hallsResponse.data || []);
        setCinemas(cinemasResponse.data || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Xử lý submit form
  const handleSubmit = async (data) => {
    try {
      await showtimeService.create(data);
      navigate("/showtimes", {
        state: {
          successMessage: "Đã tạo suất chiếu mới thành công!"
        }
      });
    } catch (err) {
      console.error("Lỗi khi tạo suất chiếu:", err);
      throw err; // Re-throw for the form to handle
    }
  };

  return (
    <>
      <Helmet>
        <title>Thêm suất chiếu mới | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Thêm suất chiếu mới
          </h1>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">{error}</p>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <ShowtimeForm
            movies={movies}
            halls={halls}
            cinemas={cinemas}
            onSubmit={handleSubmit}
            isCreate={true}
            submitButtonText="Tạo suất chiếu"
          />
        )}
      </div>
    </>
  );
};

export default ShowtimeCreate;