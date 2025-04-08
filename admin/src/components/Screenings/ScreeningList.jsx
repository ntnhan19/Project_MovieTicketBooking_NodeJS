// src/components/Screenings/ScreeningList.jsx
import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  DateField,
  NumberField,
  ReferenceField,
  EditButton,
  DeleteButton,
  Filter,
  TextInput,
  DateInput,
  ReferenceInput,
  SelectInput
} from 'react-admin';

const ScreeningFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput source="movieId" reference="movies" label="Phim">
      <SelectInput optionText="title" />
    </ReferenceInput>
    <ReferenceInput source="theaterId" reference="theaters" label="Rạp">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <DateInput label="Từ ngày" source="startTime_gte" />
    <DateInput label="Đến ngày" source="startTime_lte" />
    <SelectInput 
      label="Trạng thái" 
      source="status" 
      choices={[
        { id: 'active', name: 'Đang mở bán' },
        { id: 'soldout', name: 'Hết vé' },
        { id: 'cancelled', name: 'Đã hủy' },
        { id: 'completed', name: 'Đã chiếu' },
      ]} 
    />
  </Filter>
);

const ScreeningList = (props) => (
  <List 
    {...props} 
    filters={<ScreeningFilter />}
    sort={{ field: 'startTime', order: 'DESC' }}
    bulkActionButtons={false}
    title="Danh sách suất chiếu"
  >
    <Datagrid rowClick="edit">
      <ReferenceField source="movieId" reference="movies" label="Phim">
        <TextField source="title" />
      </ReferenceField>
      <ReferenceField source="theaterId" reference="theaters" label="Rạp">
        <TextField source="name" />
      </ReferenceField>
      <DateField source="startTime" label="Thời gian bắt đầu" showTime />
      <DateField source="endTime" label="Thời gian kết thúc" showTime />
      <NumberField source="price" label="Giá vé" options={{ style: 'currency', currency: 'VND' }} />
      <SelectField 
        source="status" 
        label="Trạng thái"
        choices={[
          { id: 'active', name: 'Đang mở bán' },
          { id: 'soldout', name: 'Hết vé' },
          { id: 'cancelled', name: 'Đã hủy' },
          { id: 'completed', name: 'Đã chiếu' },
        ]}
      />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// SelectField component for status display
const SelectField = ({ source, record = {}, choices }) => {
  const value = record[source];
  const choice = choices.find(choice => choice.id === value);
  return choice ? <span>{choice.name}</span> : null;
};

export default ScreeningList;