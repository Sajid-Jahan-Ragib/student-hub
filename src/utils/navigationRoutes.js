export const SCREEN_TO_PATH = {
  home: '/',
  admin: '/admin',
  profile: '/profile',
  results: '/results',
  fees: '/fees',
  attendance: '/attendance',
  routines: '/routines',
  calendar: '/calendar',
  downloads: '/downloads',
  courses: '/courses',
  present: '/courses/present',
  pending: '/courses/pending',
};

const KNOWN_PATHS = new Set(Object.values(SCREEN_TO_PATH));

const PATH_TO_SCREEN = Object.entries(SCREEN_TO_PATH).reduce((acc, [screen, routePath]) => {
  acc[routePath] = screen;
  return acc;
}, {});

export function normalizePath(pathname) {
  if (!pathname) return '/';
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function pathToScreen(pathname) {
  const normalizedPath = normalizePath(pathname);
  if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) {
    return 'admin';
  }
  return PATH_TO_SCREEN[normalizedPath] || 'home';
}

export function isKnownPath(pathname) {
  const normalizedPath = normalizePath(pathname);
  if (normalizedPath === '/admin' || normalizedPath.startsWith('/admin/')) {
    return true;
  }
  return KNOWN_PATHS.has(normalizedPath);
}
