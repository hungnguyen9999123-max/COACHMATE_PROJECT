import { ArrowRight, BadgeCheck, CalendarDays, ClipboardList, Mail, ShieldCheck, Trophy, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, Badge, Card } from '../design-system/components';
import { profileForRole } from '../data/seed';
import { createBrowserDemoRepository } from '../data/repository';
import { ROLE_LABELS, type DemoRole } from '../navigation/roleNavigation';

const ACCOUNT_EMAILS: Partial<Record<DemoRole, string>> = {
  admin: 'admin@coachmate.vn',
  organizer: 'organizer@coachmate.vn',
};

const ROLE_RESPONSIBILITIES: Record<'admin' | 'organizer', string[]> = {
  admin: ['Quản lý tài khoản và vai trò', 'Kiểm duyệt nội dung, khóa học', 'Theo dõi giao dịch và báo cáo'],
  organizer: ['Tổ chức và quản lý giải đấu', 'Duyệt đăng ký vận động viên', 'Xếp lịch, cập nhật kết quả và thứ hạng'],
};

export function AccountProfilePage({ role }: { role: 'admin' | 'organizer' }) {
  const profile = profileForRole(role);
  const email = ACCOUNT_EMAILS[role]!;
  const state = createBrowserDemoRepository().load();
  const metrics = role === 'admin'
    ? [
      { icon: Users, value: `${state.students.length + state.coaches.length + 2}`, label: 'Tài khoản quản lý' },
      { icon: ShieldCheck, value: `${state.courses.length}`, label: 'Khóa học trên nền tảng' },
      { icon: ClipboardList, value: `${state.activityLogs.length}`, label: 'Hoạt động gần đây' },
    ]
    : [
      { icon: Trophy, value: `${state.tournaments.length}`, label: 'Giải đấu quản lý' },
      { icon: Users, value: `${state.tournamentRegistrations.length}`, label: 'Lượt đăng ký' },
      { icon: CalendarDays, value: `${state.matches.length}`, label: 'Trận trong lịch đấu' },
    ];

  return <div className="account-profile-page">
    <header className="account-profile-heading">
      <div><Badge tone="success"><BadgeCheck size={14}/> THÔNG TIN TÀI KHOẢN</Badge><h2>Hồ sơ cá nhân</h2><p>Thông tin làm việc và phạm vi quản lý của bạn trên CoachMate.</p></div>
    </header>
    <section className="account-profile-hero">
      <div className="account-profile-identity">
        <Avatar name={profile.name} size="lg"/>
        <div><span className="account-profile-eyebrow">{ROLE_LABELS[role]}</span><h3>{profile.name}</h3><span className="account-profile-meta">{profile.meta}</span></div>
      </div>
      <Badge tone="success"><span className="account-active-dot"/> Đang hoạt động</Badge>
    </section>
    <div className="account-profile-metrics">
      {metrics.map(({ icon: Icon, value, label }) => <Card key={label} className="account-profile-metric"><span><Icon size={18}/></span><strong>{value}</strong><small>{label}</small></Card>)}
    </div>
    <div className="account-profile-layout">
      <Card className="account-profile-details">
        <div className="account-profile-section-heading"><div><span>ACCOUNT</span><h3>Thông tin liên hệ</h3></div><ShieldCheck size={20}/></div>
        <div className="account-profile-detail-row"><span><Mail size={17}/> Email công việc</span><strong>{email}</strong></div>
        <div className="account-profile-detail-row"><span><ShieldCheck size={17}/> Vai trò</span><strong>{ROLE_LABELS[role]}</strong></div>
        <div className="account-profile-detail-row"><span><BadgeCheck size={17}/> Trạng thái</span><strong className="account-profile-status">Đang hoạt động</strong></div>
      </Card>
      <Card className="account-profile-responsibilities">
        <div className="account-profile-section-heading"><div><span>WORKSPACE</span><h3>Phạm vi công việc</h3></div></div>
        <ul>{ROLE_RESPONSIBILITIES[role].map((responsibility) => <li key={responsibility}><BadgeCheck size={16}/>{responsibility}</li>)}</ul>
        <Link to={role === 'admin' ? '/admin/dashboard' : '/organizer/dashboard'}>Mở tổng quan công việc <ArrowRight size={15}/></Link>
      </Card>
    </div>
  </div>;
}
