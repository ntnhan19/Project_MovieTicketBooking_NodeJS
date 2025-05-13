// admin/src/components/Genres/GenreShow.jsx
import {
  Show,
  TextField,
  TopToolbar,
  EditButton,
  DeleteButton,
  ReferenceManyField,
  Datagrid,
  DateField,
  useShowController,
  ListButton
} from 'react-admin';
import { Card, CardContent, Typography, Box, Divider } from '@mui/material';
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MovieIcon from '@mui/icons-material/Movie';

const GenreShowActions = ({ basePath, data }) => (
  <TopToolbar className="flex gap-2 bg-transparent">
    <ListButton 
      basePath={basePath}
      label="Quay lại"
      icon={<ArrowLeftIcon />}
      className="bg-white dark:bg-background-paper-dark text-secondary hover:bg-gray-100 dark:hover:bg-secondary-light rounded-lg shadow-sm px-4 py-2"
    />
    <EditButton 
      basePath={basePath} 
      record={data} 
      label="Chỉnh sửa"
      icon={<EditIcon />}
      className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg shadow-sm px-4 py-2"
    />
    <DeleteButton 
      basePath={basePath} 
      record={data} 
      label="Xóa"
      icon={<DeleteIcon />}
      className="bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-sm px-4 py-2"
    />
  </TopToolbar>
);

const GenreTitle = ({ record }) => {
  return <span>{record ? `Thể loại: ${record.name}` : 'Chi tiết thể loại'}</span>;
};

const GenreShow = () => {
  const controllerProps = useShowController();
  const { record } = controllerProps;

  if (!record) return null;

  return (
    <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
      <div className="mb-6">
        <Typography variant="h4" className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          {record ? `Thể loại: ${record.name}` : 'Chi tiết thể loại'}
        </Typography>
        <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark">
          Xem thông tin chi tiết và danh sách phim thuộc thể loại này
        </Typography>
      </div>

      <Show 
        title={<GenreTitle />} 
        actions={<GenreShowActions />}
        component="div"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-background-paper-dark shadow-card rounded-xl overflow-hidden col-span-1">
            <CardContent>
              <Typography variant="h6" className="font-bold mb-4 text-primary dark:text-primary-light">
                Thông tin thể loại
              </Typography>
              <Divider className="mb-4" />
              
              <Box className="mb-4">
                <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark mb-1">
                  ID
                </Typography>
                <Typography variant="body1" className="font-medium text-text-primary dark:text-text-primary-dark">
                  <TextField source="id" />
                </Typography>
              </Box>
              
              <Box className="mb-4">
                <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark mb-1">
                  Tên thể loại
                </Typography>
                <Typography variant="body1" className="font-medium text-text-primary dark:text-text-primary-dark">
                  <TextField source="name" />
                </Typography>
              </Box>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-background-paper-dark shadow-card rounded-xl overflow-hidden col-span-1 md:col-span-2">
            <CardContent>
              <div className="flex items-center mb-4">
                <MovieIcon className="text-primary mr-2" />
                <Typography variant="h6" className="font-bold text-primary dark:text-primary-light">
                  Danh sách phim thuộc thể loại này
                </Typography>
              </div>
              <Divider className="mb-4" />
              
              <Box className="overflow-x-auto">
                <ReferenceManyField
                  reference="movies"
                  target="genreId"
                  label=""
                >
                  <Datagrid
                    className="min-w-full"
                    bulkActionButtons={false}
                    sx={{
                      '& .RaDatagrid-headerCell': {
                        backgroundColor: 'rgb(249, 250, 251)',
                        fontWeight: 'bold',
                        color: '#334155',
                        padding: '16px',
                      },
                      '& .RaDatagrid-row': {
                        '&:hover': {
                          backgroundColor: 'rgba(231, 26, 15, 0.04)',
                        },
                      },
                      '& .RaDatagrid-tbody': {
                        '& tr': {
                          borderBottom: '1px solid #f0f0f0',
                        },
                      },
                    }}
                  >
                    <TextField 
                      source="title" 
                      label="Tên phim" 
                      className="text-text-primary dark:text-text-primary-dark font-medium"
                    />
                    <DateField 
                      source="releaseDate" 
                      label="Ngày phát hành" 
                      className="text-text-primary dark:text-text-primary-dark"
                      options={{ 
                        year: "numeric", 
                        month: "long", 
                        day: "numeric" 
                      }}
                    />
                    <TextField 
                      source="duration" 
                      label="Thời lượng (phút)" 
                      className="text-text-primary dark:text-text-primary-dark"
                    />
                  </Datagrid>
                </ReferenceManyField>
              </Box>
            </CardContent>
          </Card>
        </div>
      </Show>
    </div>
  );
};

export default GenreShow;