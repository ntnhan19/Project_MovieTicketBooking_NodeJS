//admin/src/components/Genres/GenreEdit.jsx
import {
  Edit,
  SimpleForm,
  TextInput,
  required,
  TopToolbar,
  ListButton,
  useEditController
} from "react-admin";
import { Card, CardContent, Typography, Box, Button, Divider } from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import SaveIcon from '@mui/icons-material/Save';

const EditActions = ({ basePath }) => (
  <TopToolbar className="flex gap-2 bg-transparent">
    <ListButton 
      basePath={basePath}
      label="Quay lại danh sách"
      icon={<ArrowLeftIcon  />}
      className="bg-white dark:bg-background-paper-dark text-secondary hover:bg-gray-100 dark:hover:bg-secondary-light rounded-lg shadow-sm px-4 py-2"
    />
  </TopToolbar>
);

const GenreTitle = ({ record }) => {
  return <span>Chỉnh sửa thể loại: {record ? `${record.name}` : ''}</span>;
};

const CustomToolbar = () => (
  <div className="flex justify-end p-4">
    <Button 
      variant="contained" 
      color="primary" 
      type="submit"
      startIcon={<SaveIcon />}
      className="bg-primary hover:bg-primary-dark text-white shadow-sm rounded-lg px-6 py-2"
    >
      Lưu thay đổi
    </Button>
  </div>
);

const GenreEdit = () => {
  const controllerProps = useEditController();
  const { record } = controllerProps;

  if (!record) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
      <div className="mb-6">
        <Typography variant="h4" className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          {record ? `Chỉnh sửa thể loại: ${record.name}` : 'Chỉnh sửa thể loại'}
        </Typography>
        <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark">
          Cập nhật thông tin của thể loại phim
        </Typography>
      </div>

      <Card className="bg-white dark:bg-background-paper-dark shadow-card rounded-xl overflow-hidden">
        <CardContent>
          <Edit 
            title={<GenreTitle />} 
            actions={<EditActions />}
            component="div"
          >
            <SimpleForm
              toolbar={<CustomToolbar />}
              className="p-4"
            >
              <Box className="mb-6">
                <Typography variant="subtitle1" className="font-medium mb-2 text-text-primary dark:text-text-primary-dark">
                  ID
                </Typography>
                <Typography variant="body1" className="text-text-secondary dark:text-text-secondary-dark">
                  {record.id}
                </Typography>
              </Box>
              
              <Divider className="my-4" />
              
              <Box className="mb-6">
                <Typography variant="subtitle1" className="font-medium mb-2 text-text-primary dark:text-text-primary-dark">
                  Tên thể loại
                </Typography>
                <TextInput
                  source="name"
                  validate={[required('Tên thể loại không được để trống')]}
                  fullWidth
                  label=""
                  placeholder="Nhập tên thể loại"
                  className="bg-white dark:bg-background-paper-dark rounded-lg"
                  helperText="Tên thể loại sẽ được hiển thị trong phần phim và tìm kiếm"
                  variant="outlined"
                />
              </Box>
            </SimpleForm>
          </Edit>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenreEdit;