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
        <ReferenceField source="hallId" reference="halls" label="Hall">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="startTime" showTime />
        <DateField source="endTime" showTime />
      </Datagrid>
    </List>
  );
};

export default ShowtimeList;

