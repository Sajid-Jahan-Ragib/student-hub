import React, { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUIContext } from './context/UIContext';
import { useUserContext } from './context/UserContext';
import { Hero } from './components/Navigation/Hero';
import { SideMenu } from './components/Navigation/SideMenu';
import { SCREEN_TO_PATH, isKnownPath, normalizePath, pathToScreen } from './utils/navigationRoutes';
import './index.css';

const Home = lazy(() => import('./components/Dashboard/Home').then((m) => ({ default: m.Home })));
const Admin = lazy(() => import('./components/Admin/Admin').then((m) => ({ default: m.Admin })));
const Profile = lazy(() =>
  import('./components/Profile/Profile').then((m) => ({ default: m.Profile }))
);
const Results = lazy(() =>
  import('./components/Results/Results').then((m) => ({ default: m.Results }))
);
const Fees = lazy(() => import('./components/Fees/Fees').then((m) => ({ default: m.Fees })));
const Attendance = lazy(() =>
  import('./components/Attendance/Attendance').then((m) => ({ default: m.Attendance }))
);
const Routines = lazy(() =>
  import('./components/Routines/Routines').then((m) => ({ default: m.Routines }))
);
const Calendar = lazy(() =>
  import('./components/Calendar/Calendar').then((m) => ({ default: m.Calendar }))
);
const Downloads = lazy(() =>
  import('./components/Downloads/Downloads').then((m) => ({ default: m.Downloads }))
);
const AllCourses = lazy(() =>
  import('./components/Courses/AllCourses').then((m) => ({ default: m.AllCourses }))
);
const PresentCourses = lazy(() =>
  import('./components/Courses/PresentCourses').then((m) => ({ default: m.PresentCourses }))
);
const PendingCourses = lazy(() =>
  import('./components/Courses/PendingCourses').then((m) => ({ default: m.PendingCourses }))
);

function App() {
  const { currentScreen, setCurrentScreen, loading } = useUIContext();
  const { user } = useUserContext();
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const syncedScreenRef = useRef(currentScreen);

  useEffect(() => {
    const currentPath = normalizePath(location.pathname);
    if (!isKnownPath(currentPath)) {
      navigate('/', { replace: true });
      return;
    }

    const nextScreen = pathToScreen(location.pathname);
    syncedScreenRef.current = nextScreen;
    setCurrentScreen((prev) => (prev === nextScreen ? prev : nextScreen));
  }, [location.pathname, navigate, setCurrentScreen]);

  useEffect(() => {
    // Ignore URL-synced updates and only navigate for user-triggered screen changes.
    if (currentScreen === syncedScreenRef.current) {
      return;
    }

    const currentPath = normalizePath(location.pathname);
    const targetPath =
      currentScreen === 'admin' && currentPath.startsWith('/admin')
        ? currentPath
        : SCREEN_TO_PATH[currentScreen] || '/';

    if (currentPath !== targetPath) {
      navigate(targetPath);
    }
  }, [currentScreen, location.pathname, navigate]);

  useEffect(() => {
    if (!menuOpen) {
      document.body.style.overflow = '';
      return;
    }

    document.body.style.overflow = 'hidden';

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const screenComponent = useMemo(() => {
    switch (currentScreen) {
      case 'home':
        return <Home />;
      case 'admin':
        return <Admin />;
      case 'profile':
        return <Profile />;
      case 'results':
        return <Results />;
      case 'fees':
        return <Fees />;
      case 'attendance':
        return <Attendance />;
      case 'routines':
        return <Routines />;
      case 'calendar':
        return <Calendar />;
      case 'downloads':
        return <Downloads />;
      case 'courses':
        return <AllCourses />;
      case 'present':
        return <PresentCourses />;
      case 'pending':
        return <PendingCourses />;
      default:
        return <Home />;
    }
  }, [currentScreen]);

  const handleMenuToggle = useCallback(() => {
    setMenuOpen(true);
  }, []);

  const handleMenuClose = useCallback(() => {
    setMenuOpen(false);
  }, []);

  const handleMenuItemClick = useCallback(
    (screen) => {
      setCurrentScreen(screen);
    },
    [setCurrentScreen]
  );

  if (loading) {
    return <div className="app-shell app-shell__loading">Loading...</div>;
  }

  return (
    <div className="app-shell">
      {currentScreen === 'home' && (
        <>
          <Hero user={user} onMenuToggle={handleMenuToggle} />
          <SideMenu
            visible={menuOpen}
            activeScreen={currentScreen}
            onMenuItemClick={handleMenuItemClick}
            onClose={handleMenuClose}
          />
        </>
      )}
      <Suspense fallback={<div className="app-shell app-shell__loading">Loading screen...</div>}>
        {screenComponent}
      </Suspense>
    </div>
  );
}

export default App;
