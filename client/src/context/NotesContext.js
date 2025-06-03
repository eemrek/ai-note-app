import React, { createContext, useContext, useReducer, useCallback } from 'react';
import axios from 'axios';

// Context oluşturma
const NotesContext = createContext();

// Başlangıç durumu
const initialState = {
  notes: [],
  currentNote: null,
  loading: true,
  error: null
};

// Reducer fonksiyonu
const notesReducer = (state, action) => {
  switch (action.type) {
    case 'GET_NOTES':
      return {
        ...state,
        notes: action.payload,
        loading: false
      };
    case 'GET_NOTE':
      return {
        ...state,
        currentNote: action.payload,
        loading: false
      };
    case 'ADD_NOTE':
      return {
        ...state,
        notes: [action.payload, ...state.notes],
        loading: false
      };
    case 'UPDATE_NOTE':
      return {
        ...state,
        notes: state.notes.map(note => 
          note._id === action.payload._id ? action.payload : note
        ),
        currentNote: action.payload,
        loading: false
      };
    case 'DELETE_NOTE':
      return {
        ...state,
        notes: state.notes.filter(note => note._id !== action.payload),
        loading: false
      };
    case 'NOTES_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    case 'CLEAR_CURRENT':
      return {
        ...state,
        currentNote: null
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: true
      };
    default:
      return state;
  }
};

// Provider bileşeni
export const NotesProvider = ({ children }) => {
  const [state, dispatch] = useReducer(notesReducer, initialState);

  // Tüm notları getir
  const getNotes = useCallback(async () => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get('/api/notes');
      dispatch({
        type: 'GET_NOTES',
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: 'NOTES_ERROR',
        payload: err.response?.data?.msg || 'Notlar yüklenirken hata oluştu'
      });
    }
  }, []);

  // Belirli bir notu getir
  const getNote = useCallback(async (id) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.get(`/api/notes/${id}`);
      dispatch({
        type: 'GET_NOTE',
        payload: res.data
      });
    } catch (err) {
      dispatch({
        type: 'NOTES_ERROR',
        payload: err.response?.data?.msg || 'Not yüklenirken hata oluştu'
      });
    }
  }, []);

  // Not ekle
  const addNote = async (note) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.post('/api/notes', note);
      dispatch({
        type: 'ADD_NOTE',
        payload: res.data
      });
      return res.data;
    } catch (err) {
      dispatch({
        type: 'NOTES_ERROR',
        payload: err.response?.data?.msg || 'Not eklenirken hata oluştu'
      });
      throw err;
    }
  };

  // Not güncelle
  const updateNote = async (id, note) => {
    try {
      dispatch({ type: 'SET_LOADING' });
      const res = await axios.put(`/api/notes/${id}`, note);
      dispatch({
        type: 'UPDATE_NOTE',
        payload: res.data
      });
      return res.data;
    } catch (err) {
      dispatch({
        type: 'NOTES_ERROR',
        payload: err.response?.data?.msg || 'Not güncellenirken hata oluştu'
      });
      throw err;
    }
  };

  // Not sil
  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`);
      dispatch({
        type: 'DELETE_NOTE',
        payload: id
      });
    } catch (err) {
      dispatch({
        type: 'NOTES_ERROR',
        payload: err.response?.data?.msg || 'Not silinirken hata oluştu'
      });
    }
  };

  // AI ile not analizi
  const analyzeNoteWithAI = async (content) => {
    try {
      const res = await axios.post('/api/ai/analyze', { content });
      return res.data;
    } catch (err) {
      dispatch({
        type: 'NOTES_ERROR',
        payload: err.response?.data?.msg || 'AI analizi sırasında hata oluştu'
      });
      throw err;
    }
  };

  // Mevcut notu temizle
  const clearCurrent = useCallback(() => {
    dispatch({ type: 'CLEAR_CURRENT' });
  }, [dispatch]);

  return (
    <NotesContext.Provider
      value={{
        notes: state.notes,
        currentNote: state.currentNote,
        loading: state.loading,
        error: state.error,
        getNotes,
        getNote,
        addNote,
        updateNote,
        deleteNote,
        analyzeNoteWithAI,
        clearCurrent
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

// Custom hook
export const useNotes = () => {
  const context = useContext(NotesContext);
  if (context === undefined) {
    throw new Error('useNotes hook must be used within a NotesProvider');
  }
  return context;
};
