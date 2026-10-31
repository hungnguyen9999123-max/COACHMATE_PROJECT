import type { Coach, Course, CourseFilters, Enrollment } from './types';

export type CourseCapacityStatus =
  | { kind: 'full'; remainingToOpen: 0 }
  | { kind: 'needs_students'; remainingToOpen: number }
  | { kind: 'confirmed'; remainingToOpen: 0 };

export function getCourseEnrollments(courseId: string, enrollments: Enrollment[]) {
  return enrollments.filter((enrollment) => enrollment.courseId === courseId);
}

export function getCourseCapacityStatus(
  course: Course,
  enrollments: Enrollment[],
): CourseCapacityStatus {
  const count = getCourseEnrollments(course.id, enrollments).length;

  if (count >= course.maxStudents) {
    return { kind: 'full', remainingToOpen: 0 };
  }

  if (count < course.minStudents) {
    return { kind: 'needs_students', remainingToOpen: course.minStudents - count };
  }

  return { kind: 'confirmed', remainingToOpen: 0 };
}

export function getCoachRating(coach: Coach): number | null {
  return coach.ratingCount > 0 ? coach.ratingSum / coach.ratingCount : null;
}

export function isCoachPro(coachId: string, activeCoachIds: Set<string>) {
  return activeCoachIds.has(coachId);
}

export function filterAndSortCourses(
  courses: Course[],
  coaches: Coach[],
  activeCoachIds: Set<string>,
  filters: CourseFilters,
) {
  const query = filters.query?.trim().toLocaleLowerCase('vi-VN') ?? '';

  return courses
    .filter((course) => {
      const coach = coaches.find((candidate) => candidate.id === course.coachId);
      const searchableText = `${course.title} ${coach?.name ?? ''} ${course.venue}`.toLocaleLowerCase(
        'vi-VN',
      );

      if (query && !searchableText.includes(query)) return false;
      if (filters.level && course.level !== filters.level) return false;
      if (filters.area && course.area !== filters.area) return false;
      if (filters.scheduleType && course.scheduleType !== filters.scheduleType) return false;
      if (filters.maximumPrice != null && course.price > filters.maximumPrice) return false;
      return course.status === 'published';
    })
    .sort((courseA, courseB) => {
      const proDifference =
        Number(isCoachPro(courseB.coachId, activeCoachIds)) -
        Number(isCoachPro(courseA.coachId, activeCoachIds));

      return proDifference || courseA.startDate.localeCompare(courseB.startDate);
    });
}

export type CourseSort = 'recommended' | 'price-ascending' | 'price-descending' | 'rating';

export function findPublishedCourse(courses: Course[], courseId: string | undefined) {
  return courses.find((course) => course.id === courseId && course.status === 'published') ?? null;
}

export function searchFilterAndSortCourses(
  courses: Course[],
  coaches: Coach[],
  activeCoachIds: Set<string>,
  filters: CourseFilters,
  sort: CourseSort = 'recommended',
) {
  const filtered = filterAndSortCourses(courses, coaches, activeCoachIds, filters);
  const coachById = new Map(coaches.map((coach) => [coach.id, coach]));

  if (sort === 'price-ascending') return filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-descending') return filtered.sort((a, b) => b.price - a.price);
  if (sort === 'rating') {
    return filtered.sort((a, b) => {
      const ratingA = getCoachRating(coachById.get(a.coachId)!) ?? -1;
      const ratingB = getCoachRating(coachById.get(b.coachId)!) ?? -1;
      return ratingB - ratingA || a.startDate.localeCompare(b.startDate);
    });
  }
  return filtered;
}

export function searchCourses(
  courses: Course[],
  coaches: Coach[],
  activeCoachIds: Set<string>,
  filters: CourseFilters,
) {
  return filterAndSortCourses(courses, coaches, activeCoachIds, filters);
}

export function calculateCoachCourseFinancials(
  coachId: string,
  courses: Course[],
  enrollments: Enrollment[],
) {
  const coachCourseIds = new Set(
    courses.filter((course) => course.coachId === coachId).map((course) => course.id),
  );
  const coachEnrollments = enrollments.filter((enrollment) =>
    coachCourseIds.has(enrollment.courseId),
  );

  const grossRevenue = coachEnrollments.reduce((sum, enrollment) => sum + enrollment.price, 0);
  const platformCommission = coachEnrollments.reduce(
    (sum, enrollment) => sum + enrollment.commission,
    0,
  );

  return {
    courseCount: coachCourseIds.size,
    studentCount: coachEnrollments.length,
    grossRevenue,
    platformCommission,
    coachPayout: grossRevenue - platformCommission,
  };
}
