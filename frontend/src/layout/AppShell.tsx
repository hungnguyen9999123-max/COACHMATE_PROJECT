import { Bell, BookOpen, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, GraduationCap, Menu, Search, Settings, ShieldCheck, Trophy, UserRound } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Badge, Button, Drawer, EmptyState, IconButton, Modal, TextInput } from '../design-system/components';
import { ROLE_LABELS, ROLE_NAVIGATION, roleForPath, type DemoRole } from '../navigation/roleNavigation';
import { profileForRole, SAMPLE_NOTIFICATIONS } from '../data/seed';
import { createBrowserDemoRepository } from '../data/repository';
import { useViewPreference } from '../data/useViewPreference';
import { useDemoRole } from './DemoRoleProvider';
import { AttentionPanel } from './AttentionPanel';
import './app-shell.css';

const PLATFORM_ROLES: DemoRole[] = ['student', 'coach', 'admin', 'organizer'];
const ROLE_ICONS = { student: GraduationCap, coach: UserRound, admin: ShieldCheck, organizer: Trophy };
const PROFILE_ROUTES: Record<DemoRole, string> = { student: '/me/profile', coach: '/coach/profile', admin: '/admin/profile', organizer: '/organizer/profile' };
function BrandMark() {
  return <svg width="23" height="23" viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M6 3l5 19q5 4 10 0l5-19M11 3l2 19M16 3v20M21 3l-2 19M6 3q10-3 20 0M9 14q7-2 14 0M12 24q4 8 8 0"/></svg>;
}
export function AppShell() {
  const location = useLocation(); const navigate = useNavigate();
  const { role, setRole } = useDemoRole();
  const activeRole = roleForPath(location.pathname) ?? role;
  const navigation = ROLE_NAVIGATION[activeRole];
  const entry = navigation.find((item) => item.to === location.pathname);
  const pageTitle = entry?.label ?? (location.pathname.includes('/confirmation/') ? 'Xác nhận đăng ký' : location.pathname.endsWith('/checkout') ? 'Đăng ký khóa học' : location.pathname.startsWith('/courses/') ? 'Chi tiết khóa học' : location.pathname.startsWith('/tournaments/') ? 'Thông tin giải đấu' : 'CoachMate');
  const data = useMemo(() => createBrowserDemoRepository().load(), [location.pathname]);
  const fixtureProfile = profileForRole(activeRole);
  const student = data.students.find((item) => item.id === data.currentStudentId);
  const user = activeRole === 'student' && student ? { name: student.name, meta: `Học viên · ${student.area}` } : fixtureProfile;
  const [collapsed, setCollapsed] = useState(() => window.innerWidth < 1200);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState<'notifications' | 'profile' | null>(null);
  const [searchOpen, setSearchOpen] = useState(false); const [helpOpen, setHelpOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [readNotifications, setReadNotifications] = useViewPreference<string[]>('read-notifications', []);
  const menuArea = useRef<HTMLDivElement>(null);
  const unread = SAMPLE_NOTIFICATIONS.filter((item) => !readNotifications.includes(item.title)).length;
  useEffect(() => { if (activeRole !== role) setRole(activeRole); }, [activeRole, role, setRole]);
  useEffect(() => { setMobileOpen(false); setMenu(null); setSearchOpen(false); window.scrollTo(0, 0); }, [location.pathname]);
  useEffect(() => {
    const close = (event: MouseEvent) => { if (!menuArea.current?.contains(event.target as Node)) setMenu(null); };
    const key = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); setSearchOpen(true); } if (event.key === 'Escape') setMenu(null); };
    const resize = () => { if (window.innerWidth > 760 && window.innerWidth < 1200) setCollapsed(true); };
    document.addEventListener('mousedown', close); window.addEventListener('keydown', key); window.addEventListener('resize', resize);
    return () => { document.removeEventListener('mousedown', close); window.removeEventListener('keydown', key); window.removeEventListener('resize', resize); };
  }, []);
  const markRead = (title: string) => setReadNotifications((current) => current.includes(title) ? current : [...current, title]);
  const switchRole = (next: DemoRole) => { setRole(next); navigate(ROLE_NAVIGATION[next][0].to); setMenu(null); };
  const searchable = [
    ...navigation.map((item) => ({ title: item.label, meta: ROLE_LABELS[activeRole], to: item.to })),
    ...data.courses.filter((item) => item.status === 'published').map((item) => ({ title: item.title, meta: 'Khóa học', to: `/courses/${item.id}` })),
    ...data.tournaments.map((item) => ({ title: item.name, meta: 'Giải đấu', to: `/tournaments/${item.id}` })),
  ].filter((item) => !search.trim() || `${item.title} ${item.meta}`.toLocaleLowerCase('vi-VN').includes(search.trim().toLocaleLowerCase('vi-VN')));
  const sidebar = (compact: boolean) => <>
    <NavLink to={navigation[0].to} className="app-brand" aria-label="CoachMate trang chính"><span className="app-brand-icon"><BrandMark/></span>{!compact && <span className="app-brand-name">COACHMATE<small>CỘNG ĐỒNG CẦU LÔNG</small></span>}</NavLink>
    {!compact && <div className="app-role-chip"><span className="app-role-dot"/>{ROLE_LABELS[activeRole]}</div>}
    <nav className="app-navigation" aria-label={`Điều hướng ${ROLE_LABELS[activeRole]}`}>{navigation.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} end title={compact ? label : undefined} className={({isActive}) => `app-nav-link ${isActive || (to === '/courses' && location.pathname.startsWith('/courses/')) || (to === '/tournaments' && location.pathname.startsWith('/tournaments/')) ? 'is-active' : ''}`}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
    <div className="app-sidebar-bottom">{!compact && <button className="app-help-link" onClick={() => { setMobileOpen(false); setHelpOpen(true); }}><CircleHelp size={18}/> Hướng dẫn bản demo</button>}<div className="app-side-profile"><Avatar name={user.name}/>{!compact && <Link to={PROFILE_ROUTES[activeRole]}><strong>{user.name}</strong><small>{user.meta}</small></Link>}</div><button className="app-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}>{collapsed ? <ChevronRight size={18}/> : <><ChevronLeft size={18}/>Thu gọn menu</>}</button></div>
  </>;
  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className="app-sidebar">{sidebar(collapsed)}</aside>
    <Drawer open={mobileOpen} title="Điều hướng CoachMate" onClose={() => setMobileOpen(false)}><div className="app-mobile-nav">{sidebar(false)}</div></Drawer>
    <div className="app-workspace"><header className="app-header"><div className="app-header-left"><IconButton className="app-mobile-menu" label="Mở menu điều hướng" onClick={() => setMobileOpen(true)}><Menu size={19}/></IconButton><div className="app-header-title"><div className="app-breadcrumb"><span>{ROLE_LABELS[activeRole]}</span><ChevronRight size={13}/><span>{pageTitle}</span></div><h1>{pageTitle}</h1></div></div><div className="app-header-actions" ref={menuArea}>
      <button className="app-search-launch" onClick={() => setSearchOpen(true)} aria-label="Tìm kiếm toàn hệ thống"><Search size={18}/><span>Tìm kiếm...</span><kbd>Ctrl K</kbd></button>
      <div className="app-popover-anchor"><IconButton className="app-notification-button" label={`Thông báo, ${unread} chưa đọc`} aria-expanded={menu === 'notifications'} onClick={() => setMenu(menu === 'notifications' ? null : 'notifications')}><Bell size={19}/>{unread > 0 && <i/>}</IconButton>{menu === 'notifications' && <div className="app-popover app-notifications"><div className="app-popover-heading"><strong>Thông báo <Badge>{unread}</Badge></strong><button disabled={!unread} onClick={() => setReadNotifications(SAMPLE_NOTIFICATIONS.map((item) => item.title))}>Đọc tất cả</button></div>{SAMPLE_NOTIFICATIONS.map((item) => <button key={item.title} className={`app-notification-item ${readNotifications.includes(item.title) ? 'is-read' : ''}`} onClick={() => markRead(item.title)}><i/><span><strong>{item.title}</strong><small>{item.detail}</small><small>{readNotifications.includes(item.title) ? 'Đã đọc' : 'Nhấn để đánh dấu đã đọc'}</small></span></button>)}<div className="app-popover-foot">Thông báo mẫu · Dữ liệu minh họa</div></div>}</div>
      <div className="app-popover-anchor"><button className="app-user-button" aria-label="Mở menu tài khoản" aria-expanded={menu === 'profile'} onClick={() => setMenu(menu === 'profile' ? null : 'profile')}><Avatar name={user.name} size="sm"/><span><strong>{user.name}</strong><small>{ROLE_LABELS[activeRole]}</small></span><ChevronDown size={15}/></button>{menu === 'profile' && <div className="app-popover app-profile-menu"><Link className="app-profile-open" to={PROFILE_ROUTES[activeRole]}><Settings size={16}/> Hồ sơ cá nhân</Link><div className="app-menu-label">CHUYỂN VAI TRÒ DEMO</div>{PLATFORM_ROLES.map((candidate) => { const Icon = ROLE_ICONS[candidate]; return <button key={candidate} className={`app-role-option ${candidate === activeRole ? 'is-current' : ''}`} onClick={() => switchRole(candidate)}><span className="app-role-option-icon"><Icon size={18}/></span><span>{ROLE_LABELS[candidate]}</span>{candidate === activeRole && <Check size={16}/>}</button>; })}</div>}</div>
    </div></header>
    <div className="app-demo-strip"><ShieldCheck size={15}/><span>Bản trình diễn MVP · Dữ liệu lưu trên trình duyệt · Không thu tiền thật</span></div>
    <main className="app-page"><div className="app-page-inner">{location.pathname.endsWith('/dashboard') && <AttentionPanel role={activeRole}/>}<Outlet context={{role:activeRole}}/></div></main></div>
    <Modal open={searchOpen} title="Tìm kiếm CoachMate" onClose={() => setSearchOpen(false)}><div className="app-global-search"><TextInput type="search" aria-label="Từ khóa tìm kiếm toàn hệ thống" autoFocus leadingIcon={<Search size={18}/>} placeholder="Tên khóa học, giải đấu hoặc trang..." value={search} onChange={(event) => setSearch(event.target.value)}/><div className="app-search-results">{searchable.length ? searchable.map((item) => <Link key={`${item.meta}-${item.to}`} to={item.to} onClick={() => setSearchOpen(false)}><BookOpen size={17}/><span><strong>{item.title}</strong><small>{item.meta}</small></span><ChevronRight size={16}/></Link>) : <EmptyState title="Không có kết quả" description="Thử tìm tên khóa học, giải đấu hoặc tên trang."/>}</div></div></Modal>
    <Modal open={helpOpen} title="Khám phá bản demo CoachMate" onClose={() => setHelpOpen(false)}><div className="app-demo-help"><p>Chọn vai trò trong menu tài khoản để khám phá Học viên, Huấn luyện viên, Quản trị hệ thống và Ban tổ chức.</p><p>Đăng ký, thanh toán và các thao tác quản lý đều được mô phỏng. Dữ liệu được lưu trên trình duyệt đang sử dụng.</p><Button onClick={() => { setHelpOpen(false); navigate('/courses'); }}>Khám phá khóa học</Button><Link to="/design-system" onClick={() => setHelpOpen(false)}>Xem thư viện giao diện</Link></div></Modal>
  </div>;
}
