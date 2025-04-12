//admin/src/components/Halls/HallEdit.jsx
import { Edit, SimpleForm } from "react-admin";
import HallForm from "./HallForm";

const HallEdit = () => (
  <Edit title="Chỉnh sửa phòng chiếu">
    <SimpleForm redirect="list">
      <HallForm />
    </SimpleForm>
  </Edit>
);

export default HallEdit;
