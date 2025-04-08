// admin/src/assets/components/Movies/MovieList.jsx
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  EditButton,
  DeleteButton,
  ImageField,
  TextInput,
  DateInput,
  FilterButton,
  CreateButton,
  ExportButton,
  TopToolbar,
  ReferenceInput,
  SelectInput,
  NumberField,
  ArrayField,
  SingleFieldList,
  ChipField
} from "react-admin";

const MoviesFilter = [
  <TextInput source="title" label="Tìm theo tên" alwaysOn />,
  <ReferenceInput source="genreId" label="Thể loại" reference="genres">
    <SelectInput optionText="name" />
  </ReferenceInput>,
  <DateInput source="releaseDate" label="Ngày ra mắt" />,
  <TextInput source="director" label="Đạo diễn" />,
];

const ListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

const MovieList = () => {
  return (
    <List
      filters={MoviesFilter}
      actions={<ListActions />}
      title="Danh sách phim"
    >
      <Datagrid rowClick="show">
        <TextField source="title" label="Tên phim" />
        <DateField source="releaseDate" label="Ngày ra mắt" />
        <ImageField source="poster" label="Poster" />
        <ArrayField source="genres" label="Thể loại">
          <SingleFieldList>
            <ChipField source="name" />
          </SingleFieldList>
        </ArrayField>
        <NumberField source="duration" label="Thời lượng (phút)" />
        <TextField source="director" label="Đạo diễn" />
        <EditButton />
        <DeleteButton />
      </Datagrid>
    </List>
  );
};

export default MovieList;
