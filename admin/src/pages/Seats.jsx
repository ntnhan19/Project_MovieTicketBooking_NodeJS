// src/pages/Seats.jsx
import React from 'react';
import { List, Create, Edit } from 'react-admin';
import SeatList from '@/components/Seats/SeatList';
import SeatForm from '@/components/Seats/SeatForm';

export const SeatListView = (props) => (
  <List {...props} title="Danh sách ghế">
    <SeatList {...props} />
  </List>
);

export const SeatCreateView = (props) => (
  <Create {...props} title="Thêm ghế mới">
    <SeatForm {...props} />
  </Create>
);

export const SeatEditView = (props) => (
  <Edit {...props} title="Chỉnh sửa thông tin ghế">
    <SeatForm {...props} />
  </Edit>
);