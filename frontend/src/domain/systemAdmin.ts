import { prependActivity } from './activity';
import type {
  AccountAccessStatus,
  AdminAccountOverride,
  Course,
  DemoState,
  PlatformRole,
} from './types';

export interface SystemAccount {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  status: AccountAccessStatus;
  accountType: 'Học viên' | 'Huấn luyện viên' | 'Quản trị viên' | 'Ban tổ chức';
  area: string;
}

export interface SystemAccountSeed {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
}

export function getSystemAccounts(
  state: DemoState,
  builtInAccounts: readonly SystemAccountSeed[],
): SystemAccount[] {
  const accounts: SystemAccount[] = [
    ...builtInAccounts.map((account) => ({
      ...account,
      status: 'active' as const,
      accountType: account.role === 'admin' ? 'Quản trị viên' as const : 'Ban tổ chức' as const,
      area: '—',
    })),
    ...state.coaches.map((coach) => ({
      id: coach.id,
      name: coach.name,
      email: '',
      role: 'coach' as const,
      status: 'active' as const,
      accountType: 'Huấn luyện viên' as const,
      area: coach.area,
    })),
    ...state.students.map((student) => ({
      id: student.id,
      name: student.name,
      email: student.email,
      role: 'student' as const,
      status: 'active' as const,
      accountType: 'Học viên' as const,
      area: student.area,
    })),
  ];

  return accounts.map((account) => ({
    ...account,
    ...state.accountOverrides?.[account.id],
  }));
}

export function updateSystemAccountByAdmin(
  state: DemoState,
  accountId: string,
  update: Partial<AdminAccountOverride>,
  builtInAccounts: readonly SystemAccountSeed[],
): DemoState {
  const account = getSystemAccounts(state, builtInAccounts).find((candidate) => candidate.id === accountId);
  if (!account) throw new Error('Không tìm thấy tài khoản demo.');

  const override: AdminAccountOverride = {
    role: update.role ?? account.role,
    status: update.status ?? account.status,
  };
  if (override.role === account.role && override.status === account.status) return state;
  const action = override.role !== account.role
    ? `đã cập nhật vai trò demo của ${account.name} thành ${override.role}`
    : `đã ${override.status === 'suspended' ? 'tạm khóa' : 'mở lại'} tài khoản demo ${account.name}`;

  return {
    ...state,
    accountOverrides: {
      ...state.accountOverrides,
      [accountId]: override,
    },
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Quản trị hệ thống',
      action,
    }),
  };
}

export function updateCourseModerationByAdmin(
  state: DemoState,
  courseId: string,
  status: Course['status'],
): DemoState {
  const course = state.courses.find((item) => item.id === courseId);
  if (!course) throw new Error('Không tìm thấy khóa học.');
  if (course.status === status) return state;

  return {
    ...state,
    courses: state.courses.map((item) => item.id === courseId ? { ...item, status } : item),
    activityLogs: prependActivity(state.activityLogs, {
      id: `activity-${Date.now()}`,
      occurredAt: new Date().toISOString(),
      actorName: 'Quản trị hệ thống',
      action: `đã chuyển trạng thái khóa học “${course.title}” thành ${status}`,
    }),
  };
}
