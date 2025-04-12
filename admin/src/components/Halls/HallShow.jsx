//admin/src/components/Halls/HallShow.jsx
import { Show, SimpleShowLayout, TextField, NumberField } from 'react-admin';

const HallShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <TextField source="location" />
      <NumberField source="totalSeats" />
      <NumberField source="rows" />
      <NumberField source="columns" />
    </SimpleShowLayout>
  </Show>
);

export default HallShow;