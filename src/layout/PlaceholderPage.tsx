import { ArrowRight, CircleHelp } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Badge, Button } from '../design-system/components';
import { ROLE_NAVIGATION, ROLE_LABELS, type DemoRole } from '../navigation/roleNavigation';

interface LayoutContext { role: DemoRole; }

export function PlaceholderPage() {
  const { role } = useOutletContext<LayoutContext>();
  const navigate = useNavigate();
  const path = window.location.pathname;
  const entry = ROLE_NAVIGATION[role].find((item) => item.to === path);
  const Icon = entry?.icon ?? CircleHelp;

  return <section className="app-placeholder" aria-labelledby="placeholder-title">
    <span className="app-placeholder-mark"><Icon size={22}/></span>
    <Badge tone="success">{ROLE_LABELS[role]} · Demo</Badge>
    <h2 id="placeholder-title">{entry?.label ?? 'Không gian CoachMate'}</h2>
    <p>Màn hình này đang được chuẩn bị trong các sprint tiếp theo. Khung ứng dụng, điều hướng và dữ liệu demo đã sẵn sàng để kết nối trải nghiệm này.</p>
    <div className="app-placeholder-meta"><CircleHelp size={14}/> Nội dung hiển thị là mẫu, chưa có thao tác nghiệp vụ.</div>
    <Button className="app-placeholder-action" onClick={() => navigate(ROLE_NAVIGATION[role][0].to)}>
      Về tổng quan <ArrowRight size={15}/>
    </Button>
  </section>;
}

export function NotFoundPage() {
  const navigate = useNavigate();
  return <main className="app-not-found"><span className="code">COACHMATE · 404</span><h2>Không tìm thấy trang này</h2><p>Liên kết có thể đã thay đổi. Hãy quay về khu vực demo để tiếp tục khám phá CoachMate.</p><Button onClick={() => navigate('/student/courses')}>Về trang học viên <ArrowRight size={15}/></Button></main>;
}
