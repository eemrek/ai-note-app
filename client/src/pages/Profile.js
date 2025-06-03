import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Avatar,
  CircularProgress,
  Alert,
  Snackbar,
  Divider
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { Edit, Save, LockReset } from '@mui/icons-material';

const Profile = () => {
  const { user, updateUser, changePassword, loading, error, successMessage, clearMessages } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (error) {
      setSnackbar({ open: true, message: error, severity: 'error' });
      clearMessages(); 
    }
    if (successMessage) {
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
      clearMessages();
    }
  }, [error, successMessage, clearMessages]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleSubmitProfile = async (e) => {
    e.preventDefault();
    if (formData.name === user.name && formData.email === user.email) {
      setIsEditing(false);
      return;
    }
    await updateUser(formData);
    setIsEditing(false);
  };

  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setSnackbar({ open: true, message: 'Yeni şifreler eşleşmiyor!', severity: 'error' });
      return;
    }
    await changePassword(passwordData.currentPassword, passwordData.newPassword);
    setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
  };
  
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  if (!user) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profilim
      </Typography>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item>
            <Avatar sx={{ width: 80, height: 80, bgcolor: 'primary.main' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </Avatar>
          </Grid>
          <Grid item xs>
            <Typography variant="h5">{user.name}</Typography>
            <Typography variant="body1" color="textSecondary">{user.email}</Typography>
          </Grid>
          <Grid item>
            <Button 
              variant="outlined" 
              startIcon={isEditing ? <Save /> : <Edit />}
              onClick={isEditing ? handleSubmitProfile : handleEditToggle}
              disabled={loading}
            >
              {loading && isEditing ? <CircularProgress size={20} sx={{mr:1}}/> : (isEditing ? 'Kaydet' : 'Düzenle')}
            </Button>
          </Grid>
        </Grid>

        {isEditing && (
          <Box component="form" onSubmit={handleSubmitProfile} sx={{ mt: 3 }}>
            <TextField
              fullWidth
              label="Ad Soyad"
              name="name"
              value={formData.name}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              required
            />
            <TextField
              fullWidth
              label="E-posta"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              margin="normal"
              variant="outlined"
              required
              // E-posta alanı genellikle değiştirilemez veya özel bir onay gerektirir.
              // Bu örnekte düzenlenebilir bırakıyoruz.
            />
          </Box>
        )}
      </Paper>

      <Divider sx={{ my: 4 }} />

      <Typography variant="h5" component="h2" gutterBottom>
        Şifre Değiştir
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Box component="form" onSubmit={handleSubmitPassword}>
          <TextField
            fullWidth
            label="Mevcut Şifre"
            name="currentPassword"
            type="password"
            value={passwordData.currentPassword}
            onChange={handlePasswordChange}
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            label="Yeni Şifre"
            name="newPassword"
            type="password"
            value={passwordData.newPassword}
            onChange={handlePasswordChange}
            margin="normal"
            variant="outlined"
            required
          />
          <TextField
            fullWidth
            label="Yeni Şifre (Tekrar)"
            name="confirmNewPassword"
            type="password"
            value={passwordData.confirmNewPassword}
            onChange={handlePasswordChange}
            margin="normal"
            variant="outlined"
            required
          />
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            sx={{ mt: 2 }} 
            startIcon={<LockReset />}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Şifreyi Değiştir'}
          </Button>
        </Box>
      </Paper>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Profile;
