import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import {
  cancelCoachPro,
  createCourseByCoach,
  getCoachOverview,
  subscribeCoachPro,
  updateCoachProfile,
  updateCourseContentByCoach,
} from './coachFlows';

describe('Coach Flows Domain Logic', () => {
  it('calculates coach overview metrics correctly', () => {
    const state = createSeedState();
    const overview = getCoachOverview(state, 'c1');

    expect(overview.courseCount).toBe(3);
    expect(overview.studentCount).toBe(8);
    expect(overview.grossRevenue).toBe(13200000);
    expect(overview.platformCommission).toBe(1320000);
    expect(overview.coachPayout).toBe(11880000);
  });

  it('creates a new course for coach', () => {
    const state = createSeedState();
    const result = createCourseByCoach(state, 'c1', {
      title: 'Lớp Cầu Lông Cuối Tuần',
      type: 'group',
      level: 'Cơ bản',
      area: 'Quận 7',
      venue: 'Sân CL Phú Mỹ Hưng',
      startDate: '2026-12-01',
      sessions: 8,
      minutesPerSession: 90,
      days: 'Thứ 7 - Chủ Nhật',
      time: '08:00-09:30',
      scheduleType: 'Cuối tuần',
      minStudents: 4,
      maxStudents: 8,
      price: 1500000,
      goal: 'Rèn luyện thể lực và footwork',
      curriculum: [' Footwork 6 điểm ', 'Đập cầu'],
      requirement: 'Không yêu cầu',
    });

    expect(result.state.courses.length).toBe(state.courses.length + 1);
    expect(result.course.title).toBe('Lớp Cầu Lông Cuối Tuần');
    expect(result.course.curriculum).toEqual(['Footwork 6 điểm', 'Đập cầu']);
  });

  it('updates course content without changing enrolled students, price, schedule, or capacity', () => {
    const state = createSeedState();
    const original = state.courses.find((course) => course.id === 'k1')!;
    const updated = updateCourseContentByCoach(state, 'c1', 'k1', {
      title: 'Tên khóa học mới',
      type: original.type,
      level: 'Trung cấp',
      goal: 'Cải thiện kỹ thuật',
      curriculum: [' Footwork ', ''],
      requirement: 'Đã biết kỹ thuật cơ bản',
      coverImageUrl: 'https://example.test/course.jpg',
    });
    const course = updated.courses.find((item) => item.id === 'k1')!;

    expect(course).toMatchObject({
      title: 'Tên khóa học mới',
      level: 'Trung cấp',
      price: original.price,
      days: original.days,
      time: original.time,
      startDate: original.startDate,
      maxStudents: original.maxStudents,
      curriculum: ['Footwork'],
    });
    expect(updated.enrollments).toEqual(state.enrollments);
    expect(() => updateCourseContentByCoach(state, 'c2', 'k1', {
      title: 'Không thuộc coach',
      type: original.type,
      level: original.level,
      goal: '',
      curriculum: [],
      requirement: '',
    })).toThrow('Không tìm thấy khóa học của huấn luyện viên này.');
  });

  it('updates public coach profile details and validates required fields', () => {
    const state = createSeedState();
    const updated = updateCoachProfile(state, 'c1', {
      name: 'Nguyễn Minh Khang',
      bio: '  Huấn luyện cầu lông phong trào. ',
      area: 'Quận 7',
      specialties: [' Footwork ', '', 'Chiến thuật', 'Footwork'],
    });

    expect(updated.coaches.find((coach) => coach.id === 'c1')).toMatchObject({
      bio: 'Huấn luyện cầu lông phong trào.',
      specialties: ['Footwork', 'Chiến thuật'],
    });
    expect(() => updateCoachProfile(state, 'c1', {
      name: ' ',
      bio: '',
      area: 'Quận 7',
      specialties: [],
    })).toThrow('Vui lòng nhập họ tên.');
  });

  it('handles Coach Pro subscription and cancellation', () => {
    const state = createSeedState();
    const subscribed = subscribeCoachPro(state, 'c2');

    expect(subscribed.subscriptions.some((s) => s.coachId === 'c2' && s.active)).toBe(true);

    const cancelled = cancelCoachPro(subscribed, 'c2');
    expect(cancelled.subscriptions.some((s) => s.coachId === 'c2' && s.active)).toBe(false);
  });
});
