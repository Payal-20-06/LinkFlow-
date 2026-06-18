import React, { createContext, useContext, useCallback, useReducer } from 'react';

const ToastContext = createContext(null);

let toastId = 0;

const toastReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TOAST':
      return [...state, action.payload];
    case 'REMOVE_TOAST':
      return state.filter((t) => t.id !== action.payload);
    default:
      return state;
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, dispatch] = useReducer(toastReducer, []);

  const addToast = useCallback(({ message, type = 'info', duration = 4000, title }) => {
    const id = ++toastId;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type, title } });
    if (duration > 0) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', payload: id });
      }, duration);
    }
    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const toast = {
    success: (message, opts) => addToast({ message, type: 'success', ...opts }),
    error:   (message, opts) => addToast({ message, type: 'error',   ...opts }),
    warning: (message, opts) => addToast({ message, type: 'warning', ...opts }),
    info:    (message, opts) => addToast({ message, type: 'info',    ...opts }),
  };

  return (
    <ToastContext.Provider value={{ toasts, toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToastContext must be used within ToastProvider');
  return ctx;
};

export default ToastContext;
