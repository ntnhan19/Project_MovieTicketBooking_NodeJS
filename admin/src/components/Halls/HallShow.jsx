//admin/src/components/Halls/HallShow.jsx
import { Show, SimpleShowLayout, TextField, NumberField, ReferenceField } from 'react-admin';

const HallShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" />
      <TextField source="name" />
      <NumberField source="totalSeats" />
      <NumberField source="rows" />
      <NumberField source="columns" />
      <ReferenceField source="cinemaId" reference="cinemas" label="Rạp chiếu">
        <TextField source="name" />
      </ReferenceField>
    </SimpleShowLayout>
  </Show>
);

export default HallShow;