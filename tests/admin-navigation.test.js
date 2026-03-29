import { describe, expect, it } from 'vitest';
import { resolveAdminBackTool } from '../src/components/Admin/adminNavigation.js';

describe('admin back navigation resolver', () => {
  it('returns home action from admin root', () => {
    expect(resolveAdminBackTool(null)).toEqual({ action: 'home' });
  });

  it('returns root tool from options state', () => {
    expect(resolveAdminBackTool('profile-options')).toEqual({ action: 'tool', tool: null });
  });

  it('returns options target from nested editors', () => {
    expect(resolveAdminBackTool('profile-json')).toEqual({
      action: 'tool',
      tool: 'profile-options',
    });
    expect(resolveAdminBackTool('routines-normal')).toEqual({
      action: 'tool',
      tool: 'routines-options',
    });
    expect(resolveAdminBackTool('fees-json')).toEqual({ action: 'tool', tool: 'fees-options' });
    expect(resolveAdminBackTool('marks-normal')).toEqual({ action: 'tool', tool: 'marks-options' });
  });
});
