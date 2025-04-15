// admin/src/components/Users/UserList.jsx
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  TextInput,
} from "react-admin";

const userFilters = [
  <TextInput label="Tên người dùng" source="name" alwaysOn />,
  <TextInput label="Email" source="email" />,
];

const UserList = (props) => (
  <List
    {...props}
    filters={userFilters}
    title="Danh sách người dùng"
    perPage={10}
  >
    <Datagrid rowClick="edit">
      <TextField source="id" label="ID" />
      <TextField source="name" label="Họ tên" />
      <EmailField source="email" label="Email" />
      <TextField source="role" label="Phân quyền" />
      <DateField source="createdAt" label="Ngày tạo" showTime />
    </Datagrid>
  </List>
);

export default UserList;
