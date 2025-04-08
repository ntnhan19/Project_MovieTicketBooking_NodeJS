// src/pages/Users.jsx
import React from 'react';
import { List, Create, Edit } from 'react-admin';
import UserList from '@/components/Users/UserList';
import UserForm from '@/components/Users/UserForm';

export const UserListView = (props) => (
  <List {...props} title="Danh sách người dùng">
    <UserList {...props} />
  </List>
);

export const UserCreateView = (props) => (
  <Create {...props} title="Thêm người dùng mới">
    <UserForm {...props} />
  </Create>
);

export const UserEditView = (props) => (
  <Edit {...props} title="Chỉnh sửa thông tin người dùng">
    <UserForm {...props} />
  </Edit>
);