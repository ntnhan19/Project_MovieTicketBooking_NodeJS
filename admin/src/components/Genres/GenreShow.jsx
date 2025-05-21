// admin/src/components/Genres/GenreShow.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Show,
  TextField,
  ReferenceManyField,
  Datagrid,
  DateField,
  useShowController
} from 'react-admin';
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
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (record) {
      setLoading(false);
    }
  }, [record]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!record && !loading) {
    return (
      <div className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-md">
          <p className="font-medium">Không tìm thấy thể loại hoặc đã có lỗi xảy ra.</p>
        </div>
        <div className="mt-4">
          <button
            onClick={() => navigate("/genres")}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-6 lg:px-8 animate-fadeIn">
      {/* Header */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary dark:text-text-primary-dark">
            Chi tiết thể loại
          </h1>
          <p className="mt-1 text-sm text-text-secondary dark:text-text-secondary-dark">
            Mã thể loại: {record.id}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Link
            to="/genres"
            className="inline-flex items-center px-4 py-2 border border-border dark:border-border-dark rounded-md shadow-sm text-sm font-medium text-text-primary dark:text-text-primary-dark bg-white dark:bg-background-paper-dark hover:bg-gray-50 dark:hover:bg-secondary-dark/10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-text-secondary dark:text-text-secondary-dark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Quay lại danh sách
          </Link>
          <Link
            to={`/genres/${record.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
              <path fillRule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clipRule="evenodd" />
            </svg>
            Chỉnh sửa
          </Link>
        </div>
      </div>

      {/* Genre Details Card */}
      <div className="bg-white dark:bg-background-paper-dark shadow-card rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-border dark:border-border-dark">
          <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark">
            Thông tin thể loại
          </h3>
        </div>

        <div className="px-6 py-5">
          <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Mã thể loại
              </dt>
              <dd className="mt-1 text-lg font-medium text-text-primary dark:text-text-primary-dark">
                {record.id}
              </dd>
            </div>
            
            <div>
              <dt className="text-sm font-medium text-text-secondary dark:text-text-secondary-dark">
                Tên thể loại
              </dt>
              <dd className="mt-1 text-lg font-medium text-text-primary dark:text-text-primary-dark">
                {record.name}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      {/* Movies List Card */}
      <div className="mt-6 bg-white dark:bg-background-paper-dark shadow-card rounded-lg overflow-hidden">
        <div className="px-6 py-5 border-b border-border dark:border-border-dark">
          <h3 className="text-lg font-medium text-text-primary dark:text-text-primary-dark flex items-center">
            <MovieIcon className="mr-2" /> Danh sách phim thuộc thể loại này
          </h3>
        </div>

        <div className="px-6 py-5">
          <ReferenceManyField
            reference="movies"
            target="genreId"
            label=""
          >
            <Datagrid
              bulkActionButtons={false}
              sx={{
                '& .RaDatagrid-thead': {
                  borderBottom: '2px solid #eee',
                },
                '& .RaDatagrid-row': {
                  borderBottom: '1px solid #eee',
                }
              }}
            >
              <TextField source="title" label="Tên phim" />
              <DateField 
                source="releaseDate" 
                label="Ngày phát hành"
                options={{ 
                  year: "numeric", 
                  month: "long", 
                  day: "numeric" 
                }}
              />
              <TextField source="duration" label="Thời lượng (phút)" />
            </Datagrid>
          </ReferenceManyField>
        </div>
      </div>
    </div>
  );
};

export default GenreShow;