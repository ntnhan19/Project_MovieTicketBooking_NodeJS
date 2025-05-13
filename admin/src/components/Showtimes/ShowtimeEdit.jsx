// admin/src/components/Showtimes/ShowtimeEdit.jsx
import React, { useState, useEffect } from "react";
import { Helmet } from 'react-helmet';
import { useParams, useNavigate } from "react-router-dom";
import { showtimeService } from "../../services/showtimeService";
import movieService from "../../services/movieService"; 
import ShowtimeForm from "./ShowtimeForm";

const ShowtimeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [movies, setMovies] = useState([]);
  const [halls, setHalls] = useState([]);
  const [cinemas, setCinemas] = useState([]);

  // Tải dữ liệu cần thiết
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Tải song song tất cả dữ liệu cần thiết
        const [showtimeRes, moviesRes, hallsRes, cinemasRes] = await Promise.all([
          showtimeService.getOne(id),
          // Sử dụng movieService thay vì fetch trực tiếp
          movieService.getList({
            pagination: { page: 1, perPage: 100 }, // Lấy nhiều phim
            sort: { field: 'title', order: 'ASC' },
            filter: {}
          }),
          fetch('/api/halls').then(res => res.json()),
          fetch('/api/cinemas').then(res => res.json())
        ]);

        setShowtime(showtimeRes.data);
        // Lấy mảng data từ kết quả trả về của movieService
        setMovies(moviesRes.data || []);
        setHalls(hallsRes.data || []);
        setCinemas(cinemasRes.data || []);
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Xử lý submit form
  const handleSubmit = async (data) => {
    setSubmitting(true);
    setError(null);

    try {
      await showtimeService.update(id, data);
      navigate("/showtimes", {
        state: {
          successMessage: "Đã cập nhật suất chiếu thành công!"
        }
      });
    } catch (err) {
      console.error("Lỗi khi cập nhật suất chiếu:", err);
      throw err; // Re-throw for the form error handling
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Chỉnh sửa suất chiếu | Hệ thống quản lý rạp chiếu phim</title>
      </Helmet>

      <div className="container mx-auto px-4 py-6">
        {/* Page Title */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Chỉnh sửa suất chiếu
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
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          showtime && (
            <ShowtimeForm
              initialData={{
                ...showtime,
                // Đảm bảo các trường datetime là Date object
                startTime: showtime.startTime ? new Date(showtime.startTime) : null,
                endTime: showtime.endTime ? new Date(showtime.endTime) : null
              }}
              movies={movies}
              halls={halls}
              cinemas={cinemas}
              onSubmit={handleSubmit}
              isCreate={false}
              submitButtonText="Cập nhật suất chiếu"
            />
          )
        )}
      </div>
    </>
  );
};

export default ShowtimeEdit;