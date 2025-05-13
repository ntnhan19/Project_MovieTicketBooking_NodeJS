// admin/src/components/Genres/GenreList.jsx
import {
  List,
  Datagrid,
  TextField,
  EditButton,
  DeleteButton,
  TextInput,
  FilterButton,
  CreateButton,
  ExportButton,
  TopToolbar,
  ShowButton,
} from 'react-admin';
import { Card, CardContent, Typography, Box, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterIcon from '@mui/icons-material/FilterList';
import AddIcon from '@mui/icons-material/Add';
import ExportIcon from '@mui/icons-material/FileDownload';


const GenresFilter = [
  <TextInput 
    source="name" 
    label="Tìm theo tên" 
    alwaysOn 
    className="bg-white dark:bg-background-paper-dark rounded-lg border-0 shadow-sm"
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon className="text-gray-400" />
        </InputAdornment>
      ),
    }}
  />
];

const ListActions = () => (
  <TopToolbar className="flex justify-between items-center bg-transparent">
    <div className="flex gap-2">
      <FilterButton 
        className="bg-white dark:bg-background-paper-dark text-secondary hover:bg-gray-100 dark:hover:bg-secondary rounded-lg shadow-sm px-4 py-2"
        label="Lọc"
        icon={<FilterIcon />}
      />
      <CreateButton 
        className="bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm px-4 py-2"
        label="Thêm thể loại"
        icon={<AddIcon />}
      />
      <ExportButton 
        className="bg-white dark:bg-background-paper-dark text-secondary hover:bg-gray-100 dark:hover:bg-secondary rounded-lg shadow-sm px-4 py-2"
        label="Xuất dữ liệu"
        icon={<ExportIcon />}
      />
    </div>
  </TopToolbar>
);

const CustomEmptyContent = () => (
  <Box className="text-center py-10">
    <Typography variant="h6" className="text-gray-600 dark:text-gray-400 mb-4">
      Chưa có thể loại nào trong hệ thống
    </Typography>
    <CreateButton 
      className="bg-primary hover:bg-primary-dark text-white rounded-lg shadow-sm px-6 py-2"
      label="Thêm thể loại mới"
      icon={<AddIcon />}
    />
  </Box>
);

const GenreList = () => {
  return (
    <div className="bg-background-light dark:bg-background-dark p-6 rounded-lg">
      <div className="mb-6">
        <Typography variant="h4" className="text-2xl font-bold text-text-primary dark:text-text-primary-dark mb-2">
          Danh sách thể loại phim
        </Typography>
        <Typography variant="body2" className="text-text-secondary dark:text-text-secondary-dark">
          Quản lý tất cả các thể loại phim trong hệ thống
        </Typography>
      </div>

      <Card className="bg-white dark:bg-background-paper-dark shadow-card rounded-xl overflow-hidden">
        <CardContent className="p-0">
          <List
            filters={GenresFilter}
            actions={<ListActions />}
            empty={<CustomEmptyContent />}
            className="rounded-xl"
            perPage={10}
            pagination={false}
          >
            <Box className="overflow-x-auto">
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
                  source="id" 
                  label="ID" 
                  className="text-text-primary dark:text-text-primary-dark"
                />
                <TextField 
                  source="name" 
                  label="Tên thể loại" 
                  className="text-text-primary dark:text-text-primary-dark font-medium"
                />
                <ShowButton 
                  label="Xem" 
                  className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg px-3 py-1 mx-1"
                />
                <EditButton 
                  label="Sửa" 
                  className="bg-amber-500 hover:bg-amber-600 text-white rounded-lg px-3 py-1 mx-1"
                />
                <DeleteButton 
                  label="Xóa" 
                  className="bg-red-500 hover:bg-red-600 text-white rounded-lg px-3 py-1 mx-1"
                />
              </Datagrid>
            </Box>
          </List>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenreList;