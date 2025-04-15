// src/components/Halls/HallList.jsx
import { List, Datagrid, TextField, NumberField, ReferenceField } from 'react-admin';

const HallList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <NumberField source="totalSeats" />
      <NumberField source="rows" />
      <NumberField source="columns" />
      <ReferenceField source="cinemaId" reference="cinemas" label="Rạp chiếu">
        <TextField source="name" />
      </ReferenceField>
    </Datagrid>
  </List>
);

export default HallList;
