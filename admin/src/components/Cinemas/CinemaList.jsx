//admin/src/components/Cinemas/CinemaList.jsx
import { List, Datagrid, TextField, EditButton, DeleteButton } from 'react-admin';

const CinemaList = () => (
  <List>
    <Datagrid rowClick="edit">
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="address" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default CinemaList;