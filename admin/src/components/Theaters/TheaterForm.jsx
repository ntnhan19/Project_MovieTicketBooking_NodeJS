import React from 'react';
import {
  SimpleForm,
  TextInput,
  NumberInput,
  SelectInput,
  required,
  minValue,
  useNotify,
  useRedirect,
  useRefresh,
  ReferenceArrayInput,
  AutocompleteArrayInput
} from 'react-admin';
import { Grid, Typography, Box } from '@mui/material';

// Validation functions
const validateTheaterName = [required('Tên rạp là bắt buộc')];
const validateAddress = [required('Địa chỉ là bắt buộc')];
const validateCapacity = [required('Sức chứa là bắt buộc'), minValue(1, 'Sức chứa phải lớn hơn 0')];

const TheaterForm = (props) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();

  const onSuccess = () => {
    notify('Rạp chiếu đã được lưu thành công');
    redirect('/theaters');
    refresh();
  };

  return (
    <SimpleForm {...props} onSuccess={onSuccess}>
      <Typography variant="h6" gutterBottom>Thông tin rạp chiếu</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <TextInput source="name" label="Tên rạp" validate={validateTheaterName} fullWidth />
        </Grid>
        <Grid item xs={12} md={6}>
          <NumberInput 
            source="capacity" 
            label="Sức chứa (ghế)" 
            validate={validateCapacity}
            min={1}
            fullWidth 
          />
        </Grid>
      </Grid>
      
      <Box mt={2}>
        <TextInput source="address" label="Địa chỉ" validate={validateAddress} fullWidth multiline />
      </Box>
      
      <Box mt={2}>
        <SelectInput 
          source="status" 
          label="Trạng thái" 
          choices={[
            { id: 'active', name: 'Đang hoạt động' },
            { id: 'maintenance', name: 'Bảo trì' },
            { id: 'closed', name: 'Đã đóng cửa' },
          ]} 
          fullWidth
        />
      </Box>
    </SimpleForm>
  );
};

export default TheaterForm;