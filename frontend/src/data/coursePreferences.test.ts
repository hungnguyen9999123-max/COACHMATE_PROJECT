import { describe, expect, it } from 'vitest';
import {
  FAVORITES_STORAGE_KEY,
  loadCoursePreferences,
  saveCoursePreferences,
  toggleFavoriteCourse,
  type PreferenceStorage,
} from './coursePreferences';

class MemoryPreferences implements PreferenceStorage {
  value: string | null = null;
  getItem(key: string) { return key === FAVORITES_STORAGE_KEY ? this.value : null; }
  setItem(key: string, value: string) { if (key === FAVORITES_STORAGE_KEY) this.value = value; }
}

describe('course favorite persistence', () => {
  it('toggles a favorite and persists it with a versioned preference record', () => {
    const storage = new MemoryPreferences();
    const first = toggleFavoriteCourse([], 'k1');
    saveCoursePreferences(storage, { version: 1, favoriteCourseIds: first });
    expect(loadCoursePreferences(storage).favoriteCourseIds).toEqual(['k1']);

    const second = toggleFavoriteCourse(first, 'k1');
    saveCoursePreferences(storage, { version: 1, favoriteCourseIds: second });
    expect(loadCoursePreferences(storage).favoriteCourseIds).toEqual([]);
  });

  it('ignores malformed and unsupported favorite preferences', () => {
    const storage = new MemoryPreferences();
    storage.value = '{broken';
    expect(loadCoursePreferences(storage).favoriteCourseIds).toEqual([]);
    storage.value = JSON.stringify({ version: 8, favoriteCourseIds: ['k2'] });
    expect(loadCoursePreferences(storage).favoriteCourseIds).toEqual([]);
  });
});
