//admin/src/components/Genres/GenreShow.jsx
import React from 'react';
import {
  Show,
  SimpleShowLayout,
  TextField,
  TopToolbar,
  EditButton,
  DeleteButton,
  ReferenceManyField,
  Datagrid,
  DateField
} from 'react-admin';

const GenreShowActions = ({ basePath, data }) => (
  <TopToolbar>
    <EditButton basePath={basePath} record={data} />
    <DeleteButton basePath={basePath} record={data} />
  </TopToolbar>
);

const GenreTitle = ({ record }) => {
  return <span>{record ? `Thể loại: ${record.name}` : 'Chi tiết thể loại'}</span>;
};

const GenreShow = () => (
  <Show title={<GenreTitle />} actions={<GenreShowActions />}>
    <SimpleShowLayout>
      <TextField source="id" label="ID" />
      <TextField source="name" label="Tên thể loại" />
      
      <ReferenceManyField 
        reference="movies" 
        target="genreId" 
        label="Danh sách phim thuộc thể loại này"
      >
        <Datagrid>
          <TextField source="title" label="Tên phim" />
          <DateField source="releaseDate" label="Ngày phát hành" />
          <TextField source="duration" label="Thời lượng (phút)" />
        </Datagrid>
      </ReferenceManyField>
    </SimpleShowLayout>
  </Show>
);

export default GenreShow;