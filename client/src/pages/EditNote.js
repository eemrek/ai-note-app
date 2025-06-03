import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Autocomplete,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
  Container
} from '@mui/material';
import {
  Save,
  Psychology,
  AutoAwesome,
  Category,
  Mood,
  ColorLens,
  ArrowBack,
  Summarize
} from '@mui/icons-material';
import { useNotes } from '../context/NotesContext';

const EditNote = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentNote, getNote, updateNote, analyzeNoteWithAI, clearCurrent } = useNotes();
  
  // Form durumu
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    color: '#ffffff',
    isPinned: false,
    aiSummary: '' // Only summary is needed now
  });
  
  // Etiket giriş durumu
  const [tagInput, setTagInput] = useState('');
  
  // Yükleniyor durumu
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  
  // AI analiz sonuçları (mevcut nottan veya yeni analizden)
  const [aiResults, setAiResults] = useState({
    summary: '' // Only summary is needed now
  });
  
  // Hata durumu
  const [error, setError] = useState('');
  
  // Bildirim durumu
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Notu yükle
  useEffect(() => {
    getNote(id);
    return () => {
      clearCurrent(); // Sayfadan çıkarken mevcut notu temizle
    };
  }, [id, getNote, clearCurrent]);
  
  // Not yüklendiğinde formu doldur
  useEffect(() => {
    if (currentNote) {
      setFormData({
        title: currentNote.title || '',
        content: currentNote.content || '',
        tags: currentNote.tags || [],
        color: currentNote.color || '#ffffff',
        isPinned: currentNote.isPinned || false,
        aiSummary: currentNote.aiSummary || '' // Only summary
      });
      setAiResults({
        summary: currentNote.aiSummary || '' // Only summary
      });
      setPageLoading(false);
    }
  }, [currentNote]);
  
  // Form değişikliklerini izle
  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'isPinned' ? checked : value
    });
  };
  
  // Etiket ekle
  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };
  
  // Etiket sil
  const handleDeleteTag = (tagToDelete) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToDelete)
    });
  };
  
  // Enter tuşuyla etiket ekle
  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };
  
  // AI ile analiz et
  const handleAnalyzeWithAI = async () => {
    if (!formData.content) {
      setSnackbar({
        open: true,
        message: 'Analiz için içerik girmelisiniz',
        severity: 'warning'
      });
      return;
    }
    
    try {
      setAiLoading(true);
      const results = await analyzeNoteWithAI(formData.content); // results should be { summary: "..." }
      
      if (results && results.summary) {
        setAiResults({ summary: results.summary });
        setFormData(prevFormData => ({
          ...prevFormData,
          aiSummary: results.summary // Update formData to save the summary
        }));
        setSnackbar({
          open: true,
          message: 'AI özeti alındı',
          severity: 'success'
        });
      } else {
        setAiResults({ summary: 'Özet alınamadı.' }); // Clear previous or set error
        setFormData(prevFormData => ({
          ...prevFormData,
          aiSummary: '' // Clear summary if not fetched
        }));
        setSnackbar({
          open: true,
          message: results.summary || 'AI özeti alınırken bir sorun oluştu.',
          severity: 'error'
        });
      }
    } catch (err) {
      setAiResults({ summary: 'Özet alınamadı (hata).' });
       setFormData(prevFormData => ({
          ...prevFormData,
          aiSummary: '' // Clear summary on error
        }));
      setSnackbar({
        open: true,
        message: err.message || 'AI analizi sırasında bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setAiLoading(false);
    }
  };
  
  // Not güncelle
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Başlık ve içerik alanları zorunludur');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // AI özetini ekle
      const noteData = {
        ...formData,
        // aiSummary zaten formData içinde güncelleniyor (handleAnalyzeWithAI içinde)
        // Eğer handleAnalyzeWithAI çağrılmadıysa ve not ilk kez yükleniyorsa formData.aiSummary zaten dolu olacak.
        // Eğer handleAnalyzeWithAI çağrıldıysa, formData.aiSummary yeni özetle güncellenmiş olacak.
        // Bu yüzden doğrudan formData.aiSummary'yi kullanabiliriz veya daha güvenli olması için aşağıdaki gibi bırakabiliriz:
        aiSummary: aiResults.summary && aiResults.summary !== 'Özet alınamadı.' && aiResults.summary !== 'Özet alınamadı (hata).' ? aiResults.summary : formData.aiSummary
        // aiCategories ve aiSentiment kaldırıldı
      };
      
      const updatedNote = await updateNote(id, noteData);
      
      setSnackbar({
        open: true,
        message: 'Not başarıyla güncellendi',
        severity: 'success'
      });
      
      // Başarılı olduğunda not sayfasına yönlendir
      setTimeout(() => {
        navigate(`/notes/${updatedNote._id}`);
      }, 1500);
    } catch (err) {
      setError('Not güncellenirken bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };
  
  // Bildirim kapat
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Renk seçenekleri
  const colorOptions = [
    { value: '#ffffff', label: 'Beyaz' },
    { value: '#f28b82', label: 'Kırmızı' },
    { value: '#fbbc04', label: 'Turuncu' },
    { value: '#fff475', label: 'Sarı' },
    { value: '#ccff90', label: 'Yeşil' },
    { value: '#a7ffeb', label: 'Turkuaz' },
    { value: '#cbf0f8', label: 'Mavi' },
    { value: '#d7aefb', label: 'Mor' },
    { value: '#fdcfe8', label: 'Pembe' },
    { value: '#e6c9a8', label: 'Kahverengi' }
  ];
  
  if (pageLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentNote && !pageLoading) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Typography variant="h5">Not bulunamadı.</Typography>
        <Button component="a" href="/dashboard" sx={{ mt: 2 }}>
          Dashboard'a Dön
        </Button>
      </Box>
    );
  }
  
  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={() => navigate(`/notes/${id}`)} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h5" component="h1">
          Notu Düzenle
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Grid container spacing={3}>
        {/* Not düzenleme formu */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3, borderRadius: '16px' }}>
            <Box component="form" onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Başlık"
                name="title"
                value={formData.title}
                onChange={handleChange}
                margin="normal"
                required
                variant="outlined"
              />
              
              <TextField
                fullWidth
                label="İçerik"
                name="content"
                value={formData.content}
                onChange={handleChange}
                margin="normal"
                required
                multiline
                rows={12}
                variant="outlined"
                placeholder="Notunuzu buraya yazın..."
              />
              
              <Box sx={{ mt: 3, mb: 2 }}>
                <Typography variant="subtitle1" gutterBottom>
                  Etiketler
                </Typography>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs>
                    <TextField
                      fullWidth
                      label="Etiket ekle"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      variant="outlined"
                      size="small"
                      placeholder="Etiket yazıp Enter'a basın"
                    />
                  </Grid>
                  <Grid item>
                    <Button
                      variant="outlined"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim()}
                    >
                      Ekle
                    </Button>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {formData.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => handleDeleteTag(tag)}
                      variant="outlined"
                      size="small"
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              
              <Box>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPinned}
                      onChange={handleChange}
                      name="isPinned"
                      color="primary"
                    />
                  }
                  label="Sabitle"
                />
              </Box>
              
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  startIcon={<Save />}
                  disabled={loading}
                  sx={{ mr: 1 }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Güncelle'}
                </Button>
                
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={handleAnalyzeWithAI}
                  startIcon={<Psychology />}
                  disabled={aiLoading || !formData.content}
                  sx={{ ml: 1 }}
                >
                  {aiLoading ? <CircularProgress size={24} /> : 'AI ile Yeniden Analiz Et'}
                </Button>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Grid>
      
      {/* AI analiz sonuçları */}
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 3, position: 'sticky', top: 80, borderRadius: '16px' }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
            <Summarize sx={{ mr: 1 }} fontSize="small" color="textSecondary" />
            AI Analiz Sonuçları
          </Typography>
          
          {aiLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {/* Display newly analyzed summary if available and valid */}
              {aiResults.summary && aiResults.summary !== 'Özet alınamadı.' && aiResults.summary !== 'Özet alınamadı (hata).' ? (
                <Card variant="outlined" sx={{ mt: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', borderRadius: '16px' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Summarize sx={{ mr: 1 }} fontSize="small" /> AI Özeti
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {aiResults.summary}
                    </Typography>
                  </CardContent>
                </Card>
              ) : formData.aiSummary ? ( /* Display loaded/previously saved summary if no new valid analysis result */
                <Card variant="outlined" sx={{ mt: 2, backgroundColor: (theme) => theme.palette.mode === 'dark' ? 'grey.800' : 'grey.100', borderRadius: '16px' }}>
                  <CardContent>
                    <Typography variant="subtitle1" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                      <Summarize sx={{ mr: 1 }} fontSize="small" /> Kayıtlı Özet
                    </Typography>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                      {formData.aiSummary}
                    </Typography>
                     <Typography variant="caption" display="block" sx={{mt: 1, color: 'text.secondary'}}>
                      İçeriği güncellediyseniz, yeni bir özet için "AI ile Yeniden Analiz Et" butonunu kullanın.
                    </Typography>
                  </CardContent>
                </Card>
              ) : ( /* No summary available */
                <Alert severity="info" sx={{ mt: 2 }}>
                  AI özeti bulunmuyor. Not içeriğini girdikten sonra "AI ile Yeniden Analiz Et" butonuna tıklayarak özet oluşturabilirsiniz.
                </Alert>
              )}
            </>
          )}
        </Paper>
      </Grid>
    </Grid>
    </Container>
    
    {/* Bildirim */}
    {snackbar.open && (
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    )}
  </Box>
);
};

export default EditNote;
