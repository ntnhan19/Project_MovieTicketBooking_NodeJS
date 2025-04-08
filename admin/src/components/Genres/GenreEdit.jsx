//admin/src/components/Genres/GenreEdit.jsx
import React from "react";
import {
  Edit, 
  SimpleForm, 
  TextInput,
  required
} from "react-admin";

const GenreTitle = ({ record }) => {
  return <span>Chỉnh sửa thể loại: {record ? `${record.name}` : ''}</span>;
};

const GenreEdit = () => (
  <Edit title={<GenreTitle />}>
    <SimpleForm>
      <TextInput 
        source="name" 
        validate={[required()]} 
        fullWidth 
        label="Tên thể loại" 
      />
    </SimpleForm>
  </Edit>
);

export default GenreEdit;