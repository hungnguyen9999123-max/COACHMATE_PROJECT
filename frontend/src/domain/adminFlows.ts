import { prependActivity } from './activity';
import type { DemoState, ValidationStatus } from './types';

export function updateBusinessSettingsByAdmin(
  state: DemoState,
  settings: DemoState['settings'],
): DemoState {
  return {
    ...state,
    settings,
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Quản trị hệ thống',
      action: 'đã cập nhật cấu hình tham số kinh doanh hệ thống',
    }),
  };
}

export function updateAssumptionStatusByAdmin(
  state: DemoState,
  assumptionText: string,
  status: ValidationStatus,
): DemoState {
  return {
    ...state,
    assumptionStatuses: {
      ...state.assumptionStatuses,
      [assumptionText]: status,
    },
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Quản trị hệ thống',
      action: `cập nhật giả định kinh doanh: “${assumptionText.slice(0, 30)}...” sang ${status}`,
    }),
  };
}
