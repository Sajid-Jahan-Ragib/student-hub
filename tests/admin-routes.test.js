import { describe, expect, it } from 'vitest';
import {
  getAdminPathFromTool,
  getAdminToolFromPath,
  isKnownAdminToolPath,
  normalizeAdminPath,
} from '../src/components/Admin/adminRoutes.js';

describe('admin route helpers', () => {
  it('normalizes empty and trailing slash paths', () => {
    expect(normalizeAdminPath('')).toBe('/admin');
    expect(normalizeAdminPath('/admin/')).toBe('/admin');
    expect(normalizeAdminPath('/admin/profile/json/')).toBe('/admin/profile/json');
  });

  it('maps tool to path and path to tool', () => {
    expect(getAdminPathFromTool('profile-json')).toBe('/admin/profile/json');
    expect(getAdminToolFromPath('/admin/profile/json')).toBe('profile-json');
  });

  it('returns null or admin root fallback for unknown routes', () => {
    expect(getAdminToolFromPath('/admin/unknown/path')).toBeNull();
    expect(getAdminPathFromTool('unknown-tool')).toBe('/admin');
  });

  it('detects known admin tool paths', () => {
    expect(isKnownAdminToolPath('/admin/fees/normal')).toBe(true);
    expect(isKnownAdminToolPath('/admin/fees/normal/')).toBe(true);
    expect(isKnownAdminToolPath('/admin/fees/invalid')).toBe(false);
  });
});
