// src/components/Users/UserForm.jsx
import React from 'react';
import {
  SimpleForm,
  TextInput,
  email,
  PasswordInput,
  BooleanInput,
  required,
  FormDataConsumer
} from 'react-admin';
import { Grid, Typography, Box, Divider } from '@mui/material';

const validateEmail = [required(), email()];

const UserForm = ({ isEdit = false }) => (
  <SimpleForm>
    {isEdit && <TextInput disabled source="id" />}
    
    <Typography variant="h6" gutterBottom>
      Thông tin tài khoản
    </Typography>
    <Divider sx={{ mb: 2 }} />
    
    <Grid container spacing={2}>
      <Grid item xs={12} md={6}>
        <TextInput 
          source="username" 
          label="Tên đăng nhập" 
          validate={required()} 
          fullWidth 
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextInput 
          source="email" 
          label="Email" 
          validate={validateEmail} 
          fullWidth 
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <PasswordInput 
          source="password" 
          label="Mật khẩu" 
          validate={isEdit ? undefined : required()} 
          fullWidth
          helperText={isEdit ? "Để trống nếu không thay đổi mật khẩu" : ""}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextInput 
          source="phone" 
          label="Số điện thoại" 
          fullWidth 
        />
      </Grid>
    </Grid>
    
    <Box mt={3}>
      <Typography variant="h6" gutterBottom>
        Quyền hạn
      </Typography>
      <Divider sx={{ mb: 2 }} />
      
      <BooleanInput 
        source="isAdmin" 
        label="Là quản trị viên" 
      />
    </Box>
    
    <FormDataConsumer>
      {({ formData, ...rest }) => formData.isAdmin && (
        <Box sx={{ mt: 2, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography variant="body2" color="textSecondary">
            Cảnh báo: Người dùng này sẽ có toàn quyền quản trị hệ thống.
          </Typography>
        </Box>
      )}
    </FormDataConsumer>
  </SimpleForm>
);

export default UserForm;