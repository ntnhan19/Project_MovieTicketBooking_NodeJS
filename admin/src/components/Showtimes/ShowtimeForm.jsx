// src/components/Showtimes/ShowtimeForm.jsx
import {
  DateTimeInput,
  ReferenceInput,
  SelectInput,
  useGetOne,
  useNotify,
} from 'react-admin';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import dayjs from 'dayjs';

const ShowtimeForm = () => {
  const { setValue } = useFormContext();
  const movieId = useWatch({ name: 'movieId' });
  const startTime = useWatch({ name: 'startTime' });

  const notify = useNotify();
  const { data: movie } = useGetOne('movies', { id: movieId }, { enabled: !!movieId });

  useEffect(() => {
    if (movie && startTime) {
      const durationInMinutes = movie.duration;
      if (!durationInMinutes) {
        notify('Phim chưa có thời lượng!');
        return;
      }
      const calculatedEndTime = dayjs(startTime).add(durationInMinutes, 'minute').toISOString();
      setValue('endTime', calculatedEndTime);
    }
  }, [movie, startTime, setValue, notify]);

  return (
    <>
      <ReferenceInput source="movieId" reference="movies" label="Phim">
        <SelectInput optionText="title" fullWidth />
      </ReferenceInput>

      <ReferenceInput source="hallId" reference="halls" label="Phòng chiếu">
        <SelectInput optionText="name" fullWidth />
      </ReferenceInput>

      <DateTimeInput source="startTime" label="Bắt đầu" fullWidth />
      <DateTimeInput source="endTime" label="Kết thúc" fullWidth disabled />
    </>
  );
};

export default ShowtimeForm;
