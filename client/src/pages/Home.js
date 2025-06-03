import React from 'react';
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
  useTheme
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

const Home = () => {
  const theme = useTheme();
  const { isAuthenticated } = useAuth();

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
    <Container maxWidth="lg">
      {/* Hero Bölümü */}
      <Box
        sx={{
          pt: 8,
          pb: 6,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Typography
          component="h1"
          variant="h2"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 600, mb: 2, letterSpacing: '-0.5px' }}
        >
          AI Destekli Not Tutma Uygulaması
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: '700px', lineHeight: 1.7 }}>
          Yapay zeka teknolojisi ile notlarınızı daha akıllı bir şekilde yönetin.
          Özetleme, kategorilendirme ve içerik önerileri ile not tutma deneyiminizi geliştirin.
        </Typography>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
        >
          {isAuthenticated ? (
            <Button
              component={RouterLink}
              to="/dashboard"
              variant="contained"
              size="large"
              sx={{ px: 4, py: 1.5, borderRadius: '24px', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
            >
              Dashboard'a Git
            </Button>
          ) : (
            <>
              <Button
                component={RouterLink}
                to="/register"
                variant="contained"
                size="large"
                sx={{ px: 4, py: 1.5, borderRadius: 2 }}
              >
                Ücretsiz Başla
              </Button>
              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                size="large"
                sx={{ px: 4, py: 1.5, borderRadius: '24px' }}
              >
                Giriş Yap
              </Button>
            </>
          )}
        </Stack>
      </Box>

      {/* Uygulama Ekran Görüntüsü */}
      <Box sx={{ my: 8 }}>
        <Paper
          elevation={4}
          sx={{
            borderRadius: '20px', // Daha yumuşak kenarlar
            overflow: 'hidden',
            maxWidth: '100%',
            mx: 'auto',
            border: `1px solid ${theme.palette.divider}`,
            boxShadow: 'none' // Varsa varsayılan gölgeyi kaldır
          }}
        >
          <Box
            sx={{
              height: 400,
              bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', // Temaya duyarlı daha yumuşak bir arka plan
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="h6" color="text.secondary">
              {/* İdeal olarak buraya uygulamanızın bir ekran görüntüsü gelmeli */}
              Uygulamanızın Şık Arayüzü Burada Sergilenecek
            </Typography>
          </Box>
        </Paper>
      </Box>

      {/* Özellikler Bölümü */}
      <Box sx={{ py: 8 }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
          sx={{ fontWeight: 600, letterSpacing: '-0.5px', mb: 8 }}
        >
          Özellikler
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px', // Daha yumuşak kenarlar
                  boxShadow: theme.shadows[1],
                  transition: 'box-shadow 0.3s ease-in-out',
                  '&:hover': {
                    boxShadow: theme.shadows[4] // Daha incelikli hover efekti
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, textAlign: 'left', p: { xs: 2, md: 3 } }}>
                  <Box sx={{ mb: 2 }}>
                    {React.cloneElement(feature.icon, { sx: { color: theme.palette.text.secondary, fontSize: '2.25rem' } })}
                  </Box>
                  <Typography gutterBottom variant="h6" component="h3" sx={{ fontWeight: 500, mb: 1 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Çağrı Bölümü */}
      <Box
        sx={{
          bgcolor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[100],
          color: theme.palette.text.primary,
          p: { xs: 4, sm: 6 },
          borderRadius: '20px',
          my: 8,
          textAlign: 'center'
        }}
      >
        <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 600, letterSpacing: '-0.5px', mb: 2 }}>
          Hemen Başlayın!
        </Typography>
        <Typography variant="h6" color="text.secondary" paragraph sx={{ mb: 4, maxWidth: '700px', mx: 'auto', lineHeight: 1.7, fontWeight: 400 }}>
          AI destekli not tutma uygulamasıyla notlarınızı daha akıllı bir şekilde yönetin.
        </Typography>
        <Button
          component={RouterLink}
          to={isAuthenticated ? '/dashboard' : '/register'}
          variant="contained"
          color="primary"
          size="large"
          sx={{ px: 5, py: 1.5, borderRadius: '24px', fontSize: '1rem', boxShadow: 'none', '&:hover': { boxShadow: 'none' } }}
        >
          {isAuthenticated ? 'Dashboard\'a Git' : 'Ücretsiz Kaydol'}
        </Button>
      </Box>
    </Container>
  );
};

export default Home;
