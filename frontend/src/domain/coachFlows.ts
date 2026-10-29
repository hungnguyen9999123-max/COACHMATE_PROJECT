import { prependActivity } from './activity';
import { DEFAULT_COURSE_COVER_IMAGE } from './constants';
import { calculateCoachCourseFinancials } from './courses';
import type { Coach, Course, DemoState, Enrollment, Subscription } from './types';

export function getCoachCourses(state: DemoState, coachId: string): Course[] {
  return state.courses.filter((course) => course.coachId === coachId);
}

export function getCoachEnrollments(state: DemoState, coachId: string): Enrollment[] {
  const courseIds = new Set(getCoachCourses(state, coachId).map((course) => course.id));
  return state.enrollments.filter((enrollment) => courseIds.has(enrollment.courseId));
}

export function getCoachStudents(state: DemoState, coachId: string) {
  const coachCourses = getCoachCourses(state, coachId);
  const courseMap = new Map(coachCourses.map((course) => [course.id, course]));
  const studentMap = new Map(state.students.map((student) => [student.id, student]));
  const enrollments = getCoachEnrollments(state, coachId);

  return enrollments.map((enrollment) => ({
    enrollment,
    course: courseMap.get(enrollment.courseId)!,
    student: studentMap.get(enrollment.studentId),
  }));
}

export function isCoachProActive(state: DemoState, coachId: string): boolean {
  return state.subscriptions.some(
    (subscription) => subscription.coachId === coachId && subscription.active,
  );
}

export function getCoachOverview(state: DemoState, coachId: string) {
  const coachCourses = getCoachCourses(state, coachId);
  const financials = calculateCoachCourseFinancials(coachId, state.courses, state.enrollments);
  const isPro = isCoachProActive(state, coachId);

  return {
    coachCourses,
    isPro,
    ...financials,
  };
}

export function createCourseByCoach(
  state: DemoState,
  coachId: string,
  input: {
    title: string;
    type: Course['type'];
    level: Course['level'];
    area: string;
    venue: string;
    startDate: string;
    sessions: number;
    minutesPerSession: number;
    days: string;
    time: string;
    scheduleType: Course['scheduleType'];
    minStudents: number;
    maxStudents: number;
    price: number;
    goal: string;
    curriculum: string[];
    requirement: string;
    coverImageUrl?: string;
  },

): { state: DemoState; course: Course } {
  const coach = state.coaches.find((c) => c.id === coachId);
  if (!coach) throw new Error('Không tìm thấy huấn luyện viên.');

  if (!input.title.trim()) throw new Error('Vui lòng nhập tên khóa học.');
  if (input.price < 0) throw new Error('Học phí không được là số âm.');
  if (input.minStudents < 1 || input.maxStudents < input.minStudents) {
    throw new Error('Số học viên tối thiểu và tối đa không hợp lệ.');
  }

  const courseId = `course-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const course: Course = {
    id: courseId,
    coachId,
    title: input.title.trim(),
    type: input.type,
    level: input.level,
    area: input.area.trim(),
    venue: input.venue.trim(),
    startDate: input.startDate,
    sessions: input.sessions,
    minutesPerSession: input.minutesPerSession,
    days: input.days.trim(),
    time: input.time.trim(),
    scheduleType: input.scheduleType,
    minStudents: input.minStudents,
    maxStudents: input.maxStudents,
    price: input.price,
    goal: input.goal.trim(),
    curriculum: input.curriculum.map((c) => c.trim()).filter(Boolean),
    requirement: input.requirement.trim(),
    status: 'published',
    coverImageUrl: input.coverImageUrl?.trim() || DEFAULT_COURSE_COVER_IMAGE,
  };

  const updatedState: DemoState = {
    ...state,
    courses: [course, ...state.courses],
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: coach.name,
      action: `đã đăng khóa học mới: ${course.title}`,
    }),
  };

  return { state: updatedState, course };
}

export function updateCourseContentByCoach(
  state: DemoState,
  coachId: string,
  courseId: string,
  input: Pick<Course, 'title' | 'type' | 'level' | 'goal' | 'curriculum' | 'requirement' | 'coverImageUrl'>,
): DemoState {
  const coach = state.coaches.find((item) => item.id === coachId);
  if (!coach) throw new Error('Không tìm thấy huấn luyện viên.');
  const course = state.courses.find((item) => item.id === courseId && item.coachId === coachId);
  if (!course) throw new Error('Không tìm thấy khóa học của huấn luyện viên này.');
  if (!input.title.trim()) throw new Error('Vui lòng nhập tên khóa học.');

  const updatedCourse: Course = {
    ...course,
    title: input.title.trim(),
    type: input.type,
    level: input.level,
    goal: input.goal.trim(),
    curriculum: input.curriculum.map((item) => item.trim()).filter(Boolean),
    requirement: input.requirement.trim(),
    coverImageUrl: input.coverImageUrl?.trim() || DEFAULT_COURSE_COVER_IMAGE,
  };
  return {
    ...state,
    courses: state.courses.map((item) => item.id === courseId ? updatedCourse : item),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: coach.name,
      action: `đã cập nhật nội dung khóa học: ${updatedCourse.title}`,
    }),
  };
}

export function updateCoachProfile(
  state: DemoState,
  coachId: string,
  input: Pick<Coach, 'name' | 'bio' | 'area' | 'specialties'>,
): DemoState {
  const coach = state.coaches.find((item) => item.id === coachId);
  if (!coach) throw new Error('Không tìm thấy hồ sơ huấn luyện viên.');
  if (!input.name.trim()) throw new Error('Vui lòng nhập họ tên.');
  if (!input.area.trim()) throw new Error('Vui lòng chọn khu vực hoạt động.');

  const updatedCoach = {
    ...coach,
    name: input.name.trim(),
    bio: input.bio.trim(),
    area: input.area.trim(),
    specialties: [...new Set(input.specialties.map((item) => item.trim()).filter(Boolean))],
  };
  return {
    ...state,
    coaches: state.coaches.map((item) => item.id === coachId ? updatedCoach : item),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: updatedCoach.name,
      action: 'đã cập nhật hồ sơ huấn luyện viên',
    }),
  };
}

export function subscribeCoachPro(state: DemoState, coachId: string): DemoState {
  const coach = state.coaches.find((c) => c.id === coachId);
  if (!coach) throw new Error('Không tìm thấy huấn luyện viên.');

  const price = state.settings.coachProMonthlyPrice;
  const subscriptionId = `sub-${Date.now()}`;
  const paymentId = `pay-sub-${Date.now()}`;

  const subscription: Subscription = {
    id: subscriptionId,
    coachId,
    amount: price,
    months: 1,
    startDate: new Date().toISOString().slice(0, 10),
    active: true,
    paymentId,
  };

  return {
    ...state,
    subscriptions: [subscription, ...state.subscriptions.map((s) => (s.coachId === coachId ? { ...s, active: false } : s))],
    payments: [
      {
        id: paymentId,
        kind: 'subscription',
        referenceId: subscriptionId,
        payerName: coach.name,
        amount: price,
        paymentFee: 0,
        method: 'Thẻ ATM / Visa',
        status: 'completed',
        simulated: true,
        createdAt: new Date().toISOString(),
      },
      ...state.payments,
    ],
    financialRecords: [
      {
        id: `fin-sub-${subscriptionId}`,
        type: 'subscription_revenue',
        referenceId: subscriptionId,
        amount: price,
        occurredAt: new Date().toISOString(),
        note: `Đăng ký gói Coach Pro của ${coach.name}`,
      },
      ...state.financialRecords,
    ],
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: coach.name,
      action: `đã đăng ký gói Coach Pro (${price.toLocaleString('vi-VN')}đ/tháng mô phỏng)`,
    }),
  };
}

export function cancelCoachPro(state: DemoState, coachId: string): DemoState {
  const coach = state.coaches.find((c) => c.id === coachId);
  if (!coach) throw new Error('Không tìm thấy huấn luyện viên.');

  return {
    ...state,
    subscriptions: state.subscriptions.map((s) =>
      s.coachId === coachId ? { ...s, active: false } : s,
    ),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: coach.name,
      action: 'đã hủy gia hạn gói Coach Pro',
    }),
  };
}
