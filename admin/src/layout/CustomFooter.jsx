//src/layout/CustomFooter.jsx
import React from 'react';
import { Box, Typography } from '@mui/material';

const CustomFooter = () => (
  <Box sx={{ textAlign: 'center', p: 2, borderTop: '1px solid #eee' }}>
    <Typography variant="body2" color="text.secondary">
      © {new Date().getFullYear()} Đồ Án Nhóm 3 - React Admin
    </Typography>
  </Box>
);

export default CustomFooter;
