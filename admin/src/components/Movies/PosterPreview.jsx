//src/components/Movies/PosterPreview.jsx
import React, { useState, useEffect } from "react";
import { TextInput, useRecordContext } from "react-admin";
import { Box, Typography } from "@mui/material";
import { regex, required } from "react-admin";

const imageUrlRegex = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp)$/;
export const urlValidate = regex(
  imageUrlRegex,
  "Phải là URL hợp lệ của ảnh (jpg, png, v.v.)"
);

const PosterPreview = ({ source }) => {
  const record = useRecordContext(); // cho Edit
  const [previewUrl, setPreviewUrl] = useState(record?.[source] || "");

  useEffect(() => {
    if (record?.[source]) setPreviewUrl(record[source]);
  }, [record, source]);

  const handleUrlChange = (e) => {
    const url = e.target.value;
    imageUrlRegex.test(url)
      ? setPreviewUrl(url)
      : setPreviewUrl("");
  };

  return (
    <Box>
      <TextInput
        source={source}
        label="URL Poster"
        validate={[required(), urlValidate]}
        onChange={handleUrlChange}
        fullWidth
      />
      {previewUrl && (
        <Box mt={2} textAlign="center">
          <Typography variant="subtitle1">Xem trước:</Typography>
          <img
            src={previewUrl}
            alt="Poster preview"
            style={{
              maxWidth: 300,
              maxHeight: 400,
              objectFit: "contain",
              borderRadius: 8,
            }}
          />
        </Box>
      )}
    </Box>
  );
};

export default PosterPreview;
