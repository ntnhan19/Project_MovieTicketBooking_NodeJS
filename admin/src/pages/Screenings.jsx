// src/pages/Screenings.jsx
import React from 'react';
import { List, Create, Edit } from 'react-admin';
import ScreeningList from '@/components/Screenings/ScreeningList';
import ScreeningForm from '@/components/Screenings/ScreeningForm';

export const ScreeningListView = (props) => (
  <List {...props} title="Danh sách suất chiếu">
    <ScreeningList {...props} />
  </List>
);

export const ScreeningCreateView = (props) => (
  <Create {...props} title="Thêm suất chiếu mới">
    <ScreeningForm {...props} />
  </Create>
);

export const ScreeningEditView = (props) => (
  <Edit {...props} title="Chỉnh sửa thông tin suất chiếu">
    <ScreeningForm {...props} />
  </Edit>
);