import {
  Activity, BookOpen, CalendarDays, CircleDollarSign, ClipboardList, CreditCard,
  Gauge, GraduationCap, MapPin, Plus, Settings2, Shield, Trophy, UserRound, Users,
  Volleyball,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { PlatformRole } from '../domain/types';

export type DemoRole = PlatformRole;
export interface NavigationEntry { label: string; to: string; icon: ComponentType<{ size?: number; strokeWidth?: number }>; }

export const ROLE_LABELS: Record<DemoRole, string> = {
  student: 'Học viên',
  coach: 'Huấn luyện viên',
  admin: 'Quản trị hệ thống',
  organizer: 'Ban tổ chức giải đấu',
};

export const ROLE_NAVIGATION: Record<DemoRole, NavigationEntry[]> = {
  student: [
    { label: 'Khám phá khóa học', to: '/courses', icon: BookOpen },
    { label: 'Giải đấu', to: '/tournaments', icon: Trophy },
    { label: 'Khóa học của tôi', to: '/me/courses', icon: GraduationCap },
    { label: 'Giải đấu của tôi', to: '/me/tournaments', icon: Volleyball },
    { label: 'Lịch sử thanh toán', to: '/me/payments', icon: CreditCard },
    { label: 'Hồ sơ', to: '/me/profile', icon: UserRound },
  ],
  coach: [
    { label: 'Tổng quan', to: '/coach/dashboard', icon: Gauge },
    { label: 'Khóa học của tôi', to: '/coach/courses', icon: BookOpen },
    { label: 'Tạo khóa học', to: '/coach/courses/new', icon: Plus },
    { label: 'Học viên', to: '/coach/students', icon: Users },
    { label: 'Lịch dạy', to: '/coach/schedule', icon: CalendarDays },
    { label: 'Doanh thu', to: '/coach/revenue', icon: CircleDollarSign },
    { label: 'Coach Pro', to: '/coach/pro', icon: Trophy },
    { label: 'Hồ sơ', to: '/coach/profile', icon: UserRound },
  ],
  admin: [
    { label: 'Tổng quan', to: '/admin/dashboard', icon: Gauge },
    { label: 'Tài khoản & phân quyền', to: '/admin/accounts', icon: Shield },
    { label: 'Huấn luyện viên', to: '/admin/coaches', icon: Users },
    { label: 'Học viên', to: '/admin/students', icon: GraduationCap },
    { label: 'Nội dung & khóa học', to: '/admin/courses', icon: BookOpen },
    { label: 'Giao dịch', to: '/admin/transactions', icon: CreditCard },
    { label: 'Báo cáo', to: '/admin/reports', icon: CircleDollarSign },
    { label: 'Cấu hình hệ thống', to: '/admin/settings', icon: Settings2 },
    { label: 'Nhật ký hoạt động', to: '/admin/activity', icon: Activity },
    { label: 'Hồ sơ cá nhân', to: '/admin/profile', icon: UserRound },
  ],
  organizer: [
    { label: 'Tổng quan giải đấu', to: '/organizer/dashboard', icon: Gauge },
    { label: 'Quản lý giải đấu', to: '/organizer/tournaments', icon: Trophy },
    { label: 'Tạo giải đấu', to: '/organizer/tournaments/new', icon: Plus },
    { label: 'Sân & trọng tài', to: '/organizer/operations', icon: MapPin },
    { label: 'Lịch thi đấu', to: '/organizer/schedule', icon: CalendarDays },
    { label: 'Kết quả & nhánh đấu', to: '/organizer/results', icon: ClipboardList },
    { label: 'Hồ sơ cá nhân', to: '/organizer/profile', icon: UserRound },
  ],
};

export function roleForPath(pathname: string): DemoRole | null {
  if (pathname === '/courses' || pathname.startsWith('/courses/')) return 'student';
  if (pathname === '/tournaments' || pathname.startsWith('/tournaments/') || pathname.startsWith('/me/')) return 'student';
  if (pathname.startsWith('/student/')) return 'student';
  if (pathname === '/coach' || pathname.startsWith('/coach/')) return 'coach';
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return 'admin';
  if (pathname === '/organizer' || pathname.startsWith('/organizer/')) return 'organizer';
  return null;
}
