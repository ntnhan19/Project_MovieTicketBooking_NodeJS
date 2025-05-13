import React from 'react';
import {
  Edit,
  SimpleForm,
  TextInput,
  ReferenceInput,
  SelectInput,
  NumberInput,
  DateInput,
  required,
  useRecordContext,
} from 'react-admin';
import { Box, Typography, Grid } from '@mui/material';

const TicketTitle = () => {
  const record = useRecordContext();
  return record ? <span>Vé #{record.id}</span> : null;
};

const statusChoices = [
  { id: 'PENDING', name: 'Chờ xử lý' },
  { id: 'CONFIRMED', name: 'Đã xác nhận' },
  { id: 'COMPLETED', name: 'Hoàn thành' },
  { id: 'CANCELLED', name: 'Đã hủy' },
];

const TicketEdit = () => {
  return (
    <Edit title={<TicketTitle />}>
      <SimpleForm>
        <Typography variant="h6" gutterBottom>
          Chỉnh sửa thông tin vé
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Box flex={1}>
              <ReferenceInput source="userId" reference="users">
                <SelectInput 
                  label="Khách hàng" 
                  validate={required()} 
                  optionText="name" 
                  fullWidth
                />
              </ReferenceInput>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box flex={1}>
              <ReferenceInput source="showtimeId" reference="showtimes">
                <SelectInput 
                  label="Suất chiếu" 
                  validate={required()} 
                  optionText={record => 
                    record ? `${record.movie?.title} (${new Date(record.startTime).toLocaleString()})` : ''
                  } 
                  fullWidth
                />
              </ReferenceInput>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box flex={1}>
              <ReferenceInput source="seatId" reference="seats">
                <SelectInput 
                  label="Ghế" 
                  validate={required()} 
                  optionText={record => record ? `${record.row}${record.column}` : ''} 
                  fullWidth
                />
              </ReferenceInput>
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box flex={1}>
              <NumberInput 
                source="price" 
                label="Giá vé"
                validate={required()}
                min={0}
                fullWidth
              />
            </Box>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Box flex={1}>
              <SelectInput
                source="status"
                label="Trạng thái"
                validate={required()}
                choices={statusChoices}
                fullWidth
              />
            </Box>
          </Grid>
        </Grid>
      </SimpleForm>
    </Edit>
  );
};

export default TicketEdit;