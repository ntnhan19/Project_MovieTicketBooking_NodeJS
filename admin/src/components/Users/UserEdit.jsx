// src/components/Users/UserEdit.jsx
import React from 'react';
import { Edit } from 'react-admin';
import { Card, CardContent } from '@mui/material';
import UserForm from './UserForm';

const UserEdit = props => (
  <Edit title="Sửa thông tin người dùng" {...props}>
    <Card>
      <CardContent>
        <UserForm isEdit={true} />
      </CardContent>
    </Card>
  </Edit>
);

export default UserEdit;