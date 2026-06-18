import React, { forwardRef, useState } from 'react';
import './Input.css';

const Input = forwardRef(({
  label,
  error,
  hint,
  icon,
  iconRight,
  type = 'text',
  placeholder,
  disabled = false,
  className = '',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || `input-${Math.random().toString(36).slice(2)}`;

  return (
    <div className={`pf-input-group ${className} ${error ? 'pf-input-group--error' : ''} ${disabled ? 'pf-input-group--disabled' : ''}`}>
      {label && (
        <label className="pf-input__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <div className="pf-input__wrapper">
        {icon && <span className="pf-input__icon pf-input__icon--left">{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          placeholder={placeholder}
          disabled={disabled}
          className={`pf-input ${icon ? 'pf-input--icon-left' : ''} ${(iconRight || isPassword) ? 'pf-input--icon-right' : ''}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            className="pf-input__icon pf-input__icon--right pf-input__eye"
            onClick={() => setShowPassword((v) => !v)}
            tabIndex={-1}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            )}
          </button>
        )}
        {!isPassword && iconRight && (
          <span className="pf-input__icon pf-input__icon--right">{iconRight}</span>
        )}
      </div>
      {error && (
        <p id={`${inputId}-error`} className="pf-input__error" role="alert">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12" stroke="white" strokeWidth="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke="white" strokeWidth="2"/></svg>
          {error}
        </p>
      )}
      {!error && hint && (
        <p id={`${inputId}-hint`} className="pf-input__hint">{hint}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
