// src/components/Users/UserShow.jsx
import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  EmailField,
  DateField,
  BooleanField,
  TopToolbar,
  EditButton,
  DeleteButton
} from 'react-admin';
import { Grid, Typography, Box, Card, CardContent, Divider, Avatar } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// User show actions
const UserShowActions = ({ basePath, data, resource }) => (
  <TopToolbar>
    <EditButton basePath={basePath} record={data} />
    <DeleteButton basePath={basePath} record={data} />
  </TopToolbar>
);

const UserShow = (props) => (
  <Show {...props} actions={<UserShowActions />}>
    <SimpleShowLayout>
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mb: 3 }}>
        <Card elevation={3}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={2}>
              <Avatar sx={{ width: 80, height: 80, mr: 3, bgcolor: 'primary.main' }}>
                <AccountCircleIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h5" component="div">
                  <TextField source="username" component="span" />
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  ID: <TextField source="id" component="span" />
                </Typography>
              </Box>
            </Box>
            
            <Divider sx={{ mb: 3 }} />
            
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Email
                </Typography>
                <EmailField source="email" component="span" />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Số điện thoại
                </Typography>
                <TextField source="phone" component="span" />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Ngày tạo
                </Typography>
                <DateField source="createdAt" showTime component="span" />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle1" color="textSecondary">
                  Vai trò
                </Typography>
                <BooleanField 
                  source="isAdmin" 
                  label="Quản trị viên"
                  valueLabelTrue="Quản trị viên"
                  valueLabelFalse="Khách hàng" 
                  component="span"
                />
              </Grid>
              
              <Grid item xs={12}>
                <Divider />
              </Grid>
              
              <Grid item xs={12}>
                <Typography variant="subtitle1" color="textSecondary">
                  Lịch sử hoạt động
                </Typography>
                <Box mt={1} p={2} bgcolor="#f8f8f8" borderRadius={1}>
                  <Typography variant="body2" color="textSecondary">
                    Chức năng đang phát triển
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>
    </SimpleShowLayout>
  </Show>
);

export default UserShow;