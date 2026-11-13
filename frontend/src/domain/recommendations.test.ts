import { describe, expect, it } from 'vitest';
import { createSeedState } from '../data/seed';
import { recommendCourses } from './recommendations';

describe('AI course recommendations', () => {
  it('returns at most three published courses with a transparent breakdown', () => {
    const state = createSeedState();
    const recommendations = recommendCourses(state, state.currentStudentId);

    expect(recommendations).toHaveLength(3);
    recommendations.forEach((item) => {
      expect(item.course.status).toBe('published');
      expect(item.score).toBeGreaterThan(0);
      expect(item.score).toBeLessThanOrEqual(100);
      expect(item.reasons.length).toBeGreaterThan(0);
      expect(item.breakdown.reduce((sum, entry) => sum + entry.max, 0)).toBe(100);
      expect(item.breakdown.reduce((sum, entry) => sum + entry.points, 0)).toBeCloseTo(item.score, 1);
    });
  });

  it('scores a course matching the student level and area above a distant course', () => {
    const state = createSeedState();
    const student = state.students.find((candidate) => candidate.id === state.currentStudentId)!;
    const recommendations = recommendCourses(state, student.id, 20);
    const close = recommendations.find((item) => item.course.level === student.level);
    const distant = recommendations.find(
      (item) => item.course.level !== student.level && item.course.area !== student.area,
    );

    expect(close).toBeDefined();
    expect(distant).toBeDefined();
    expect(close!.score).toBeGreaterThan(distant!.score);
  });

  it('never recommends a course the student already joined', () => {
    const state = createSeedState();
    const enrollment = state.enrollments[0];
    const recommendations = recommendCourses(state, enrollment.studentId, 20);

    expect(recommendations.some((item) => item.course.id === enrollment.courseId)).toBe(false);
  });

  it('skips a course that is already full', () => {
    const state = createSeedState();
    const fullCourse = state.courses.find((course) => course.id === 'k2')!;
    const enrolled = state.enrollments.filter((item) => item.courseId === fullCourse.id).length;
    const recommendations = recommendCourses(state, state.currentStudentId, 20);

    expect(enrolled).toBe(fullCourse.maxStudents);
    expect(recommendations.some((item) => item.course.id === fullCourse.id)).toBe(false);
  });
});