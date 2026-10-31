import { ArrowLeft, ArrowRight, BadgeCheck, BookOpen, CalendarDays, CheckCircle2, CircleAlert, CreditCard, GraduationCap, Mail, MapPin, Phone, Search, ShieldCheck, Trophy, Users } from 'lucide-react';
import { useMemo, useRef, useState, type FormEvent } from 'react';
import { SportImage } from '../design-system/SportImage';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, EmptyState, FormField, PriceDisplay, Select, TextInput, useToast } from '../design-system/components';
import { createBrowserDemoRepository } from '../data/repository';
import { useViewPreference } from '../data/useViewPreference';
import { DEFAULT_COURSE_COVER_IMAGE } from '../domain/constants';
import { findPublishedCourse } from '../domain/courses';
import { createCourseEnrollment, createTournamentRegistration, getStudentCourses, getStudentPayments, getStudentTournaments, updateStudentProfile, type PaymentMethod } from '../domain/studentFlows';
import type { DemoState, Student, TournamentStatus } from '../domain/types';
import './student-journey.css';

const PAYMENT_METHODS: PaymentMethod[] = ['Ví MoMo', 'Chuyển khoản ngân hàng', 'Thẻ ATM / Visa'];
const money = (value: number) => `${new Intl.NumberFormat('vi-VN').format(value)}đ`;
const date = (value: string) => value ? new Date(`${value.slice(0,10)}T00:00:00`).toLocaleDateString('vi-VN') : '—';
function loadState() { return createBrowserDemoRepository().load(); }
function saveState(state: DemoState) { createBrowserDemoRepository().save(state); }
function currentStudent(state: DemoState) { return state.students.find((student) => student.id === state.currentStudentId)!; }

function CheckoutFields({ student, includePartner = false, onSubmit, submitLabel }: {
  student: Student; includePartner?: boolean; onSubmit: (values: { name: string; phone: string; email: string; partnerName: string; method: PaymentMethod }) => void; submitLabel: string;
}) {
  const [name, setName] = useState(student.name);
  const [phone, setPhone] = useState(student.phone);
  const [email, setEmail] = useState(student.email);
  const [partnerName, setPartnerName] = useState('');
  const [method, setMethod] = useState<PaymentMethod>('Ví MoMo');
  const [error, setError] = useState('');
  const [reviewing, setReviewing] = useState(false);
  const submit = (event: FormEvent) => { event.preventDefault(); if (!name.trim() || !phone.trim() || phone.replace(/\D/g,'').length < 9 || (includePartner && !partnerName.trim())) { setError('Kiểm tra họ tên, số điện thoại và thông tin đồng đội.'); return; } setError(''); if (!reviewing) { setReviewing(true); return; } onSubmit({ name, phone, email, partnerName, method }); };
  return <form className="journey-form" onSubmit={submit}>
    {reviewing && <section className="journey-review" aria-label="Kiểm tra thông tin trước khi xác nhận"><h3>Kiểm tra lại thông tin</h3><dl><div><dt>Học viên</dt><dd>{name}</dd></div><div><dt>Số điện thoại</dt><dd>{phone}</dd></div>{includePartner && <div><dt>Đồng đội</dt><dd>{partnerName}</dd></div>}<div><dt>Phương thức demo</dt><dd>{method}</dd></div></dl><Button type="button" variant="outline" onClick={() => setReviewing(false)}>Chỉnh sửa thông tin</Button></section>}
    <fieldset hidden={reviewing} style={{border:0,padding:0,margin:0}}><div className="journey-form-grid"><FormField label="Họ và tên" required><TextInput autoComplete="name" value={name} onChange={(event) => setName(event.target.value)}/></FormField><FormField label="Số điện thoại" required><TextInput autoComplete="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)}/></FormField><FormField label="Email"><TextInput type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)}/></FormField>{includePartner && <FormField label="Tên đồng đội" required><TextInput value={partnerName} onChange={(event) => setPartnerName(event.target.value)} placeholder="Họ và tên đồng đội"/></FormField>}<FormField label="Phương thức thanh toán demo"><Select value={method} onChange={(event) => setMethod(event.target.value as PaymentMethod)}>{PAYMENT_METHODS.map((item) => <option key={item}>{item}</option>)}</Select></FormField></div></fieldset>
    {error && <p className="journey-inline-error" role="alert"><CircleAlert size={15}/>{error}</p>}
    <div className="journey-demo-disclosure"><ShieldCheck size={17}/><span><strong>Thanh toán DEMO · Không thu tiền thật</strong><small>Xác nhận sẽ tạo đăng ký và giao dịch mô phỏng trong trình duyệt. Đăng ký giải đấu vẫn cần Ban tổ chức duyệt.</small></span></div>
    <Button type="submit">{reviewing ? submitLabel : 'Kiểm tra thông tin'} <ArrowRight size={16}/></Button>
  </form>;
}

export function CourseCheckout() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const data = useMemo(loadState, []);
  const submitting = useRef(false);
  const course = findPublishedCourse(data.courses, courseId);
  if (!course) return <JourneyNotFound title="Không tìm thấy khóa học" backTo="/courses"/>;
  const coach = data.coaches.find((item) => item.id === course.coachId);
  const enrolled = data.enrollments.filter((item) => item.courseId === course.id).length;
  const alreadyEnrolled = data.enrollments.some((item) => item.courseId === course.id && item.studentId === data.currentStudentId);
  if (alreadyEnrolled) return <CheckoutResult title="Bạn đã đăng ký khóa học này" detail={course.title} backTo="/me/courses"/>;
  if (enrolled >= course.maxStudents) return <JourneyNotFound title="Khóa học đã đủ chỗ" backTo={`/courses/${course.id}`}/>;
  const submit = (values: { name: string; phone: string; email: string; method: PaymentMethod }) => {
    if (submitting.current) return;
    submitting.current = true;
    try {
      const result = createCourseEnrollment(loadState(), course.id, values);
      saveState(result.state);
      toast('Đã gửi yêu cầu đăng ký khóa học.', 'success');
      navigate(`/me/confirmation/course/${result.recordId}`);
    } catch (error) { submitting.current = false; toast(error instanceof Error ? error.message : 'Không thể hoàn tất đăng ký.', 'error'); }
  };
  return <div className="journey-page"><header className="journey-heading"><button className="journey-back" onClick={() => navigate(`/courses/${course.id}`)}><ArrowLeft size={15}/> Quay lại khóa học</button><Badge tone="success">BƯỚC 1 · XÁC NHẬN ĐĂNG KÝ</Badge><h2>Hoàn tất đăng ký khóa học</h2><p>Kiểm tra thông tin và xác nhận giao dịch mô phỏng.</p></header><div className="journey-checkout-layout"><Card className="journey-form-card"><h3>Thông tin học viên</h3><CheckoutFields student={currentStudent(data)} onSubmit={submit} submitLabel="Xác nhận đăng ký demo"/></Card><aside className="journey-summary"><span className="market-eyebrow">TÓM TẮT KHÓA HỌC</span><SportImage src={course.coverImageUrl || DEFAULT_COURSE_COVER_IMAGE} alt="Sân tập cầu lông" onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER_IMAGE; }}/><Badge tone="success">{course.level}</Badge><h3>{course.title}</h3><p className="journey-summary-coach"><Avatar name={coach?.name ?? 'HLV'} size="sm"/>{coach?.name}</p><div><CalendarDays size={15}/>{course.days} · {course.time}</div><div><MapPin size={15}/>{course.venue}, {course.area}</div><div><Users size={15}/>{enrolled}/{course.maxStudents} học viên · còn {course.maxStudents - enrolled} chỗ</div><div className="journey-total"><span>Học phí</span><strong>{money(course.price)}</strong></div><p className="journey-fine-print">Đây là giao dịch demo, không có tiền thật bị thu.</p></aside></div></div>;
}

function TournamentCard({ state, tournament }: { state: DemoState; tournament: DemoState['tournaments'][number] }) {
  const registration = state.tournamentRegistrations
    .filter((item) => item.tournamentId === tournament.id && item.studentId === state.currentStudentId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  const count = state.tournamentRegistrations.filter((item) => item.tournamentId === tournament.id && item.reviewStatus !== 'rejected').length;
  const statusLabel: Record<TournamentStatus, string> = { open: 'Đang mở đăng ký', closed: 'Đã chốt đăng ký', finished: 'Đã kết thúc' };
  const activeRegistration = registration?.reviewStatus === 'rejected' ? undefined : registration;
  const registrationLabel = activeRegistration?.reviewStatus === 'pending'
    ? 'Chờ duyệt'
    : activeRegistration ? 'Đã duyệt' : registration ? 'Đã từ chối' : null;
  return <Card className="tour-market-card">
    <Link to={`/tournaments/${tournament.id}`} className="tour-market-image">
      <SportImage src={tournament.coverImageUrl || DEFAULT_COURSE_COVER_IMAGE} alt="Sân thi đấu cầu lông" onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER_IMAGE; }}/>
      <span className="tour-image-shade"/>
      <Badge tone={tournament.status === 'open' ? 'success' : tournament.status === 'closed' ? 'info' : 'neutral'}>{statusLabel[tournament.status]}</Badge>
      <span className="tour-image-format">{tournament.format === 'singles' ? 'ĐƠN' : 'ĐÔI'} · {tournament.level}</span>
      <span className="tour-image-capacity"><Users size={13}/>{Math.max(0, tournament.maxRegistrations - count)} chỗ còn lại</span>
    </Link>
    <div className="tour-market-body">
      <div className="tour-market-date"><CalendarDays size={16}/><span><small>NGÀY THI ĐẤU</small><strong>{date(tournament.date)}</strong></span></div>
      <Link to={`/tournaments/${tournament.id}`} className="tour-market-title">{tournament.name}</Link>
      <div className="tour-market-fact"><MapPin size={15}/>{tournament.venue}</div>
      <div className="tour-market-prize"><Trophy size={15}/><span><small>GIẢI THƯỞNG</small><strong>{tournament.prize}</strong></span></div>
      <div className="tour-market-capacity"><span>{count}/{tournament.maxRegistrations} lượt đăng ký</span><div><i style={{width:`${Math.min(100,count/tournament.maxRegistrations*100)}%`}}/></div></div>
      <footer>
        <PriceDisplay amount={tournament.fee} suffix={tournament.format === 'doubles' ? 'cặp' : 'người'}/>
        {registrationLabel
          ? <Badge tone={registration?.reviewStatus === 'rejected' ? 'warning' : activeRegistration?.reviewStatus === 'pending' ? 'info' : 'success'}>{registrationLabel}</Badge>
          : <Link to={`/tournaments/${tournament.id}`} className="tour-card-action">Xem chi tiết <ArrowRight size={15}/></Link>}
      </footer>
    </div>
  </Card>;
}

export function TournamentMarketplace() {
  const state = useMemo(loadState, []);
  const [query, setQuery] = useViewPreference('tournaments-query', '');
  const [status, setStatus] = useViewPreference('tournaments-status', '');
  const [format, setFormat] = useViewPreference('tournaments-format', '');
  const [area, setArea] = useViewPreference('tournaments-area', '');
  const [dateRange, setDateRange] = useViewPreference('tournaments-date', '');
  const [sort, setSort] = useViewPreference('tournaments-sort', 'date');
  const areas = [...new Set(state.tournaments.map((item) => item.venue))];
  const list = state.tournaments.filter((item) => (!query || `${item.name} ${item.venue} ${item.level}`.toLocaleLowerCase('vi-VN').includes(query.toLocaleLowerCase('vi-VN')))
    && (!status || item.status === status) && (!format || item.format === format) && (!area || item.venue === area)
    && (!dateRange || (dateRange === 'upcoming' ? item.date >= new Date().toISOString().slice(0,10) : item.date < new Date().toISOString().slice(0,10))))
    .sort((a,b) => sort === 'fee-low' ? a.fee-b.fee : sort === 'fee-high' ? b.fee-a.fee : a.date.localeCompare(b.date));
  const reset = () => { setQuery(''); setStatus(''); setFormat(''); setArea(''); setDateRange(''); setSort('date'); };
  const openCount = state.tournaments.filter((tournament) => tournament.status === 'open').length;
  return <div className="journey-page tournament-marketplace">
    <section className="tour-hero">
      <div className="tour-hero-copy">
        <Badge tone="lime"><Trophy size={14}/> CỘNG ĐỒNG THI ĐẤU</Badge>
        <h2>Sẵn sàng ra sân<br/><span>và thử sức?</span></h2>
        <p>Chọn giải đấu phù hợp, tìm đồng đội và tạo nên khoảnh khắc đáng nhớ cùng cộng đồng cầu lông.</p>
        <div className="tour-hero-meta"><span><ShieldCheck size={16}/> Thể thức minh bạch</span><span><Users size={16}/> Đơn & đôi</span></div>
        <Link className="tour-hero-cta" to="#tournament-list">Khám phá giải đấu <ArrowRight size={16}/></Link>
      </div>
      <div className="tour-hero-visual">
        <SportImage src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85" alt="Vận động viên cầu lông trên sân"/>
        <div className="tour-hero-caption"><span className="tour-live-dot"/><span><strong>{openCount} giải đang mở đăng ký</strong><small>Sẵn sàng cho trận đấu tiếp theo?</small></span><Trophy size={19}/></div>
      </div>
      <div className="tour-hero-glow"/>
    </section>
    <section className="tour-listing" id="tournament-list">
      <header className="tour-section-heading">
        <div><span className="market-eyebrow">COACHMATE TOURNAMENTS</span><h2>Giải đấu dành cho bạn</h2><p>Tìm kiếm thử thách tiếp theo theo trình độ, địa điểm và thời gian.</p></div>
        <div className="tour-section-stat"><strong>{state.tournaments.length}</strong><span>giải đấu<br/>trong cộng đồng</span></div>
      </header>
      <Card className="tour-filters">
        <FormField label="Tìm giải đấu"><TextInput leadingIcon={<Search size={16}/>} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tên giải hoặc địa điểm"/></FormField>
        <FormField label="Trạng thái"><Select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Mọi trạng thái</option><option value="open">Đang mở đăng ký</option><option value="closed">Đã chốt</option><option value="finished">Đã kết thúc</option></Select></FormField>
        <FormField label="Thể thức"><Select value={format} onChange={(event) => setFormat(event.target.value)}><option value="">Đơn & đôi</option><option value="singles">Đơn</option><option value="doubles">Đôi</option></Select></FormField>
        <FormField label="Địa điểm"><Select value={area} onChange={(event) => setArea(event.target.value)}><option value="">Mọi địa điểm</option>{areas.map((item) => <option key={item}>{item}</option>)}</Select></FormField>
        <FormField label="Thời gian"><Select value={dateRange} onChange={(event) => setDateRange(event.target.value)}><option value="">Mọi thời gian</option><option value="upcoming">Sắp diễn ra</option><option value="past">Đã qua</option></Select></FormField>
        <FormField label="Sắp xếp"><Select value={sort} onChange={(event) => setSort(event.target.value)}><option value="date">Ngày thi đấu</option><option value="fee-low">Phí thấp đến cao</option><option value="fee-high">Phí cao đến thấp</option></Select></FormField>
        <button className="journey-clear" onClick={reset}>Xóa bộ lọc</button>
      </Card>
      <div className="active-filters" aria-label="Bộ lọc giải đấu đang áp dụng">{[[query, setQuery, `Từ khóa: ${query}`], [status, setStatus, status === 'open' ? 'Đang mở' : status === 'closed' ? 'Đã chốt' : 'Đã kết thúc'], [format, setFormat, format === 'doubles' ? 'Đôi' : 'Đơn'], [area, setArea, area], [dateRange, setDateRange, dateRange === 'upcoming' ? 'Sắp diễn ra' : 'Đã qua']].map(([value, setter, label], index) => value && <button key={index} onClick={() => (setter as (value: string) => void)('')}>{String(label)} ×</button>)}</div>
      <div className="tour-results-count" aria-live="polite"><span><strong>{list.length}</strong> giải đấu phù hợp</span><span className="tour-sort-note">Được cập nhật từ cộng đồng CoachMate</span></div>
      {list.length
        ? <div className="tour-market-grid">{list.map((tournament) => <TournamentCard key={tournament.id} state={state} tournament={tournament}/>)}</div>
        : <EmptyState title="Chưa có giải đấu phù hợp" description="Thử thay đổi bộ lọc để xem các giải đấu khác." action={<Button variant="outline" onClick={reset}>Xóa bộ lọc</Button>}/>}
    </section>
  </div>;
}

export function TournamentDetailPage() {
  const { tournamentId = '' } = useParams();
  const navigate = useNavigate();
  const state = useMemo(loadState, []);
  const tournament = state.tournaments.find((item) => item.id === tournamentId);
  if (!tournament) return <JourneyNotFound title="Không tìm thấy giải đấu" backTo="/tournaments"/>;
  const registered = state.tournamentRegistrations
    .filter((item) => item.tournamentId === tournament.id && item.studentId === state.currentStudentId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  const activeRegistration = registered?.reviewStatus === 'rejected' ? undefined : registered;
  const registrations = state.tournamentRegistrations.filter((item) => item.tournamentId === tournament.id && item.reviewStatus !== 'rejected').length;
  return <div className="journey-page tournament-detail"><button className="journey-back" onClick={() => navigate('/tournaments')}><ArrowLeft size={15}/> Tất cả giải đấu</button><SportImage className="tournament-detail-cover" src={tournament.coverImageUrl || DEFAULT_COURSE_COVER_IMAGE} alt="Sân thi đấu" onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER_IMAGE; }}/><div className="tournament-detail-grid"><div><div className="tour-market-tags"><Badge tone="lime">{tournament.format === 'singles' ? 'Đơn' : 'Đôi'}</Badge><span>{tournament.level}</span><Badge tone={tournament.status === 'open' ? 'success' : 'info'}>{tournament.status === 'open' ? 'Đang mở đăng ký' : tournament.status === 'closed' ? 'Đã chốt' : 'Đã kết thúc'}</Badge></div><h2>{tournament.name}</h2><p className="tournament-description">{tournament.rules}</p><section className="tour-detail-section"><h3>Thông tin giải đấu</h3><div className="course-info-grid"><div><CalendarDays/><span><small>Ngày thi đấu</small><strong>{date(tournament.date)}</strong></span></div><div><CalendarDays/><span><small>Hạn đăng ký</small><strong>{date(tournament.registrationDeadline)}</strong></span></div><div><MapPin/><span><small>Địa điểm</small><strong>{tournament.venue}</strong></span></div><div><Users/><span><small>Số lượng</small><strong>{registrations}/{tournament.maxRegistrations} lượt · tối thiểu {tournament.minRegistrations}</strong></span></div></div></section><section className="tour-detail-section"><h3>Điều lệ & giải thưởng</h3><p>{tournament.rules}</p><p><strong>Giải thưởng:</strong> {tournament.prize}</p><p><strong>Ban tổ chức:</strong> CoachMate</p></section></div><Card className="tour-register-panel"><span className="market-eyebrow">LỆ PHÍ THAM GIA</span><PriceDisplay amount={tournament.fee} suffix={tournament.format === 'doubles' ? 'cặp' : 'người'}/><div className="journey-demo-disclosure"><ShieldCheck size={16}/><span>Thanh toán DEMO · Không thu tiền thật. Đăng ký chờ Ban tổ chức duyệt.</span></div>{activeRegistration ? <div className="journey-success-inline"><CheckCircle2 size={18}/>{activeRegistration.reviewStatus === 'pending' ? 'Đang chờ Ban tổ chức duyệt đăng ký.' : 'Đăng ký của bạn đã được duyệt.'}</div> : registered?.reviewStatus === 'rejected' ? <p role="status">Đơn đăng ký trước đã bị từ chối. Trạng thái lệ phí đã được cập nhật.</p> : null}{!activeRegistration && <Button disabled={tournament.status !== 'open' || registrations >= tournament.maxRegistrations} onClick={() => navigate(`/tournaments/${tournament.id}/register`)}>{tournament.status !== 'open' ? 'Đã đóng đăng ký' : registrations >= tournament.maxRegistrations ? 'Đã đủ số lượng' : registered ? 'Đăng ký lại' : 'Đăng ký giải đấu'} <ArrowRight size={15}/></Button>}<Link to="/me/tournaments" className="journey-text-link">Xem giải đấu của tôi</Link></Card></div></div>;
}

export function TournamentRegistrationPage() {
  const { tournamentId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const state = useMemo(loadState, []);
  const submitting = useRef(false);
  const tournament = state.tournaments.find((item) => item.id === tournamentId);
  if (!tournament) return <JourneyNotFound title="Không tìm thấy giải đấu" backTo="/tournaments"/>;
  const submit = (values: { name: string; phone: string; email: string; partnerName: string; method: PaymentMethod }) => {
    if (submitting.current) return;
    submitting.current = true;
    try { const result = createTournamentRegistration(loadState(), tournament.id, values); saveState(result.state); navigate(`/me/confirmation/tournament/${result.recordId}`); }
    catch (error) { submitting.current = false; toast(error instanceof Error ? error.message : 'Không thể đăng ký giải.', 'error'); }
  };
  return <div className="journey-page"><header className="journey-heading"><button className="journey-back" onClick={() => navigate(`/tournaments/${tournament.id}`)}><ArrowLeft size={15}/> Quay lại giải đấu</button><Badge tone="success">ĐĂNG KÝ GIẢI</Badge><h2>{tournament.name}</h2><p>{date(tournament.date)} · {tournament.venue}</p></header><Card className="journey-form-card"><h3>{tournament.format === 'doubles' ? 'Thông tin cặp đấu' : 'Thông tin vận động viên'}</h3><CheckoutFields student={currentStudent(state)} includePartner={tournament.format === 'doubles'} onSubmit={submit} submitLabel={`Xác nhận · ${money(tournament.fee)}`}/></Card></div>;
}

export function MyCoursesPage() {
  const state = useMemo(loadState, []);
  const courses = getStudentCourses(state);
  const mine = state.enrollments.filter((item) => item.studentId === state.currentStudentId);
  return <div className="journey-page"><header className="journey-heading"><Badge tone="success">KHÔNG GIAN HỌC VIÊN</Badge><h2>Khóa học của tôi</h2><p>Thông tin lớp, huấn luyện viên và tiến độ học tập của bạn.</p></header>{courses.length ? <div className="my-activity-list">{courses.map((course) => { const enrollment = mine.find((item) => item.courseId === course.id)!; const coach = state.coaches.find((item) => item.id === course.coachId); return <Card className="my-course-row" key={course.id}><SportImage src={course.coverImageUrl || DEFAULT_COURSE_COVER_IMAGE} alt="Sân tập" onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER_IMAGE; }}/><div className="my-activity-main"><Badge tone={enrollment.completed ? 'info' : 'success'}>{enrollment.completed ? 'Đã hoàn thành' : 'Đã đăng ký'}</Badge><h3>{course.title}</h3><p>{coach?.name} · {course.days}, {course.time}</p><span><MapPin size={14}/>{course.venue}, {course.area}</span></div><div className="my-activity-side"><strong>{money(enrollment.price)}</strong><Link to={`/courses/${course.id}`}>Chi tiết khóa học <ArrowRight size={14}/></Link></div></Card>; })}</div> : <EmptyState title="Bạn chưa đăng ký khóa học nào" description="Khám phá các lớp học cầu lông và tìm khóa phù hợp với mình." action={<Link className="journey-link-button" to="/courses">Khám phá khóa học <ArrowRight size={15}/></Link>}/>}</div>;
}

export function MyTournamentsPage() {
  const state = useMemo(loadState, []);
  const tournaments = getStudentTournaments(state);
  const registrations = state.tournamentRegistrations
    .filter((item) => item.studentId === state.currentStudentId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));
  return <div className="journey-page"><header className="journey-heading"><Badge tone="lime"><Trophy size={13}/> GIẢI ĐẤU CỦA BẠN</Badge><h2>Giải đấu của tôi</h2><p>Theo dõi trạng thái duyệt đăng ký và lịch thi đấu.</p></header>{tournaments.length ? <div className="my-activity-list">{tournaments.map((tournament) => { const registration = registrations.find((item) => item.tournamentId === tournament.id)!; const pending = registration.reviewStatus === 'pending'; const rejected = registration.reviewStatus === 'rejected'; return <Card className="my-course-row" key={tournament.id}><SportImage src={tournament.coverImageUrl ?? 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=600&q=75'} alt="Sân thi đấu"/><div className="my-activity-main"><Badge tone={pending ? 'info' : rejected ? 'warning' : 'success'}>{pending ? 'Đang chờ duyệt' : rejected ? 'Đã từ chối' : 'Đã duyệt'}</Badge><h3>{tournament.name}</h3><p>{tournament.format === 'doubles' ? `${registration.participantName} / ${registration.partnerName}` : registration.participantName}</p><span><CalendarDays size={14}/>{date(tournament.date)} · {tournament.venue}</span></div><div className="my-activity-side"><strong>{money(registration.fee)}</strong><Link to={`/tournaments/${tournament.id}`}>{rejected ? 'Đăng ký lại' : 'Chi tiết giải'} <ArrowRight size={14}/></Link></div></Card>; })}</div> : <EmptyState title="Bạn chưa đăng ký giải nào" description="Xem các giải cầu lông sắp tới và đăng ký tham gia." action={<Link className="journey-link-button" to="/tournaments">Khám phá giải đấu <ArrowRight size={15}/></Link>}/>}</div>;
}

export function PaymentHistoryPage() {
  const state = useMemo(loadState, []);
  const payments = getStudentPayments(state);
  const courseById = new Map(state.enrollments.map((item) => [item.id, item.courseId]));
  const tournamentById = new Map(state.tournamentRegistrations.map((item) => [item.id, item.tournamentId]));
  const label = (payment: DemoState['payments'][number]) => payment.kind === 'course' ? state.courses.find((item) => item.id === courseById.get(payment.referenceId))?.title ?? 'Khóa học' : payment.kind === 'tournament' ? state.tournaments.find((item) => item.id === tournamentById.get(payment.referenceId))?.name ?? 'Giải đấu' : 'Coach Pro';
  return <div className="journey-page"><header className="journey-heading"><Badge tone="info"><CreditCard size={13}/> LỊCH SỬ GIAO DỊCH DEMO</Badge><h2>Lịch sử thanh toán</h2><p>Theo dõi các khoản phí liên quan đến khóa học và giải đấu của bạn.</p></header>{payments.length ? <Card className="payment-table-wrap"><table className="payment-table"><thead><tr><th>Giao dịch</th><th>Ngày</th><th>Phương thức</th><th>Trạng thái</th><th>Số tiền</th></tr></thead><tbody>{payments.map((payment) => <tr key={payment.id}><td><strong>{label(payment)}</strong><small>{payment.referenceId}</small></td><td>{new Date(payment.createdAt).toLocaleDateString('vi-VN')}</td><td>{payment.method}</td><td><Badge tone={payment.status === 'completed' ? 'success' : 'warning'}>{payment.status === 'completed' ? 'Hoàn tất mô phỏng' : 'Đã hoàn mô phỏng'}</Badge></td><td><strong>{money(payment.amount)}</strong></td></tr>)}</tbody></table><p className="journey-table-note"><ShieldCheck size={15}/> Tất cả giao dịch trong danh sách đều mô phỏng. Không thu hoặc hoàn tiền thật.</p></Card> : <EmptyState title="Chưa có lịch sử thanh toán" description="Các khoản phí sẽ xuất hiện tại đây sau khi bạn đăng ký khóa học hoặc giải đấu."/>}</div>;
}

export function StudentProfilePage() {
  const initial = useMemo(loadState, []);
  const [values, setValues] = useState<Student>(currentStudent(initial));
  const [error, setError] = useState('');
  const toast = useToast();
  const save = (event: FormEvent) => { event.preventDefault(); try { const next = updateStudentProfile(loadState(), values); saveState(next); setValues(currentStudent(next)); setError(''); toast('Thông tin hồ sơ đã được cập nhật.'); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Không thể lưu hồ sơ.'); } };
  const field = <K extends keyof Student>(key: K, value: Student[K]) => setValues((current) => ({ ...current, [key]: value }));
  const courseCount = getStudentCourses(initial).length;
  const tournamentCount = getStudentTournaments(initial).length;
  return <div className="journey-page profile-page">
    <header className="journey-heading"><Badge tone="success"><BadgeCheck size={14}/> TÀI KHOẢN CỦA TÔI</Badge><h2>Hồ sơ học viên</h2><p>Cập nhật thông tin để CoachMate gợi ý lớp học và giải đấu phù hợp hơn.</p></header>
    <section className="student-profile-hero">
      <div className="student-profile-identity"><Avatar name={values.name} size="lg"/><div><span>HỒ SƠ HỌC VIÊN</span><h3>{values.name}</h3><p><MapPin size={14}/>{values.area} <i/> <GraduationCap size={14}/>{values.level}</p></div></div>
      <Badge tone="success"><span className="profile-status-dot"/> Hồ sơ đang hoạt động</Badge>
    </section>
    <div className="student-profile-metrics">
      <Card><span><BookOpen size={17}/></span><strong>{courseCount}</strong><small>Khóa học đã tham gia</small></Card>
      <Card><span><Trophy size={17}/></span><strong>{tournamentCount}</strong><small>Giải đấu đã đăng ký</small></Card>
      <Card><span><CreditCard size={17}/></span><strong>{getStudentPayments(initial).length}</strong><small>Giao dịch đã ghi nhận</small></Card>
    </div>
    <div className="student-profile-layout">
      <Card className="student-profile-form-card">
        <div className="profile-section-heading"><div><span>THÔNG TIN CÁ NHÂN</span><h3>Thông tin liên hệ</h3></div><Users size={19}/></div>
        <form className="journey-form" onSubmit={save}>
          <div className="journey-form-grid">
            <FormField label="Họ và tên" required><TextInput autoComplete="name" value={values.name} onChange={(event) => field('name', event.target.value)}/></FormField>
            <FormField label="Số điện thoại" required><TextInput autoComplete="tel" inputMode="tel" leadingIcon={<Phone size={16}/>} value={values.phone} onChange={(event) => field('phone', event.target.value)}/></FormField>
            <FormField label="Email"><TextInput type="email" autoComplete="email" leadingIcon={<Mail size={16}/>} value={values.email} onChange={(event) => field('email', event.target.value)}/></FormField>
            <FormField label="Khu vực"><Select value={values.area} onChange={(event) => field('area', event.target.value)}>{['Quận 1','Quận 7','Bình Thạnh','Tân Bình','Thủ Đức'].map((area) => <option key={area}>{area}</option>)}</Select></FormField>
            <FormField label="Trình độ hiện tại"><Select value={values.level} onChange={(event) => field('level', event.target.value as Student['level'])}>{['Mới bắt đầu','Cơ bản','Trung cấp','Nâng cao'].map((level) => <option key={level}>{level}</option>)}</Select></FormField>
          </div>
          {error && <p className="journey-inline-error" role="alert"><CircleAlert size={15}/>{error}</p>}
          <div className="student-profile-form-footer"><span><ShieldCheck size={15}/> Thông tin chỉ dùng để cá nhân hóa trải nghiệm của bạn.</span><Button type="submit">Lưu thay đổi <ArrowRight size={15}/></Button></div>
        </form>
      </Card>
      <aside className="student-profile-aside">
        <Card className="student-profile-tip"><span><GraduationCap size={18}/></span><h3>Hoàn thiện hồ sơ</h3><p>Trình độ và khu vực giúp bạn tìm được huấn luyện viên cùng lớp học phù hợp.</p><div className="student-profile-completion"><i/></div><small>Thông tin cơ bản đã sẵn sàng</small></Card>
        <Card className="student-profile-shortcuts"><h3>Không gian của bạn</h3><Link to="/me/courses"><BookOpen size={16}/>Khóa học của tôi <ArrowRight size={14}/></Link><Link to="/me/tournaments"><Trophy size={16}/>Giải đấu của tôi <ArrowRight size={14}/></Link><Link to="/me/payments"><CreditCard size={16}/>Lịch sử giao dịch <ArrowRight size={14}/></Link></Card>
      </aside>
    </div>
  </div>;
}

function CheckoutResult({ title, detail, backTo }: { title: string; detail: string; backTo: string }) { return <div className="journey-result"><span><CheckCircle2 size={26}/></span><Badge tone="success">HOÀN TẤT ĐĂNG KÝ</Badge><h2>{title}</h2><p>{detail}</p><Link className="journey-link-button" to={backTo}>Tiếp tục <ArrowRight size={15}/></Link></div>; }
function JourneyNotFound({ title, backTo }: { title: string; backTo: string }) { return <div className="journey-result"><span><Search size={24}/></span><h2>{title}</h2><p>Không tìm thấy nội dung bạn cần.</p><Link className="journey-link-button" to={backTo}><ArrowLeft size={15}/> Quay lại</Link></div>; }
