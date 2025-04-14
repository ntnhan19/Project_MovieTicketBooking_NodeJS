//admin/src/components/Halls/HallCreate.jsx
import { Create, SimpleForm } from 'react-admin';
import HallForm from './HallForm';

const HallCreate = () => (
  <Create title="Tạo phòng chiếu">
    <SimpleForm redirect="list">
      <HallForm />
    </SimpleForm>
  </Create>
);

export default HallCreate;
