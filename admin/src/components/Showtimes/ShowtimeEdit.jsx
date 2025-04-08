// src/components/Showtimes/ShowtimeEdit.jsx
import { Edit, SimpleForm } from 'react-admin';
import ShowtimeForm from './ShowtimeForm';

const ShowtimeEdit = () => {
  return (
    <Edit>
      <SimpleForm>
        <ShowtimeForm />
      </SimpleForm>
    </Edit>
  );
};

export default ShowtimeEdit;
