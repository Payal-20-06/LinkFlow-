import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem('pf_token') || null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_ERROR':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return { ...initialState, isLoading: false, token: null };
    case 'UPDATE_USER':
      return { ...state, user: { ...state.user, ...action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Restore session from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('pf_token');
    if (token) {
      const raw = localStorage.getItem('pf_user');
      if (raw && raw !== 'undefined') {
        try {
          const user = JSON.parse(raw);
          // Sanity-check: make sure user object has expected shape
          if (user && user.id && user.email) {
            dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
          } else {
            dispatch({ type: 'LOGOUT' });
          }
        } catch {
          // JSON.parse failed — clear corrupted state
          localStorage.removeItem('pf_token');
          localStorage.removeItem('pf_user');
          dispatch({ type: 'LOGOUT' });
        }
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = async (credentials) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const data = await authService.login(credentials);
      // FIXED: Backend now returns { access_token, token_type, user }
      // Original backend returned no user object → AuthContext crashed
      localStorage.setItem('pf_token', data.access_token);
      localStorage.setItem('pf_user', JSON.stringify(data.user));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: data.user, token: data.access_token },
      });
      return { success: true };
    } catch (err) {
      // FIXED: Backend returns "detail" (FastAPI default), not "message"
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Login failed. Please try again.';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_LOADING' });
    try {
      const data = await authService.register(userData);
      // FIXED: Backend now returns access_token on register so user is
      // immediately logged in. Original returned no token → user had to
      // manually log in after registering.
      localStorage.setItem('pf_token', data.access_token);
      localStorage.setItem('pf_user', JSON.stringify(data.user));
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: data.user, token: data.access_token },
      });
      return { success: true };
    } catch (err) {
      // FIXED: Read from err.response?.data?.detail (FastAPI error format)
      const msg =
        err.response?.data?.detail ||
        err.response?.data?.message ||
        'Registration failed. Please try again.';
      dispatch({ type: 'AUTH_ERROR', payload: msg });
      return { success: false, error: msg };
    }
  };

  const logout = () => {
    localStorage.removeItem('pf_token');
    localStorage.removeItem('pf_user');
    // Fire-and-forget — we don't block logout on the API call
    authService.logout().catch(() => {});
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    const updated = { ...state.user, ...userData };
    localStorage.setItem('pf_user', JSON.stringify(updated));
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
