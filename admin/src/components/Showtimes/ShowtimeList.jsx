// src/components/Showtimes/ShowtimeList.jsx
import { Datagrid, List, TextField, DateField, ReferenceField } from 'react-admin';

const ShowtimeList = () => {
  return (
    <List>
      <Datagrid rowClick="edit">
        <TextField source="id" />
        <ReferenceField source="movieId" reference="movies" label="Movie">
          <TextField source="title" />
        </ReferenceField>
        <ReferenceField source="roomId" reference="rooms" label="Room">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="startTime" showTime />
      </Datagrid>
    </List>
  );
};

export default ShowtimeList;
