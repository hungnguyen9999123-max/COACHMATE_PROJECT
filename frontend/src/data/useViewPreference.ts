import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

/** Presentation preferences only; never writes domain demo records. */
export function useViewPreference<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>] {
  const storageKey = `coachmate-view-v1:${key}`;
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = JSON.parse(sessionStorage.getItem(storageKey) ?? 'null');
      return saved?.version === 1 ? saved.value as T : initial;
    } catch { return initial; }
  });
  useEffect(() => {
    try { sessionStorage.setItem(storageKey, JSON.stringify({ version: 1, value })); } catch { /* Session still works without browser storage. */ }
  }, [storageKey, value]);
  return [value, setValue];
}
