import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';

// Context oluşturma
const ThemeContext = createContext();

// Provider bileşeni
export const ThemeProvider = ({ children }) => {
  // Kullanıcının tercihini localStorage'dan al veya varsayılan olarak 'light' kullan
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme || 'light';
  });

  // Tema değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Tema değiştirme fonksiyonu
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  // Material UI tema ayarları
  const lightTheme = createTheme({
    palette: {
      mode: 'light',
      primary: {
        main: '#007AFF', // Modern Apple-like blue
      },
      secondary: {
        main: '#FF9500', // Apple-like orange
      },
      background: {
        default: '#FFFFFF',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#1D1D1F',
        secondary: '#6E6E73',
      },
    },
    shape: {
      borderRadius: 12, // Global border radius
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true, // Removes default box-shadow for contained buttons
        },
        styleOverrides: {
          root: {
            textTransform: 'none', // More modern, less shouty buttons
            // borderRadius will be inherited from theme.shape.borderRadius
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: '#0070E0', // Slightly darker on hover for primary
            }
          },
          containedSecondary: {
            '&:hover': {
              backgroundColor: '#F28C00', // Slightly darker on hover for secondary
            }
          }
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            // borderRadius will be inherited from theme.shape.borderRadius
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)', // Softer shadow
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none', // Flat app bar
            borderBottom: '1px solid',
            borderColor: 'divider',
          }
        }
      },
    },
  });

  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#0A84FF', // Brighter Apple-like blue for dark mode
      },
      secondary: {
        main: '#FF9F0A', // Brighter Apple-like orange for dark mode
      },
      background: {
        default: '#000000',
        paper: '#1D1D1F',
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#8E8E93',
      },
    },
    shape: {
      borderRadius: 12, // Global border radius
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    },
    components: {
      MuiButton: {
        defaultProps: {
          disableElevation: true, // Removes default box-shadow for contained buttons
        },
        styleOverrides: {
          root: {
            textTransform: 'none', // More modern, less shouty buttons
            // borderRadius will be inherited from theme.shape.borderRadius
          },
          containedPrimary: {
            '&:hover': {
              backgroundColor: '#0070E0', // Slightly darker on hover for primary (dark theme variant)
            }
          },
          containedSecondary: {
            '&:hover': {
              backgroundColor: '#F28C00', // Slightly darker on hover for secondary (dark theme variant)
            }
          }
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            // borderRadius will be inherited from theme.shape.borderRadius
            boxShadow: '0 1px 4px rgba(255,255,255,0.05)', // Softer, lighter shadow for dark mode
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none', // Flat app bar
            borderBottom: '1px solid',
            borderColor: 'divider',
          }
        }
      },
    },
  });

  // Mevcut temaya göre Material UI temasını seç
  const muiTheme = theme === 'light' ? lightTheme : darkTheme;

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <MuiThemeProvider theme={muiTheme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme hook must be used within a ThemeProvider');
  }
  return context;
};
