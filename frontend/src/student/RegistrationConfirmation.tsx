import { CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Badge, Card, EmptyState } from '../design-system/components';
import { createBrowserDemoRepository } from '../data/repository';

export function RegistrationConfirmation() {
  const { kind, recordId } = useParams();
  const state = createBrowserDemoRepository().load();
  const courseRecord = kind === 'course' ? state.enrollments.find((item) => item.id === recordId && item.studentId === state.currentStudentId) : undefined;
  const tournamentRecord = kind === 'tournament' ? state.tournamentRegistrations.find((item) => item.id === recordId && item.studentId === state.currentStudentId) : undefined;
  const record = courseRecord ?? tournamentRecord;
  if (!record) return <EmptyState title="Không tìm thấy xác nhận" description="Đăng ký này không thuộc học viên hiện tại hoặc chưa được lưu." action={<Link className="journey-link-button" to="/me/courses">Xem hoạt động của tôi</Link>}/>;
  const payment = state.payments.find((item) => item.id === record.paymentId);
  const amount = payment?.amount ?? (courseRecord ? courseRecord.price : tournamentRecord!.fee);
  const title = courseRecord ? state.courses.find((item) => item.id === courseRecord.courseId)?.title : state.tournaments.find((item) => item.id === tournamentRecord?.tournamentId)?.name;
  const status = courseRecord ? 'Đã đăng ký' : tournamentRecord?.reviewStatus === 'pending' ? 'Chờ Ban tổ chức duyệt' : tournamentRecord?.reviewStatus === 'rejected' ? 'Đã từ chối' : 'Đã được duyệt';
  return <Card className="confirmation-card"><span className="confirmation-icon"><CheckCircle2 size={32}/></span><Badge tone="success">ĐĂNG KÝ DEMO ĐÃ ĐƯỢC LƯU</Badge><h2>Hẹn gặp bạn trên sân!</h2><p>Thông tin đăng ký và giao dịch mô phỏng đã được ghi nhận trong trình duyệt.</p><h3>{title}</h3><dl className="confirmation-facts"><div><dt>Mã đăng ký</dt><dd>{record.id}</dd></div><div><dt>Trạng thái đăng ký</dt><dd><Badge tone="info">{status}</Badge></dd></div><div><dt>Số tiền mô phỏng</dt><dd>{new Intl.NumberFormat('vi-VN').format(amount)}đ</dd></div><div><dt>Thanh toán mô phỏng</dt><dd>{payment?.status === 'refunded' ? 'Đã hoàn mô phỏng' : 'Hoàn tất mô phỏng'} · {payment?.method ?? '—'}</dd></div></dl><div className="journey-demo-disclosure"><ShieldCheck size={19}/><span><strong>Không thu tiền thật</strong><small>Giao dịch này chỉ phục vụ trình diễn MVP. Bạn có thể xem lại sau khi tải lại trang.</small></span></div><div className="confirmation-actions"><Link className="journey-link-button" to={courseRecord ? '/me/courses' : '/me/tournaments'}>Xem hoạt động của tôi <ArrowRight size={16}/></Link><Link className="journey-link-button" to="/me/payments">Lịch sử thanh toán demo</Link></div></Card>;
}
