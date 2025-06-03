import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import { useTheme } from './context/ThemeContext';
import { useAuth } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NoteDetail from './pages/NoteDetail';
import CreateNote from './pages/CreateNote';
import EditNote from './pages/EditNote';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

// Koruma bileşeni - Sadece giriş yapmış kullanıcıların erişebileceği sayfalar için
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Yükleniyor...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

// Sadece giriş yapmamış kullanıcıların erişebileceği sayfalar için
const GuestRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Yükleniyor...</div>;
  }
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  
  return children;
};

function App() {
  const { theme } = useTheme();
  const { loadUser } = useAuth();
  
  useEffect(() => {
    loadUser();
  }, [loadUser]);
  
  return (
    <Router>
      <CssBaseline />
      <div className={theme === 'dark' ? 'dark-theme' : 'light-theme'}>
        <Routes>
          {/* Genel sayfalar */}
          <Route path="/" element={<MainLayout><Home /></MainLayout>} />
          
          {/* Misafir sayfaları */}
          <Route path="/login" element={
            <GuestRoute>
              <MainLayout><Login /></MainLayout>
            </GuestRoute>
          } />
          <Route path="/register" element={
            <GuestRoute>
              <MainLayout><Register /></MainLayout>
            </GuestRoute>
          } />
          
          {/* Korumalı sayfalar */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <MainLayout><Dashboard /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/notes/create" element={
            <ProtectedRoute>
              <MainLayout><CreateNote /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/notes/:id" element={
            <ProtectedRoute>
              <MainLayout><NoteDetail /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/notes/:id/edit" element={
            <ProtectedRoute>
              <MainLayout><EditNote /></MainLayout>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <MainLayout><Profile /></MainLayout>
            </ProtectedRoute>
          } />
          
          {/* Bulunamayan Sayfa */}
          <Route path="*" element={<MainLayout><NotFound /></MainLayout>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
