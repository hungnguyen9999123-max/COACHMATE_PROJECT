import {
  ArrowDownUp, ArrowLeft, ArrowRight, BadgeCheck, CalendarDays, ChevronDown,
  Heart, MapPin, Search, SlidersHorizontal, Sparkles, Star, Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, EmptyState, FormField, PriceDisplay, Rating, Select, Skeleton } from '../design-system/components';
import { createBrowserDemoRepository } from '../data/repository';
import { useCourseFavorites } from '../data/useCourseFavorites';
import { DEFAULT_COURSE_COVER_IMAGE } from '../domain/constants';
import { findPublishedCourse, getCoachRating, searchFilterAndSortCourses, type CourseSort } from '../domain/courses';
import type { Coach, Course, CourseFilters, CourseType, SkillLevel } from '../domain/types';
import './course-marketplace.css';

const TYPE_LABELS: Record<CourseType, string> = {
  beginner: 'Nền tảng', clinic: 'Skill Clinic', group: 'Nhóm', individual: 'Cá nhân', advanced: 'Nâng cao',
};
const LEVEL_LABELS: Record<SkillLevel, string> = {
  'Mới bắt đầu': 'Người mới', 'Cơ bản': 'Cơ bản', 'Trung cấp': 'Trung cấp', 'Nâng cao': 'Nâng cao',
};
const FORMATS: { label: string; types: CourseType[] }[] = [
  { label: 'Cá nhân', types: ['individual'] },
  { label: 'Nhóm', types: ['group'] },
  { label: 'Skill Clinic', types: ['clinic'] },
  { label: 'Nâng cao', types: ['advanced'] },
];
const EMPTY_FILTERS: CourseFilters = {};

function useDemoData() {
  return useMemo(() => createBrowserDemoRepository().load(), []);
}

function CourseTile({ course, coach, enrolled, onFavorite, favorite }: {
  course: Course; coach: Coach;
  enrolled: number; onFavorite: () => void; favorite: boolean;
}) {
  const status = enrolled >= course.maxStudents
    ? { kind: 'full' as const, remainingToOpen: 0 }
    : enrolled < course.minStudents
      ? { kind: 'needs_students' as const, remainingToOpen: course.minStudents - enrolled }
      : { kind: 'confirmed' as const, remainingToOpen: 0 };
  return <Card className="market-course-card">
    <div className="market-card-image-wrap">
      <img
        src={course.coverImageUrl || DEFAULT_COURSE_COVER_IMAGE}
        alt={`Sân cầu lông cho khóa ${course.title}`}
        className="market-card-image"
        loading="lazy"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER_IMAGE;
        }}
      />
      <Badge className="market-type-badge" tone="neutral">{TYPE_LABELS[course.type]}</Badge>
      <button className={`market-favorite ${favorite ? 'is-favorite' : ''}`} aria-label={favorite ? `Bỏ lưu ${course.title}` : `Lưu ${course.title}`} aria-pressed={favorite} onClick={onFavorite}>
        <Heart size={18} fill={favorite ? 'currentColor' : 'none'}/>
      </button>
    </div>
    <div className="market-card-body"><div className="market-card-coach"><Avatar name={coach.name} src={coach.avatarUrl} size="sm"/><span>{coach.name}</span><Rating value={getCoachRating(coach) ?? 0} count={coach.ratingCount}/></div><Link className="market-card-title" to={`/courses/${course.id}`}>{course.title}</Link><div className="market-card-tags"><Badge tone="success">{LEVEL_LABELS[course.level]}</Badge><span><MapPin size={13}/>{course.area}</span></div><div className="market-card-meta"><span><CalendarDays size={14}/>{course.days} · {course.time}</span><span><Users size={14}/>{course.sessions} buổi · {course.minutesPerSession} phút</span></div><div className="market-seats"><div className="market-seats-bar"><i style={{ width: `${Math.min(100, course.maxStudents ? enrolled / course.maxStudents * 100 : 0)}%` }}/></div><span>{enrolled}/{course.maxStudents} chỗ</span></div><div className="market-card-footer"><PriceDisplay amount={course.price} suffix="khóa"/><Link className="market-details-link" to={`/courses/${course.id}`}>Chi tiết <ArrowRight size={14}/></Link></div>{status.kind === 'full' ? <div className="market-status full">Đã đủ học viên</div> : status.kind === 'needs_students' ? <div className="market-status needs">Cần thêm {status.remainingToOpen} học viên để mở lớp</div> : <div className="market-status ready">Đủ điều kiện mở lớp</div>}</div>
  </Card>;
}

export function CourseMarketplace() {
  const data = useDemoData();
  const navigate = useNavigate();
  const { favoriteIds, toggleFavorite } = useCourseFavorites();
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<CourseFilters>(EMPTY_FILTERS);
  const [selectedTypes, setSelectedTypes] = useState<CourseType[]>([]);
  const [sort, setSort] = useState<CourseSort>('recommended');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [loading, setLoading] = useState(false);
  const areaOptions = [...new Set(data.courses.map((course) => course.area))];
  const results = searchFilterAndSortCourses(data.courses, data.coaches, new Set(['c1']), {
    ...filters, query,
  }, sort).filter((course) => !selectedTypes.length || selectedTypes.includes(course.type))
    .filter((course) => !favoritesOnly || favoriteIds.includes(course.id));

  const clearFilters = () => { setQuery(''); setFilters({}); setSelectedTypes([]); setFavoritesOnly(false); setSort('recommended'); };
  const updateFilter = <T extends keyof CourseFilters>(key: T, value: CourseFilters[T]) => setFilters((current) => ({ ...current, [key]: value }));
  const toggleType = (type: CourseType) => setSelectedTypes((current) => current.includes(type) ? current.filter((item) => item !== type) : [...current, type]);
  const submitSearch = (event: React.FormEvent) => { event.preventDefault(); setLoading(true); window.setTimeout(() => setLoading(false), 220); };

  return <div className="course-marketplace">
    <section className="market-hero"><div className="market-hero-content"><Badge tone="lime"><Sparkles size={13}/> HỌC CÙNG HLV TẬN TÂM</Badge><h2>Tìm lớp cầu lông<br/><span>hợp với nhịp của bạn.</span></h2><p>Từ những bước chân đầu tiên đến cú smash tự tin. Khám phá lớp học chất lượng ngay gần bạn.</p><form className="market-hero-search" onSubmit={submitSearch}><Search size={19}/><input aria-label="Tìm theo tên khóa, huấn luyện viên hoặc từ khóa" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Bạn muốn cải thiện kỹ năng nào?"/><Button type="submit">Tìm khóa học</Button></form><div className="market-hero-trust"><span><BadgeCheck size={15}/> HLV được đánh giá</span><span><MapPin size={15}/> Lớp học tại TP.HCM</span><span><Users size={15}/> Nhóm học phù hợp</span></div></div><div className="market-hero-art"><img src="https://i.pinimg.com/736x/b9/3d/db/b93ddb9ebaa794011a4c4afb3856d487.jpg" alt="Người chơi cầu lông trên sân trong nhà"/><div className="market-hero-float"><span className="market-float-icon"><Star size={16} fill="currentColor"/></span><span><strong>Huấn luyện viên được học viên đánh giá</strong><small>Xem điểm đánh giá trên từng khóa học</small></span></div><div className="market-hero-caption">Bắt đầu hành trình của bạn</div></div></section>

    <section className="market-listing" aria-labelledby="market-listing-title"><div className="market-section-heading"><div><span className="market-eyebrow">COACHMATE BADMINTON</span><h2 id="market-listing-title">Khóa học được yêu thích</h2><p>Chọn lớp học phù hợp với mục tiêu và lịch trình của bạn.</p></div><button className={`market-favorites-filter ${favoritesOnly ? 'is-active' : ''}`} onClick={() => setFavoritesOnly(!favoritesOnly)}><Heart size={16} fill={favoritesOnly ? 'currentColor' : 'none'}/> Đã lưu <span>{favoriteIds.length}</span></button></div>

      <div className="market-filters"><div className="market-filter-top"><div className="market-filter-label"><SlidersHorizontal size={15}/> Lọc khóa học</div><button className="market-clear" onClick={clearFilters}>Xóa bộ lọc</button></div><div className="market-filter-grid"><FormField label="Cấp độ"><Select value={filters.level ?? ''} onChange={(event) => updateFilter('level', event.target.value as SkillLevel | '')}><option value="">Tất cả cấp độ</option>{(['Mới bắt đầu','Cơ bản','Trung cấp','Nâng cao'] as SkillLevel[]).map((level) => <option key={level} value={level}>{LEVEL_LABELS[level]}</option>)}</Select></FormField><FormField label="Khu vực"><Select value={filters.area ?? ''} onChange={(event) => updateFilter('area', event.target.value)}><option value="">Tất cả khu vực</option>{areaOptions.map((area) => <option key={area}>{area}</option>)}</Select></FormField><FormField label="Lịch học"><Select value={filters.scheduleType ?? ''} onChange={(event) => updateFilter('scheduleType', event.target.value as CourseFilters['scheduleType'])}><option value="">Mọi thời gian</option><option>Tối trong tuần</option><option>Cuối tuần</option></Select></FormField><FormField label="Học phí tối đa"><Select value={filters.maximumPrice == null ? '' : String(filters.maximumPrice)} onChange={(event) => updateFilter('maximumPrice', event.target.value ? Number(event.target.value) : null)}><option value="">Không giới hạn</option><option value="1000000">1.000.000đ</option><option value="1500000">1.500.000đ</option><option value="2500000">2.500.000đ</option><option value="3000000">3.000.000đ</option></Select></FormField><FormField label="Sắp xếp"><Select value={sort} onChange={(event) => setSort(event.target.value as CourseSort)}><option value="recommended">Gợi ý cho bạn</option><option value="price-ascending">Giá thấp đến cao</option><option value="price-descending">Giá cao đến thấp</option><option value="rating">Đánh giá cao nhất</option></Select></FormField></div><div className="market-format-row"><span>Hình thức:</span>{FORMATS.map(({ label, types }) => <button key={label} className={`market-format-chip ${types.some((type) => selectedTypes.includes(type)) ? 'is-active' : ''}`} onClick={() => types.forEach(toggleType)}>{label}</button>)}</div></div>

      <div className="market-results-heading"><p><strong>{results.length}</strong> khóa học phù hợp</p><span><ArrowDownUp size={14}/> Khóa học được cập nhật bởi huấn luyện viên</span></div>
      {loading ? <div className="market-course-grid">{[0,1,2].map((key) => <Card key={key} className="market-loading-card"><Skeleton height={165}/><Skeleton width="65%"/><Skeleton width="88%"/><Skeleton width="45%"/></Card>)}</div> : results.length ? <div className="market-course-grid">{results.map((course) => { const coach = data.coaches.find((candidate) => candidate.id === course.coachId)!; const enrolled = data.enrollments.filter((enrollment) => enrollment.courseId === course.id).length; return <CourseTile key={course.id} course={course} coach={coach} enrolled={enrolled} favorite={favoriteIds.includes(course.id)} onFavorite={() => toggleFavorite(course.id)}/>; })}</div> : <EmptyState title="Chưa tìm thấy khóa học phù hợp" description="Thử điều chỉnh từ khóa, cấp độ hoặc bộ lọc để xem thêm lớp học." action={<Button variant="outline" onClick={clearFilters}>Xóa tất cả bộ lọc</Button>}/>}
    </section>
    <section className="market-bottom-banner"><div><Badge tone="lime">BẠN LÀ HUẤN LUYỆN VIÊN?</Badge><h2>Chia sẻ đam mê.<br/>Truyền cảm hứng trên sân.</h2><p>CoachMate giúp kết nối HLV với cộng đồng người chơi cầu lông.</p></div><Button variant="secondary" onClick={() => navigate('/coach/dashboard')}>Khám phá không gian HLV <ArrowRight size={15}/></Button></section>
  </div>;
}

function NotFoundCourse({ onBack }: { onBack: () => void }) {
  return <div className="course-detail-not-found"><span><Search size={22}/></span><h2>Không tìm thấy khóa học</h2><p>Khóa học này không tồn tại hoặc không còn được hiển thị.</p><Button variant="outline" onClick={onBack}><ArrowLeft size={15}/> Quay lại danh sách</Button></div>;
}

export function CourseDetailPage() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const data = useDemoData();
  const { favoriteIds, toggleFavorite } = useCourseFavorites();
  const course = findPublishedCourse(data.courses, courseId);
  if (!course) return <NotFoundCourse onBack={() => navigate('/courses')}/>;

  const coach = data.coaches.find((item) => item.id === course.coachId);
  const enrolled = data.enrollments.filter((item) => item.courseId === course.id).length;
  const available = Math.max(0, course.maxStudents - enrolled);
  const related = data.courses.filter((item) => item.coachId === course.coachId && item.id !== course.id && item.status === 'published');

  return <article className="course-detail"><nav className="course-detail-breadcrumb" aria-label="Breadcrumb"><button onClick={() => navigate('/courses')}>Khóa học</button><ChevronDown size={13}/><span>{course.title}</span></nav><button className="course-back-link" onClick={() => navigate('/courses')}><ArrowLeft size={15}/> Tất cả khóa học</button>
    <div className="course-detail-layout"><div className="course-detail-main"><div className="course-detail-cover">
      <img
        src={course.coverImageUrl || DEFAULT_COURSE_COVER_IMAGE}
        alt={`Ảnh sân tập cho ${course.title}`}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER_IMAGE;
        }}
      />
      <Badge className="course-cover-badge" tone="neutral">{TYPE_LABELS[course.type]}</Badge>
    </div><div className="course-detail-title-row"><div><div className="course-detail-tags"><Badge tone="success">{LEVEL_LABELS[course.level]}</Badge><span><MapPin size={14}/>{course.area}</span></div><h2>{course.title}</h2></div><button className={`market-favorite detail-favorite ${favoriteIds.includes(course.id) ? 'is-favorite' : ''}`} aria-label={favoriteIds.includes(course.id) ? 'Bỏ lưu khóa học' : 'Lưu khóa học'} aria-pressed={favoriteIds.includes(course.id)} onClick={() => toggleFavorite(course.id)}><Heart size={19} fill={favoriteIds.includes(course.id) ? 'currentColor' : 'none'}/></button></div>
      <div className="course-detail-coach"><Avatar name={coach?.name ?? 'HLV'} size="lg"/><div><span className="course-detail-label">HUẤN LUYỆN VIÊN</span><strong>{coach?.name}</strong><p>{coach?.bio}</p></div>{coach && coach.ratingCount > 0 && <Rating value={getCoachRating(coach)!} count={coach.ratingCount}/>}</div>
      <section className="course-detail-section"><span className="market-eyebrow">GIỚI THIỆU</span><h3>Về khóa học này</h3><p>{course.goal}</p><p className="course-detail-requirement"><strong>Phù hợp với:</strong> {course.requirement}</p></section>
      {course.curriculum.length > 0 && <section className="course-detail-section"><span className="market-eyebrow">NỘI DUNG HỌC</span><h3>Bạn sẽ học được gì</h3><div className="course-curriculum">{course.curriculum.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item}</strong><BadgeCheck size={16}/></div>)}</div></section>}
      <section className="course-detail-section"><span className="market-eyebrow">THÔNG TIN LỚP</span><h3>Lịch học & địa điểm</h3><div className="course-info-grid"><div><CalendarDays/><span><small>Ngày học</small><strong>{course.days}</strong></span></div><div><CalendarDays/><span><small>Bắt đầu</small><strong>{new Date(`${course.startDate}T00:00:00`).toLocaleDateString('vi-VN')}</strong></span></div><div><Users/><span><small>Thời lượng</small><strong>{course.sessions} buổi · {course.minutesPerSession} phút/buổi</strong></span></div><div><MapPin/><span><small>Địa điểm</small><strong>{course.venue}, {course.area}</strong></span></div></div></section>
      {related.length > 0 && <section className="course-detail-section"><span className="market-eyebrow">HỌC CÙNG HLV</span><h3>Khóa học khác của {coach?.name}</h3><div className="course-related">{related.map((item) => <Link key={item.id} to={`/courses/${item.id}`}><span>{item.title}</span><ArrowRight size={15}/></Link>)}</div></section>}
    </div><aside className="course-enroll-panel"><span className="market-eyebrow">HỌC PHÍ TRỌN KHÓA</span><PriceDisplay amount={course.price} suffix="khóa"/><p className="course-price-per-session">Khoảng {new Intl.NumberFormat('vi-VN').format(Math.round(course.price/course.sessions))}đ / buổi</p><div className="course-enroll-capacity"><span><Users size={16}/> Chỗ còn lại</span><strong>{available} / {course.maxStudents}</strong><div className="market-seats-bar"><i style={{width:`${Math.min(100,enrolled/course.maxStudents*100)}%`}}/></div></div><div className="course-enroll-meta"><span><CalendarDays size={15}/>{course.days}</span><span><MapPin size={15}/>{course.area}</span></div><Button className="course-enroll-cta" disabled={available === 0} onClick={() => navigate(`/courses/${course.id}/checkout`)}>{available === 0 ? 'Khóa học đã đủ chỗ' : 'Đăng ký khóa học'} <ArrowRight size={16}/></Button><div className="course-checkout-note"><BadgeCheck size={16}/><span>Khoản phí sẽ được xác nhận sau khi yêu cầu đăng ký được duyệt.</span></div><button className="course-save-text" onClick={() => toggleFavorite(course.id)}><Heart size={15} fill={favoriteIds.includes(course.id) ? 'currentColor' : 'none'}/>{favoriteIds.includes(course.id) ? 'Đã lưu vào yêu thích' : 'Lưu khóa học yêu thích'}</button></aside></div>
  </article>;
}
