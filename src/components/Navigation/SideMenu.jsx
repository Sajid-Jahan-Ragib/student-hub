import React from 'react';

const MENU_GROUPS = [
  {
    title: 'Overview',
    items: [
      { screen: 'home', label: 'Dashboard' },
      { screen: 'admin', label: 'Admin' },
      { screen: 'profile', label: 'Profile' },
    ],
  },
  {
    title: 'Academic',
    items: [
      { screen: 'attendance', label: 'Attendance' },
      { screen: 'results', label: 'Results' },
      { screen: 'routines', label: 'Routines' },
      { screen: 'calendar', label: 'Calendar' },
      { screen: 'present', label: 'Present Courses' },
      { screen: 'pending', label: 'Pending Courses' },
      { screen: 'courses', label: 'All Courses' },
    ],
  },
  {
    title: 'Resources',
    items: [
      { screen: 'fees', label: 'Fees & Waivers' },
      { screen: 'downloads', label: 'Downloads' },
    ],
  },
];

function SideMenuComponent({ visible, activeScreen, onMenuItemClick, onClose }) {
  return (
    <>
      {visible && <div className="menu-overlay" onClick={onClose}></div>}
      <aside
        className={`side-menu ${visible ? '' : 'hidden'}`}
        role="menu"
        aria-label="Quick navigation menu"
      >
        <button
          className="side-menu__close"
          type="button"
          aria-label="Close menu"
          onClick={onClose}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="side-menu__title">Quick Menu</h2>
        <nav className="side-menu__list" role="navigation">
          {MENU_GROUPS.map((group) => (
            <section key={group.title} className="side-menu__group" aria-label={group.title}>
              <p className="side-menu__group-title">{group.title}</p>
              {group.items.map((item) => (
                <button
                  key={item.screen}
                  className={`side-menu__item ${activeScreen === item.screen ? 'side-menu__item--active' : ''}`}
                  type="button"
                  onClick={() => {
                    onMenuItemClick(item.screen);
                    onClose();
                  }}
                >
                  {item.label}
                </button>
              ))}
            </section>
          ))}
        </nav>
      </aside>
    </>
  );
}

export const SideMenu = React.memo(SideMenuComponent);
