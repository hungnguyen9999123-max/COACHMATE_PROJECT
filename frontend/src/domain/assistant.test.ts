import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import { askAssistant, suggestQuestions } from './assistant';

const state = createSeedState();

describe('AI rule-based assistant', () => {
  it('finds courses by area and budget in a Vietnamese question', () => {
    const result = askAssistant('Tìm lớp Quận 7 dưới 2 triệu', state, 'student');

    expect(result.intent).toBe('tim-khoa-hoc');
    expect(result.text).toContain('Quận 7');
    expect(result.text).toContain('2.000.000đ');
    expect(result.actions.length).toBeGreaterThan(0);
    expect(result.actions[0].to).toMatch(/^\/courses\//);
  });

  it('gives a personalized recommendation when no filter is provided', () => {
    const result = askAssistant('Tư vấn khóa học phù hợp cho tôi', state, 'student');

    expect(result.intent).toBe('goi-y-khoa-hoc');
    expect(result.actions).toHaveLength(3);
  });

  it('lists upcoming tournaments with navigable actions', () => {
    const result = askAssistant('Giải đấu nào sắp tới?', state, 'organizer');

    expect(result.intent).toBe('giai-dau');
    expect(result.text).toContain('CoachMate Mini Cup #1');
    expect(result.actions.some((action) => action.to === '/tournaments/t1')).toBe(true);
  });

  it('answers a student schedule question from enrollment data', () => {
    const result = askAssistant('Lịch học của tôi', state, 'student');

    expect(result.intent).toBe('lich-cua-toi');
    expect(result.actions.length).toBeGreaterThan(0);
  });

  it('reads platform finance for admin and coach revenue for coach', () => {
    const admin = askAssistant('Doanh thu nền tảng tháng này', state, 'admin');
    const coach = askAssistant('Doanh thu của tôi', state, 'coach');

    expect(admin.intent).toBe('doanh-thu');
    expect(admin.text).toContain('Doanh thu nền tảng');
    expect(admin.actions[0].to).toBe('/admin/reports');

    expect(coach.intent).toBe('doanh-thu');
    expect(coach.text).toContain('Thực nhận');
    expect(coach.actions[0].to).toBe('/coach/revenue');
  });

  it('forecasts at-risk classes for a coach', () => {
    const result = askAssistant('Lớp nào nguy cơ huỷ?', state, 'coach');

    expect(result.intent).toBe('du-bao-lop');
    expect(result.text).toContain('Nguy cơ huỷ lớp');
    expect(result.text).toContain('Cầu lông cho người mới');
  });

  it('falls back with role-specific suggested questions', () => {
    const result = askAssistant('Xin chào', state, 'student');

    expect(result.intent).toBe('tro-giup');
    expect(result.chips).toEqual(suggestQuestions('student'));
    expect(suggestQuestions('organizer')).toContain('Ai vô địch?');
  });
});