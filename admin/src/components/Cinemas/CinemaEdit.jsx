//admin/src/components/Cinemas/CinemaEdit.jsx
import { Edit, SimpleForm, TextInput } from "react-admin";
import CinemaForm from "./CinemaForm";

const CinemaEdit = () => (
  <Edit>
    <SimpleForm>
      <CinemaForm />
    </SimpleForm>
  </Edit>
);

export default CinemaEdit;
