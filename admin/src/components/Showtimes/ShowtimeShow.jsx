// src/components/Showtimes/ShowtimeShow.jsx
import { Show, SimpleShowLayout, TextField, DateField, ReferenceField } from 'react-admin';

const ShowtimeShow = () => {
  return (
    <Show>
      <SimpleShowLayout>
        <TextField source="id" />
        <ReferenceField source="movieId" reference="movies" label="Movie">
          <TextField source="title" />
        </ReferenceField>
        <ReferenceField source="roomId" reference="rooms" label="Room">
          <TextField source="name" />
        </ReferenceField>
        <DateField source="startTime" showTime />
      </SimpleShowLayout>
    </Show>
  );
};

export default ShowtimeShow;
