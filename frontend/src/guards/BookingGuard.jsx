// frontend/src/guards/BookingGuard.jsx
import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { BookingContext } from '../context/BookingContext';

export const BookingGuard = ({ children, requiredData }) => {
  const { bookingData } = useContext(BookingContext);
  
  // Kiểm tra xem dữ liệu cần thiết có tồn tại không
  const checkRequiredData = () => {
    switch (requiredData) {
      case 'showtime':
        return bookingData.showtime && bookingData.movie;
      case 'seats':
        return bookingData.seats && bookingData.seats.length > 0;
      case 'snacks':
        return bookingData.seats && bookingData.seats.length > 0;
      case 'payment':
        return bookingData.payment && bookingData.payment.status === 'COMPLETED';
      default:
        return true;
    }
  };
  
  // Xác định trang chuyển hướng nếu thiếu dữ liệu
  const getRedirectPath = () => {
    if (!bookingData.movie) return '/movies';
    if (!bookingData.showtime) return `/booking/movie/${bookingData.movie.id}`;
    if (!bookingData.seats || bookingData.seats.length === 0) return `/booking/seats/${bookingData.showtime.id}`;
    if (requiredData === 'payment' && !bookingData.payment) return '/booking/payment';
    return '/';
  };
  
  // Chuyển hướng nếu thiếu dữ liệu
  if (!checkRequiredData()) {
    return <Navigate to={getRedirectPath()} replace />;
  }
  
  // Nếu đã có đủ dữ liệu, hiển thị component con
  return children;
};