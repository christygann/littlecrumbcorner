// Design-system primitives (Button, Tag, Price, SectionHeader) plus the small
// form pieces shared by the shop, checkout and orders pages.

export function Button({ kind = 'primary', className = '', type = 'button', children, ...rest }) {
  return (
    <button type={type} className={`lc-btn lc-btn--${kind} ${className}`.trim()} {...rest}>
      {children}
    </button>
  )
}

export function Tag({ variant = 'blush', children }) {
  return <span className={`lc-tag${variant === 'sage' ? ' lc-tag--sage' : ''}`}>{children}</span>
}

export function Price({ amount, label }) {
  const v = Number.isInteger(amount) ? `$${amount}` : `$${amount.toFixed(2)}`
  return (
    <span className="lc-price-wrap">
      <span className="lc-price">{v}</span>
      {label && <span className="lc-price-label">{label}</span>}
    </span>
  )
}

export function SectionHeader({ eyebrow, title }) {
  return (
    <header className="lc-section-header">
      {eyebrow && <div className="lc-eyebrow">{eyebrow}</div>}
      <h2>{title}</h2>
      <hr className="lc-divider" />
    </header>
  )
}

export function Stepper({ value, onChange, min = 1, max = 30, size = 'md', disabled = false }) {
  return (
    <div className={`oc-stepper oc-stepper--${size}`}>
      <button type="button" aria-label="decrease" onClick={() => onChange(Math.max(min, value - 1))} disabled={disabled || value <= min}>−</button>
      <span>{value}</span>
      <button type="button" aria-label="increase" onClick={() => onChange(Math.min(max, value + 1))} disabled={disabled || value >= max}>+</button>
    </div>
  )
}

export function Field({ label, hint, children }) {
  return (
    <label className="oc-field">
      <span className="oc-label">{label}</span>
      {children}
      {hint && <span className="oc-hint">{hint}</span>}
    </label>
  )
}
