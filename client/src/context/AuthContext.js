import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';

// Context oluşturma
const AuthContext = createContext();

// Başlangıç durumu
const initialState = {
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  loading: true,
  user: null,
  error: null
};

// Reducer fonksiyonu
const authReducer = (state, action) => {
  switch (action.type) {
    case 'USER_LOADED':
      return {
        ...state,
        isAuthenticated: true,
        loading: false,
        user: action.payload
      };
    case 'REGISTER_SUCCESS':
    case 'LOGIN_SUCCESS':
      console.log('[authReducer] LOGIN_SUCCESS: Storing token:', action.payload.token); // Log token storage
      localStorage.setItem('token', action.payload.token);
      return {
        ...state,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        user: action.payload.user // Store user info from login/register if available
      };
    case 'AUTH_ERROR':
    case 'REGISTER_FAIL':
    case 'LOGIN_FAIL':
    case 'LOGOUT':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        loading: false,
        user: null,
        error: action.payload
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Kullanıcı bilgilerini yükle
  const loadUser = useCallback(async () => {
    let token = axios.defaults.headers.common['x-auth-token'];
    console.log('[loadUser] Initial token check from axios default header:', token);

    if (!token) { // If not in axios header, try localStorage
      token = localStorage.getItem('token');
      console.log('[loadUser] Token from localStorage (as it was not in axios header):', token);
      if (token) {
        axios.defaults.headers.common['x-auth-token'] = token;
        console.log('[loadUser] x-auth-token header now set from localStorage:', token);
      }
    }

    if (token) { // If we have a token (either from pre-set header or localStorage)
      console.log(`[loadUser] Proceeding to make API call with token: ${token}`);
      try {
        // Ensure the header is definitely set if token was sourced from localStorage in this call
        if (!axios.defaults.headers.common['x-auth-token'] && token) {
            axios.defaults.headers.common['x-auth-token'] = token;
        }
        console.log("[loadUser] Making API call to /api/auth/user. Current x-auth-token header:", axios.defaults.headers.common['x-auth-token']);
        const res = await axios.get('/api/auth/user');
        console.log("[loadUser] /api/auth/user call successful. Response data:", res.data);
        dispatch({
          type: 'USER_LOADED',
          payload: res.data
        });
      } catch (err) {
        console.error("[loadUser] /api/auth/user call failed. Status:", err.response?.status, "Message:", err.message);
        console.error("[loadUser] Failed request config headers for /api/auth/user:", err.config?.headers);
        // If auth error (e.g. token invalid), remove it from axios defaults and localStorage to prevent loops
        if (err.response?.status === 401 || err.response?.status === 403) {
            delete axios.defaults.headers.common['x-auth-token'];
            localStorage.removeItem('token');
            console.log('[loadUser] Token removed from axios headers and localStorage due to auth error on /api/auth/user.');
        }
        dispatch({
          type: 'AUTH_ERROR',
          payload: err.response?.data?.msg || 'Kullanıcı yüklenirken sunucu hatası (loadUser)'
        });
      }
    } else { // No token found anywhere
      console.log('[loadUser] No token found in axios headers or localStorage. Dispatching AUTH_ERROR.');
      delete axios.defaults.headers.common['x-auth-token']; // Ensure it's cleared if somehow missed
      dispatch({ type: 'AUTH_ERROR' });
    }
  }, [dispatch]);

  // Kullanıcı kaydı
  const register = async (formData) => {
    try {
      const res = await axios.post('/api/auth/register', formData);
      dispatch({
        type: 'REGISTER_SUCCESS',
        payload: res.data
      });
      console.log('[register] REGISTER_SUCCESS dispatch edildi, kullanıcı yükleniyor...');
      axios.defaults.headers.common['x-auth-token'] = res.data.token;
      console.log('[register] x-auth-token header set with NEW token:', res.data.token);
      loadUser();
    } catch (err) {
      dispatch({
        type: 'REGISTER_FAIL',
        payload: err.response?.data?.msg || 'Kayıt işlemi başarısız oldu'
      });
    }
  };

  // Kullanıcı girişi
  const login = async (formData) => {
    try {
      console.log("Login isteği gönderiliyor:", formData); // 1. İstek gönderilmeden önce logla
      const res = await axios.post('/api/auth/login', formData);
      console.log("Login API yanıtı alındı:", res); // 2. Yanıtı logla (status, data vb.)

      // Backend'den gelen yanıtın yapısını kontrol et
      if (res.data && res.data.token) { // Başarılı yanıtı doğrula
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: res.data
        });
        console.log("LOGIN_SUCCESS dispatch edildi, kullanıcı yükleniyor..."); // 3. Dispatch logla
        axios.defaults.headers.common['x-auth-token'] = res.data.token; 
        console.log('[login] x-auth-token header set with NEW token:', res.data.token);
        loadUser();
      } else {
        // Beklenmedik yanıt formatı
        console.error("Login API'den beklenmedik yanıt formatı:", res.data);
        dispatch({
          type: 'LOGIN_FAIL',
          payload: 'Sunucudan geçersiz yanıt formatı'
        });
      }
    } catch (err) {
      console.error("Login API hatası (catch bloğu):", err.response || err.message); // 4. Hata bloğunu logla
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err.response?.data?.msg || err.message || 'Giriş işlemi sırasında bir hata oluştu'
      });
    }
  };

  // Çıkış yap
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Hata temizleme
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider
      value={{
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        user: state.user,
        error: state.error,
        register,
        login,
        logout,
        loadUser,
        clearError
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth hook must be used within an AuthProvider');
  }
  return context;
};
