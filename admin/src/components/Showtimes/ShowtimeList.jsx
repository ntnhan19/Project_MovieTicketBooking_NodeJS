// src/components/Showtimes/ShowtimeList.jsx
import React from "react";
import {
  List,
  Datagrid,
  TextField,
  DateField,
  ReferenceField,
  TextInput,
  ReferenceInput,
  SelectInput,
  FilterButton,
  CreateButton,
  ExportButton,
  TopToolbar,
  EditButton,
  DeleteButton
} from "react-admin";

const ShowtimeFilters = [
  <ReferenceInput label="Phim" source="movieId" reference="movies" alwaysOn>
    <SelectInput optionText="title" />
  </ReferenceInput>,
  <ReferenceInput label="Phòng chiếu" source="hallId" reference="halls">
    <SelectInput optionText="name" />
  </ReferenceInput>,
];

const ShowtimeListActions = () => (
  <TopToolbar>
    <FilterButton />
    <CreateButton />
    <ExportButton />
  </TopToolbar>
);

const ShowtimeList = () => (
  <List
    filters={ShowtimeFilters}
    actions={<ShowtimeListActions />}
    title="Danh sách suất chiếu"
  >
    <Datagrid rowClick="show">
      <TextField source="id" />
      <ReferenceField source="movieId" reference="movies" label="Phim">
        <TextField source="title" />
      </ReferenceField>
      <ReferenceField source="hallId" reference="halls" label="Phòng chiếu">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="startTime" label="Bắt đầu" showTime />
      <DateField source="endTime" label="Kết thúc" showTime />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

export default ShowtimeList;

