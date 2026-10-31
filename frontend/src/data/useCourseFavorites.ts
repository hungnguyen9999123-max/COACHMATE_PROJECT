import { useCallback, useState } from 'react';
import {
  loadCoursePreferences,
  saveCoursePreferences,
  toggleFavoriteCourse,
} from './coursePreferences';

const storage = {
  getItem: (key: string) => window.localStorage.getItem(key),
  setItem: (key: string, value: string) => window.localStorage.setItem(key, value),
};

export function useCourseFavorites() {
  const [favoriteIds, setFavoriteIds] = useState(() => loadCoursePreferences(storage).favoriteCourseIds);
  const toggleFavorite = useCallback((courseId: string) => {
    setFavoriteIds((current) => {
      const favoriteCourseIds = toggleFavoriteCourse(current, courseId);
      saveCoursePreferences(storage, { version: 1, favoriteCourseIds });
      return favoriteCourseIds;
    });
  }, []);
  return { favoriteIds, toggleFavorite, isFavorite: (courseId: string) => favoriteIds.includes(courseId) };
}
