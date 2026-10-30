export const FAVORITES_STORAGE_KEY = 'coachmate-course-preferences-v1';
const VERSION = 1;

export interface CoursePreferences { version: 1; favoriteCourseIds: string[]; }

export interface PreferenceStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function loadCoursePreferences(storage: PreferenceStorage): CoursePreferences {
  try {
    const parsed: unknown = JSON.parse(storage.getItem(FAVORITES_STORAGE_KEY) ?? 'null');
    if (typeof parsed === 'object' && parsed !== null) {
      const record = parsed as Record<string, unknown>;
      if (record.version === VERSION && Array.isArray(record.favoriteCourseIds)) {
        return {
          version: 1,
          favoriteCourseIds: record.favoriteCourseIds.filter((id): id is string => typeof id === 'string'),
        };
      }
    }
  } catch { /* Invalid or unavailable preference storage falls back to empty favorites. */ }
  return { version: 1, favoriteCourseIds: [] };
}

export function saveCoursePreferences(storage: PreferenceStorage, preferences: CoursePreferences) {
  try { storage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(preferences)); } catch { /* Current view still works if storage is blocked. */ }
}

export function toggleFavoriteCourse(favoriteCourseIds: string[], courseId: string) {
  return favoriteCourseIds.includes(courseId)
    ? favoriteCourseIds.filter((id) => id !== courseId)
    : [...favoriteCourseIds, courseId];
}
