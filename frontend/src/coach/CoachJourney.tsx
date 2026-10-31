import {
  ArrowRight, Award, BadgeCheck, BookOpen, Calendar, CalendarDays, CheckCircle2, Pencil,
  CircleDollarSign, DollarSign, GraduationCap, MapPin, Plus, Sparkles, Users,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { SportImage } from '../design-system/SportImage';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Avatar, Badge, Button, Card, EmptyState, FormField, Rating, Select, TextInput, useToast } from '../design-system/components';
import { createBrowserDemoRepository } from '../data/repository';
import { cancelCoachPro, createCourseByCoach, getCoachOverview, getCoachStudents, subscribeCoachPro, updateCoachProfile, updateCourseContentByCoach } from '../domain/coachFlows';
import { DEFAULT_COURSE_COVER_IMAGE } from '../domain/constants';
import type { Course, CourseType, DemoState, SkillLevel } from '../domain/types';
import './coach.css';

function loadState() {
  return createBrowserDemoRepository().load();
}

function saveState(state: DemoState) {
  createBrowserDemoRepository().save(state);
}

const DEFAULT_COACH_ID = 'c1';

export function CoachDashboardPage() {
  const navigate = useNavigate();
  const data = loadState();
  const overview = useMemo(() => getCoachOverview(data, DEFAULT_COACH_ID), [data]);
  const students = useMemo(() => getCoachStudents(data, DEFAULT_COACH_ID), [data]);

  return (
    <div className="coach-page">
      <header className="coach-header">
        <Badge tone="lime"><Sparkles size={13}/> BẢNG ĐIỀU HÀNH HUẤN LUYỆN VIÊN</Badge>
        <h2>Tổng quan công việc huấn luyện</h2>
        <p>Theo dõi hiệu quả đào tạo, số lượng học viên và thu nhập thực nhận.</p>
      </header>

      <div className="coach-kpi-grid">
        <div className="coach-kpi-card">
          <div className="coach-kpi-head">
            <span>Khóa học đang quản lý</span>
            <div className="coach-kpi-icon"><BookOpen size={18}/></div>
          </div>
          <div className="coach-kpi-value">{overview.courseCount} lớp</div>
          <div className="coach-kpi-sub">Đang hiển thị trên chợ khóa học</div>
        </div>

        <div className="coach-kpi-card">
          <div className="coach-kpi-head">
            <span>Tổng số học viên</span>
            <div className="coach-kpi-icon"><Users size={18}/></div>
          </div>
          <div className="coach-kpi-value">{overview.studentCount} học viên</div>
          <div className="coach-kpi-sub">Đã đăng ký các lớp của bạn</div>
        </div>

        <div className="coach-kpi-card">
          <div className="coach-kpi-head">
            <span>Tổng doanh thu (GMV)</span>
            <div className="coach-kpi-icon"><DollarSign size={18}/></div>
          </div>
          <div className="coach-kpi-value">{overview.grossRevenue.toLocaleString('vi-VN')}đ</div>
          <div className="coach-kpi-sub">Tổng học phí đã thu hộ</div>
        </div>

        <div className="coach-kpi-card highlight">
          <div className="coach-kpi-head">
            <span>Thu nhập thực nhận (Net Payout)</span>
            <div className="coach-kpi-icon"><CircleDollarSign size={18}/></div>
          </div>
          <div className="coach-kpi-value">{overview.coachPayout.toLocaleString('vi-VN')}đ</div>
          <div className="coach-kpi-sub">Đã trừ {data.settings.commissionPercent}% hoa hồng CoachMate</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button onClick={() => navigate('/coach/courses/new')}>
          <Plus size={16}/> Tạo khóa học mới
        </Button>
        <Button variant="secondary" onClick={() => navigate('/coach/students')}>
          <Users size={16}/> Quản lý học viên ({students.length})
        </Button>
        <Button variant="outline" onClick={() => navigate('/coach/pro')}>
          <Sparkles size={16}/> {overview.isPro ? 'Quản lý Coach Pro (Đang hoạt động)' : 'Nâng cấp Coach Pro'}
        </Button>
      </div>

      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Học viên mới đăng ký gần đây</h3>
          <Link to="/coach/students" style={{ color: 'var(--color-primary)', fontSize: '14px', fontWeight: 600 }}>Xem tất cả →</Link>
        </div>

        {students.length === 0 ? (
          <EmptyState title="Chưa có học viên mới" description="Khóa học của bạn chưa có lượt đăng ký nào." />
        ) : (
          <div className="coach-table-card">
            <table className="coach-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Khóa học</th>
                  <th>Học phí</th>
                  <th>Hoa hồng giữ lại</th>
                  <th>Thực nhận</th>
                  <th>Ngày đăng ký</th>
                </tr>
              </thead>
              <tbody>
                {[...students].sort((a,b) => b.enrollment.createdAt.localeCompare(a.enrollment.createdAt)).slice(0, 5).map(({ enrollment, course, student }) => (
                  <tr key={enrollment.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar name={enrollment.studentName} size="sm" />
                        <div>
                          <strong>{enrollment.studentName}</strong>
                          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{student?.phone || '—'}</div>
                        </div>
                      </div>
                    </td>
                    <td><strong>{course.title}</strong></td>
                    <td>{enrollment.price.toLocaleString('vi-VN')}đ</td>
                    <td style={{ color: '#d97706' }}>-{enrollment.commission.toLocaleString('vi-VN')}đ</td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                      {(enrollment.price - enrollment.commission).toLocaleString('vi-VN')}đ
                    </td>
                    <td>{new Date(enrollment.createdAt).toLocaleDateString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

export function CoachCourseListPage() {
  const navigate = useNavigate();
  const data = loadState();
  const coachCourses = data.courses.filter((course) => course.coachId === DEFAULT_COACH_ID);

  return (
    <div className="coach-page">
      <header className="coach-header" style={{ display: 'flex', justifyContent: 'space-between', flexDirection: 'row', alignItems: 'center' }}>
        <div>
          <h2>Danh sách khóa học của bạn</h2>
          <p>Quản lý các lớp học cầu lông đang và sẽ khai giảng.</p>
        </div>
        <Button onClick={() => navigate('/coach/courses/new')}>
          <Plus size={16}/> Tạo khóa học mới
        </Button>
      </header>

      {coachCourses.length === 0 ? (
        <EmptyState
          title="Bạn chưa tạo khóa học nào"
          description="Bắt đầu chiêu sinh học viên bằng cách tạo lớp học cầu lông đầu tiên."
          action={<Button onClick={() => navigate('/coach/courses/new')}><Plus size={16}/> Tạo khóa học ngay</Button>}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {coachCourses.map((course) => {
            const enrollments = data.enrollments.filter((e) => e.courseId === course.id);
            const count = enrollments.length;

            return (
              <Card key={course.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <SportImage
                  src={course.coverImageUrl || DEFAULT_COURSE_COVER_IMAGE}
                  alt={course.title}
                  style={{ width: '100%', height: '180px', objectFit: 'cover', objectPosition: 'center 20%', borderRadius: '8px' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER_IMAGE; }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Badge tone="success">{course.level}</Badge>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}><MapPin size={13}/> {course.area}</span>
                </div>
                <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{course.title}</h3>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                  <CalendarDays size={14}/> {course.days} · {course.time} ({course.sessions} buổi)
                </div>
                <div style={{ background: 'var(--color-bg)', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span>Số lượng đăng ký:</span>
                    <strong>{count} / {course.maxStudents} chỗ</strong>
                  </div>
                  <div style={{ height: '6px', background: '#e7ede9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, (count / course.maxStudents) * 100)}%`, height: '100%', background: 'var(--color-primary)' }} />
                  </div>
                  {count >= course.maxStudents ? (
                    <div style={{ color: '#dc2626', fontWeight: 600, fontSize: '12px', marginTop: '6px' }}>Đã đủ học viên (Full)</div>
                  ) : count >= course.minStudents ? (
                    <div style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '12px', marginTop: '6px' }}>Đủ điều kiện mở lớp</div>
                  ) : (
                    <div style={{ color: '#d97706', fontWeight: 600, fontSize: '12px', marginTop: '6px' }}>Cần thêm {course.minStudents - count} học viên nữa</div>
                  )}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                  <div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Thực nhận/học viên:</div>
                    <strong style={{ color: 'var(--color-primary)', fontSize: '16px' }}>
                      {Math.round(course.price * (1 - data.settings.commissionPercent / 100)).toLocaleString('vi-VN')}đ
                    </strong>
                  </div>
                  <Link to={`/courses/${course.id}`} style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-primary)' }}>
                    Xem trên chợ →
                  </Link>
                </div>
                <Button variant="outline" onClick={() => navigate(`/coach/courses/${course.id}/edit`)}>
                  <Pencil size={14}/> Sửa nội dung khóa học
                </Button>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function CoachEditCoursePage() {
  const { courseId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const state = loadState();
  const course = state.courses.find((item) => item.id === courseId && item.coachId === DEFAULT_COACH_ID);
  const [title, setTitle] = useState(course?.title ?? '');
  const [type, setType] = useState<CourseType>(course?.type ?? 'group');
  const [level, setLevel] = useState<SkillLevel>(course?.level ?? 'Cơ bản');
  const [goal, setGoal] = useState(course?.goal ?? '');
  const [requirement, setRequirement] = useState(course?.requirement ?? '');
  const [curriculumText, setCurriculumText] = useState(course?.curriculum.join('\n') ?? '');
  const [coverImageUrl, setCoverImageUrl] = useState(course?.coverImageUrl ?? '');
  const [error, setError] = useState('');

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    try {
      const updated = updateCourseContentByCoach(loadState(), DEFAULT_COACH_ID, courseId, {
        title,
        type,
        level,
        goal,
        requirement,
        curriculum: curriculumText.split('\n'),
        coverImageUrl,
      });
      saveState(updated);
      toast('Đã cập nhật nội dung khóa học.', 'success');
      navigate('/coach/courses');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Không thể cập nhật khóa học.');
    }
  };

  if (!course) {
    return <EmptyState title="Không tìm thấy khóa học" description="Khóa học không tồn tại hoặc không thuộc hồ sơ huấn luyện viên hiện tại." action={<Button onClick={() => navigate('/coach/courses')}>Quay lại danh sách</Button>} />;
  }

  return (
    <div className="coach-page">
      <header className="coach-header">
        <Badge tone="info"><Pencil size={13}/> CHỈNH SỬA NỘI DUNG</Badge>
        <h2>Cập nhật khóa học</h2>
        <p>Học phí, lịch học, địa điểm và sức chứa được giữ nguyên để bảo vệ các đăng ký hiện có.</p>
      </header>
      <Card style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <FormField label="Tên khóa học" required><TextInput value={title} onChange={(event) => setTitle(event.target.value)}/></FormField>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <FormField label="Loại hình khóa học"><Select value={type} onChange={(event) => setType(event.target.value as CourseType)}><option value="beginner">Nền tảng người mới</option><option value="group">Lớp nhóm</option><option value="clinic">Skill Clinic chuyên đề</option><option value="individual">Kèm 1-1</option><option value="advanced">Luyện thi đấu nâng cao</option></Select></FormField>
            <FormField label="Cấp độ học viên"><Select value={level} onChange={(event) => setLevel(event.target.value as SkillLevel)}><option value="Mới bắt đầu">Mới bắt đầu</option><option value="Cơ bản">Cơ bản</option><option value="Trung cấp">Trung cấp</option><option value="Nâng cao">Nâng cao</option></Select></FormField>
          </div>
          <FormField label="Mục tiêu khóa học"><textarea value={goal} onChange={(event) => setGoal(event.target.value)} rows={3}/></FormField>
          <FormField label="Giáo trình (mỗi dòng là một nội dung)"><textarea value={curriculumText} onChange={(event) => setCurriculumText(event.target.value)} rows={6}/></FormField>
          <FormField label="Yêu cầu đầu vào"><textarea value={requirement} onChange={(event) => setRequirement(event.target.value)} rows={3}/></FormField>
          <FormField label="Đường dẫn ảnh bìa"><TextInput value={coverImageUrl} onChange={(event) => setCoverImageUrl(event.target.value)} placeholder="https://..."/></FormField>
          <p role="note" style={{ margin: 0, color: 'var(--color-text-secondary)', fontSize: '13px' }}>Không thể sửa học phí, lịch/địa điểm, ngày khai giảng hoặc sức chứa trong luồng này.</p>
          {error && <p role="alert" style={{ color: '#b42318', margin: 0 }}>{error}</p>}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <Button type="button" variant="outline" onClick={() => navigate('/coach/courses')}>Hủy</Button>
            <Button type="submit">Lưu nội dung</Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function CoachCreateCoursePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const data = loadState();

  const [title, setTitle] = useState('');
  const [type, setType] = useState<CourseType>('group');
  const [level, setLevel] = useState<SkillLevel>('Cơ bản');
  const [area, setArea] = useState('Quận 7');
  const [venue, setVenue] = useState('Sân CL Phú Mỹ Hưng');
  const [startDate, setStartDate] = useState('2026-11-20');
  const [sessions, setSessions] = useState(8);
  const [minutesPerSession, setMinutesPerSession] = useState(90);
  const [days, setDays] = useState('Thứ 3 - Thứ 5');
  const [time, setTime] = useState('19:00-20:30');
  const [scheduleType] = useState<Course['scheduleType']>('Tối trong tuần');
  const [minStudents, setMinStudents] = useState(4);
  const [maxStudents, setMaxStudents] = useState(8);
  const [price, setPrice] = useState(1200000);
  const [goal, setGoal] = useState('');
  const [requirement, setRequirement] = useState('');
  const [curriculumText, setCurriculumText] = useState('Kỹ thuật cầm vợt\nFootwork cơ bản\nĐánh cầu phông và néo\nLuật thi đấu');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [error, setError] = useState('');

  const commissionPercent = data.settings.commissionPercent;
  const commissionAmount = Math.round((price * commissionPercent) / 100);
  const netPayout = price - commissionAmount;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setCoverImageUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Vui lòng nhập tiêu đề khóa học.'); return; }
    if (price < 0) { setError('Học phí không hợp lệ.'); return; }

    try {
      const curriculum = curriculumText.split('\n').filter((item) => item.trim());
      const result = createCourseByCoach(data, DEFAULT_COACH_ID, {
        title, type, level, area, venue, startDate, sessions,
        minutesPerSession, days, time, scheduleType, minStudents,
        maxStudents, price, goal, requirement, curriculum,
        coverImageUrl: coverImageUrl || DEFAULT_COURSE_COVER_IMAGE,
      });

      saveState(result.state);
      toast('Tạo khóa học thành công!', 'success');
      navigate('/coach/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo khóa học.');
    }
  };

  return (
    <div className="coach-page">
      <header className="coach-header">
        <Badge tone="success"><Plus size={13}/> TẠO KHÓA HỌC MỚI</Badge>
        <h2>Đăng ký lớp học mới trên CoachMate</h2>
        <p>Thiết lập thông tin khóa học, lịch tập và mức học phí chiêu sinh.</p>
      </header>

      <Card style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <FormField label="Tên khóa học" required>
              <TextInput value={title} onChange={(e) => setTitle(e.target.value)} placeholder="VD: Cầu lông nền tảng 8 buổi cho người mới" />
            </FormField>

            <FormField label="Loại hình khóa học">
              <Select value={type} onChange={(e) => setType(e.target.value as CourseType)}>
                <option value="beginner">Nền tảng người mới</option>
                <option value="group">Lớp nhóm</option>
                <option value="clinic">Skill Clinic chuyên đề</option>
                <option value="individual">Kèm 1-1</option>
                <option value="advanced">Luyện thi đấu nâng cao</option>
              </Select>
            </FormField>

            <FormField label="Cấp độ học viên">
              <Select value={level} onChange={(e) => setLevel(e.target.value as SkillLevel)}>
                <option value="Mới bắt đầu">Mới bắt đầu</option>
                <option value="Cơ bản">Cơ bản</option>
                <option value="Trung cấp">Trung cấp</option>
                <option value="Nâng cao">Nâng cao</option>
              </Select>
            </FormField>

            <FormField label="Khu vực">
              <TextInput value={area} onChange={(e) => setArea(e.target.value)} placeholder="Quận 7, Bình Thạnh..." />
            </FormField>

            <FormField label="Địa điểm / Tên sân">
              <TextInput value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Sân CL Phú Mỹ Hưng" />
            </FormField>

            <FormField label="Ngày khai giảng">
              <TextInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </FormField>

            <FormField label="Lịch học trong tuần">
              <TextInput value={days} onChange={(e) => setDays(e.target.value)} placeholder="Thứ 3 - Thứ 5" />
            </FormField>

            <FormField label="Khung giờ học">
              <TextInput value={time} onChange={(e) => setTime(e.target.value)} placeholder="19:00-20:30" />
            </FormField>

            <FormField label="Số buổi học">
              <TextInput type="number" value={sessions} onChange={(e) => setSessions(Number(e.target.value))} />
            </FormField>

            <FormField label="Thời lượng/buổi (phút)">
              <TextInput type="number" value={minutesPerSession} onChange={(e) => setMinutesPerSession(Number(e.target.value))} />
            </FormField>

            <FormField label="Học viên tối thiểu để mở lớp">
              <TextInput type="number" value={minStudents} onChange={(e) => setMinStudents(Number(e.target.value))} />
            </FormField>

            <FormField label="Học viên tối đa (Cap)">
              <TextInput type="number" value={maxStudents} onChange={(e) => setMaxStudents(Number(e.target.value))} />
            </FormField>
          </div>

          <FormField label="Học phí trọn khóa (VNĐ/học viên)" required>
            <TextInput type="number" value={price} onChange={(e) => setPrice(Number(e.target.value))} />
          </FormField>

          {/* Live Price Split Preview */}
          <div className="price-preview-card">
            <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Sparkles size={16} color="var(--color-primary)"/> Live Price Split Preview (Phân chia học phí realtime)
            </div>
            <div className="price-preview-grid">
              <div className="price-preview-item">
                <label>Mức học phí niêm yết</label>
                <strong>{price.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="price-preview-item">
                <label>Hoa hồng CoachMate ({commissionPercent}%)</label>
                <strong style={{ color: '#d97706' }}>-{commissionAmount.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="price-preview-item highlight">
                <label>HLV thực nhận / học viên</label>
                <strong>{netPayout.toLocaleString('vi-VN')}đ</strong>
              </div>
            </div>
          </div>

          <FormField label="Mục tiêu khóa học">
            <TextInput value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="Giúp học viên di chuyển linh hoạt và nắm vững cú smash..." />
          </FormField>

          <FormField label="Yêu cầu đầu vào">
            <TextInput value={requirement} onChange={(e) => setRequirement(e.target.value)} placeholder="Đã biết cầm vợt cơ bản hoặc không yêu cầu" />
          </FormField>

          <FormField label="Nội dung chương trình học (mỗi dòng 1 bài học)">
            <textarea
              value={curriculumText}
              onChange={(e) => setCurriculumText(e.target.value)}
              rows={4}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '14px'
              }}
            />
          </FormField>

          {/* Cover Image Selection Section */}
          <div style={{ border: '1px solid var(--color-border)', padding: '16px', borderRadius: '12px', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--color-text-primary)' }}>Hình ảnh bìa khóa học (Tùy chọn / Optional)</div>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--color-text-secondary)' }}>
              Bạn có thể nhập link hình ảnh hoặc tải ảnh lên từ thiết bị. Nếu không chọn, hệ thống sẽ tự động dùng hình ảnh mặc định.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
              <FormField label="Lựa chọn 1: Nhập link ảnh (URL)">
                <TextInput
                  value={coverImageUrl.startsWith('data:') ? '' : coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.target.value)}
                  placeholder="https://i.pinimg.com/..."
                />
              </FormField>

              <FormField label="Lựa chọn 2: Hoặc Tải ảnh từ thiết bị">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                    background: 'white',
                    fontSize: '13px',
                  }}
                />
              </FormField>
            </div>

            <div style={{ marginTop: '4px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>Xem trước ảnh đại diện:</div>
              <div style={{ width: '220px', height: '140px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)', background: '#e9f2ed' }}>
                <SportImage
                  src={coverImageUrl || DEFAULT_COURSE_COVER_IMAGE}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center 20%' }}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = DEFAULT_COURSE_COVER_IMAGE; }}
                />
              </div>
            </div>
          </div>

          {error && <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/coach/courses')}>Hủy bỏ</Button>
            <Button type="submit">Đăng khóa học ngay <ArrowRight size={16}/></Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function CoachStudentListPage() {
  const data = loadState();
  const students = useMemo(() => getCoachStudents(data, DEFAULT_COACH_ID), [data]);

  return (
    <div className="coach-page">
      <header className="coach-header">
        <Badge tone="lime"><Users size={13}/> DANH SÁCH HỌC VIÊN</Badge>
        <h2>Học viên đã đăng ký các lớp của bạn</h2>
        <p>Quản lý danh sách học viên và thông tin đăng ký.</p>
      </header>

      {students.length === 0 ? (
        <EmptyState title="Chưa có học viên nào" description="Các lượt đăng ký mới sẽ xuất hiện tại đây." />
      ) : (
        <div className="coach-table-card">
          <table className="coach-table">
            <thead>
              <tr>
                <th>Học viên</th>
                <th>SĐT / Email</th>
                <th>Khóa học</th>
                <th>Học phí</th>
                <th>Hoa hồng</th>
                <th>HLV Thực nhận</th>
                <th>Ngày đăng ký</th>
              </tr>
            </thead>
            <tbody>
              {students.map(({ enrollment, course, student }) => (
                <tr key={enrollment.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar name={enrollment.studentName} size="sm" />
                      <strong>{enrollment.studentName}</strong>
                    </div>
                  </td>
                  <td>
                    <div>{student?.phone || '—'}</div>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{student?.email || '—'}</div>
                  </td>
                  <td><strong>{course.title}</strong></td>
                  <td>{enrollment.price.toLocaleString('vi-VN')}đ</td>
                  <td style={{ color: '#d97706' }}>-{enrollment.commission.toLocaleString('vi-VN')}đ</td>
                  <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>
                    {(enrollment.price - enrollment.commission).toLocaleString('vi-VN')}đ
                  </td>
                  <td>{new Date(enrollment.createdAt).toLocaleDateString('vi-VN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function CoachSchedulePage() {
  const data = loadState();
  const coachCourses = data.courses.filter((course) => course.coachId === DEFAULT_COACH_ID);

  return (
    <div className="coach-page">
      <header className="coach-header">
        <Badge tone="success"><CalendarDays size={13}/> LỊCH DẠY HỌC</Badge>
        <h2>Thời khóa biểu dạy cầu lông</h2>
        <p>Lịch giảng dạy chi tiết theo tuần của các lớp học.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px' }}>
        {coachCourses.map((course) => {
          const enrollments = data.enrollments.filter((e) => e.courseId === course.id);
          return (
            <Card key={course.id}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ background: 'var(--color-mint)', padding: '10px', borderRadius: '8px', color: 'var(--color-primary)' }}>
                  <Calendar size={20}/>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}>{course.title}</h3>
                  <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{course.days} · {course.time}</div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px' }}>
                <div><MapPin size={14}/> <strong>Địa điểm:</strong> {course.venue}, {course.area}</div>
                <div><Users size={14}/> <strong>Sĩ số hiện tại:</strong> {enrollments.length} / {course.maxStudents} học viên</div>
                <div><GraduationCap size={14}/> <strong>Khai giảng:</strong> {new Date(course.startDate).toLocaleDateString('vi-VN')}</div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function CoachProPage() {
  const [data, setData] = useState(loadState);
  const toast = useToast();
  const isPro = useMemo(() => data.subscriptions.some((s) => s.coachId === DEFAULT_COACH_ID && s.active), [data]);
  const proPrice = data.settings.coachProMonthlyPrice;

  const handleSubscribe = () => {
    try {
      const updated = subscribeCoachPro(data, DEFAULT_COACH_ID);
      saveState(updated);
      setData(updated);
      toast('Đã ghi nhận yêu cầu đăng ký Coach Pro.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Không thể đăng ký Coach Pro.', 'error');
    }
  };

  const handleCancel = () => {
    try {
      const updated = cancelCoachPro(data, DEFAULT_COACH_ID);
      saveState(updated);
      setData(updated);
      toast('Đã hủy gia hạn gói Coach Pro.', 'info');
    } catch (err) {
      toast('Không thể hủy gói.', 'error');
    }
  };

  return (
    <div className="coach-page">
      <div className="coach-pro-hero">
        <div className="coach-pro-content">
          <span className="coach-pro-badge"><Sparkles size={14}/> GÓI HỘI VIÊN CAO CẤP</span>
          <h2>Coach Pro — Nâng tầm thương hiệu HLV</h2>
          <p>Thu hút thêm nhiều học viên hơn với các quyền lợi ưu tiên hiển thị và công cụ quảng bá chuyên nghiệp.</p>
          <div className="coach-pro-price">{proPrice.toLocaleString('vi-VN')}đ / tháng</div>
          <div className="coach-pro-payment-note"><BadgeCheck size={15}/> Xác nhận thanh toán sẽ được xử lý riêng với ngân hàng hoặc đơn vị thanh toán.</div>

          {isPro ? (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <Badge tone="lime"><CheckCircle2 size={14}/> Đã đăng ký</Badge>
              <Button variant="secondary" onClick={handleCancel}>Hủy gia hạn</Button>
            </div>
          ) : (
            <Button onClick={handleSubscribe} style={{ background: '#c6f135', color: '#20332d', fontWeight: 700 }}>
              Nâng cấp Coach Pro ngay <ArrowRight size={16}/>
            </Button>
          )}
        </div>
      </div>

      <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '16px 0 0 0' }}>Quyền lợi độc quyền của Coach Pro</h3>

      <div className="coach-pro-benefits">
        <div className="coach-pro-benefit-item">
          <Award size={24}/>
          <div>
            <strong>Ưu tiên lên đầu chợ khóa học</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Khóa học của bạn luôn được xếp vị trí ưu tiên khi học viên tìm kiếm.
            </p>
          </div>
        </div>

        <div className="coach-pro-benefit-item">
          <Sparkles size={24}/>
          <div>
            <strong>Huy hiệu Pro chính thức</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Gắn nhãn Coach Pro nổi bật trên thẻ khóa học và hồ sơ HLV.
            </p>
          </div>
        </div>

        <div className="coach-pro-benefit-item">
          <CircleDollarSign size={24}/>
          <div>
            <strong>Tăng trưởng thu nhập</strong>
            <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Tiếp cận trung bình gấp 3 lần số lượng học viên mới mỗi tháng.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function CoachRevenuePage() {
  const data = loadState();
  const overview = useMemo(() => getCoachOverview(data, DEFAULT_COACH_ID), [data]);

  return (
    <div className="coach-page">
      <header className="coach-header">
        <Badge tone="success"><CircleDollarSign size={13}/> BÁO CÁO DOANH THU</Badge>
        <h2>Thu nhập & Chi tiết hoa hồng</h2>
        <p>Chi tiết doanh thu thu hộ và khấu trừ hoa hồng nền tảng.</p>
      </header>

      <div className="coach-kpi-grid">
        <div className="coach-kpi-card">
          <div className="coach-kpi-head"><span>Tổng GMV Thu hộ</span></div>
          <div className="coach-kpi-value">{overview.grossRevenue.toLocaleString('vi-VN')}đ</div>
        </div>

        <div className="coach-kpi-card">
          <div className="coach-kpi-head"><span>Hoa hồng CoachMate ({data.settings.commissionPercent}%)</span></div>
          <div className="coach-kpi-value" style={{ color: '#d97706' }}>-{overview.platformCommission.toLocaleString('vi-VN')}đ</div>
        </div>

        <div className="coach-kpi-card highlight">
          <div className="coach-kpi-head"><span>Thực nhận (Net Payout)</span></div>
          <div className="coach-kpi-value" style={{ color: 'var(--color-primary)' }}>{overview.coachPayout.toLocaleString('vi-VN')}đ</div>
        </div>
      </div>
    </div>
  );
}

export function CoachProfilePage() {
  const [data, setData] = useState(loadState);
  const coach = data.coaches.find((item) => item.id === DEFAULT_COACH_ID);
  const [name, setName] = useState(coach?.name ?? '');
  const [bio, setBio] = useState(coach?.bio ?? '');
  const [area, setArea] = useState(coach?.area ?? '');
  const [specialties, setSpecialties] = useState(coach?.specialties.join(', ') ?? '');
  const toast = useToast();
  const save = (event: FormEvent) => {
    event.preventDefault();
    try {
      const updated = updateCoachProfile(loadState(), DEFAULT_COACH_ID, {
        name, bio, area, specialties: specialties.split(','),
      });
      saveState(updated);
      setData(updated);
      toast('Đã cập nhật hồ sơ huấn luyện viên.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Không thể cập nhật hồ sơ.', 'error');
    }
  };
  if (!coach) return <EmptyState title="Không tìm thấy hồ sơ" description="Vui lòng thử lại sau." />;

  return (
    <div className="coach-page coach-profile-page">
      <header className="coach-header">
        <Badge tone="lime"><Award size={13}/> HỒ SƠ HUẤN LUYỆN VIÊN</Badge>
        <h2>Hồ sơ huấn luyện viên</h2>
        <p>Giúp học viên hiểu rõ kinh nghiệm, thế mạnh và phong cách huấn luyện của bạn.</p>
      </header>
      <section className="coach-profile-summary">
        <div className="coach-profile-avatar"><Avatar name={coach.name} size="lg"/></div>
        <div className="coach-profile-summary-copy">
          <Badge tone="success"><BadgeCheck size={13}/> Hồ sơ huấn luyện viên</Badge>
          <h3>{coach.name}</h3><span><MapPin size={15}/>{coach.area}</span>
          <Rating value={coach.ratingSum / Math.max(1, coach.ratingCount)} count={coach.ratingCount}/>
        </div>
        <div className="coach-profile-summary-stat"><strong>{getCoachOverview(data, DEFAULT_COACH_ID).courseCount}</strong><span>khóa học</span></div>
      </section>
      <div className="coach-profile-layout">
        <Card className="coach-profile-form-card">
          <div className="coach-profile-section-title"><div><span>HỒ SƠ CÔNG KHAI</span><h3>Thông tin giới thiệu</h3></div><Pencil size={18}/></div>
          <form onSubmit={save} className="coach-profile-form">
            <FormField label="Họ và tên" required><TextInput value={name} onChange={(event) => setName(event.target.value)} autoComplete="name"/></FormField>
            <FormField label="Khu vực hoạt động" required><Select value={area} onChange={(event) => setArea(event.target.value)}>{['Quận 1','Quận 7','Bình Thạnh','Tân Bình','Thủ Đức'].map((item) => <option key={item}>{item}</option>)}</Select></FormField>
            <FormField label="Giới thiệu kinh nghiệm"><textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={5} placeholder="Chia sẻ kinh nghiệm và phương pháp huấn luyện của bạn."/></FormField>
            <FormField label="Chuyên môn" hint="Phân tách từng kỹ năng bằng dấu phẩy."><TextInput value={specialties} onChange={(event) => setSpecialties(event.target.value)} placeholder="Footwork, chiến thuật, đánh đôi"/></FormField>
            <div className="coach-profile-form-footer"><span>Thông tin này xuất hiện trên trang hồ sơ của bạn.</span><Button type="submit"><CheckCircle2 size={16}/> Lưu thay đổi</Button></div>
          </form>
        </Card>
        <Card className="coach-profile-preview">
          <span className="coach-profile-preview-label">HỌC VIÊN SẼ THẤY</span>
          <div className="coach-profile-preview-person"><Avatar name={name || coach.name}/><div><strong>{name || coach.name}</strong><span><MapPin size={13}/>{area || 'Chưa chọn khu vực'}</span></div></div>
          <Rating value={coach.ratingSum / Math.max(1, coach.ratingCount)} count={coach.ratingCount}/>
          <p>{bio || 'Phần giới thiệu của bạn sẽ hiển thị tại đây.'}</p>
          <div className="coach-profile-specialties">{specialties.split(',').map((item) => item.trim()).filter(Boolean).map((item) => <Badge key={item} tone="neutral">{item}</Badge>)}</div>
        </Card>
      </div>
    </div>
  );
}
