import { describe, expect, it } from 'vitest';
import { ROLE_NAVIGATION, roleForPath } from './roleNavigation';

describe('role navigation', () => {
  it('provides the requested role-specific destinations', () => {
    expect(ROLE_NAVIGATION.student.map((item) => item.to)).toEqual([
      '/courses', '/tournaments', '/me/courses',
      '/me/tournaments', '/me/payments', '/me/profile',
    ]);
    expect(ROLE_NAVIGATION.coach).toHaveLength(8);
    expect(ROLE_NAVIGATION.admin).toHaveLength(10);
    expect(ROLE_NAVIGATION.admin.at(-1)?.to).toBe('/admin/profile');
    expect(ROLE_NAVIGATION.organizer.map((item) => item.to)).toEqual([
      '/organizer/dashboard', '/organizer/tournaments', '/organizer/tournaments/new',
      '/organizer/operations', '/organizer/schedule', '/organizer/results', '/organizer/profile',
    ]);
  });

  it('resolves role from role route prefixes only', () => {
    expect(roleForPath('/student/courses')).toBe('student');
    expect(roleForPath('/coach/courses/new')).toBe('coach');
    expect(roleForPath('/admin')).toBe('admin');
    expect(roleForPath('/admin/accounts')).toBe('admin');
    expect(roleForPath('/organizer')).toBe('organizer');
    expect(roleForPath('/organizer/results')).toBe('organizer');
    expect(roleForPath('/design-system')).toBeNull();
  });
});
