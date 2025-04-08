//src/components/Movies/MovieShow.jsx
import React from "react";
import {
  Show,
  SimpleShowLayout,
  TextField,
  DateField,
  NumberField,
  RichTextField,
  TopToolbar,
  EditButton,
  DeleteButton,
  useRecordContext,
} from "react-admin";
import { Box, Typography, Chip, Stack, Card, CardMedia } from "@mui/material";

const MovieShowActions = () => {
  const record = useRecordContext();
  return (
    <TopToolbar>
      <EditButton record={record} />
      <DeleteButton record={record} />
    </TopToolbar>
  );
};

const PosterSection = ({ url }) => (
  <Box display="flex" justifyContent="center" my={2}>
    <Card sx={{ width: 300, borderRadius: 2, boxShadow: 3 }}>
      <CardMedia
        component="img"
        image={url || "https://via.placeholder.com/300x400?text=No+Image"}
        alt="Poster"
      />
    </Card>
  </Box>
);

const GenresField = ({ genres }) => (
  <Stack direction="row" spacing={1} flexWrap="wrap" my={1}>
    {genres?.map((genre) => (
      <Chip
        key={genre.id}
        label={genre.name}
        color="primary"
        variant="outlined"
      />
    ))}
  </Stack>
);

const MovieShow = () => {
  const record = useRecordContext();

  return (
    <Show
      title={`Chi tiết phim: ${record?.title || ""}`}
      actions={<MovieShowActions />}
    >
      <SimpleShowLayout>
        <Typography variant="h5" gutterBottom>
          {record?.title}
        </Typography>

        {record?.poster && <PosterSection url={record.poster} />}

        <TextField source="title" label="Tên phim" />
        <DateField source="releaseDate" label="Ngày ra mắt" />
        <NumberField source="duration" label="Thời lượng (phút)" />
        <TextField source="director" label="Đạo diễn" />
        <TextField source="mainActors" label="Diễn viên chính" />

        <Box my={2}>
          <Typography variant="subtitle1">Thể loại:</Typography>
          <GenresField genres={record?.genres} />
        </Box>

        <Box mt={2}>
          <Typography variant="subtitle1">Mô tả:</Typography>
          <RichTextField source="description" />
        </Box>
      </SimpleShowLayout>
    </Show>
  );
};

export default MovieShow;
