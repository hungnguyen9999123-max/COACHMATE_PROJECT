import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import {
  calculateCoachCourseFinancials,
  filterAndSortCourses,
  findPublishedCourse,
  getCoachRating,
  getCourseCapacityStatus,
  searchFilterAndSortCourses,
} from './courses';

describe('course preservation rules', () => {
  it('reproduces every seeded capacity state', () => {
    const state = createSeedState();
    const statusByCourse = Object.fromEntries(
      state.courses.map((course) => [
        course.id,
        getCourseCapacityStatus(course, state.enrollments),
      ]),
    );

    expect(statusByCourse).toEqual({
      k1: { kind: 'confirmed', remainingToOpen: 0 },
      k2: { kind: 'full', remainingToOpen: 0 },
      k3: { kind: 'needs_students', remainingToOpen: 2 },
      k4: { kind: 'needs_students', remainingToOpen: 1 },
      k5: { kind: 'needs_students', remainingToOpen: 2 },
    });
  });

  it('combines filters with AND and searches title, coach, and venue', () => {
    const state = createSeedState();
    const activeCoachIds = new Set(['c1']);

    expect(
      filterAndSortCourses(state.courses, state.coaches, activeCoachIds, {
        query: 'Lê Quốc Bảo',
      }).map((course) => course.id),
    ).toEqual(['k2', 'k4']);

    expect(
      filterAndSortCourses(state.courses, state.coaches, activeCoachIds, {
        level: 'Cơ bản',
        area: 'Bình Thạnh',
        scheduleType: 'Tối trong tuần',
        maximumPrice: 1_500_000,
      }).map((course) => course.id),
    ).toEqual(['k3']);
  });

  it('sorts active Coach Pro courses first, then by start date', () => {
    const state = createSeedState();
    const result = filterAndSortCourses(
      state.courses,
      state.coaches,
      new Set(['c1']),
      {},
    );

    expect(result.map((course) => course.id)).toEqual(['k1', 'k5', 'k3', 'k2', 'k4']);
  });

  it('uses the original rating and coach earning formulas', () => {
    const state = createSeedState();
    const coach = state.coaches.find((candidate) => candidate.id === 'c1')!;
    const financials = calculateCoachCourseFinancials('c1', state.courses, state.enrollments);

    expect(getCoachRating(coach)).toBeCloseTo(58 / 12);
    expect(financials).toEqual({
      courseCount: 2,
      studentCount: 8,
      grossRevenue: 13_200_000,
      platformCommission: 1_320_000,
      coachPayout: 11_880_000,
    });
  });

  it('sorts by price and coach rating and returns an empty result for unmatched searches', () => {
    const state = createSeedState();
    const args = [state.courses, state.coaches, new Set<string>()] as const;
    expect(searchFilterAndSortCourses(...args, {}, 'price-ascending').map((course) => course.id)).toEqual([
      'k2', 'k1', 'k3', 'k5', 'k4',
    ]);
    expect(searchFilterAndSortCourses(...args, {}, 'price-descending').map((course) => course.id)).toEqual([
      'k4', 'k5', 'k3', 'k1', 'k2',
    ]);
    expect(searchFilterAndSortCourses(...args, {}, 'rating').map((course) => course.id)).toEqual([
      'k2', 'k4', 'k1', 'k5', 'k3',
    ]);
    expect(searchFilterAndSortCourses(...args, { query: 'khóa không tồn tại' })).toEqual([]);
  });

  it('returns a published course by ID and rejects unknown or unpublished courses', () => {
    const courses = createSeedState().courses;
    expect(findPublishedCourse(courses, 'k1')?.title).toContain('người mới');
    expect(findPublishedCourse(courses, 'missing')).toBeNull();
    expect(findPublishedCourse([{ ...courses[0], status: 'draft' }], 'k1')).toBeNull();
  });
});
