// frontend/src/context/BookingContext.jsx
import React, { createContext, useState } from 'react';

export const BookingContext = createContext();

export const BookingProvider = ({ children }) => {
  const [bookingData, setBookingData] = useState({
    movie: null,
    showtime: null,
    seats: [],
    snacks: [],
    ticketPrice: 0,
    bookingId: null,
    payment: null
  });

  const updateBookingData = (newData) => {
    setBookingData(prevData => ({ ...prevData, ...newData }));
  };

  const resetBookingData = () => {
    setBookingData({
      movie: null,
      showtime: null,
      seats: [],
      snacks: [],
      ticketPrice: 0,
      bookingId: null,
      payment: null
    });
  };

  return (
    <BookingContext.Provider value={{ bookingData, updateBookingData, resetBookingData }}>
      {children}
    </BookingContext.Provider>
  );
};