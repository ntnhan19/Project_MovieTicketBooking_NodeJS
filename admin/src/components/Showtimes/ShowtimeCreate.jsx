// src/components/Showtimes/ShowtimeCreate.jsx
import { Create, SimpleForm } from 'react-admin';
import ShowtimeForm from './ShowtimeForm';

const ShowtimeCreate = () => {
  return (
    <Create>
      <SimpleForm>
        <ShowtimeForm />
      </SimpleForm>
    </Create>
  );
};

export default ShowtimeCreate;
