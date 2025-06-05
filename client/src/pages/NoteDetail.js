import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  Container, // Added Container import
  CircularProgress,
  Alert,
  IconButton,
  Divider,
  Grid,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Tooltip
} from '@mui/material';
import {
  useTheme
} from '@mui/material';
import {
  ArrowBack,
  Edit,
  Delete,
  PushPin,
  PushPinOutlined,
  Category,
  Mood,
  Summarize,
  Palette
} from '@mui/icons-material';
import { useNotes } from '../context/NotesContext';
import { useAuth } from '../context/AuthContext'; // Kullanıcı bilgilerini almak için
import { format } from 'date-fns'; // Tarih formatlamak için
import { tr } from 'date-fns/locale'; // Türkçe tarih formatı

const NoteDetail = () => {
  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNote, getNote, deleteNote, loading: notesLoading, error: notesError, clearCurrent } = useNotes();
  const { user } = useAuth(); // Mevcut kullanıcıyı al

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  useEffect(() => {
    getNote(id);
    return () => {
      clearCurrent(); // Sayfadan çıkarken mevcut notu temizle
    };
  }, [id, getNote, clearCurrent]);

  const handleDelete = async () => {
    try {
      await deleteNote(id);
      navigate('/dashboard');
    } catch (err) {
      // Hata NotesContext içinde yönetiliyor, burada ek bir şey yapmaya gerek yok
      // İsteğe bağlı olarak burada da bir snackbar gösterilebilir
    }
    setOpenDeleteDialog(false);
  };

  const handleOpenDeleteDialog = () => {
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
  };

  if (notesLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (notesError) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error">{notesError}</Alert>
        <Button component={Link} to="/dashboard" sx={{ mt: 2 }}>
          Dashboard'a Dön
        </Button>
      </Box>
    );
  }

  if (!currentNote) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Not bulunamadı.</Typography>
        <Button component={Link} to="/dashboard" sx={{ mt: 2 }}>
          Dashboard'a Dön
        </Button>
      </Box>
    );
  }
  
  // Not sahibi kontrolü (isteğe bağlı, backend zaten kontrol ediyor olmalı)
  // if (user && currentNote.user !== user._id) {
  //   return (
  //     <Box sx={{ textAlign: 'center', mt: 4 }}>
  //       <Alert severity="warning">Bu notu görüntüleme yetkiniz yok.</Alert>
  //       <Button component={Link} to="/dashboard" sx={{ mt: 2 }}>
  //         Notlarım'a Dön
  //       </Button>
  //     </Box>
  //   );
  // }

  const formattedDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr });
    } catch (error) {
      return 'Geçersiz tarih';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 1 }}>
            <ArrowBack />
          </IconButton>
          <Typography variant="h5" component="h1">
            {currentNote.title}
          </Typography>
        </Box>
        <Box>
          {currentNote.isPinned && (
            <Tooltip title="Sabitlenmiş Not">
              <PushPin color="primary" sx={{ mr: 1, verticalAlign: 'middle' }} />
            </Tooltip>
          )}
          <Tooltip title="Düzenle">
            <IconButton
              component={Link}
              to={`/notes/${currentNote._id}/edit`}
              aria-label="Notu düzenle"
              sx={{ mr: 0.5 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Sil">
            <IconButton
              color="error"
              onClick={handleOpenDeleteDialog}
              aria-label="Notu sil"
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Paper sx={{ p: 3, borderRadius: '16px', backgroundColor: theme.palette.background.paper }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', mb: 3, fontSize: '1.1rem', color: theme.palette.text.primary }}>
              {currentNote.content}
            </Typography>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                Etiketler:
              </Typography>
              {currentNote.tags && currentNote.tags.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {currentNote.tags.map((tag, index) => (
                    <Chip key={index} label={tag} size="small" variant="outlined" />
                  ))}
                </Box>
              ) : (
                <Typography variant="caption">Etiket bulunmuyor.</Typography>
              )}
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <Typography variant="caption" color={theme.palette.text.secondary}>
                Oluşturulma: {formattedDate(currentNote.createdAt)}
              </Typography>
              <Typography variant="caption" color={theme.palette.text.secondary}>
                Son Güncelleme: {formattedDate(currentNote.updatedAt)}
              </Typography>
            </Box>
          </Grid>

          {/* AI Analiz Bölümü */}
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Summarize sx={{ mr: 1 }} color="primary" /> AI Analizi
                </Typography>

                {currentNote.aiSummary && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>Özet:</Typography>
                    <Typography variant="body2">{currentNote.aiSummary}</Typography>
                  </Box>
                )}

                {currentNote.aiCategories && currentNote.aiCategories.length > 0 && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <Category fontSize="small" sx={{ mr: 0.5 }} /> Kategoriler:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                      {currentNote.aiCategories.map((category, index) => (
                        <Chip key={index} label={category} size="small" variant="outlined" color="secondary" />
                      ))}
                    </Box>
                  </Box>
                )}

                {currentNote.aiSentiment && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                      <Mood fontSize="small" sx={{ mr: 0.5 }} /> Duygu Analizi:
                    </Typography>
                    <Typography variant="body2">{currentNote.aiSentiment}</Typography>
                  </Box>
                )}

                {!currentNote.aiSummary && (!currentNote.aiCategories || currentNote.aiCategories.length === 0) && !currentNote.aiSentiment && (
                  <Alert severity="info" variant="outlined" sx={{ mt: 1 }}>
                    Bu not için AI analizi bulunmamaktadır.
                  </Alert>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Paper>
      </Container>

      {/* Silme Onay Dialogu */}
      <Dialog
        open={openDeleteDialog}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Notu Sil</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Bu notu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="primary">
            İptal
          </Button>
          <Button onClick={handleDelete} color="error" autoFocus>
            Sil
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NoteDetail;
