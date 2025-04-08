//src/components/Movies/MovieEdit.jsx
import React from "react";
import {
  Edit,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  required,
  ReferenceArrayInput,
  SelectArrayInput,
  useRecordContext,
  minValue,
  maxValue,
} from "react-admin";
import { RichTextInput } from "ra-input-rich-text";
import PosterPreview from "./PosterPreview";

const MovieTitle = () => {
  const record = useRecordContext();
  return <span>Chỉnh sửa phim: {record?.title}</span>;
};

const MovieEdit = () => {
  return (
    <Edit title={<MovieTitle />}>
      <SimpleForm>
        <TextInput source="title" label="Tên phim" validate={required()} />

        <ReferenceArrayInput
          source="genres"
          reference="genres"
          label="Thể loại"
        >
          <SelectArrayInput optionText="name" />
        </ReferenceArrayInput>

        <DateInput source="releaseDate" label="Ngày ra mắt" validate={required()} />
        <RichTextInput source="description" label="Mô tả" validate={required()} />
        <PosterPreview source="poster" />
        <NumberInput source="duration" label="Thời lượng (phút)" validate={[required(), minValue(1), maxValue(500)]} />
        <TextInput source="director" label="Đạo diễn" validate={required()} />
        <TextInput source="mainActors" label="Diễn viên chính" />
      </SimpleForm>
    </Edit>
  );
};

export default MovieEdit;
