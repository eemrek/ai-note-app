
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Stack,
  Paper,
  useTheme,
  TextField,
  Snackbar,
  Alert
} from '@mui/material';
import {
  AutoAwesome,
  Psychology,
  Category,
  Sync,
  Security,
  Speed
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

import React, { useState } from 'react';

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [noteText, setNoteText] = useState("");
  const [showLoginAlert, setShowLoginAlert] = useState(false);

  const handleNoteChange = (e) => setNoteText(e.target.value);

  const handleSummarize = () => {
    if (!isAuthenticated) {
      setShowLoginAlert(true);
      return;
    }
    // Burada özetleme işlemi yapılabilir (giriş yapılmışsa)
  };

  const handleAlertClose = () => setShowLoginAlert(false);

  // Özellik kartları
  const features = [
    {
      icon: <AutoAwesome fontSize="large" color="primary" />,
      title: 'Akıllı Özetleme',
      description: 'AI teknolojisi ile notlarınızın otomatik özetlerini çıkarın ve ana noktaları hızlıca kavrayın.'
    },
    {
      icon: <Psychology fontSize="large" color="primary" />,
      title: 'İçerik Önerileri',
      description: 'Notlarınızın içeriğine göre akıllı öneriler alın ve yazma sürecinizi hızlandırın.'
    },
    {
      icon: <Category fontSize="large" color="primary" />,
      title: 'Otomatik Kategorilendirme',
      description: 'Notlarınız içeriğine göre otomatik olarak kategorilere ayrılır, böylece düzenli kalırsınız.'
    },
    {
      icon: <Sync fontSize="large" color="primary" />,
      title: 'Bulut Senkronizasyonu',
      description: 'Notlarınıza her cihazdan erişin ve değişiklikleriniz otomatik olarak senkronize edilsin.'
    },
    {
      icon: <Security fontSize="large" color="primary" />,
      title: 'Güvenli Depolama',
      description: 'Notlarınız güvenli bir şekilde saklanır ve sadece sizin erişiminize açıktır.'
    },
    {
      icon: <Speed fontSize="large" color="primary" />,
      title: 'Hızlı Performans',
      description: 'Hızlı yükleme süreleri ve sorunsuz kullanıcı deneyimi için optimize edilmiş uygulama.'
    }
  ];

  return (
    <Container maxWidth="sm" sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2, mb: 6 }}>
        {/* AI Glow Icon + Başlık */}
        <Box sx={{ mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Box
            sx={{
              mb: 1,
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #5c6bc0 0%, #42a5f5 100%)',
              boxShadow: '0 0 32px 12px #42a5f555',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'aiGlow 2.5s infinite alternate',
            }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" fill="#fff" fillOpacity="0.18" />
              <path d="M12 6v6l4 2" stroke="#5c6bc0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="12" cy="12" r="7.5" stroke="#42a5f5" strokeWidth="1.2" strokeDasharray="4 2" />
            </svg>
          </Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 800, letterSpacing: '-1px', color: 'primary.main', textShadow: '0 2px 12px #42a5f588' }}
          >
            Notunu Yaz ve Özetle!
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ color: 'text.secondary', mt: 1, mb: 2, fontWeight: 400, letterSpacing: 0.2 }}
          >
            AI destekli hızlı not özetleme. Sadece yaz, tek tıkla özetle!
          </Typography>
        </Box>

        {/* Glassmorphism Paper */}
        <Paper
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: 500,
            p: { xs: 2, sm: 4 },
            borderRadius: '24px',
            background: 'rgba(40,50,70,0.22)',
            boxShadow: '0 8px 32px 0 rgba(66,165,245,0.10)',
            border: '1.5px solid rgba(66,165,245,0.18)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mt: 2,
          }}
        >
          <TextField
            id="note-input"
            label="Notunu buraya yaz..."
            multiline
            minRows={8}
            maxRows={16}
            variant="filled"
            sx={{
              width: '100%',
              mb: 3,
              borderRadius: 2,
              background: 'rgba(255,255,255,0.09)',
              '& .MuiFilledInput-root': {
                borderRadius: 2,
                fontSize: '1.22rem',
                fontWeight: 500,
                color: 'white',
                background: 'rgba(255,255,255,0.11)',
                boxShadow: '0 1.5px 8px 0 rgba(92,107,192,0.07)',
                padding: '22px 16px',
                transition: 'box-shadow 0.3s',
                minHeight: 220,
                '&:hover, &.Mui-focused': {
                  background: 'rgba(255,255,255,0.17)',
                  boxShadow: '0 3px 16px 0 #42a5f555',
                },
              },
              '& .MuiInputLabel-root': {
                color: '#b0bec5',
                fontWeight: 400,
                fontSize: '1.08rem',
              },
            }}
            value={noteText}
            onChange={handleNoteChange}
            InputProps={{ disableUnderline: true }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSummarize}
            sx={{
              px: 6,
              py: 1.8,
              borderRadius: '32px',
              fontWeight: 700,
              fontSize: '1.1rem',
              letterSpacing: 0.5,
              boxShadow: '0 2px 16px 0 #42a5f555',
              background: 'linear-gradient(90deg, #5c6bc0 0%, #42a5f5 100%)',
              transition: 'transform 0.15s, box-shadow 0.2s',
              '&:hover': {
                background: 'linear-gradient(90deg, #42a5f5 0%, #5c6bc0 100%)',
                transform: 'scale(1.06)',
                boxShadow: '0 6px 28px 0 #42a5f5aa',
              },
            }}
          >
            <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
              <svg width="22" height="22" fill="none" style={{marginRight:2}}><path d="M12 6v6l4 2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="12" cy="12" r="9.2" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 2" opacity=".4"/></svg>
              Özetle
            </span>
          </Button>
          {/* Giriş Modalı */}
          {showLoginAlert && (
            <Box
              sx={{
                position: 'fixed',
                zIndex: 3000,
                inset: 0,
                bgcolor: 'rgba(24,28,40,0.55)',
                backdropFilter: 'blur(8px)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'auto',
                transition: 'backdrop-filter 0.3s',
              }}
            >
              <Paper elevation={10} sx={{
                px: { xs: 3, sm: 6 },
                py: { xs: 3.5, sm: 5 },
                borderRadius: '22px',
                maxWidth: 410,
                width: '100%',
                background: 'rgba(40,50,70,0.97)',
                boxShadow: '0 2px 18px 0 #42a5f522',
                backdropFilter: 'blur(3px)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                position: 'relative',
              }}>
                <Button
                  onClick={handleAlertClose}
                  sx={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    minWidth: 0,
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    color: '#b0bec5',
                    bgcolor: 'rgba(66,165,245,0.10)',
                    '&:hover': { bgcolor: 'rgba(66,165,245,0.16)' }
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M18 6L6 18" stroke="#b0bec5" strokeWidth="2.1" strokeLinecap="round"/><path d="M6 6l12 12" stroke="#b0bec5" strokeWidth="2.1" strokeLinecap="round"/></svg>
                </Button>
                <Box sx={{ mb: 2, mt: 2 }}>
                  <svg width="46" height="46" viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="26" fill="#42a5f522"/><path d="M26 16v12l8 4" stroke="#5c6bc0" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/><circle cx="26" cy="26" r="16" stroke="#42a5f5" strokeWidth="1.4" strokeDasharray="5 3"/></svg>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main', mb: 1, textAlign: 'center' }}>
                  Özetleme için giriş yapmalısınız
                </Typography>
                <Typography variant="body1" sx={{ color: '#b0bec5', mb: 3, textAlign: 'center', fontSize: '1.05rem' }}>
                  Bu özelliği kullanmak için hesabınıza giriş yapın veya yeni bir hesap oluşturun.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, width: '100%', justifyContent: 'center', mt: 1 }}>
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    color="primary"
                    sx={{
                      minWidth: 120,
                      px: 2.5,
                      py: 1.3,
                      borderRadius: '28px',
                      fontWeight: 700,
                      fontSize: '1.07rem',
                      whiteSpace: 'nowrap',
                      background: 'linear-gradient(90deg,#5c6bc0 0%,#42a5f5 100%)',
                      boxShadow: '0 2px 12px 0 #42a5f533',
                      transition: 'transform 0.15s, box-shadow 0.2s',
                      '&:hover': {
                        background: 'linear-gradient(90deg,#42a5f5 0%,#5c6bc0 100%)',
                        transform: 'scale(1.06)',
                        boxShadow: '0 6px 18px 0 #42a5f5aa'
                      }
                    }}
                  >
                    Giriş Yap
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="outlined"
                    color="primary"
                    sx={{
                      minWidth: 120,
                      px: 2.5,
                      py: 1.3,
                      borderRadius: '28px',
                      fontWeight: 700,
                      fontSize: '1.07rem',
                      color: 'primary.main',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      background: 'rgba(66,165,245,0.07)',
                      boxShadow: '0 2px 12px 0 #42a5f522',
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        background: 'rgba(66,165,245,0.15)',
                        borderColor: 'primary.dark',
                        color: 'primary.dark',
                        transform: 'scale(1.04)'
                      }
                    }}
                  >
                    Kayıt Ol
                  </Button>
                </Box>
              </Paper>
            </Box>
          )}

        </Paper>
      </Box>
      {/* AI Glow Animation Keyframes */}
      <style>
        {`
          @keyframes aiGlow {
            0% { box-shadow: 0 0 32px 12px #42a5f555; }
            100% { box-shadow: 0 0 48px 24px #5c6bc088; }
          }
        `}
      </style>
    </Container>
  );
};

export default Home;
