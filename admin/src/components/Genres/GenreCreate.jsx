//admin/src/components/Genres/GenreCreate.jsx
import {
  Create,
  SimpleForm,
  TextInput,
  required,
  ListButton,
  TopToolbar
} from 'react-admin';
import { Card, CardContent, Typography, Box, Button, Divider } from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import AddIcon from '@mui/icons-material/Add';

const CreateActions = ({ basePath }) => (
  <TopToolbar className="flex gap-2 bg-transparent">
    <ListButton 
      basePath={basePath}
      label="Quay lại danh sách"
      icon={<ArrowLeftIcon />}
      className="bg-white dark:bg-background-paper-dark text-secondary hover:bg-gray-100 dark:hover:bg-secondary-light rounded-lg shadow-sm px-4 py-2"
    />
  </TopToolbar>
);

const CustomToolbar = () => (
  <div className="flex justify-end p-4">
    <Button 
      variant="contained" 
      color="primary" 
      type="submit"
      startIcon={<AddIcon />}
      className="bg-primary hover:bg-primary-dark text-white shadow-sm rounded-lg px-6 py-2"
    >
      Tạo thể loại
    </Button>
  </div>
);

const GenreCreate = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
      <div className="mb-6">
        <Typography variant="h4" className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Thêm thể loại phim mới
        </Typography>
        <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark">
          Tạo thể loại phim mới cho hệ thống rạp chiếu phim
        </Typography>
      </div>

      <Card className="bg-white dark:bg-background-paper-dark shadow-card rounded-xl overflow-hidden">
        <CardContent>
          <Create 
            title="" 
            actions={<CreateActions />}
            component="div"
            redirect="list"
          >
            <SimpleForm
              toolbar={<CustomToolbar />}
              className="p-4"
            >
              <Box className="mb-6">
                <Typography variant="subtitle1" className="font-medium mb-4 text-text-primary dark:text-text-primary-dark">
                  Thông tin thể loại
                </Typography>
                <Divider className="mb-4" />
                
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
          </Create>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenreCreate;