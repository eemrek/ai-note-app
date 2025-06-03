import React, { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Grid,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  Tooltip,
  Fab,
  CircularProgress,
  Alert,
  Snackbar,
  useTheme,
  Container // Added Container
} from '@mui/material';
import {
  Search,
  Add,
  Delete,
  Edit,
  MoreVert,
  PushPin,
  PushPinOutlined,
  Archive,
  Unarchive,
  FilterList
} from '@mui/icons-material';
import { useNotes } from '../context/NotesContext';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const Dashboard = () => {
  const theme = useTheme();
  const {
    notes,
    loading,
    error,
    getNotes,
    deleteNote,
    updateNote
  } = useNotes();

  // Durum değişkenleri
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedNote, setSelectedNote] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success'
  });

  // Sayfa yüklendiğinde notları getir
  useEffect(() => {
    getNotes();
  }, [getNotes]);

  // Notları filtrele
  useEffect(() => {
    if (notes) {
      let filtered = [...notes];
      
      // Arama filtresi
      if (searchTerm) {
        filtered = filtered.filter(note => 
          note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }
      
      // Kategori filtresi
      switch (activeFilter) {
        case 'pinned':
          filtered = filtered.filter(note => note.isPinned && !note.isArchived);
          break;
        case 'archived':
          filtered = filtered.filter(note => note.isArchived);
          break;
        case 'all':
        default:
          filtered = filtered.filter(note => !note.isArchived);
          break;
      }
      
      // Sıralama: Önce sabitlenmiş notlar, sonra en son güncellenenler
      filtered.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
      
      setFilteredNotes(filtered);
    }
  }, [notes, searchTerm, activeFilter]);

  // Not menüsünü aç
  const handleMenuOpen = (event, note) => {
    setAnchorEl(event.currentTarget);
    setSelectedNote(note);
  };

  // Not menüsünü kapat
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedNote(null);
  };

  // Filtre menüsünü aç
  const handleFilterMenuOpen = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  // Filtre menüsünü kapat
  const handleFilterMenuClose = () => {
    setFilterAnchorEl(null);
  };

  // Filtre değiştir
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    handleFilterMenuClose();
  };

  // Not sil
  const handleDeleteNote = async () => {
    try {
      await deleteNote(selectedNote._id);
      setSnackbar({
        open: true,
        message: 'Not başarıyla silindi',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Not silinirken bir hata oluştu',
        severity: 'error'
      });
    }
    handleMenuClose();
  };

  // Not sabitle/sabitlemeyi kaldır
  const handleTogglePin = async () => {
    try {
      await updateNote(selectedNote._id, {
        isPinned: !selectedNote.isPinned
      });
      setSnackbar({
        open: true,
        message: selectedNote.isPinned 
          ? 'Not sabitlemesi kaldırıldı' 
          : 'Not sabitlendi',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'İşlem sırasında bir hata oluştu',
        severity: 'error'
      });
    }
    handleMenuClose();
  };

  // Not arşivle/arşivden çıkar
  const handleToggleArchive = async () => {
    try {
      await updateNote(selectedNote._id, {
        isArchived: !selectedNote.isArchived
      });
      setSnackbar({
        open: true,
        message: selectedNote.isArchived 
          ? 'Not arşivden çıkarıldı' 
          : 'Not arşivlendi',
        severity: 'success'
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'İşlem sırasında bir hata oluştu',
        severity: 'error'
      });
    }
    handleMenuClose();
  };

  // Snackbar kapat
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };

  // Not içeriğini kısalt
  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // Tarih formatla
  const formatDate = (dateString) => {
    return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: tr });
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 } }}>
      {/* Box was here, Container now wraps everything */}
      {/* Başlık ve Arama */}
      <Box sx={{ mb: { xs: 3, md: 5 }, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', md: 'center' }, gap: 2 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          {activeFilter === 'all' && 'Tüm Notlar'}
          {activeFilter === 'pinned' && 'Sabitlenmiş Notlar'}
          {activeFilter === 'archived' && 'Arşivlenmiş Notlar'}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            placeholder="Notlarda ara..."
            variant="outlined"
            size="small"
            fullWidth
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              )
            }}
            sx={{ maxWidth: { xs: '100%', md: 300 } }}
          />
          
          <Tooltip title="Filtrele">
            <IconButton 
              onClick={handleFilterMenuOpen}
              aria-label="filtrele"
              sx={{ color: theme.palette.text.secondary }} // Changed color to be more subtle
            >
              <FilterList />
            </IconButton>
          </Tooltip>
          
          <Menu
            anchorEl={filterAnchorEl}
            open={Boolean(filterAnchorEl)}
            onClose={handleFilterMenuClose}
          >
            <MenuItem 
              onClick={() => handleFilterChange('all')}
              selected={activeFilter === 'all'}
            >
              Tüm Notlar
            </MenuItem>
            <MenuItem 
              onClick={() => handleFilterChange('pinned')}
              selected={activeFilter === 'pinned'}
            >
              Sabitlenmiş Notlar
            </MenuItem>
            <MenuItem 
              onClick={() => handleFilterChange('archived')}
              selected={activeFilter === 'archived'}
            >
              Arşivlenmiş Notlar
            </MenuItem>
          </Menu>
        </Box>
      </Box>
      
      {/* Hata mesajı */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Yükleniyor */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Not bulunamadı mesajı */}
          {filteredNotes.length === 0 ? (
            <Box sx={{ textAlign: 'center', my: 8 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                {searchTerm 
                  ? 'Aramanızla eşleşen not bulunamadı' 
                  : activeFilter === 'archived'
                    ? 'Arşivlenmiş not bulunamadı'
                    : activeFilter === 'pinned'
                      ? 'Sabitlenmiş not bulunamadı'
                      : 'Henüz not eklenmemiş'}
              </Typography>
              {!searchTerm && activeFilter === 'all' && (
                <Button 
                  component={RouterLink} 
                  to="/notes/create" 
                  variant="contained" 
                  startIcon={<Add />}
                  sx={{ mt: 2 }}
                >
                  Yeni Not Oluştur
                </Button>
              )}
            </Box>
          ) : (
            /* Not kartları */
            <Grid container spacing={3}>
              {filteredNotes.map((note) => (
                <Grid item xs={12} sm={6} md={4} key={note._id}>
                  <Card 
                    className="note-card"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      bgcolor: theme.palette.background.paper,
                      transition: theme.transitions.create(['box-shadow', 'transform'], {
                        duration: theme.transitions.duration.short,
                      }),
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: theme.shadows[6], // Or a custom, more subtle shadow if theme.shadows[6] is too strong
                      }
                    }}
                  >
                    {/* Sabitlenmiş ikon */}
                    {note.isPinned && !note.isArchived && (
                      <PushPin 
                        color="primary" 
                        sx={{ 
                          position: 'absolute', 
                          top: 8, 
                          right: 8,
                          fontSize: '1.2rem'
                        }} 
                      />
                    )}
                    
                    <CardContent sx={{ flexGrow: 1, pt: note.isPinned ? 4 : 2 }}>
                      <Typography 
                        variant="h6" 
                        component={RouterLink} 
                        to={`/notes/${note._id}`}
                        sx={{ 
                          textDecoration: 'none', 
                          color: 'text.primary',
                          '&:hover': { textDecoration: 'underline' }
                        }}
                      >
                        {note.title}
                      </Typography>
                      
                      <Typography 
                        variant="body2" 
                        color="text.secondary" 
                        sx={{ mt: 1, mb: 2 }}
                      >
                        {truncateContent(note.content)}
                      </Typography>
                      
                      {/* Etiketler */}
                      {note.tags && note.tags.length > 0 && (
                        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {note.tags.map((tag, index) => (
                            <Chip 
                              key={index} 
                              label={tag} 
                              size="small" 
                              variant="outlined" // Make regular tags more subtle
                              sx={{ mr: 0.5, mb: 0.5 }} 
                            />
                          ))}
                        </Box>
                      )}
                      
                      {/* AI özellikleri */}
                      {note.aiCategories && note.aiCategories.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            AI Kategorileri:
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {note.aiCategories.map((category, index) => (
                              <Chip 
                                key={index} 
                                label={category} 
                                size="small" 
                                color="primary"
                                variant="outlined"
                                sx={{ mr: 0.5, mb: 0.5 }} 
                              />
                            ))}
                          </Box>
                        </Box>
                      )}
                      
                      {/* Tarih */}
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                        Son güncelleme: {formatDate(note.updatedAt)}
                      </Typography>
                    </CardContent>
                    
                    <CardActions sx={{ justifyContent: 'flex-end' }}>
                      <IconButton 
                        component={RouterLink} 
                        to={`/notes/${note._id}/edit`}
                        aria-label="düzenle"
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        aria-label="daha fazla"
                        onClick={(e) => handleMenuOpen(e, note)}
                      >
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}
      
      {/* Not menüsü */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleTogglePin}>
          {selectedNote?.isPinned ? (
            <>
              <PushPinOutlined fontSize="small" sx={{ mr: 1 }} />
              Sabitlemeyi Kaldır
            </>
          ) : (
            <>
              <PushPin fontSize="small" sx={{ mr: 1 }} />
              Sabitle
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleToggleArchive}>
          {selectedNote?.isArchived ? (
            <>
              <Unarchive fontSize="small" sx={{ mr: 1 }} />
              Arşivden Çıkar
            </>
          ) : (
            <>
              <Archive fontSize="small" sx={{ mr: 1 }} />
              Arşivle
            </>
          )}
        </MenuItem>
        <MenuItem onClick={handleDeleteNote} sx={{ color: 'error.main' }}>
          <Delete fontSize="small" sx={{ mr: 1 }} />
          Sil
        </MenuItem>
      </Menu>
      
      {/* Yeni not oluşturma butonu */}
      <Tooltip title="Yeni Not Oluştur">
        <Fab
          color="primary"
          aria-label="yeni not oluştur"
          component={RouterLink}
          to="/notes/create"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24
          }}
        >
          <Add />
        </Fab>
      </Tooltip>
      
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
    </Container>
  );
};

export default Dashboard;
