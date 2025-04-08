// src/components/Theaters/TheaterList.jsx
import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  NumberField,
  EditButton,
  DeleteButton,
  Filter,
  TextInput,
  SelectInput
} from 'react-admin';

const TheaterFilter = (props) => (
  <Filter {...props}>
    <TextInput label="Tìm rạp" source="name" alwaysOn />
    <TextInput label="Địa chỉ" source="address" />
    <SelectInput 
      label="Trạng thái" 
      source="status" 
      choices={[
        { id: 'active', name: 'Đang hoạt động' },
        { id: 'maintenance', name: 'Bảo trì' },
        { id: 'closed', name: 'Đã đóng cửa' },
      ]} 
    />
  </Filter>
);

const TheaterList = (props) => (
  <List 
    {...props} 
    filters={<TheaterFilter />}
    sort={{ field: 'name', order: 'ASC' }}
      bulkActionButtons={false}
  >
    <Datagrid rowClick="edit">
      <TextField source="name" label="Tên rạp" />
      <TextField source="address" label="Địa chỉ" />
      <NumberField source="capacity" label="Sức chứa" />
      <SelectField 
        source="status" 
        label="Trạng thái"
        choices={[
          { id: 'active', name: 'Đang hoạt động' },
          { id: 'maintenance', name: 'Bảo trì' },
          { id: 'closed', name: 'Đã đóng cửa' },
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

export default TheaterList;
