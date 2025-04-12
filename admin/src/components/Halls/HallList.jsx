// src/components/Halls/HallList.jsx
import { List, Datagrid, TextField, NumberField } from 'react-admin';

const HallList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="location" />
      <NumberField source="totalSeats" />
      <NumberField source="rows" />
      <NumberField source="columns" />
    </Datagrid>
  </List>
);

export default HallList;
