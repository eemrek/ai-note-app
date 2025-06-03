import React from 'react';
import { Box, Typography, Button, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)', // Adjust based on header/footer height
        textAlign: 'center',
        p: 3,
      }}
    >
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 500, width: '100%' }}>
        <ErrorOutlineIcon sx={{ fontSize: 80, color: 'primary.main', mb: 2 }} />
        <Typography variant="h3" component="h1" gutterBottom>
          404
        </Typography>
        <Typography variant="h5" component="h2" color="textSecondary" gutterBottom>
          Sayfa Bulunamadı
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </Typography>
        <Button component={Link} to="/dashboard" variant="contained" color="primary">
          Anasayfa'ya Dön
        </Button>
      </Paper>
    </Box>
  );
};

export default NotFound;
