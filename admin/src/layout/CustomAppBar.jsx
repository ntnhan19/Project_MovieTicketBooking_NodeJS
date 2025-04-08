//src/layout/CustomAppBar.jsx
import React from 'react';
import { AppBar } from 'react-admin';
import { Typography } from '@mui/material';

const CustomAppBar = () => (
  <AppBar>
    <Typography variant="h6" sx={{ flex: 1 }}>
      🎬 Admin Đặt Vé Xem Phim
    </Typography>
  </AppBar>
);

export default CustomAppBar;
