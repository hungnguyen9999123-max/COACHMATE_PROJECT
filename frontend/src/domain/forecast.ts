import { getCoachCourses } from './coachFlows';
import type { Course, DemoState, Enrollment } from './types';

const DAY_MS = 86_400_000;

export type ForecastRisk = 'low' | 'medium' | 'high';

export interface CourseForecast {
  courseId: string;
  courseTitle: string;
  current: number;
  minStudents: number;
  maxStudents: number;
  velocityPerDay: number;
  daysToStart: number;
  projected: number;
  probability: number;
  risk: ForecastRisk;
  label: string;
  reason: string;
}

function dayStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function logistic(value: number) {
  return 1 / (1 + Math.exp(-value));
}

function riskFor(probability: number): ForecastRisk {
  if (probability >= 0.75) return 'low';
  if (probability >= 0.45) return 'medium';
  return 'high';
}

function labelFor(risk: ForecastRisk) {
  if (risk === 'low') return 'Khả năng mở cao';
  if (risk === 'medium') return 'Cần theo dõi';
  return 'Nguy cơ huỷ lớp';
}

function formatNumber(value: number, maximumFractionDigits = 1) {
  return value.toLocaleString('vi-VN', { maximumFractionDigits });
}

/**
 * Dự báo lớp có đạt minStudents trước ngày khai giảng bằng tốc độ đăng ký thực tế.
 * Xác suất dùng logistic quanh ngưỡng mở lớp, thiên về cảnh báo sớm khi còn ít ngày.
 */
export function forecastCourse(
  course: Course,
  enrollments: Enrollment[],
  now = new Date(),
): CourseForecast {
  const courseEnrollments = enrollments.filter((enrollment) => enrollment.courseId === course.id);
  const current = courseEnrollments.length;
  const startDate = new Date(`${course.startDate}T00:00:00`);
  const daysToStart = Math.max(0, Math.round((dayStart(startDate) - dayStart(now)) / DAY_MS));

  const createdAtTimes = courseEnrollments
    .map((enrollment) => new Date(enrollment.createdAt).getTime())
    .filter((time) => Number.isFinite(time))
    .sort((left, right) => left - right);
  const firstEnrollmentAt = createdAtTimes[0];
  const elapsedDays = firstEnrollmentAt == null
    ? 1
    : Math.max(1, (now.getTime() - firstEnrollmentAt) / DAY_MS);
  const velocityPerDay = current === 0 ? 0 : current / elapsedDays;
  const projected = Math.round((current + velocityPerDay * daysToStart) * 10) / 10;

  let probability: number;
  let label: string;

  if (current >= course.maxStudents) {
    probability = 1;
    label = 'Lớp đã đủ học viên';
  } else if (current >= course.minStudents) {
    probability = 0.96;
    label = 'Đủ điều kiện mở lớp';
  } else if (daysToStart === 0) {
    probability = Math.min(0.2, logistic((current - course.minStudents) / 0.9) * 0.4);
    label = 'Đã tới ngày khai giảng';
  } else {
    probability = Math.min(0.97, Math.max(0.03, logistic((projected - course.minStudents) / 0.9)));
    label = labelFor(riskFor(probability));
  }

  const risk = riskFor(probability);
  const reason = daysToStart === 0
    ? `${current}/${course.minStudents} học viên · đã tới ngày khai giảng nên không thể đăng ký thêm`
    : `${current}/${course.minStudents} học viên · tốc độ ${formatNumber(velocityPerDay, 2)}/ngày · còn ${daysToStart} ngày · dự phóng ${formatNumber(projected)} học viên`;

  return {
    courseId: course.id,
    courseTitle: course.title,
    current,
    minStudents: course.minStudents,
    maxStudents: course.maxStudents,
    velocityPerDay,
    daysToStart,
    projected,
    probability,
    risk,
    label,
    reason,
  };
}

export function forecastCoachCourses(
  state: DemoState,
  coachId: string,
  now = new Date(),
): CourseForecast[] {
  return getCoachCourses(state, coachId)
    .map((course) => forecastCourse(course, state.enrollments, now))
    .sort((left, right) => left.probability - right.probability || left.courseId.localeCompare(right.courseId));
}