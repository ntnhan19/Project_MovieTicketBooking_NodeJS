// admin/src/components/Tickets/TicketForm.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import ticketService from "@/services/ticketService";
import userService from "@/services/userService";
import showtimeService from "@/services/showtimeService";

const TicketForm = ({ initialData }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [users, setUsers] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [seats, setSeats] = useState([]);

  // Danh sách trạng thái vé
  const statusOptions = [
    { id: "AVAILABLE", name: "Khả dụng" },
    { id: "BOOKED", name: "Đã đặt" },
    { id: "LOCKED", name: "Đã khóa" },
  ];

  // Fetch dữ liệu cho dropdown
  useEffect(() => {
    const fetchDropdownData = async () => {
      try {
        const usersResponse = await userService.getList();
        const showtimesResponse = await showtimeService.getList();
        
        setUsers(usersResponse.data);
        setShowtimes(showtimesResponse.data);

        // Nếu có initialData, fetch danh sách ghế cho suất chiếu đó
        if (initialData?.showtimeId) {
          const seatsResponse = await showtimeService.getSeats(initialData.showtimeId);
          setSeats(seatsResponse.data);
        }
      } catch (err) {
        console.error("Lỗi khi tải dữ liệu:", err);
      }
    };

    fetchDropdownData();
  }, [initialData?.showtimeId]);

  // Fetch danh sách ghế khi chọn suất chiếu
  const fetchSeatsForShowtime = async (showtimeId) => {
    try {
      const seatsResponse = await showtimeService.getSeats(showtimeId);
      setSeats(seatsResponse.data);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ghế:", err);
    }
  };

  // Initialize react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: initialData ? {
      userId: initialData.userId,
      showtimeId: initialData.showtimeId,
      seatId: initialData.seatId,
      price: initialData.price,
      status: initialData.status || "AVAILABLE",
    } : {},
  });

  // Handle form submission
  const onFormSubmit = async (data) => {
    setLoading(true);
    setError(null);

    try {
      // Chỉ hỗ trợ cập nhật
      await ticketService.update(initialData.id, data);
      
      // Chuyển hướng sau khi cập nhật thành công
      navigate("/tickets");
    } catch (err) {
      console.error("Lỗi khi cập nhật vé:", err);
      setError(err.message || "Không thể cập nhật vé. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-background-paper-dark rounded-lg shadow-card p-6 animate-fadeIn">
      {/* Form Header */}
      <div className="border-b border-border dark:border-border-dark pb-4 mb-6">
        <h2 className="text-xl font-bold text-text-primary dark:text-text-primary-dark">
          Chỉnh sửa vé
        </h2>
        <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
          Quản lý thông tin chi tiết của vé
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Người dùng */}
          <div>
            <label
              htmlFor="userId"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Người dùng
            </label>
            <select
              id="userId"
              className={`w-full px-3 py-2 border ${
                errors.userId
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("userId")}
            >
              <option value="">Chọn người dùng</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name}
                </option>
              ))}
            </select>
            {errors.userId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.userId.message}
              </p>
            )}
          </div>

          {/* Suất chiếu */}
          <div>
            <label
              htmlFor="showtimeId"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Suất chiếu
            </label>
            <select
              id="showtimeId"
              className={`w-full px-3 py-2 border ${
                errors.showtimeId
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("showtimeId", { 
                onChange: (e) => fetchSeatsForShowtime(e.target.value)
              })}
            >
              <option value="">Chọn suất chiếu</option>
              {showtimes.map((showtime) => (
                <option key={showtime.id} value={showtime.id}>
                  {showtime.movie.title} - {new Date(showtime.startTime).toLocaleString()}
                </option>
              ))}
            </select>
            {errors.showtimeId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.showtimeId.message}
              </p>
            )}
          </div>

          {/* Ghế */}
          <div>
            <label
              htmlFor="seatId"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Ghế
            </label>
            <select
              id="seatId"
              className={`w-full px-3 py-2 border ${
                errors.seatId
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("seatId")}
            >
              <option value="">Chọn ghế</option>
              {seats.map((seat) => (
                <option key={seat.id} value={seat.id}>
                  {seat.row}{seat.column}
                </option>
              ))}
            </select>
            {errors.seatId && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.seatId.message}
              </p>
            )}
          </div>

          {/* Giá vé */}
          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Giá vé
            </label>
            <input
              type="number"
              id="price"
              placeholder="Nhập giá vé"
              className={`w-full px-3 py-2 border ${
                errors.price
                  ? "border-red-500 dark:border-red-500"
                  : "border-border dark:border-border-dark"
              } rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark`}
              {...register("price", { 
                min: { value: 0, message: "Giá vé phải lớn hơn 0" }
              })}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.price.message}
              </p>
            )}
          </div>

          {/* Trạng thái */}
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-text-primary dark:text-text-primary-dark mb-1"
            >
              Trạng thái
            </label>
            <select
              id="status"
              className="w-full px-3 py-2 border border-border dark:border-border-dark rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary bg-white dark:bg-background-paper-dark text-text-primary dark:text-text-primary-dark"
              {...register("status")}
            >
              {statusOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 border-t border-border dark:border-border-dark pt-6">
          <button
            type="button"
            onClick={() => navigate("/tickets")}
            className="px-4 py-2 border border-border dark:border-border-dark rounded-md text-sm font-medium text-text-primary dark:text-text-primary-dark hover:bg-gray-100 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </div>
            ) : (
              "Cập nhật"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TicketForm;