import { describe, expect, it } from 'vitest';
import { ROLE_NAVIGATION, roleForPath } from './roleNavigation';

describe('role navigation', () => {
  it('provides the requested role-specific destinations', () => {
    expect(ROLE_NAVIGATION.student.map((item) => item.to)).toEqual([
      '/courses', '/tournaments', '/me/courses',
      '/me/tournaments', '/me/payments', '/me/profile',
    ]);
    expect(ROLE_NAVIGATION.coach).toHaveLength(8);
    expect(ROLE_NAVIGATION.admin).toHaveLength(9);
  });

  it('resolves role from role route prefixes only', () => {
    expect(roleForPath('/student/courses')).toBe('student');
    expect(roleForPath('/coach/courses/new')).toBe('coach');
    expect(roleForPath('/admin/results')).toBe('admin');
    expect(roleForPath('/design-system')).toBeNull();
  });
});
