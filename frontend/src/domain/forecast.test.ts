import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import { forecastCoachCourses, forecastCourse } from './forecast';

const now = new Date('2026-11-13T09:00:00+07:00');

describe('AI class-opening forecast', () => {
  it('flags a course with no enrollment as high risk', () => {
    const state = createSeedState();
    const course = state.courses.find((candidate) => candidate.id === 'k4')!;
    const forecast = forecastCourse(course, state.enrollments, now);

    expect(forecast.current).toBe(0);
    expect(forecast.daysToStart).toBe(3);
    expect(forecast.probability).toBeLessThan(0.45);
    expect(forecast.risk).toBe('high');
    expect(forecast.label).toBe('Nguy cơ huỷ lớp');
    expect(forecast.reason).toContain('0/1 học viên');
  });

  it('confirms a course that already reached minStudents', () => {
    const state = createSeedState();
    const course = state.courses.find((candidate) => candidate.id === 'k1')!;
    const forecast = forecastCourse(course, state.enrollments, now);

    expect(forecast.current).toBeGreaterThanOrEqual(course.minStudents);
    expect(forecast.probability).toBeGreaterThanOrEqual(0.96);
    expect(forecast.label).toBe('Đủ điều kiện mở lớp');
  });

  it('reports a class that already filled every seat', () => {
    const state = createSeedState();
    const course = state.courses.find((candidate) => candidate.id === 'k2')!;
    const forecast = forecastCourse(course, state.enrollments, now);

    expect(forecast.probability).toBe(1);
    expect(forecast.label).toBe('Lớp đã đủ học viên');
  });

  it('projects future enrollment from the observed registration velocity', () => {
    const state = createSeedState();
    const course = state.courses.find((candidate) => candidate.id === 'k7')!;
    const enrollments = [
      {
        ...state.enrollments[0],
        id: 'forecast-e1',
        courseId: course.id,
        createdAt: '2026-11-11T10:00:00+07:00',
      },
      {
        ...state.enrollments[0],
        id: 'forecast-e2',
        courseId: course.id,
        createdAt: '2026-11-13T10:00:00+07:00',
      },
    ];
    const forecast = forecastCourse(course, enrollments, now);

    expect(forecast.current).toBe(2);
    expect(forecast.velocityPerDay).toBeGreaterThan(0);
    expect(forecast.projected).toBeGreaterThan(forecast.current);
    expect(forecast.daysToStart).toBeGreaterThan(0);
  });

  it('orders a coach course list from the highest risk upward', () => {
    const state = createSeedState();
    const forecasts = forecastCoachCourses(state, 'c1', now);
    const probabilities = forecasts.map((item) => item.probability);

    expect(forecasts.length).toBeGreaterThan(0);
    expect([...probabilities].sort((left, right) => left - right)).toEqual(probabilities);
  });
});