//admin/src/components/Cinemas/CinemaForm.jsx
import { TextInput } from 'react-admin';
import { Card, CardContent, Typography, Box } from '@mui/material';

const CinemaForm = () => (
  <Card sx={{ borderRadius: 4, boxShadow: 3, mt: 2 }}>
    <CardContent>
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: '#333' }}>
        Thông tin rạp chiếu phim
      </Typography>

      <Box display="flex" flexDirection="column" gap={2} mt={2}>
        <TextInput
          source="name"
          label="Tên rạp"
          fullWidth
          variant="outlined"
          helperText="Nhập tên rạp, ví dụ: CGV Nguyễn Trãi"
        />
        <TextInput
          source="address"
          label="Địa chỉ"
          fullWidth
          variant="outlined"
          helperText="Nhập địa chỉ rạp, ví dụ: 135 Nguyễn Trãi, Q.5, TP.HCM"
        />
      </Box>
    </CardContent>
  </Card>
);

export default CinemaForm;