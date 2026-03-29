const ADMIN_TOOL_TO_PATH = {
  'profile-options': '/admin/profile/options',
  'profile-normal': '/admin/profile/normal',
  'profile-json': '/admin/profile/json',
  'routines-options': '/admin/routines/options',
  'routines-normal': '/admin/routines/normal',
  'routines-json': '/admin/routines/json',
  'fees-options': '/admin/fees/options',
  'fees-normal': '/admin/fees/normal',
  'fees-json': '/admin/fees/json',
  'calendar-options': '/admin/calendar/options',
  'calendar-normal': '/admin/calendar/normal',
  'calendar-json': '/admin/calendar/json',
  'downloads-options': '/admin/downloads/options',
  'downloads-normal': '/admin/downloads/normal',
  'downloads-json': '/admin/downloads/json',
  'courses-options': '/admin/courses/options',
  'courses-normal': '/admin/courses/normal',
  'courses-json': '/admin/courses/json',
  'pending-courses-options': '/admin/pending-courses/options',
  'pending-courses-normal': '/admin/pending-courses/normal',
  'pending-courses-json': '/admin/pending-courses/json',
  'marks-options': '/admin/marks/options',
  'marks-normal': '/admin/marks/normal',
  'marks-json': '/admin/marks/json',
};

const ADMIN_PATH_TO_TOOL = Object.entries(ADMIN_TOOL_TO_PATH).reduce((acc, [tool, path]) => {
  acc[path] = tool;
  return acc;
}, {});

function normalizeAdminPath(pathname) {
  if (!pathname) {
    return '/admin';
  }
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function getAdminToolFromPath(pathname) {
  const normalizedPath = normalizeAdminPath(pathname);
  return ADMIN_PATH_TO_TOOL[normalizedPath] || null;
}

function getAdminPathFromTool(tool) {
  return ADMIN_TOOL_TO_PATH[tool] || '/admin';
}

function isKnownAdminToolPath(pathname) {
  const normalizedPath = normalizeAdminPath(pathname);
  return Boolean(ADMIN_PATH_TO_TOOL[normalizedPath]);
}

export {
  ADMIN_TOOL_TO_PATH,
  getAdminPathFromTool,
  getAdminToolFromPath,
  isKnownAdminToolPath,
  normalizeAdminPath,
};
