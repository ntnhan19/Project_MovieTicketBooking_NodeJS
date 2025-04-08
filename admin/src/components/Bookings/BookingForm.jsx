// src/components/Bookings/BookingForm.jsx
import React, { useState, useEffect } from 'react';
import { useDataProvider, useNotify, useRedirect } from 'react-admin';
import { Box, Button, TextField, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, MenuItem, Select } from '@mui/material';

const BookingForm = () => {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [movies, setMovies] = useState([]);
  const [screenings, setScreenings] = useState([]);
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const redirect = useRedirect();

  useEffect(() => {
    fetchBookings();
    fetchMovies();
  }, []);

  const fetchBookings = async () => {
    try {
      const { data } = await dataProvider.getList('bookings', { pagination: { page: 1, perPage: 10 }, sort: { field: 'createdAt', order: 'DESC' } });
      setBookings(data);
    } catch (error) {
      notify('Không thể tải danh sách vé!', { type: 'error' });
    }
  };

  const fetchMovies = async () => {
    try {
      const { data } = await dataProvider.getList('movies', { pagination: { page: 1, perPage: 100 }, sort: { field: 'title', order: 'ASC' } });
      setMovies(data);
    } catch (error) {
      notify('Không thể tải danh sách phim!', { type: 'error' });
    }
  };

  const handleMovieChange = async (movieId) => {
    try {
      const { data } = await dataProvider.getList('screenings', { filter: { movieId }, pagination: { page: 1, perPage: 100 } });
      setScreenings(data);
      setSelectedBooking({ ...selectedBooking, movieId, screeningId: '' });
    } catch (error) {
      notify('Không thể tải danh sách suất chiếu!', { type: 'error' });
    }
  };

  const handleUpdate = async () => {
    try {
      await dataProvider.update('bookings', { id: selectedBooking.id, data: selectedBooking });
      notify('Cập nhật vé thành công!', { type: 'success' });
      fetchBookings();
      setSelectedBooking(null);
    } catch (error) {
      notify('Cập nhật vé thất bại!', { type: 'error' });
    }
  };

  return (
    <Box sx={{ padding: 3, boxShadow: 2, borderRadius: 2 }}>
      <Typography variant="h4" mb={2}>Quản Lý Vé Xem Phim</Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Tên phim</TableCell>
              <TableCell>Suất chiếu</TableCell>
              <TableCell>Số lượng vé</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>{booking.movieTitle}</TableCell>
                <TableCell>{booking.screeningTime}</TableCell>
                <TableCell>{booking.ticketQuantity}</TableCell>
                <TableCell>{booking.status}</TableCell>
                <TableCell>
                  <Button onClick={() => setSelectedBooking(booking)} variant="contained">Chỉnh sửa</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {selectedBooking && (
        <Box sx={{ mt: 2 }}>
          <Select value={selectedBooking.movieId} onChange={(e) => handleMovieChange(e.target.value)} fullWidth>
            {movies.map((movie) => (
              <MenuItem key={movie.id} value={movie.id}>{movie.title}</MenuItem>
            ))}
          </Select>
          <Select value={selectedBooking.screeningId} onChange={(e) => setSelectedBooking({ ...selectedBooking, screeningId: e.target.value })} fullWidth>
            {screenings.map((screening) => (
              <MenuItem key={screening.id} value={screening.id}>{screening.time}</MenuItem>
            ))}
          </Select>
          <TextField label="Số lượng vé" type="number" value={selectedBooking.ticketQuantity} onChange={(e) => setSelectedBooking({ ...selectedBooking, ticketQuantity: parseInt(e.target.value, 10) })} fullWidth sx={{ mb: 2 }} />
          <Button onClick={handleUpdate} variant="contained" color="primary">Lưu thay đổi</Button>
        </Box>
      )}
    </Box>
  );
};

export default BookingForm;
