import { Link } from 'react-router-dom';
import { ArrowRight, CircleAlert } from 'lucide-react';
import { createBrowserDemoRepository } from '../data/repository';
import type { DemoRole } from '../navigation/roleNavigation';

export function AttentionPanel({ role }: { role: DemoRole }) {
  const state = createBrowserDemoRepository().load();
  const pending = state.tournamentRegistrations.filter((item) => item.reviewStatus === 'pending').length;
  const needStudents = state.courses.filter((course) => state.enrollments.filter((item) => item.courseId === course.id).length < course.minStudents);
  const actions = role === 'organizer' ? [
    { label: 'Đăng ký đang chờ duyệt', count: pending, to: '/organizer/tournaments' },
    { label: 'Giải đang mở đăng ký', count: state.tournaments.filter((item) => item.status === 'open').length, to: '/organizer/tournaments' },
  ] : role === 'coach' ? [
    { label: 'Khóa học cần thêm học viên', count: needStudents.filter((item) => item.coachId === state.coaches[0]?.id).length, to: '/coach/courses' },
    { label: 'Xem lịch dạy sắp tới', to: '/coach/schedule' },
  ] : role === 'admin' ? [
    { label: 'Kiểm tra nội dung khóa học', to: '/admin/courses' },
    { label: 'Đối chiếu giao dịch demo', to: '/admin/transactions' },
  ] : [];
  if (!actions.length) return null;
  return <section className="attention-panel"><h2><CircleAlert size={17}/> Việc cần theo dõi</h2><div>{actions.map((item) => <Link key={item.to + item.label} to={item.to}>{item.label}{'count' in item && <strong>{item.count}</strong>}<ArrowRight size={15}/></Link>)}</div></section>;
}
