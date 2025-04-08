// src/components/Promotions/PromotionList.jsx
import React from 'react';
import { 
    List, 
    Datagrid, 
    TextField, 
    EditButton, 
    DeleteButton 
} from 'react-admin';

const PromotionList = (props) => {
    return (
        <List {...props} className="admin-page">
            <Datagrid rowClick="edit" className="table">
                <TextField source="id" label="ID" />
                <TextField source="name" label="Tên Khuyến Mãi" />
                <TextField source="discount" label="Giảm Giá (%)" />
                <EditButton className="button-primary" />
                <DeleteButton className="button-primary" />
            </Datagrid>
        </List>
    );
};

export default PromotionList;
