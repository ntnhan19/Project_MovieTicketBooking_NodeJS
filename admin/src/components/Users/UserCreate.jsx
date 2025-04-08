// src/components/Users/UserCreate.jsx
import React from 'react';
import { Create } from 'react-admin';
import { Card, CardContent } from '@mui/material';
import UserForm from './UserForm';

const UserCreate = props => (
  <Create title="Tạo người dùng mới" {...props}>
    <Card>
      <CardContent>
        <UserForm isEdit={false} />
      </CardContent>
    </Card>
  </Create>
);

export default UserCreate;