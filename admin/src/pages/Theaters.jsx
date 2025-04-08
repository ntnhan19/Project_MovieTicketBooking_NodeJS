// src/pages/Theaters.jsx
import React from 'react';
import { List, Create, Edit } from 'react-admin';
import TheaterList from '@/components/Theaters/TheaterList';
import TheaterForm from '@/components/Theaters/TheaterForm';

export const TheaterListView = (props) => (
  <List {...props} title="Danh sách rạp chiếu">
    <TheaterList {...props} />
  </List>
);

export const TheaterCreateView = (props) => (
  <Create {...props} title="Thêm rạp chiếu mới">
    <TheaterForm {...props} />
  </Create>
);

export const TheaterEditView = (props) => (
  <Edit {...props} title="Chỉnh sửa thông tin rạp chiếu">
    <TheaterForm {...props} />
  </Edit>
);