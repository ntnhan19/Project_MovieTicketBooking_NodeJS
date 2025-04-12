//admin/src/components/Cinemas/CinemaCreate.jsx
import { Create, SimpleForm } from "react-admin";
import CinemaForm from "./CinemaForm";

const CinemaCreate = () => (
  <Create>
    <SimpleForm>
      <CinemaForm />
    </SimpleForm>
  </Create>
);

export default CinemaCreate;
