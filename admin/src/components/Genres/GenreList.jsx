//admin/src/components/Genres/GenreList.jsx
import React from 'react';
import { 
  List, 
  Datagrid, 
  TextField, 
  EditButton, 
  DeleteButton,
  TextInput,
  FilterButton,
  CreateButton,
  ExportButton,
  TopToolbar,
  ShowButton
} from 'react-admin';

const GenresFilter = [
  <TextInput source="name" label="Tìm theo tên" alwaysOn />
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

const GenreList = () => {
  return (
    <List 
      filters={GenresFilter}
      actions={<ListActions />}
      title="Danh sách thể loại phim"
    >
      <Datagrid>
        <TextField source="id" label="ID" />
        <TextField source="name" label="Tên thể loại" />
        <ShowButton />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export default GenreList;