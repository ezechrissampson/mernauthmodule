export default function FormInput({
  label,
  id,
  type = 'text',
  value,
  onChange,
  error,
  icon,
  rightElement,
  ...rest
}) {
  return (
    <div className="mb-3">
      {label && (
        <label htmlFor={id} className="form-label fw-medium">
          {label}
        </label>
      )}
      <div className="input-group">
        {icon && (
          <span className="input-group-text bg-white" style={{ borderColor: 'var(--color-border)' }}>
            <i className={`bi ${icon}`} />
          </span>
        )}
        <input
          id={id}
          type={type}
          className={`form-control ${error ? 'is-invalid' : ''}`}
          value={value}
          onChange={onChange}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          {...rest}
        />
        {rightElement}
        {error && (
          <div id={`${id}-error`} className="invalid-feedback d-block">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
