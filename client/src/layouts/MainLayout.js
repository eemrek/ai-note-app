import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Box,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  Container,
  Avatar,
  Button,
  Tooltip,
  MenuItem,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery
} from '@mui/material';
import {
  Menu as MenuIcon,
  LightMode,
  DarkMode,
  Dashboard as DashboardIcon, // Renamed for clarity
  NoteAdd,
  Person,
  Logout,
  Login,
  PersonAdd,
  Home
} from '@mui/icons-material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const MainLayout = ({ children }) => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const muiTheme = useMuiTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [anchorElUser, setAnchorElUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    handleCloseUserMenu();
  };

  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" component="div">
          AI Notlarım
        </Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button component={RouterLink} to="/">
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary="Ana Sayfa" />
        </ListItem>
        
        {isAuthenticated ? (
          <>
            <ListItem button component={RouterLink} to="/dashboard">
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Notlarım" />
            </ListItem>
            <ListItem button component={RouterLink} to="/notes/create">
              <ListItemIcon>
                <NoteAdd />
              </ListItemIcon>
              <ListItemText primary="Not Oluştur" />
            </ListItem>
            <ListItem button component={RouterLink} to="/profile">
              <ListItemIcon>
                <Person />
              </ListItemIcon>
              <ListItemText primary="Profil" />
            </ListItem>
            <ListItem button onClick={handleLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Çıkış Yap" />
            </ListItem>
          </>
        ) : (
          <>
            <ListItem button component={RouterLink} to="/login">
              <ListItemIcon>
                <Login />
              </ListItemIcon>
              <ListItemText primary="Giriş Yap" />
            </ListItem>
            <ListItem button component={RouterLink} to="/register">
              <ListItemIcon>
                <PersonAdd />
              </ListItemIcon>
              <ListItemText primary="Kayıt Ol" />
            </ListItem>
          </>
        )}
      </List>
      <Divider />
      <List>
        <ListItem button onClick={toggleTheme}>
          <ListItemIcon>
            {theme === 'light' ? <DarkMode /> : <LightMode />}
          </ListItemIcon>
          <ListItemText primary={theme === 'light' ? 'Karanlık Mod' : 'Aydınlık Mod'} />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="sticky">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
            
            <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: { xs: 'flex', flexGrow: { xs: 1, md: 0 } }, // Adjusted for mobile logo centering
                fontFamily: 'monospace',
                fontWeight: 700,
                letterSpacing: '.2rem',
                color: 'inherit',
                textDecoration: 'none',
              }}
            >
              AI NOT
            </Typography>
            
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {isAuthenticated && (
                <>
                  <Button
                    component={RouterLink}
                    to="/dashboard"
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
Notlarım
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/notes/create"
                    sx={{ my: 2, color: 'white', display: 'block' }}
                  >
                    Not Oluştur
                  </Button>
                </>
              )}
            </Box>

            <Box sx={{ flexGrow: 0, display: 'flex', alignItems: 'center' }}>
              <Tooltip title={theme === 'light' ? "Karanlık Mod" : "Aydınlık Mod"}>
                <IconButton onClick={toggleTheme} color="inherit" sx={{ mr: 1 }}>
                  {theme === 'light' ? <DarkMode /> : <LightMode />}
                </IconButton>
              </Tooltip>

              {isAuthenticated ? (
                <Tooltip title="Ayarlar">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.name || 'User'} src={user?.avatarUrl}>
                      {/* Fallback for Avatar if no src and name exists */}
                      {!user?.avatarUrl && user?.name ? user.name.charAt(0).toUpperCase() : null}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              ) : (
                <Box sx={{ display: 'flex' }}> {/* Wrapper for login/register buttons */}
                  <Button component={RouterLink} to="/login" color="inherit" sx={{ mr: 1 }}>
                    Giriş Yap
                  </Button>
                  <Button 
                    component={RouterLink} 
                    to="/register" 
                    variant="outlined" 
                    color="inherit"
                    sx={{ 
                      borderColor: 'rgba(255, 255, 255, 0.5)', // Softer border for dark theme
                      '&:hover': { borderColor: 'white'} 
                    }}
                  >
                    Kayıt Ol
                  </Button>
                </Box>
              )}
              <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {isAuthenticated && [
                  <MenuItem key="profile" component={RouterLink} to="/profile" onClick={handleCloseUserMenu}>
                    <ListItemIcon><Person fontSize="small" /></ListItemIcon>
                    <ListItemText>Profil</ListItemText>
                  </MenuItem>,
                  <Divider key="divider" />,
                  <MenuItem key="logout" onClick={handleLogout}>
                    <ListItemIcon><Logout fontSize="small" /></ListItemIcon>
                    <ListItemText>Çıkış Yap</ListItemText>
                  </MenuItem>
                ]}
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>

      {/* Main content area */}
      <Container 
        component="main" 
        maxWidth="xl" // Use xl to match AppBar's container for consistency
        sx={{ 
          py: { xs: 2, md: 3 }, // Standard padding
          px: { xs: 2, md: 3 },  // Standard padding
          flexGrow: 1 // Added to make content area expand
        }}
      >
        {children}
      </Container>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: 2, 
          px: 2,
          mt: 'auto', 
          backgroundColor: (muiTheme.palette.mode === 'light'
              ? muiTheme.palette.grey[200]
              : muiTheme.palette.grey[800]),
          textAlign: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Typography variant="body2" color="text.secondary">
            © {new Date().getFullYear()} AI Not Uygulaması. Tüm hakları saklıdır.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default MainLayout;