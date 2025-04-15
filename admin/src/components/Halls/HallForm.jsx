//admin/src/components/Halls/HallForm.jsx
import { TextInput, NumberInput, ReferenceInput, SelectInput } from 'react-admin';

const HallForm = () => (
  <>
    <TextInput source="name" label="Tên phòng chiếu" fullWidth />
    <NumberInput source="totalSeats" label="Tổng số ghế" />
    <NumberInput source="rows" label="Số hàng" />
    <NumberInput source="columns" label="Số ghế mỗi hàng" />

    {/* Chọn cinema (rạp) chứa hall */}
    <ReferenceInput source="cinemaId" reference="cinemas" label="Rạp chiếu">
      <SelectInput optionText="name" />
    </ReferenceInput>
  </>
);

export default HallForm;