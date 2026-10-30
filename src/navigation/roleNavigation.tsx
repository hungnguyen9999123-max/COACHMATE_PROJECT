import {
  Activity, BookOpen, CalendarDays, CircleDollarSign, ClipboardList, CreditCard,
  Gauge, GraduationCap, MapPin, Plus, Settings2, Trophy, UserRound, Users,
  Volleyball,
} from 'lucide-react';
import type { ComponentType } from 'react';

export type DemoRole = 'student' | 'coach' | 'admin';
export interface NavigationEntry { label: string; to: string; icon: ComponentType<{ size?: number; strokeWidth?: number }>; }

export const ROLE_LABELS: Record<DemoRole, string> = {
  student: 'Học viên',
  coach: 'Huấn luyện viên',
  admin: 'Ban tổ chức',
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
    { label: 'Giải đấu', to: '/admin/tournaments', icon: Trophy },
    { label: 'Tạo giải đấu', to: '/admin/tournaments/new', icon: Plus },
    { label: 'Sân & trọng tài', to: '/admin/operations', icon: MapPin },
    { label: 'Lịch thi đấu', to: '/admin/schedule', icon: CalendarDays },
    { label: 'Kết quả', to: '/admin/results', icon: ClipboardList },
    { label: 'Tài chính', to: '/admin/finance', icon: CircleDollarSign },
    { label: 'Giả định kinh doanh', to: '/admin/assumptions', icon: Settings2 },
    { label: 'Nhật ký hoạt động', to: '/admin/activity', icon: Activity },
  ],
};

export function roleForPath(pathname: string): DemoRole | null {
  if (pathname === '/courses' || pathname.startsWith('/courses/')) return 'student';
  if (pathname === '/tournaments' || pathname.startsWith('/tournaments/') || pathname.startsWith('/me/')) return 'student';
  if (pathname.startsWith('/student/')) return 'student';
  if (pathname.startsWith('/coach/')) return 'coach';
  if (pathname.startsWith('/admin/')) return 'admin';
  return null;
}
