// src/components/Showtimes/ShowtimeShow.jsx
import { Show, SimpleShowLayout, TextField, DateField, ReferenceField } from 'react-admin';

const ShowtimeShow = () => (
  <Show title="Chi tiết suất chiếu">
    <SimpleShowLayout>
      <TextField source="id" />
      <ReferenceField source="movieId" reference="movies" label="Phim">
        <TextField source="title" />
      </ReferenceField>
      <ReferenceField source="hallId" reference="halls" label="Phòng chiếu">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="startTime" label="Bắt đầu" showTime />
      <DateField source="endTime" label="Kết thúc" showTime />
    </SimpleShowLayout>
  </Show>
);

export default ShowtimeShow;

