// admin/src/pages/Users.jsx
import {
  List,
  Datagrid,
  TextField,
  EmailField,
  DateField,
  Show,
  SimpleShowLayout,
  Edit,
  SimpleForm,
  TextInput,
  Create,
  SelectInput,
} from "react-admin";

const roleChoices = [
  { id: "ADMIN", name: "Quản trị viên" },
  { id: "USER", name: "Khách hàng" },
];

export const UserList = () => (
  <List>
    <Datagrid rowClick="show">
      <TextField source="id" />
      <TextField source="name" label="Tên người dùng" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Số điện thoại" />
      <TextField source="role" label="Vai trò" />
      <DateField source="createdAt" label="Ngày tạo" />
    </Datagrid>
  </List>
);

export const UserShow = () => (
  <Show>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Tên người dùng" />
      <EmailField source="email" label="Email" />
      <TextField source="phone" label="Số điện thoại" />
      <TextField source="role" label="Vai trò" />
      <DateField source="createdAt" label="Ngày tạo" />
      <DateField source="updatedAt" label="Ngày cập nhật" />
    </SimpleShowLayout>
  </Show>
);

export const UserEdit = () => (
  <Edit>
    <SimpleForm>
      <TextInput source="name" label="Tên người dùng" />
      <TextInput source="email" label="Email" />
      <TextInput source="phone" label="Số điện thoại" />
      <TextInput source="password" type="password" label="Mật khẩu" />
      <SelectInput source="role" choices={roleChoices} label="Vai trò" />
    </SimpleForm>
  </Edit>
);

export const UserCreate = () => (
  <Create>
    <SimpleForm>
      <TextInput source="name" label="Tên người dùng" />
      <TextInput source="email" label="Email" />
      <TextInput source="phone" label="Số điện thoại" />
      <TextInput source="password" type="password" label="Mật khẩu" />
      <SelectInput source="role" choices={roleChoices} label="Vai trò" />
    </SimpleForm>
  </Create>
);
