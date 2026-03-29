import React from 'react';

function HeroComponent({ user, onMenuToggle }) {
  return (
    <header className="hero">
      <div className="hero__top">
        <div className="hero__brand">
          <div className="hero__avatar">
            <img src={user?.avatarSmall} alt="Profile" />
          </div>
          <div className="hero__text">
            <p className="hero__name">{user?.name || 'Loading...'}</p>
            <p className="hero__id">{user?.id || ''}</p>
            <p className="hero__program">{user?.department || ''}</p>
          </div>
        </div>
        <button className="hero__menu" type="button" aria-label="Open menu" onClick={onMenuToggle}>
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>
    </header>
  );
}

export const Hero = React.memo(HeroComponent);
