import {
  Bell, ChevronDown, ChevronLeft, ChevronRight, Dumbbell, LogOut,
  Menu, Search, Settings, X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Avatar, Badge, IconButton, useToast } from '../design-system/components';
import { ROLE_LABELS, ROLE_NAVIGATION, roleForPath, type DemoRole } from '../navigation/roleNavigation';
import { useDemoRole } from './DemoRoleProvider';
import './app-shell.css';

const SAMPLE_NOTIFICATIONS = [
  { title: 'Lớp học sắp bắt đầu', detail: 'Cầu lông nền tảng · 19:00 hôm nay', tone: 'green' },
  { title: 'Có học viên mới', detail: 'Lê Hoàng Nam vừa đăng ký', tone: 'lime' },
  { title: 'Giải đấu mới', detail: 'Mini Cup #1 · 06 tháng 12', tone: 'blue' },
];

function profileForRole(role: DemoRole) {
  if (role === 'coach') return { name: 'Nguyễn Minh Khang', meta: 'HLV · Quận 7' };
  if (role === 'admin') return { name: 'Mai Anh', meta: 'Ban tổ chức' };
  return { name: 'Nguyễn An Nhiên', meta: 'Học viên · Quận 7' };
}

export function AppShell() {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  const { role, setRole } = useDemoRole();
  const routeRole = roleForPath(location.pathname);
  const activeRole = routeRole ?? role;
  const navigation = ROLE_NAVIGATION[activeRole];
  const currentEntry = navigation.find((item) => item.to === location.pathname);
  const pageTitle = currentEntry?.label ?? (location.pathname.startsWith('/courses/') ? 'Chi tiết khóa học' : location.pathname.startsWith('/tournaments/') ? location.pathname.endsWith('/register') ? 'Đăng ký giải đấu' : 'Chi tiết giải đấu' : 'Trang demo');
  const user = profileForRole(activeRole);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menu, setMenu] = useState<'notifications' | 'profile' | null>(null);
  const [search, setSearch] = useState('');
  const menuArea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (routeRole && routeRole !== role) setRole(routeRole);
  }, [routeRole, role, setRole]);

  useEffect(() => {
    setMobileOpen(false);
    setMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const closeMenu = (event: MouseEvent) => {
      if (menuArea.current && !menuArea.current.contains(event.target as Node)) setMenu(null);
    };
    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  const breadcrumb = useMemo(() => [activeRole === 'student' ? 'Học viên' : activeRole === 'coach' ? 'Huấn luyện viên' : 'Ban tổ chức', pageTitle], [activeRole, pageTitle]);

  const switchRole = (nextRole: DemoRole) => {
    setRole(nextRole);
    const nextRoute = ROLE_NAVIGATION[nextRole][0].to;
    navigate(nextRoute);
    setMenu(null);
    toast(`Đã chuyển sang vai trò ${ROLE_LABELS[nextRole]}.`, 'info');
  };

  const sidebarContent = <>
    <NavLink to={navigation[0].to} className="app-brand" aria-label="CoachMate trang chính">
      <span className="app-brand-icon"><Dumbbell size={19}/></span>
      {!collapsed && <span className="app-brand-name">COACH<span>MATE</span><small>SPORTS COMMUNITY</small></span>}
    </NavLink>
    {!collapsed && <div className="app-role-chip"><span className="app-role-dot"/>{ROLE_LABELS[activeRole]}<Badge tone="lime">DEMO</Badge></div>}
    <nav className="app-navigation" aria-label={`Điều hướng ${ROLE_LABELS[activeRole]}`}>
      {navigation.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} title={collapsed ? label : undefined} className={({ isActive }) => `app-nav-link ${isActive ? 'is-active' : ''}`}>
        <Icon size={18} strokeWidth={1.8}/><span>{label}</span>{label === 'Coach Pro' && <i className="app-nav-spark">✦</i>}
      </NavLink>)}
    </nav>
    <div className="app-sidebar-bottom">
      {!collapsed && <div className="app-help-card"><span>Đồng hành cùng bạn</span><strong>Cần hỗ trợ?</strong><button onClick={() => toast('Đội ngũ CoachMate luôn sẵn sàng hỗ trợ bạn.', 'info')}>Trung tâm trợ giúp <ChevronRight size={14}/></button></div>}
      <div className="app-side-profile"><Avatar name={user.name}/>{!collapsed && <><span><strong>{user.name}</strong><small>{user.meta}</small></span><button aria-label="Mở hồ sơ demo" onClick={() => setMenu(menu === 'profile' ? null : 'profile')}><ChevronDown size={15}/></button></>}</div>
      <button className="app-collapse" onClick={() => setCollapsed(!collapsed)} aria-label={collapsed ? 'Mở rộng thanh điều hướng' : 'Thu gọn thanh điều hướng'}>{collapsed ? <ChevronRight size={17}/> : <><ChevronLeft size={17}/><span>Thu gọn menu</span></>}</button>
    </div>
  </>;

  return <div className={`app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className="app-sidebar">{sidebarContent}</aside>
    {mobileOpen && <div className="app-mobile-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setMobileOpen(false); }}><aside className="app-mobile-drawer"><div className="app-mobile-close"><span>Điều hướng</span><IconButton label="Đóng menu" onClick={() => setMobileOpen(false)}><X size={18}/></IconButton></div><NavLink to={navigation[0].to} className="app-brand"><span className="app-brand-icon"><Dumbbell size={19}/></span><span className="app-brand-name">COACH<span>MATE</span><small>SPORTS COMMUNITY</small></span></NavLink><div className="app-role-chip"><span className="app-role-dot"/>{ROLE_LABELS[activeRole]}<Badge tone="lime">DEMO</Badge></div><nav className="app-navigation" aria-label={`Điều hướng ${ROLE_LABELS[activeRole]}`}>{navigation.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `app-nav-link ${isActive ? 'is-active' : ''}`}><Icon size={18}/><span>{label}</span></NavLink>)}</nav><div className="app-sidebar-bottom"><div className="app-side-profile"><Avatar name={user.name}/><span><strong>{user.name}</strong><small>{user.meta}</small></span></div></div></aside></div>}
    <div className="app-workspace">
      <header className="app-header">
        <div className="app-header-left"><IconButton className="app-mobile-menu" label="Mở menu điều hướng" onClick={() => setMobileOpen(true)}><Menu size={19}/></IconButton><div className="app-header-title"><div className="app-breadcrumb">{breadcrumb.map((part, index) => <span key={`${part}-${index}`} className={index === breadcrumb.length - 1 ? 'current' : ''}>{index > 0 && <ChevronRight size={13}/ >}{part}</span>)}</div><h1>{pageTitle}</h1></div></div>
        <div className="app-header-actions" ref={menuArea}>
          <form className="app-search" onSubmit={(event) => { event.preventDefault(); toast(search ? `Đang tìm “${search}” trong bản demo.` : 'Nhập nội dung để tìm kiếm.', 'info'); }}><Search size={17}/><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm kiếm..." aria-label="Tìm kiếm trong bản demo"/><kbd>⌘ K</kbd></form>
          <div className="app-popover-anchor">
            <IconButton className="app-notification-button" label="Thông báo" onClick={() => setMenu(menu === 'notifications' ? null : 'notifications')}><Bell size={18}/><i/></IconButton>
            {menu === 'notifications' && <div className="app-popover app-notifications"><div className="app-popover-heading"><strong>Thông báo</strong><button onClick={() => toast('Đã đánh dấu tất cả là đã đọc.')}>Đánh dấu đã đọc</button></div>{SAMPLE_NOTIFICATIONS.map((item) => <button className="app-notification-item" key={item.title} onClick={() => {setMenu(null);toast(item.detail,'info');}}><i className={item.tone}/><span><strong>{item.title}</strong><small>{item.detail}</small></span></button>)}<div className="app-popover-foot">Thông báo mẫu trong môi trường demo</div></div>}
          </div>
          <div className="app-popover-anchor">
            <button className="app-user-button" onClick={() => setMenu(menu === 'profile' ? null : 'profile')} aria-expanded={menu === 'profile'}><Avatar name={user.name} size="sm"/><span><strong>{user.name}</strong><small>{ROLE_LABELS[activeRole]}</small></span><ChevronDown size={15}/></button>
            {menu === 'profile' && <div className="app-popover app-profile-menu"><div className="app-profile-summary"><Avatar name={user.name}/><span><strong>{user.name}</strong><small>{user.meta}</small></span></div><div className="app-menu-label">CHUYỂN VAI TRÒ DEMO</div>{(['student','coach','admin'] as DemoRole[]).map((candidate) => <button key={candidate} className={`app-role-option ${activeRole === candidate ? 'is-current' : ''}`} onClick={() => switchRole(candidate)}><span className="app-role-option-icon">{candidate === 'student' ? '🏸' : candidate === 'coach' ? '🎾' : '🏆'}</span><span>{ROLE_LABELS[candidate]}<small>{candidate === 'student' ? 'Nguyễn An Nhiên' : candidate === 'coach' ? 'Nguyễn Minh Khang' : 'Mai Anh'}</small></span>{activeRole === candidate && <span className="app-check">✓</span>}</button>)}<div className="app-profile-actions"><button onClick={() => toast('Hồ sơ demo sẽ có ở sprint tiếp theo.','info')}><Settings size={15}/>Cài đặt tài khoản</button><button onClick={() => toast('Đây là phiên demo, không cần đăng xuất.','info')}><LogOut size={15}/>Kết thúc xem thử</button></div></div>}
          </div>
        </div>
      </header>
      <div className="app-demo-banner"><span>✦</span><p><strong>Không gian trải nghiệm CoachMate</strong><small>Dữ liệu và giao dịch trong đây đều là mô phỏng.</small></p><button onClick={() => toast('Dữ liệu demo được lưu trên thiết bị của bạn.','info')}>Tìm hiểu thêm <ChevronRight size={14}/></button></div>
      <main className="app-page"><div className="app-page-inner"><Outlet context={{ role: activeRole }}/></div></main>
    </div>
  </div>;
}
