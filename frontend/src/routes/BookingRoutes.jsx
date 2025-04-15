import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Step1SelectShowtime from '../components/Booking/Step1SelectShowtime';
import Step2SelectSeats from '../components/Booking/Step2SelectSeats';
import Step3SelectSnacks from '../components/Booking/Step3SelectSnacks';
import Step4PaymentMethod from '../components/Booking/steps/Step4PaymentMethod';
import Step5Success from '../components/Booking/steps/Step5Success';
import { BookingGuard } from '../guards/BookingGuard';

const BookingRoutes = () => {
  return (
    <Routes>
      <Route path="/movie/:movieId" element={<Step1SelectShowtime />} />
      <Route path="/seats/:id" element={
        <BookingGuard requiredData="showtime">
          <Step2SelectSeats />
        </BookingGuard>
      } />
      <Route path="/snacks" element={
        <BookingGuard requiredData="seats">
          <Step3SelectSnacks />
        </BookingGuard>
      } />
      <Route path="/payment" element={
        <BookingGuard requiredData="snacks">
          <Step4PaymentMethod />
        </BookingGuard>
      } />
      <Route path="/success" element={
        <BookingGuard requiredData="payment">
          <Step5Success />
        </BookingGuard>
      } />
      <Route path="/*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default BookingRoutes;