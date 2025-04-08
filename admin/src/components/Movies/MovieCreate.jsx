// src/components/Movies/MovieCreate.jsx
import React from "react";
import {
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  DateInput,
  required,
  ReferenceArrayInput,
  SelectArrayInput,
  minValue,
  maxValue,
} from "react-admin";
import { RichTextInput } from "ra-input-rich-text";
import PosterPreview from "./PosterPreview";

const MovieCreate = () => {
  const transform = (data) => ({
    ...data,
    genres: data.genres?.map((g) => (typeof g === "object" ? g.id : g)) || [],
  });

  return (
    <Create title="Thêm mới phim" transform={transform}>
      <SimpleForm>
        <TextInput source="title" label="Tên phim" validate={required()} />

        <ReferenceArrayInput
          source="genres"
          reference="genres"
          label="Thể loại"
          format={(value) =>
            Array.isArray(value) ? value.map((g) => g?.id || g) : []
          }
          parse={(value) => value?.map((id) => ({ id })) || []}
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
    </Create>
  );
};

export default MovieCreate;

