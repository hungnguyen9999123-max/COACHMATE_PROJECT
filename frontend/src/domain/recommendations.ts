import { LEVELS } from './constants';
import { getCoachRating, getCourseCapacityStatus } from './courses';
import type { Course, DemoState, SkillLevel } from './types';

export interface RecommendationBreakdown {
  label: string;
  points: number;
  max: number;
  detail: string;
}

export interface CourseRecommendation {
  course: Course;
  score: number;
  reasons: string[];
  breakdown: RecommendationBreakdown[];
}

export interface RecommendationPreferences {
  level: SkillLevel;
  area: string;
  budget: number;
  scheduleType: Course['scheduleType'] | null;
}

const DEFAULT_BUDGET = 1_500_000;

function levelDistance(left: SkillLevel, right: SkillLevel) {
  const leftIndex = LEVELS.indexOf(left);
  const rightIndex = LEVELS.indexOf(right);
  if (leftIndex < 0 || rightIndex < 0) return Number.MAX_SAFE_INTEGER;
  return Math.abs(leftIndex - rightIndex);
}

function studentPreferences(state: DemoState, studentId: string): RecommendationPreferences {
  const student = state.students.find((candidate) => candidate.id === studentId);
  const enrolledCourseIds = new Set(
    state.enrollments.filter((enrollment) => enrollment.studentId === studentId).map((enrollment) => enrollment.courseId),
  );
  const enrolledCourses = state.courses.filter((course) => enrolledCourseIds.has(course.id));
  const scheduleCounts = new Map<Course['scheduleType'], number>();
  enrolledCourses.forEach((course) => {
    scheduleCounts.set(course.scheduleType, (scheduleCounts.get(course.scheduleType) ?? 0) + 1);
  });
  const preferredSchedule = [...scheduleCounts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
  const averagePrice = enrolledCourses.length
    ? Math.round(enrolledCourses.reduce((sum, course) => sum + course.price, 0) / enrolledCourses.length)
    : DEFAULT_BUDGET;

  return {
    level: student?.level ?? 'Cơ bản',
    area: student?.area ?? '',
    budget: averagePrice,
    scheduleType: preferredSchedule,
  };
}

function scoreLevel(course: Course, preferences: RecommendationPreferences): RecommendationBreakdown {
  const distance = levelDistance(course.level, preferences.level);
  if (distance === 0) {
    return { label: 'Đúng trình độ', points: 40, max: 40, detail: `Khớp trình độ ${preferences.level} của bạn` };
  }
  if (distance === 1) {
    return { label: 'Gần trình độ', points: 14, max: 40, detail: `Gần trình độ ${preferences.level} (khóa ${course.level})` };
  }
  return { label: 'Trình độ', points: 0, max: 40, detail: `Khóa ${course.level} lệch trình độ ${preferences.level}` };
}

function scoreArea(course: Course, preferences: RecommendationPreferences): RecommendationBreakdown {
  if (preferences.area && course.area === preferences.area) {
    return { label: 'Cùng khu vực', points: 20, max: 20, detail: `Học ngay tại ${course.area}` };
  }
  return { label: 'Khu vực', points: 0, max: 20, detail: preferences.area ? `Khác khu vực ${preferences.area}` : 'Chưa có khu vực trong hồ sơ' };
}

function scoreSchedule(course: Course, preferences: RecommendationPreferences): RecommendationBreakdown {
  if (!preferences.scheduleType) {
    return { label: 'Lịch học', points: 8, max: 15, detail: 'Chưa có dữ liệu lịch học cũ, tạm tính trung bình' };
  }
  if (course.scheduleType === preferences.scheduleType) {
    return { label: 'Hợp lịch', points: 15, max: 15, detail: `Cùng khung ${course.scheduleType.toLowerCase()}` };
  }
  return { label: 'Lịch học', points: 0, max: 15, detail: `Khác khung ${preferences.scheduleType.toLowerCase()}` };
}

function scorePrice(course: Course, preferences: RecommendationPreferences): RecommendationBreakdown {
  if (course.price <= preferences.budget) {
    return { label: 'Trong ngân sách', points: 15, max: 15, detail: `Học phí ${course.price.toLocaleString('vi-VN')}đ trong mức quen thuộc` };
  }
  if (course.price <= preferences.budget * 1.25) {
    return { label: 'Gần ngân sách', points: 8, max: 15, detail: `Cao hơn mức quen thuộc khoảng ${Math.round((course.price / preferences.budget - 1) * 100)}%` };
  }
  return { label: 'Học phí', points: 0, max: 15, detail: 'Cao hơn ngân sách quen thuộc' };
}

function scoreCoach(state: DemoState, course: Course): RecommendationBreakdown {
  const coach = state.coaches.find((candidate) => candidate.id === course.coachId);
  const rating = coach ? getCoachRating(coach) : null;
  if (!rating) {
    return { label: 'Huấn luyện viên', points: 5, max: 10, detail: 'HLV chưa có đánh giá' };
  }
  return {
    label: 'Huấn luyện viên',
    points: Math.round(rating * 2 * 10) / 10,
    max: 10,
    detail: `HLV ${coach?.name ?? ''} được ${rating.toFixed(1)}★ (${coach?.ratingCount ?? 0} đánh giá)`,
  };
}

function buildReasons(breakdown: RecommendationBreakdown[]) {
  const positive = breakdown.filter((item) => item.points > 0).map((item) => item.detail);
  return positive.length ? positive : ['Khóa học đang mở đăng ký và còn chỗ'];
}

/**
 * Chấm điểm khóa học theo hồ sơ học viên:
 * trình độ 40 · khu vực 20 · lịch học 15 · ngân sách 15 · HLV 10.
 */
export function recommendCourses(state: DemoState, studentId: string, limit = 3): CourseRecommendation[] {
  const preferences = studentPreferences(state, studentId);
  const enrolledCourseIds = new Set(
    state.enrollments.filter((enrollment) => enrollment.studentId === studentId).map((enrollment) => enrollment.courseId),
  );

  return state.courses
    .filter((course) => course.status === 'published' && !enrolledCourseIds.has(course.id))
    .filter((course) => getCourseCapacityStatus(course, state.enrollments).kind !== 'full')
    .map((course) => {
      const breakdown = [
        scoreLevel(course, preferences),
        scoreArea(course, preferences),
        scoreSchedule(course, preferences),
        scorePrice(course, preferences),
        scoreCoach(state, course),
      ];
      const score = Math.round(breakdown.reduce((sum, item) => sum + item.points, 0) * 10) / 10;

      return {
        course,
        score,
        reasons: buildReasons(breakdown),
        breakdown,
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.course.price - right.course.price ||
        left.course.id.localeCompare(right.course.id),
    )
    .slice(0, limit);
}