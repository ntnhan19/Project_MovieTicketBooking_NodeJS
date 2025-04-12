// src/components/Showtimes/ShowtimeCreate.jsx
import { Create, SimpleForm } from 'react-admin';
import ShowtimeForm from './ShowtimeForm';

const ShowtimeCreate = () => (
  <Create title="Thêm suất chiếu">
    <SimpleForm>
      <ShowtimeForm />
    </SimpleForm>
  </Create>
);

export default ShowtimeCreate;

