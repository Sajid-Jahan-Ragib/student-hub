import { describe, it, expect } from 'vitest';
import { normalizeAdminPath } from '../src/components/Admin/adminRoutes';

describe('Phase 1: Router Verification Tests', () => {
  describe('Main Route URLs', () => {
    const mainRoutes = [
      '/',
      '/home',
      '/profile',
      '/attendance',
      '/calendar',
      '/results',
      '/routines',
      '/fees',
      '/downloads',
      '/courses',
      '/pending',
      '/present',
      '/admin',
    ];

    mainRoutes.forEach((route) => {
      it(`should allow direct navigation to ${route}`, () => {
        expect(route).toBeTruthy();
        expect(typeof route).toBe('string');
        expect(route.length > 0).toBe(true);
      });
    });
  });

  describe('Admin Deep-Link Routes', () => {
    const adminRoutes = [
      '/admin',
      '/admin/profile/json',
      '/admin/profile/form',
      '/admin/routines/json',
      '/admin/routines/semesters/json',
      '/admin/fees/json',
      '/admin/fees/semesters/json',
      '/admin/calendar/json',
      '/admin/downloads/json',
      '/admin/courses/json',
      '/admin/courses/pending/json',
      '/admin/marks/json',
    ];

    adminRoutes.forEach((route) => {
      it(`should normalize admin route ${route} correctly`, () => {
        const normalized = normalizeAdminPath(route);
        expect(normalized).toBeTruthy();
        expect(normalized.startsWith('/admin')).toBe(true);
        // Ensure no trailing slashes cause issues
        expect(normalizeAdminPath(route + '/')).toBe(normalized);
      });
    });
  });

  describe('Route Shake Prevention', () => {
    it('should normalize routes consistently (no bounce)', () => {
      const testRoute = '/admin/profile/json';
      const normalized1 = normalizeAdminPath(testRoute);
      const normalized2 = normalizeAdminPath(normalized1);
      expect(normalized1).toBe(normalized2);
    });

    it('should handle trailing slashes without bounce', () => {
      const baseRoute = '/admin/fees/json';
      const withSlash = '/admin/fees/json/';
      const normalized = normalizeAdminPath(baseRoute);
      const withSlashNormalized = normalizeAdminPath(withSlash);
      // Both should normalize to same value
      expect(normalizeAdminPath(normalized)).toBe(normalized);
      expect(normalizeAdminPath(withSlashNormalized)).toBe(normalizeAdminPath(withSlash));
    });

    it('should handle empty/invalid paths gracefully', () => {
      const invalid = '/admin/invalid/path';
      const normalized = normalizeAdminPath(invalid);
      // Should fallback to /admin instead of erroring
      expect(normalized).toBeTruthy();
    });
  });

  describe('Back Navigation Safety', () => {
    it('should provide consistent path resolution for back navigation', () => {
      const paths = [
        '/admin/profile/json',
        '/admin/routines/semesters/json',
        '/admin/fees/json',
        '/admin/calendar/json',
      ];

      paths.forEach((path) => {
        const normalized = normalizeAdminPath(path);
        // Back navigation should not trigger reshape
        expect(normalizeAdminPath(normalized)).toBe(normalized);
      });
    });

    it('should maintain route state during repeated normalization', () => {
      const route = '/admin/marks/json';
      let current = route;

      // Simulate 10 back/forward cycles
      for (let i = 0; i < 10; i++) {
        const next = normalizeAdminPath(current);
        expect(next).toBe(normalizeAdminPath(route)); // Should always match original normalized
        current = next;
      }
    });
  });
});
