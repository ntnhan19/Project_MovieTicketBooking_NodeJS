// src/components/Bookings/BookingShow.jsx
import React, { useEffect, useState } from 'react';
import { useDataProvider, useNotify, useRedirect, useRecordContext } from 'react-admin';
import { Box, Button, Typography, TextField } from '@mui/material';

const BookingShow = () => {
  const [booking, setBooking] = useState(null);
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();
  const record = useRecordContext();

  useEffect(() => {
    if (record) fetchBooking(record.id);
  }, [record]);

  const fetchBooking = async (id) => {
    try {
      const { data } = await dataProvider.getOne('bookings', { id });
      setBooking(data);
    } catch (error) {
      notify('Không thể tải thông tin vé!', { type: 'error' });
    }
  };

  const handleBack = () => {
    redirect('/bookings');
  };

  return (
    <Box sx={{ padding: 3, boxShadow: 2, borderRadius: 2 }}>
      <Typography variant="h4" mb={2}>Chi Tiết Vé Xem Phim</Typography>
      {booking ? (
        <>
          <TextField label="Tên phim" value={booking.movieTitle} fullWidth sx={{ mb: 2 }} disabled />
          <TextField label="Suất chiếu" value={booking.screeningTime} fullWidth sx={{ mb: 2 }} disabled />
          <TextField label="Số lượng vé" value={booking.ticketQuantity} fullWidth sx={{ mb: 2 }} disabled />
          <TextField label="Trạng thái" value={booking.status} fullWidth sx={{ mb: 2 }} disabled />
          <Button onClick={handleBack} variant="contained" color="primary">Quay lại</Button>
        </>
      ) : (
        <Typography>Đang tải...</Typography>
      )}
    </Box>
  );
};

export default BookingShow;
