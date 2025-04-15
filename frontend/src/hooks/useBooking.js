// frontend/src/hooks/useBooking.js
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../context/BookingContext';
import { bookingApi } from '../api/bookingApi';

export const useBooking = () => {
  const navigate = useNavigate();
  const { bookingData, updateBookingData, resetBookingData } = useContext(BookingContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Chọn suất chiếu và chuyển đến trang chọn ghế
  const selectShowtime = async (movieId, showtimeId, showtimeInfo) => {
    try {
      setLoading(true);
      setError(null);
      
      // Phân tách thông tin ngày và giờ từ chuỗi showtimeInfo
      const [date, time] = showtimeInfo.split(' ');
      
      // Cập nhật thông tin suất chiếu trong context
      updateBookingData({
        showtime: {
          id: showtimeId,
          date,
          time
        },
        ticketPrice: 90000 // Giá vé mặc định
      });
      
      // Chuyển hướng đến trang chọn ghế
      navigate(`/booking/seats/${showtimeId}`);
      return true;
    } catch (err) {
      console.error("Lỗi khi chọn suất chiếu:", err);
      setError("Không thể chọn suất chiếu. Vui lòng thử lại.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Chọn ghế và chuyển đến trang chọn đồ ăn
  const selectSeats = async (seats) => {
    try {
      setLoading(true);
      setError(null);
      
      // Kiểm tra xem đã chọn ghế chưa
      if (!seats || seats.length === 0) {
        setError("Vui lòng chọn ít nhất một ghế.");
        return false;
      }
      
      // Cập nhật thông tin ghế đã chọn trong context
      updateBookingData({ seats });
      
      // Chuyển hướng đến trang chọn đồ ăn
      navigate(`/booking/snacks`);
      return true;
    } catch (err) {
      console.error("Lỗi khi chọn ghế:", err);
      setError("Không thể chọn ghế. Vui lòng thử lại.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Chọn đồ ăn và chuyển đến trang thanh toán
  const selectSnacks = async (snacks) => {
    try {
      setLoading(true);
      setError(null);
      
      // Cập nhật thông tin đồ ăn đã chọn trong context
      updateBookingData({ snacks });
      
      // Chuyển hướng đến trang thanh toán
      navigate(`/booking/payment`);
      return true;
    } catch (err) {
      console.error("Lỗi khi chọn đồ ăn:", err);
      setError("Không thể xử lý đồ ăn đã chọn. Vui lòng thử lại.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán và hoàn tất đặt vé
  const processPayment = async (paymentMethod, cardDetails = null) => {
    try {
      setLoading(true);
      setError(null);
      
      // Tính tổng tiền
      const ticketsTotal = bookingData.seats.length * bookingData.ticketPrice;
      const snacksTotal = bookingData.snacks.reduce((total, snack) => 
        total + (snack.price * snack.quantity), 0);
      const totalAmount = ticketsTotal + snacksTotal;
      
      // Tạo dữ liệu đặt vé
      const bookingPayload = {
        movieId: bookingData.movie.id,
        showtimeId: bookingData.showtime.id,
        seats: bookingData.seats,
        snacks: bookingData.snacks,
        amount: totalAmount,
        paymentMethod,
        cardDetails
      };
      
      // Gọi API để tạo đặt vé
      const response = await bookingApi.createBooking(bookingPayload);
      
      // Cập nhật thông tin thanh toán trong context
      updateBookingData({
        bookingId: response.id || response.bookingId,
        payment: {
          id: response.paymentId,
          status: 'COMPLETED',
          transactionId: response.transactionId || `TXN-${Date.now()}`
        }
      });
      
      // Chuyển hướng đến trang thành công
      navigate('/booking/success');
      return true;
    } catch (err) {
      console.error("Lỗi khi xử lý thanh toán:", err);
      setError("Không thể xử lý thanh toán. Vui lòng thử lại.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    selectShowtime,
    selectSeats,
    selectSnacks,
    processPayment,
    loading,
    error,
    resetBookingData
  };
};