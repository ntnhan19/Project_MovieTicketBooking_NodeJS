// src/components/Screenings/ScreeningForm.jsx
import React, { useState, useEffect } from 'react';
import {
  SimpleForm,
  ReferenceInput,
  SelectInput,
  NumberInput,
  DateTimeInput,
  required,
  minValue,
  useNotify,
  useRedirect,
  useRefresh,
  useDataProvider
} from 'react-admin';
import { Grid, Typography, Box, Button } from '@mui/material';

// Validation functions
const validateMovie = [required('Phim là bắt buộc')];
const validateTheater = [required('Rạp chiếu là bắt buộc')];
const validateStartTime = [required('Thời gian bắt đầu là bắt buộc')];
const validateEndTime = [required('Thời gian kết thúc là bắt buộc')];
const validatePrice = [required('Giá vé là bắt buộc'), minValue(0, 'Giá vé không thể âm')];

const ScreeningForm = (props) => {
  const notify = useNotify();
  const redirect = useRedirect();
  const refresh = useRefresh();
  const dataProvider = useDataProvider();
  
  const [movieDuration, setMovieDuration] = useState(0);
  const [startTime, setStartTime] = useState(null);
  
  const onSuccess = () => {
    notify('Suất chiếu đã được lưu thành công');
    redirect('/screenings');
    refresh();
  };
  
  // Calculate end time based on movie duration and start time
  const calculateEndTime = (start, duration) => {
    if (!start || !duration) return null;
    
    const endTime = new Date(start);
    endTime.setMinutes(endTime.getMinutes() + parseInt(duration));
    return endTime;
  };
  
  return (
    <SimpleForm {...props} onSuccess={onSuccess}>
      <Typography variant="h6" gutterBottom>Thông tin suất chiếu</Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <ReferenceInput 
            source="movieId" 
            reference="movies" 
            validate={validateMovie}
            onChange={(e) => {
              // Get movie information when selected
              if (e.target.value) {
                dataProvider.getOne('movies', { id: e.target.value })
                  .then(({ data }) => {
                    setMovieDuration(data.duration || 0);
                  })
                  .catch(error => {
                    console.error("Error fetching movie:", error);
                  });
              }
            }}
          >
            <SelectInput optionText="title" label="Phim" fullWidth />
          </ReferenceInput>
        </Grid>
        <Grid item xs={12} md={6}>
          <ReferenceInput source="theaterId" reference="theaters" validate={validateTheater}>
            <SelectInput optionText="name" label="Rạp chiếu" fullWidth />
          </ReferenceInput>
        </Grid>
      </Grid>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <DateTimeInput 
            source="startTime" 
            label="Thời gian bắt đầu" 
            validate={validateStartTime}
            fullWidth
            onChange={(e) => {
              setStartTime(e.target.value ? new Date(e.target.value) : null);
            }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <DateTimeInput 
            source="endTime" 
            label="Thời gian kết thúc" 
            validate={validateEndTime}
            fullWidth
            defaultValue={() => {
              return calculateEndTime(startTime, movieDuration);
            }}
          />
          {/* Button to auto-calculate end time */}
          {movieDuration > 0 && startTime && (
            <Button 
              variant="outlined" 
              size="small" 
              sx={{ mt: 1 }}
              onClick={() => {
                const calculatedEndTime = calculateEndTime(startTime, movieDuration);
                if (calculatedEndTime) {
                  props.record.endTime = calculatedEndTime.toISOString();
                  // This requires a form state refresh that might need custom implementation
                }
              }}
            >
              Tự động tính (Phim dài {movieDuration} phút)
            </Button>
          )}
        </Grid>
      </Grid>
      
      <Grid container spacing={2} sx={{ mt: 1 }}>
        <Grid item xs={12} md={6}>
          <NumberInput 
            source="price" 
            label="Giá vé (VND)" 
            validate={validatePrice}
            min={0}
            fullWidth 
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <SelectInput 
            source="status" 
            label="Trạng thái" 
            choices={[
              { id: 'active', name: 'Đang mở bán' },
              { id: 'soldout', name: 'Hết vé' },
              { id: 'cancelled', name: 'Đã hủy' },
              { id: 'completed', name: 'Đã chiếu' },
            ]} 
            fullWidth
          />
        </Grid>
      </Grid>
    </SimpleForm>
  );
};

export default ScreeningForm;