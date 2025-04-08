// src/components/Seats/SeatForm.jsx
import React from 'react';
import {
  SimpleForm,
  ReferenceInput,
  SelectInput,
  TextInput,
  required,
  useNotify,
  useRedirect,
  useRefresh
} from 'react-admin';
import { Grid, Typography, Box, Button } from '@mui/material';

// Validation functions
const validateTheater = [required('Rạp chiếu là bắt buộc')];
const validateRow = [required('Hàng ghế là bắt buộc')];
const validateNumber = [required('Số ghế là bắt buộc')];

const SeatForm = (props) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();

  const onSuccess = () => {
    notify('Thông tin ghế đã được lưu thành công');
    redirect('/seats');
    refresh();
  };

  return (
    <SimpleForm {...props} onSuccess={onSuccess}>
      <Typography variant="h6" gutterBottom>Thông tin ghế</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={12}>
          <ReferenceInput source="theaterId" reference="theaters" validate={validateTheater}>
            <SelectInput optionText="name" label="Rạp chiếu" fullWidth />
          </ReferenceInput>
        </Grid>
      </Grid>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={4}>
          <TextInput source="row" label="Hàng" validate={validateRow} fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextInput source="number" label="Số ghế" validate={validateNumber} fullWidth />
        </Grid>
        <Grid item xs={12} md={4}>
          <SelectInput 
            source="type" 
            label="Loại ghế" 
            choices={[
              { id: 'standard', name: 'Thường' },
              { id: 'vip', name: 'VIP' },
              { id: 'couple', name: 'Ghế đôi' },
            ]} 
            fullWidth
          />
        </Grid>
      </Grid>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12}>
          <SelectInput 
            source="status" 
            label="Trạng thái" 
            choices={[
              { id: 'active', name: 'Hoạt động' },
              { id: 'maintenance', name: 'Bảo trì' },
              { id: 'inactive', name: 'Không hoạt động' },
            ]} 
            fullWidth
          />
        </Grid>
      </Grid>
    </SimpleForm>
  );
};

export default SeatForm;