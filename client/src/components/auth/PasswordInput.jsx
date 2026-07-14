import { useState } from 'react';
import { getPasswordStrength } from '../../utils/validation.js';

export default function PasswordInput({ label, id, value, onChange, error, showStrength = false, ...rest }) {
  const [visible, setVisible] = useState(false);
  const strength = showStrength ? getPasswordStrength(value) : null;

  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="form-label fw-medium">
          {label}
        </label>
      )}
      <div className="input-group">
        <span className="input-group-text bg-white" style={{ borderColor: 'var(--color-border)' }}>
          <i className="bi bi-lock" />
        </span>
        <input
          id={id}
          type={visible ? 'text' : 'password'}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          {...rest}
        />
        <button
          type="button"
          className="btn btn-outline-secondary"
          style={{ borderColor: 'var(--color-border)' }}
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} />
        </button>
        {error && <div className="invalid-feedback d-block">{error}</div>}
      </div>
      {showStrength && value && (
        <div className="mt-2">
          <div className="progress" style={{ height: '5px' }}>
            <div
              className={`progress-bar bg-${strength.variant}`}
              style={{ width: `${strength.percent}%` }}
            />
          </div>
          <small className={`text-${strength.variant}`}>{strength.label} password</small>
        </div>
      )}
    </div>
  );
}
