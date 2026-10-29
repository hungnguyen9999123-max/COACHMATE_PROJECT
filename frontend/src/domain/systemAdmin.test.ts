import { describe, expect, it } from 'vitest';
import { SYSTEM_DEMO_ACCOUNTS, createSeedState } from '../data/seed';
import {
  getSystemAccounts,
  updateCourseModerationByAdmin,
  updateSystemAccountByAdmin,
} from './systemAdmin';

describe('system administration flows', () => {
  it('lists four-role demo accounts and persists access and role overrides', () => {
    const state = createSeedState();
    const accounts = getSystemAccounts(state, SYSTEM_DEMO_ACCOUNTS);
    const student = accounts.find((account) => account.id === state.currentStudentId)!;
    expect(new Set(accounts.map((account) => account.role))).toEqual(new Set(['student', 'coach', 'admin', 'organizer']));

    const updated = updateSystemAccountByAdmin(state, student.id, {
      role: 'organizer',
      status: 'suspended',
    }, SYSTEM_DEMO_ACCOUNTS);

    expect(getSystemAccounts(updated, SYSTEM_DEMO_ACCOUNTS).find((account) => account.id === student.id)).toMatchObject({
      role: 'organizer',
      status: 'suspended',
    });
    expect(updated.activityLogs[0].actorName).toBe('Quản trị hệ thống');
  });

  it('moderates a course without changing historical enrollment or payment amounts', () => {
    const state = createSeedState();
    const enrollmentPayments = state.payments.map((payment) => payment.amount);
    const course = state.courses[0];
    const updated = updateCourseModerationByAdmin(state, course.id, 'archived');

    expect(updated.courses.find((item) => item.id === course.id)?.status).toBe('archived');
    expect(updated.enrollments).toEqual(state.enrollments);
    expect(updated.payments.map((payment) => payment.amount)).toEqual(enrollmentPayments);
  });

  it('rejects unknown account and course identifiers', () => {
    const state = createSeedState();
    expect(() => updateSystemAccountByAdmin(state, 'missing-account', { status: 'suspended' }, SYSTEM_DEMO_ACCOUNTS)).toThrow(
      'Không tìm thấy tài khoản demo.',
    );
    expect(() => updateCourseModerationByAdmin(state, 'missing-course', 'draft')).toThrow(
      'Không tìm thấy khóa học.',
    );
  });
});
