// frontend/src/hooks/useBooking.js
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../context/BookingContext';
import { bookingApi } from '../api/bookingApi';
import { showtimeApi } from '../api/showtimeApi';
import { paymentApi } from '../api/paymentApi';

export const useBooking = () => {
  const { bookingData, updateBookingData, resetBookingData } = useContext(BookingContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch available showtimes for a movie
  const fetchShowtimes = async (movieId) => {
    setLoading(true);
    setError(null);
    try {
      const showtimes = await showtimeApi.getShowtimes(movieId);
      return showtimes;
    } catch (err) {
      setError(err.message || 'Failed to fetch showtimes');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Select a showtime and update booking context
  const selectShowtime = async (movieId, showtimeId, dateTime) => {
    setLoading(true);
    setError(null);
    try {
      // Fetch movie details and showtime details
      const showtime = { id: showtimeId, date: dateTime.split(' ')[0], time: dateTime.split(' ')[1] };
      
      // Update booking context
      updateBookingData({
        movie: { id: movieId },
        showtime: showtime,
        bookingId: `BOOK-${Date.now()}`
      });
      
      navigate('/booking/seats');
      return true;
    } catch (err) {
      setError(err.message || 'Failed to select showtime');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Fetch available seats for a showtime
  const fetchAvailableSeats = async (showtimeId) => {
    setLoading(true);
    setError(null);
    try {
      const seatsData = await bookingApi.getAvailableSeats(showtimeId);
      return seatsData;
    } catch (err) {
      setError(err.message || 'Failed to fetch available seats');
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Select seats and update booking context
  const selectSeats = (selectedSeats, ticketPrice) => {
    updateBookingData({
      seats: selectedSeats,
      ticketPrice: ticketPrice
    });
    navigate('/booking/snacks');
  };

  // Select snacks and update booking context
  const selectSnacks = (selectedSnacks) => {
    updateBookingData({
      snacks: selectedSnacks
    });
    navigate('/booking/payment');
  };

  // Process payment
  const processPayment = async (paymentDetails) => {
    setLoading(true);
    setError(null);
    try {
      // Create payment payload
      const paymentPayload = {
        bookingId: bookingData.bookingId,
        amount: calculateTotalAmount(),
        paymentMethod: paymentDetails.paymentMethod,
        cardDetails: paymentDetails.cardDetails,
        items: [
          { type: 'tickets', quantity: bookingData.seats.length, price: bookingData.ticketPrice },
          ...bookingData.snacks.map(snack => ({
            type: 'snack',
            id: snack.id,
            name: snack.name,
            quantity: snack.quantity,
            price: snack.price
          }))
        ]
      };

      // Process payment
      const result = await paymentApi.processPayment(paymentPayload);

      // Update booking data with payment info
      updateBookingData({
        payment: {
          id: result.paymentId,
          status: result.status,
          transactionId: result.transactionId
        }
      });

      // Create final booking record
      await bookingApi.createBooking({
        bookingId: bookingData.bookingId,
        movieId: bookingData.movie.id,
        showtimeId: bookingData.showtime.id,
        seats: bookingData.seats,
        snacks: bookingData.snacks,
        totalAmount: calculateTotalAmount(),
        paymentId: result.paymentId
      });

      navigate('/booking/success');
      return true;
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Calculate total amount
  const calculateTotalAmount = () => {
    const ticketsTotal = bookingData.seats.length * bookingData.ticketPrice;
    const snacksTotal = bookingData.snacks.reduce((total, snack) => 
      total + (snack.price * snack.quantity), 0);
    return ticketsTotal + snacksTotal;
  };

  return {
    bookingData,
    loading,
    error,
    fetchShowtimes,
    selectShowtime,
    fetchAvailableSeats,
    selectSeats,
    selectSnacks,
    processPayment,
    calculateTotalAmount,
    resetBookingData
  };
};