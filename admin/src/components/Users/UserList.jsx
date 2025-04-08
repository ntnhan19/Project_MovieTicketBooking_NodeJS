import React from 'react';
import { List, Datagrid, TextField, EditButton, DeleteButton } from 'react-admin';

const UserList = (props) => {
    return (
        <List {...props} className="admin-page">
            <Datagrid rowClick="edit" className="table">
                <TextField source="id" label="ID" />
                <TextField source="username" label="Tên Người Dùng" />
                <TextField source="email" label="Email" />
                <EditButton className="button-primary" />
                <DeleteButton className="button-primary" />
            </Datagrid>
        </List>
    );
};

export default UserList;
