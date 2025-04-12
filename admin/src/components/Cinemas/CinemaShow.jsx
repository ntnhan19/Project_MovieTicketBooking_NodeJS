//admin/src/components/Cinemas/CinemaShow.jsx
import { Show, SimpleShowLayout, TextField } from 'react-admin';

const CinemaShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="name" />
      <TextField source="address" />
    </SimpleShowLayout>
  </Show>
);

export default CinemaShow;
