import { describe, expect, it } from 'vitest';
import { isKnownPath, normalizePath, pathToScreen } from '../src/utils/navigationRoutes.js';

describe('navigation routes', () => {
  it('normalizes trailing slash paths', () => {
    expect(normalizePath('/results/')).toBe('/results');
  });

  it('maps admin deep links to admin screen', () => {
    expect(pathToScreen('/admin/profile/json')).toBe('admin');
    expect(pathToScreen('/admin')).toBe('admin');
  });

  it('maps known feature routes', () => {
    expect(pathToScreen('/results')).toBe('results');
    expect(pathToScreen('/courses/present')).toBe('present');
  });

  it('falls back unknown routes to home screen mapping', () => {
    expect(pathToScreen('/unknown/route')).toBe('home');
    expect(isKnownPath('/unknown/route')).toBe(false);
  });

  it('recognizes known routes and admin routes', () => {
    expect(isKnownPath('/calendar')).toBe(true);
    expect(isKnownPath('/admin/marks/json')).toBe(true);
  });
});
