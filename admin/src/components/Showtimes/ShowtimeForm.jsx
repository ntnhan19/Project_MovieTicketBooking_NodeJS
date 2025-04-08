// src/components/Showtimes/ShowtimeForm.jsx
import { useRecordContext, DateTimeInput, ReferenceInput, SelectInput } from 'react-admin';

const ShowtimeForm = () => {
  const record = useRecordContext();

  return (
    <>
      <ReferenceInput source="movieId" reference="movies" label="Movie">
        <SelectInput optionText="title" />
      </ReferenceInput>

      <ReferenceInput source="roomId" reference="rooms" label="Room">
        <SelectInput optionText="name" />
      </ReferenceInput>

      <DateTimeInput source="startTime" label="Start Time" />
    </>
  );
};

export default ShowtimeForm;
