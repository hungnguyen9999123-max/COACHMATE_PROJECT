import {
  ArrowRight, BookOpen, CircleDollarSign, CreditCard,
  GraduationCap, ShieldCheck, Trophy, Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Button, Card, Select, TextInput, useToast } from '../design-system/components';
import { SYSTEM_DEMO_ACCOUNTS } from '../data/seed';
import { createBrowserDemoRepository } from '../data/repository';
import {
  getSystemAccounts, updateCourseModerationByAdmin, updateSystemAccountByAdmin,
  type SystemAccount,
} from '../domain/systemAdmin';
import type { AccountAccessStatus, Course, DemoState, PaymentKind, PlatformRole } from '../domain/types';
import { calculatePlatformTotals } from '../domain/finance';
import './system-admin.css';

function loadState() {
  return createBrowserDemoRepository().load();
}

function saveState(state: DemoState) {
  createBrowserDemoRepository().save(state);
}

function formatCurrency(amount: number) {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

const PLATFORM_ROLES: { value: PlatformRole; label: string }[] = [
  { value: 'student', label: 'Học viên' },
  { value: 'coach', label: 'Huấn luyện viên' },
  { value: 'admin', label: 'Quản trị hệ thống' },
  { value: 'organizer', label: 'Ban tổ chức giải đấu' },
];

function parseRole(value: string): PlatformRole | undefined {
  return PLATFORM_ROLES.find((role) => role.value === value)?.value;
}

function parseCourseStatus(value: string): Course['status'] | undefined {
  if (value === 'published' || value === 'draft' || value === 'archived') return value;
  return undefined;
}

function PageHeader({ title, description, badge }: { title: string; description: string; badge?: string }) {
  return <header className="sys-admin-header">
    <div>{badge && <Badge tone="info">{badge}</Badge>}<h2>{title}</h2><p>{description}</p></div>
  </header>;
}

export function AdminSystemDashboardPage() {
  const data = loadState();
  const totals = calculatePlatformTotals(data);
  const accounts = getSystemAccounts(data, SYSTEM_DEMO_ACCOUNTS);
  const suspendedCount = accounts.filter((account) => account.status === 'suspended').length;
  const shortcuts = [
    { to: '/admin/accounts', label: 'Tài khoản & phân quyền', detail: `${accounts.length} tài khoản`, icon: ShieldCheck },
    { to: '/admin/courses', label: 'Nội dung & khóa học', detail: `${data.courses.length} khóa học`, icon: BookOpen },
    { to: '/admin/transactions', label: 'Giao dịch', detail: `${data.payments.length} giao dịch`, icon: CreditCard },
    { to: '/admin/reports', label: 'Báo cáo nền tảng', detail: 'Tài chính và phễu đăng ký', icon: CircleDollarSign },
  ];

  return <div className="sys-admin-page">
    <PageHeader badge="QUẢN TRỊ HỆ THỐNG" title="Tổng quan CoachMate" description="Quản lý tài khoản, nội dung, giao dịch và cấu hình nền tảng."/>
    <div className="sys-admin-metrics">
      <MetricCard icon={<Users size={18}/>} label="Tài khoản" value={accounts.length.toLocaleString('vi-VN')} note={`${suspendedCount} tài khoản đang tạm khóa`}/>
      <MetricCard icon={<BookOpen size={18}/>} label="Khóa học" value={data.courses.length.toLocaleString('vi-VN')} note={`${data.courses.filter((course) => course.status === 'published').length} đang xuất bản`}/>
      <MetricCard icon={<CreditCard size={18}/>} label="Giao dịch" value={data.payments.length.toLocaleString('vi-VN')} note={`${data.payments.filter((payment) => payment.status === 'completed').length} khoản phí đã ghi nhận`}/>
      <MetricCard icon={<CircleDollarSign size={18}/>} label="Doanh thu ghi nhận" value={formatCurrency(totals.platformRevenue)} note="Theo các khoản phí trên hồ sơ"/>
    </div>
    <section className="sys-admin-shortcuts" aria-label="Điều hướng quản trị">
      {shortcuts.map(({ to, label, detail, icon: Icon }) => <Link className="sys-admin-shortcut" key={to} to={to}>
        <span className="sys-admin-shortcut-icon"><Icon size={19}/></span><span><strong>{label}</strong><small>{detail}</small></span><ArrowRight size={17}/>
      </Link>)}
      <Link className="sys-admin-shortcut" to="/admin/coaches"><span className="sys-admin-shortcut-icon"><Trophy size={19}/></span><span><strong>Quản lý huấn luyện viên</strong><small>{data.coaches.length} hồ sơ Coach</small></span><ArrowRight size={17}/></Link>
      <Link className="sys-admin-shortcut" to="/admin/students"><span className="sys-admin-shortcut-icon"><GraduationCap size={19}/></span><span><strong>Quản lý học viên</strong><small>{data.students.length} hồ sơ Student</small></span><ArrowRight size={17}/></Link>
    </section>
    <Card className="sys-admin-recent">
      <div className="sys-admin-section-heading"><div><h3>Hoạt động quản trị gần đây</h3><p>Lịch sử thay đổi trên nền tảng.</p></div><Link to="/admin/activity">Xem nhật ký <ArrowRight size={15}/></Link></div>
      {data.activityLogs.length ? <ul>{data.activityLogs.slice(0, 5).map((entry) => <li key={entry.id}><span><strong>{entry.actorName}</strong> {entry.action}</span><time>{new Date(entry.occurredAt).toLocaleString('vi-VN')}</time></li>)}</ul> : <p className="sys-admin-empty">Chưa có hoạt động nào.</p>}
    </Card>
  </div>;
}

function MetricCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <Card className="sys-admin-metric"><span className="sys-admin-metric-icon">{icon}</span><span className="sys-admin-metric-label">{label}</span><strong>{value}</strong><small>{note}</small></Card>;
}

function AccountDirectory({ accountType }: { accountType?: SystemAccount['accountType'] }) {
  const [data, setData] = useState(loadState);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const toast = useToast();
  const accounts = useMemo(() => getSystemAccounts(data, SYSTEM_DEMO_ACCOUNTS).filter((account) => {
    const matchesType = !accountType || account.accountType === accountType;
    const searchText = `${account.name} ${account.email} ${account.area}`.toLocaleLowerCase('vi');
    return matchesType && searchText.includes(query.trim().toLocaleLowerCase('vi'))
      && (!roleFilter || account.role === roleFilter)
      && (!statusFilter || account.status === statusFilter);
  }), [accountType, data, query, roleFilter, statusFilter]);

  const updateAccount = (account: SystemAccount, update: { role?: PlatformRole; status?: AccountAccessStatus }) => {
    try {
      const next = updateSystemAccountByAdmin(data, account.id, update, SYSTEM_DEMO_ACCOUNTS);
      saveState(next);
      setData(next);
      toast('Đã lưu thay đổi tài khoản.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Không thể lưu thay đổi tài khoản.', 'error');
    }
  };

  const title = accountType === 'Huấn luyện viên' ? 'Quản lý huấn luyện viên'
    : accountType === 'Học viên' ? 'Quản lý học viên'
      : 'Tài khoản & phân quyền';

  return <div className="sys-admin-page">
    <PageHeader badge="QUẢN TRỊ TÀI KHOẢN" title={title} description="Tra cứu hồ sơ và cập nhật vai trò, trạng thái tài khoản."/>
    <div className="sys-admin-toolbar">
      <TextInput type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm theo tên, email hoặc khu vực" aria-label="Tìm tài khoản"/>
      {!accountType && <Select aria-label="Lọc theo vai trò" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
        <option value="">Tất cả vai trò</option>{PLATFORM_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
      </Select>}
      <Select aria-label="Lọc trạng thái tài khoản" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
        <option value="">Mọi trạng thái</option><option value="active">Đang hoạt động</option><option value="suspended">Tạm khóa</option>
      </Select>
      <Badge tone="neutral">{accounts.length} tài khoản</Badge>
    </div>
    <Card className="sys-admin-table-card">
      <div className="sys-admin-table-wrap"><table className="sys-admin-table">
        <thead><tr><th>Tài khoản</th><th>Loại hồ sơ</th><th>Khu vực</th><th>Vai trò</th><th>Trạng thái</th><th>Thao tác</th></tr></thead>
        <tbody>{accounts.map((account) => <tr key={account.id}>
          <td><strong>{account.name}</strong><small>{account.email || 'Chưa cập nhật email'}</small></td>
          <td>{account.accountType}</td><td>{account.area || '—'}</td>
          <td><Select aria-label={`Vai trò của ${account.name}`} value={account.role} onChange={(event) => {
            const role = parseRole(event.target.value);
            if (role) updateAccount(account, { role });
          }}>{PLATFORM_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}</Select></td>
          <td><Badge tone={account.status === 'active' ? 'success' : 'warning'} dot>{account.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}</Badge></td>
          <td><Button size="sm" variant={account.status === 'active' ? 'outline' : 'secondary'} onClick={() => updateAccount(account, { status: account.status === 'active' ? 'suspended' : 'active' })}>{account.status === 'active' ? 'Tạm khóa' : 'Mở lại'}</Button></td>
        </tr>)}</tbody>
      </table></div>
      {!accounts.length && <p className="sys-admin-empty">Không tìm thấy tài khoản phù hợp.</p>}
    </Card>
  </div>;
}

export function AdminAccountsPage() { return <AccountDirectory/>; }
export function AdminCoachesPage() { return <AccountDirectory accountType="Huấn luyện viên"/>; }
export function AdminStudentsPage() { return <AccountDirectory accountType="Học viên"/>; }

export function AdminCoursesPage() {
  const [data, setData] = useState(loadState);
  const [query, setQuery] = useState('');
  const toast = useToast();
  const courses = data.courses.filter((course) => {
    const coach = data.coaches.find((item) => item.id === course.coachId);
    return `${course.title} ${coach?.name ?? ''}`.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'));
  });

  const updateStatus = (course: Course, value: string) => {
    const status = parseCourseStatus(value);
    if (!status) return;
    try {
      const next = updateCourseModerationByAdmin(data, course.id, status);
      saveState(next);
      setData(next);
      toast('Đã cập nhật trạng thái nội dung khóa học.');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Không thể cập nhật khóa học.', 'error');
    }
  };

  return <div className="sys-admin-page">
    <PageHeader badge="KIỂM DUYỆT NỘI DUNG" title="Nội dung & khóa học" description="Kiểm tra nội dung và cập nhật trạng thái xuất bản. Enrollment và giao dịch lịch sử được giữ nguyên."/>
    <div className="sys-admin-toolbar"><TextInput type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm khóa học hoặc huấn luyện viên" aria-label="Tìm khóa học"/><Badge tone="neutral">{courses.length} khóa học</Badge></div>
    <Card className="sys-admin-table-card"><div className="sys-admin-table-wrap"><table className="sys-admin-table">
      <thead><tr><th>Khóa học</th><th>Huấn luyện viên</th><th>Đăng ký</th><th>Học phí</th><th>Trạng thái nội dung</th></tr></thead>
      <tbody>{courses.map((course) => <tr key={course.id}>
        <td><strong>{course.title}</strong><small>{course.area} · {course.venue}</small></td>
        <td>{data.coaches.find((coach) => coach.id === course.coachId)?.name ?? '—'}</td>
        <td>{data.enrollments.filter((enrollment) => enrollment.courseId === course.id).length}/{course.maxStudents}</td>
        <td>{formatCurrency(course.price)}</td>
        <td><Select aria-label={`Trạng thái nội dung ${course.title}`} value={course.status} onChange={(event) => updateStatus(course, event.target.value)}>
          <option value="published">Đang xuất bản</option><option value="draft">Bản nháp</option><option value="archived">Đã lưu trữ</option>
        </Select></td>
      </tr>)}</tbody>
    </table></div>{!courses.length && <p className="sys-admin-empty">Không tìm thấy khóa học phù hợp.</p>}</Card>
  </div>;
}

const PAYMENT_KINDS: Record<PaymentKind, string> = {
  course: 'Khóa học',
  tournament: 'Giải đấu',
  subscription: 'Coach Pro',
};

export function AdminTransactionsPage() {
  const data = loadState();
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState('');
  const payments = data.payments.filter((payment) => {
    const matchesQuery = `${payment.payerName} ${payment.referenceId}`.toLocaleLowerCase('vi').includes(query.trim().toLocaleLowerCase('vi'));
    return matchesQuery && (!kind || payment.kind === kind);
  });

  return <div className="sys-admin-page">
    <PageHeader badge="QUẢN LÝ GIAO DỊCH" title="Giao dịch" description="Tra cứu lịch sử thanh toán và trạng thái các khoản phí trên nền tảng."/>
    <div className="sys-admin-notice" role="note"><CreditCard size={18}/><span>Giao dịch DEMO / MÔ PHỎNG. Không thu hoặc hoàn tiền thật; dữ liệu chỉ được ghi nhận trên trình duyệt.</span></div>
    <div className="sys-admin-toolbar"><TextInput type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm người thanh toán hoặc mã tham chiếu" aria-label="Tìm giao dịch"/>
      <Select aria-label="Lọc loại giao dịch" value={kind} onChange={(event) => setKind(event.target.value)}><option value="">Tất cả loại</option>{Object.entries(PAYMENT_KINDS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select>
      <Badge tone="neutral">{payments.length} giao dịch</Badge>
    </div>
    <Card className="sys-admin-table-card"><div className="sys-admin-table-wrap"><table className="sys-admin-table">
      <thead><tr><th>Thời gian</th><th>Người thanh toán</th><th>Loại</th><th>Mã tham chiếu</th><th>Số tiền</th><th>Phí thanh toán</th><th>Trạng thái</th></tr></thead>
      <tbody>{payments.map((payment) => <tr key={payment.id}>
        <td>{new Date(payment.createdAt).toLocaleString('vi-VN')}</td><td><strong>{payment.payerName}</strong></td><td>{PAYMENT_KINDS[payment.kind]}</td>
        <td><code>{payment.referenceId}</code></td><td>{formatCurrency(payment.amount)}</td><td>{formatCurrency(payment.paymentFee)}</td>
        <td><Badge tone={payment.status === 'completed' ? 'success' : 'warning'}>{payment.status === 'completed' ? 'Hoàn tất mô phỏng' : 'Đã hoàn mô phỏng'}</Badge></td>
      </tr>)}</tbody>
    </table></div>{!payments.length && <p className="sys-admin-empty">Không tìm thấy giao dịch phù hợp.</p>}</Card>
  </div>;
}
