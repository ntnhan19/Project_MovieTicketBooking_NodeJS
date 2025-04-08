// src/components/Seats/SeatList.jsx
import React from 'react';
import {
  List,
  Datagrid,
  TextField,
  ReferenceField,
  EditButton,
  DeleteButton,
  Filter,
  TextInput,
  ReferenceInput,
  SelectInput,
  ChipField
} from 'react-admin';
import { Chip } from '@mui/material';

const SeatFilter = (props) => (
  <Filter {...props}>
    <ReferenceInput source="theaterId" reference="theaters" label="Rạp">
      <SelectInput optionText="name" />
    </ReferenceInput>
    <TextInput label="Hàng" source="row" />
    <TextInput label="Số ghế" source="number" />
    <SelectInput 
      label="Loại ghế" 
      source="type" 
      choices={[
        { id: 'standard', name: 'Thường' },
        { id: 'vip', name: 'VIP' },
        { id: 'couple', name: 'Ghế đôi' },
      ]} 
    />
    <SelectInput 
      label="Trạng thái" 
      source="status" 
      choices={[
        { id: 'active', name: 'Hoạt động' },
        { id: 'maintenance', name: 'Bảo trì' },
        { id: 'inactive', name: 'Không hoạt động' },
      ]} 
    />
  </Filter>
);

const SeatList = (props) => (
  <List 
    {...props} 
    filters={<SeatFilter />}
    sort={{ field: 'theaterId', order: 'ASC' }}
    perPage={25}
    bulkActionButtons={false}
    title="Danh sách ghế"
  >
    <Datagrid rowClick="edit">
      <ReferenceField source="theaterId" reference="theaters" label="Rạp">
        <TextField source="name" />
      </ReferenceField>
      <TextField source="row" label="Hàng" />
      <TextField source="number" label="Số ghế" />
      <SeatTypeField source="type" label="Loại ghế" />
      <StatusField source="status" label="Trạng thái" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Custom field for seat type display
const SeatTypeField = ({ record = {} }) => {
  const typeMap = {
    standard: { label: 'Thường', color: 'default' },
    vip: { label: 'VIP', color: 'primary' },
    couple: { label: 'Ghế đôi', color: 'secondary' }
  };
  
  const type = record.type || 'standard';
  const config = typeMap[type] || typeMap.standard;
  
  return (
    <Chip 
      label={config.label}
      color={config.color}
      size="small"
    />
  );
};

// Custom field for status display
const StatusField = ({ record = {} }) => {
  const statusMap = {
    active: { label: 'Hoạt động', color: 'success' },
    maintenance: { label: 'Bảo trì', color: 'warning' },
    inactive: { label: 'Không hoạt động', color: 'error' }
  };
  
  const status = record.status || 'active';
  const config = statusMap[status] || statusMap.active;
  
  return (
    <Chip 
      label={config.label}
      color={config.color}
      size="small"
    />
  );
};

export default SeatList;