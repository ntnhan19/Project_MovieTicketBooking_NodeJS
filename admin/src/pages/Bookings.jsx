// src/pages/Bookings.jsx
import React from 'react';
import { List, Create, Edit} from 'react-admin';
import BookingList from '@/components/Bookings/BookingList';
import BookingForm from '@/components/Bookings/BookingForm';

export const BookingListView = (props) => (
  <List {...props} title="Danh sách đặt vé">
    <BookingList {...props} />
  </List>
);

export const BookingCreateView = (props) => (
  <Create {...props} title="Tạo đặt vé mới">
    <BookingForm {...props} />
  </Create>
);

export const BookingEditView = (props) => (
  <Edit {...props} title="Chỉnh sửa thông tin đặt vé">
    <BookingForm {...props} />
  </Edit>
);