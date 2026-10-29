import type { ActivityLogEntry } from './types';

const MAX_ACTIVITY_ENTRIES = 80;

export function prependActivity(
  activityLogs: ActivityLogEntry[],
  entry: ActivityLogEntry,
): ActivityLogEntry[] {
  return [entry, ...activityLogs].slice(0, MAX_ACTIVITY_ENTRIES);
}
