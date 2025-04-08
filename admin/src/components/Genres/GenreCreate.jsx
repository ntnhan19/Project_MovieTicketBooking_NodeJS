//admin/src/components/Genres/GenreCreate.jsx
import React from 'react';
import { 
  Create, 
  SimpleForm, 
  TextInput,
  required
} from 'react-admin';

const GenreCreate = () => (
  <Create title="Thêm thể loại phim mới">
    <SimpleForm>
      <TextInput 
        source="name" 
        validate={[required()]} 
        fullWidth 
        label="Tên thể loại" 
      />
    </SimpleForm>
  </Create>
);

export default GenreCreate;