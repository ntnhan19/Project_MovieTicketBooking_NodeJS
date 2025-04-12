//admin/src/components/Halls/HallForm.jsx
import { TextInput, NumberInput } from 'react-admin';

const HallForm = () => (
  <>
    <TextInput source="name" label="Tên rạp" fullWidth />
    <TextInput source="location" label="Địa điểm" fullWidth />
    <NumberInput source="totalSeats" label="Tổng số ghế" />
    <NumberInput source="rows" label="Số hàng" />
    <NumberInput source="columns" label="Số ghế mỗi hàng" />
  </>
);

export default HallForm;