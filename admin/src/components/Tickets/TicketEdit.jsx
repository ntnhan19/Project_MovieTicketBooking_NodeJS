import React from 'react';
import {
  Edit,
  SimpleForm,
  SelectInput,
  ReferenceInput,
  TextField,
  DateField,
  NumberInput,
  required,
  useNotify,
  useRedirect,
  useRecordContext,
  FormDataConsumer
} from 'react-admin';

const TicketTitle = () => {
  const record = useRecordContext();
  return record ? <span>Edit Ticket #{record.id}</span> : null;
};

const TicketEdit = () => {
  const notify = useNotify();
  const redirect = useRedirect();
  
  const onSuccess = () => {
    notify('Ticket updated successfully');
    redirect('show', 'tickets');
  };
  
  return (
    <Edit title={<TicketTitle />} mutationOptions={{ onSuccess }}>
      <SimpleForm>
        <TextField source="id" disabled />
        <ReferenceInput source="userId" reference="users" disabled>
          <TextField source="name" />
        </ReferenceInput>
        <ReferenceInput source="showtimeId" reference="showtimes" disabled>
          <TextField source="movie.title" />
        </ReferenceInput>
        <TextField source="seat.row" label="Row" disabled />
        <TextField source="seat.column" label="Seat" disabled />
        <NumberInput source="price" validate={required()} />
        <SelectInput 
          source="status" 
          choices={[
            { id: 'PENDING', name: 'Pending' },
            { id: 'CONFIRMED', name: 'Confirmed' },
            { id: 'COMPLETED', name: 'Completed' },
            { id: 'CANCELLED', name: 'Cancelled' }
          ]} 
          validate={required()}
        />
        <FormDataConsumer>
          {({ formData }) => (
            formData.status === 'CANCELLED' ? (
              <div style={{ color: 'red', marginTop: 10 }}>
                Warning: When changing status to CANCELLED, the seat will be released for booking again.
              </div>
            ) : null
          )}
        </FormDataConsumer>
      </SimpleForm>
    </Edit>
  );
};

export default TicketEdit;