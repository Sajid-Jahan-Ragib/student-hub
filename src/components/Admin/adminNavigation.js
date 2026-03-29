export function resolveAdminBackTool(activeTool) {
  if (!activeTool) {
    return { action: 'home' };
  }

  if (activeTool.endsWith('-options')) {
    return { action: 'tool', tool: null };
  }

  if (activeTool.startsWith('profile-')) {
    return { action: 'tool', tool: 'profile-options' };
  }

  if (activeTool.startsWith('routines-')) {
    return { action: 'tool', tool: 'routines-options' };
  }

  if (activeTool.startsWith('fees-')) {
    return { action: 'tool', tool: 'fees-options' };
  }

  if (activeTool.startsWith('calendar-')) {
    return { action: 'tool', tool: 'calendar-options' };
  }

  if (activeTool.startsWith('downloads-')) {
    return { action: 'tool', tool: 'downloads-options' };
  }

  if (activeTool.startsWith('courses-')) {
    return { action: 'tool', tool: 'courses-options' };
  }

  if (activeTool.startsWith('pending-courses-')) {
    return { action: 'tool', tool: 'pending-courses-options' };
  }

  if (activeTool.startsWith('marks-')) {
    return { action: 'tool', tool: 'marks-options' };
  }

  return { action: 'tool', tool: null };
}
