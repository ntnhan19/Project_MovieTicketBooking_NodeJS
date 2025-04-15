// frontend/src/components/Booking/steps/Step5Success.jsx
import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookingContext } from '../../../context/BookingContext';

function Step5Success() {
  const navigate = useNavigate();
  const { bookingData, resetBookingData } = useContext(BookingContext);

  useEffect(() => {
    // If no payment data, redirect to home
    if (!bookingData.payment) {
      navigate('/');
    }
  }, [bookingData, navigate]);

  const handleBackToHome = () => {
    resetBookingData();
    navigate('/');
  };

  const handleViewTickets = () => {
    navigate('/user/tickets');
  };

  if (!bookingData.payment) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="success-container">
      <div className="success-icon">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
      </div>
      
      <h2>Payment Successful!</h2>
      <p className="success-message">Your booking has been confirmed.</p>
      
      <div className="booking-details">
        <h3>Booking Details</h3>
        <div className="detail-item">
          <span>Transaction ID:</span>
          <span>{bookingData.payment.transactionId}</span>
        </div>
        <div className="detail-item">
          <span>Movie:</span>
          <span>{bookingData.movie?.title}</span>
        </div>
        <div className="detail-item">
          <span>Date & Time:</span>
          <span>{bookingData.showtime?.date} at {bookingData.showtime?.time}</span>
        </div>
        <div className="detail-item">
          <span>Seats:</span>
          <span>{bookingData.seats?.join(', ')}</span>
        </div>
        {bookingData.snacks?.length > 0 && (
          <div className="detail-item">
            <span>Snacks:</span>
            <ul>
              {bookingData.snacks.map((snack, index) => (
                <li key={index}>{snack.name} x{snack.quantity}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      <p className="ticket-info">
        Your e-tickets have been sent to your email address.
        You can also view them in your account.
      </p>
      
      <div className="action-buttons">
        <button className="primary-btn" onClick={handleViewTickets}>
          View My Tickets
        </button>
        <button className="secondary-btn" onClick={handleBackToHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default Step5Success;