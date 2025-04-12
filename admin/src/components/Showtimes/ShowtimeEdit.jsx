// src/components/Showtimes/ShowtimeEdit.jsx
import { Edit, SimpleForm } from 'react-admin';
import ShowtimeForm from './ShowtimeForm';

const ShowtimeEdit = () => (
  <Edit title="Chỉnh sửa suất chiếu">
    <SimpleForm>
      <ShowtimeForm />
    </SimpleForm>
  </Edit>
);

export default ShowtimeEdit;
