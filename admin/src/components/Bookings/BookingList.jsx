// src/components/Bookings/BookingList.jsx
import React from 'react';
import { List, Datagrid, TextField, DateField, EditButton, DeleteButton } from 'react-admin';

const BookingList = (props) => {
  return (
    <List
      {...props}
      className="admin-page"
      actions={null}
      bulkActionButtons={false}
      pagination={false}>
      <Datagrid>
        <TextField source="id" label="ID" />
        <TextField source="movieTitle" label="Tên Phim" />
        <TextField source="screeningTime" label="Suất Chiếu" />
        <TextField source="ticketQuantity" label="Số Lượng Vé" />
        <TextField source="status" label="Trạng Thái" />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export default BookingList;
