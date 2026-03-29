import React from 'react';

export function Card({ children, variant = 'default', className = '', onClick = null }) {
  const baseClasses = 'card';
  const variantClasses = {
    default: 'card--primary',
    notice: 'card--notice card--interactive',
    classes: 'card--classes card--interactive',
  };

  const handleKeyDown = (event) => {
    if (!onClick) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant] || ''} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {children}
    </div>
  );
}

export function Button({ children, onClick, className = '', type = 'button', ...props }) {
  return (
    <button type={type} onClick={onClick} className={`btn btn--primary ${className}`} {...props}>
      {children}
    </button>
  );
}

export function Tile({ icon, label, onClick }) {
  return (
    <button type="button" className="tile" onClick={onClick}>
      <span className="tile__icon material-symbols-outlined">{icon}</span>
      <span className="tile__label">{label}</span>
    </button>
  );
}

export function TopBar({ title, onBack }) {
  return (
    <header className="page-header">
      <div className="page-header__inner">
        <button
          className="page-header__back"
          onClick={onBack}
          type="button"
          aria-label="Back to dashboard"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="page-header__content">
          <h1 className="page-header__title">{title}</h1>
        </div>
      </div>
    </header>
  );
}

export function SectionTitle({ eyebrow, title }) {
  return (
    <div className="section-title">
      <p className="section-title__eyebrow">{eyebrow}</p>
      <p className="section-title__heading">{title}</p>
    </div>
  );
}

export function EmptyState({ message }) {
  return <div className="pending-alert">{message}</div>;
}
