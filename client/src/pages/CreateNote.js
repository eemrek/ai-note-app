import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  FormControlLabel
} from '@mui/material';
import {
  Save,
  Psychology,
  AutoAwesome,
  Category,
  Mood,
  ColorLens
} from '@mui/icons-material';
import { useNotes } from '../context/NotesContext';

const CreateNote = () => {
  const navigate = useNavigate();
  const { addNote, analyzeNoteWithAI } = useNotes();
  
  // Form durumu
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [],
    color: '#ffffff',
    isPinned: false
  });
  
  // Etiket giriş durumu
  const [tagInput, setTagInput] = useState('');
  
  // Yükleniyor durumu
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  
  // AI analiz sonuçları
  const [aiResults, setAiResults] = useState({
    summary: '',
    categories: [],
    sentiment: '',
    suggestions: []
  });
  
  // Hata durumu
  const [error, setError] = useState('');
  
  // Bildirim durumu
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });
  
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
      const results = await analyzeNoteWithAI(formData.content);
      setAiResults(results);
      
      // Önerilen etiketleri ekle
      if (results.categories && results.categories.length > 0) {
        const newTags = [...formData.tags];
        results.categories.forEach(category => {
          if (!newTags.includes(category)) {
            newTags.push(category);
          }
        });
        setFormData({
          ...formData,
          tags: newTags
        });
      }
      
      setSnackbar({
        open: true,
        message: 'AI analizi tamamlandı',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'AI analizi sırasında bir hata oluştu',
        severity: 'error'
      });
    } finally {
      setAiLoading(false);
    }
  };
  
  // Not kaydet
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Başlık ve içerik alanları zorunludur');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // AI sonuçlarını ekle
      const noteData = {
        ...formData,
        aiSummary: aiResults.summary || '',
        aiCategories: aiResults.categories || [],
        aiSentiment: aiResults.sentiment || ''
      };
      
      const savedNote = await addNote(noteData);
      
      setSnackbar({
        open: true,
        message: 'Not başarıyla kaydedildi',
        severity: 'success'
      });
      
      // Başarılı olduğunda not sayfasına yönlendir
      setTimeout(() => {
        navigate(`/notes/${savedNote._id}`);
      }, 1500);
    } catch (err) {
      setError('Not kaydedilirken bir hata oluştu');
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
  
  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Yeni Not Oluştur
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Not oluşturma formu */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
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
                      sx={{ m: 0.5 }}
                    />
                  ))}
                </Box>
              </Box>
              
              <Divider sx={{ my: 3 }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <Box>
                  <Autocomplete
                    options={colorOptions}
                    getOptionLabel={(option) => option.label}
                    value={colorOptions.find(option => option.value === formData.color) || colorOptions[0]}
                    onChange={(_, newValue) => {
                      setFormData({
                        ...formData,
                        color: newValue ? newValue.value : '#ffffff'
                      });
                    }}
                    sx={{ width: 200 }}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Not rengi"
                        variant="outlined"
                        size="small"
                        InputProps={{
                          ...params.InputProps,
                          startAdornment: (
                            <Box
                              sx={{
                                width: 24,
                                height: 24,
                                borderRadius: '50%',
                                bgcolor: formData.color,
                                border: '1px solid #ddd',
                                mr: 1
                              }}
                            />
                          )
                        }}
                      />
                    )}
                  />
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
                    {loading ? <CircularProgress size={24} /> : 'Kaydet'}
                  </Button>
                  
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={handleAnalyzeWithAI}
                    startIcon={<Psychology />}
                    disabled={aiLoading || !formData.content}
                    sx={{ ml: 1 }}
                  >
                    {aiLoading ? <CircularProgress size={24} /> : 'AI ile Analiz Et'}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Grid>
        
        {/* AI analiz sonuçları */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <AutoAwesome sx={{ mr: 1 }} color="primary" />
              AI Analiz Sonuçları
            </Typography>
            
            {aiLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {!aiResults.summary && !aiResults.categories.length ? (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    Henüz AI analizi yapılmadı. İçeriğinizi yazdıktan sonra "AI ile Analiz Et" butonuna tıklayın.
                  </Alert>
                ) : (
                  <Box sx={{ mt: 2 }}>
                    {/* Özet */}
                    {aiResults.summary && (
                      <Card sx={{ mb: 3 }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <AutoAwesome fontSize="small" sx={{ mr: 1 }} color="primary" />
                            Özet
                          </Typography>
                          <Typography variant="body2">
                            {aiResults.summary}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Kategoriler */}
                    {aiResults.categories && aiResults.categories.length > 0 && (
                      <Card sx={{ mb: 3 }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Category fontSize="small" sx={{ mr: 1 }} color="primary" />
                            Önerilen Kategoriler
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {aiResults.categories.map((category, index) => (
                              <Chip
                                key={index}
                                label={category}
                                color="primary"
                                variant="outlined"
                                size="small"
                                sx={{ m: 0.5 }}
                              />
                            ))}
                          </Box>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* Duygu Analizi */}
                    {aiResults.sentiment && (
                      <Card sx={{ mb: 3 }}>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Mood fontSize="small" sx={{ mr: 1 }} color="primary" />
                            Duygu Analizi
                          </Typography>
                          <Typography variant="body2">
                            {aiResults.sentiment}
                          </Typography>
                        </CardContent>
                      </Card>
                    )}
                    
                    {/* İçerik Önerileri */}
                    {aiResults.suggestions && aiResults.suggestions.length > 0 && (
                      <Card>
                        <CardContent>
                          <Typography variant="subtitle1" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <Psychology fontSize="small" sx={{ mr: 1 }} color="primary" />
                            İçerik Önerileri
                          </Typography>
                          <ul style={{ paddingLeft: '20px', margin: '8px 0' }}>
                            {aiResults.suggestions.map((suggestion, index) => (
                              <li key={index}>
                                <Typography variant="body2">
                                  {suggestion}
                                </Typography>
                              </li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    )}
                  </Box>
                )}
              </>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Bildirim */}
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
    </Box>
  );
};

export default CreateNote;
