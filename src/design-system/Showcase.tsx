import {
  Activity,
  ArrowRight,
  Bell,
  CalendarDays,
  Check,
  ChevronRight,
  CircleHelp,
  CreditCard,
  Dumbbell,
  LayoutDashboard,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  CoachCard,
  ConfirmDialog,
  CourseCard,
  Divider,
  Drawer,
  EmptyState,
  ErrorState,
  FormField,
  IconButton,
  LoadingIndicator,
  Modal,
  NavItem,
  PriceDisplay,
  ProgressBar,
  Radio,
  Rating,
  SearchInput,
  Select,
  Skeleton,
  StatusIndicator,
  StatisticCard,
  Tabs,
  TextArea,
  TextInput,
  ToastProvider,
  TournamentCard,
  Tooltip,
  useToast,
} from './components';

function ShowcaseContent() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('Tổng quan');
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  return <div className="ds-shell">
    <aside className="ds-sidebar">
      <a className="ds-brand" href="/design-system" aria-label="CoachMate Design System"><span className="ds-brand-icon"><Dumbbell size={19}/></span><span>COACH<span>MATE</span><small>DESIGN SYSTEM</small></span></a>
      <p className="ds-side-label">WORKSPACE</p>
      <NavItem active icon={<LayoutDashboard size={17}/>}>Overview</NavItem>
      <NavItem icon={<Users size={17}/>}>Students</NavItem>
      <NavItem icon={<Trophy size={17}/>}>Tournaments</NavItem>
      <NavItem icon={<CreditCard size={17}/>}>Finances</NavItem>
      <div className="ds-sidebar-bottom"><NavItem icon={<Settings2 size={17}/>}>Settings</NavItem><NavItem icon={<CircleHelp size={17}/>}>Help center</NavItem><div className="ds-profile"><Avatar name="Mai Anh"/><span><strong>Mai Anh</strong><small>Demo account</small></span><ChevronRight size={15}/></div></div>
    </aside>

    <div className="ds-main">
      <header className="ds-topbar"><div className="ds-mobile-brand"><Dumbbell size={18}/> CoachMate</div><Breadcrumb items={['Components', 'Design system']}/><div className="ds-top-actions"><span className="ds-demo-label"><i/>Demo workspace</span><IconButton label="Thông báo" onClick={() => toast('Bạn đã xem tất cả thông báo.', 'info')}><Bell size={18}/></IconButton><Avatar name="Mai Anh" size="sm"/></div></header>
      <main className="ds-content">
        <section className="ds-hero"><div><Badge tone="success"><Sparkles size={13}/> SPRINT 1.1 · FOUNDATION</Badge><h1>Design system</h1><p>Một ngôn ngữ giao diện thống nhất cho trải nghiệm cầu lông CoachMate.</p></div><Button icon={<Plus size={16}/>} onClick={() => toast('Thành phần đã được thêm vào bộ sưu tập.')}>Thêm thành phần</Button></section>
        <div className="ds-callout"><span><ShieldCheck size={19}/></span><p><strong>Frontend demo</strong><br/>Mọi nội dung và thao tác trong showcase đều là mẫu. Không có giao dịch thật.</p><Button variant="ghost" size="sm" onClick={() => toast('Toàn bộ dữ liệu demo đang hiển thị.', 'info')}>Tìm hiểu thêm <ArrowRight size={14}/></Button></div>

        <section className="ds-section" id="tokens"><div className="ds-section-heading"><div><span className="ds-kicker">01 · FOUNDATIONS</span><h2>Màu sắc thương hiệu</h2><p>Bảng màu sáng, lấy cảm hứng từ sân đấu và năng lượng vận động.</p></div></div><div className="ds-color-grid">{[['Primary','#168A63','color-primary'],['Primary dark','#116B4D','color-primary-dark'],['Mint','#E4F5EC','color-primary-soft'],['Lime accent','#C6F135','color-lime'],['Background','#F7F9F8','color-background'],['Surface','#FFFFFF','color-surface'],['Main text','#20332D','color-text'],['Secondary text','#74837C','color-text-secondary'],['Border','#E7EDE9','color-border']].map(([name,value,token])=><div className="ds-color" key={token}><span style={{background:value}}/><div><strong>{name}</strong><small>{value}</small></div></div>)}</div></section>

        <section className="ds-section"><div className="ds-section-heading"><div><span className="ds-kicker">02 · TYPOGRAPHY</span><h2>Chữ rõ ràng, thân thiện</h2><p>Be Vietnam Pro hỗ trợ nội dung tiếng Việt ở mọi kích thước.</p></div></div><Card className="ds-type-card"><div className="ds-type-meta">DISPLAY · 48 / 600</div><h1 className="ds-type-display">Cùng nhau tiến bộ</h1><Divider/><div className="ds-type-meta">HEADING 2 · 30 / 600</div><h2>Khóa học phù hợp với bạn</h2><div className="ds-type-meta">BODY · 16 / 400</div><p>Khám phá lớp học gần bạn, rèn kỹ thuật cùng huấn luyện viên và tự tin hơn trên sân đấu.</p><div className="ds-type-meta">CAPTION · 13 / 500</div><small className="cm-field-hint">Lịch học cuối tuần · Quận 7 · Còn 3 chỗ</small></Card></section>

        <section className="ds-section"><div className="ds-section-heading"><div><span className="ds-kicker">03 · ACTIONS</span><h2>Buttons & controls</h2><p>Phân cấp hành động rõ ràng, trạng thái tương tác dễ nhận biết.</p></div></div><Card><div className="ds-control-row"><Button>Đăng ký khóa học</Button><Button variant="secondary">Lưu thay đổi</Button><Button variant="outline">Xem chi tiết</Button><Button variant="ghost">Bỏ qua</Button><Button variant="danger">Hủy đăng ký</Button><IconButton label="Tìm kiếm"><Search size={17}/></IconButton><Button size="sm">Small</Button><Button size="lg">Large</Button><Button disabled>Đang xử lý</Button></div><Divider label="Dropdown"/><div className="ds-dropdown-area"><Button variant="outline" onClick={() => setMenuOpen(!menuOpen)}>Tùy chọn <ChevronRight size={15}/></Button>{menuOpen && <div className="ds-dropdown" role="menu"><button role="menuitem" onClick={() => {setMenuOpen(false);toast('Đã chọn chỉnh sửa.');}}>Chỉnh sửa khóa học</button><button role="menuitem" onClick={() => {setMenuOpen(false);toast('Đã sao chép liên kết.','info');}}>Sao chép liên kết</button><button role="menuitem" onClick={() => {setMenuOpen(false);setConfirmOpen(true);}}>Xóa khỏi danh sách</button></div>}<Tooltip text="Mở trợ giúp về nút hành động"><CircleHelp size={18}/></Tooltip></div></Card></section>

        <section className="ds-section"><div className="ds-section-heading"><div><span className="ds-kicker">04 · FORMS</span><h2>Form elements</h2><p>Nhãn, gợi ý và lỗi luôn đi cùng trường nhập để dễ sử dụng.</p></div></div><Card className="ds-form-grid"><FormField label="Tìm kiếm" hint="Tìm theo tên khóa, HLV hoặc sân."><SearchInput aria-label="Tìm kiếm"/></FormField><FormField label="Tên khóa học" required><TextInput placeholder="Ví dụ: Cầu lông nền tảng"/></FormField><FormField label="Khu vực"><Select defaultValue="q7"><option value="q7">Quận 7</option><option>Bình Thạnh</option><option>Thủ Đức</option></Select></FormField><FormField label="Giá khóa học" error="Vui lòng nhập mức giá hợp lệ."><TextInput invalid type="number" placeholder="1.200.000"/></FormField><FormField label="Mô tả" hint="Mô tả ngắn về mục tiêu khóa học."><TextArea placeholder="Học viên sẽ đạt được..."/></FormField><div className="ds-choice-stack"><Checkbox label="Tôi đã đọc thông tin khóa học" defaultChecked/><Radio name="schedule" label="Buổi tối trong tuần" defaultChecked/><Radio name="schedule" label="Cuối tuần"/></div></Card></section>

        <section className="ds-section"><div className="ds-section-heading"><div><span className="ds-kicker">05 · SURFACES</span><h2>Cards, badges & indicators</h2><p>Thông tin được nhóm theo ngữ cảnh, giữ nhịp đọc thoáng.</p></div></div><div className="ds-showcase-grid"><Card><div className="ds-card-heading"><strong>Trạng thái đăng ký</strong><Badge tone="success" dot>Đang mở</Badge></div><p className="cm-field-hint">Các trạng thái sử dụng màu có ý nghĩa ổn định.</p><div className="ds-badges"><Badge>Chờ xác nhận</Badge><Badge tone="success" dot>Đã xác nhận</Badge><Badge tone="warning" dot>Sắp đầy</Badge><Badge tone="danger" dot>Đã đầy</Badge><Badge tone="info">Đang diễn ra</Badge><Badge tone="lime">Coach Pro</Badge></div><Divider/><div className="ds-control-row"><StatusIndicator label="Đang hoạt động"/><Rating value={4.9} count={24}/></div><ProgressBar value={6} max={8} label="6 trên 8 học viên"/><Divider label="Avatar"/><div className="ds-control-row"><Avatar name="Mai Anh" size="sm"/><Avatar name="Nguyễn Minh Khang"/><Avatar name="Trần Thu Hà" size="lg"/></div></Card><Card className="ds-stat-demo"><StatisticCard label="Học viên đã đăng ký" value="128" change="+12% so với tháng trước" icon={<Users size={18}/>}/><StatisticCard label="Doanh thu mô phỏng" value="24,8M đ" change="Dữ liệu mẫu" icon={<Activity size={18}/>}/></Card></div></section>

        <section className="ds-section"><div className="ds-section-heading"><div><span className="ds-kicker">06 · NAVIGATION</span><h2>Navigation patterns</h2><p>Thành phần điều hướng hỗ trợ chuột, bàn phím và màn hình nhỏ.</p></div></div><Card><Breadcrumb items={['Trang chủ','Khóa học','Chi tiết khóa học']}/><Divider/><Tabs items={['Tổng quan','Lịch học','Đánh giá']} active={activeTab} onChange={setActiveTab}/><p className="ds-tab-result"><Check size={15}/> Tab đang mở: <strong>{activeTab}</strong></p></Card></section>

        <section className="ds-section"><div className="ds-section-heading"><div><span className="ds-kicker">07 · FEEDBACK</span><h2>Dialogs, toasts & states</h2><p>Phản hồi rõ ràng cho xác nhận, thành công, tải và lỗi.</p></div></div><Card><div className="ds-control-row"><Button variant="outline" onClick={() => setModalOpen(true)}>Mở modal</Button><Button variant="outline" onClick={() => setConfirmOpen(true)}>Confirmation</Button><Button variant="outline" onClick={() => setDrawerOpen(true)}>Mở drawer</Button><Button onClick={() => toast('Đã lưu thay đổi của bạn.')}>Toast thành công</Button><Button variant="ghost" onClick={() => toast('Không thể lưu lúc này. Hãy thử lại.', 'error')}>Toast lỗi</Button><LoadingIndicator label="Đang tải dữ liệu"/></div><Divider/><div className="ds-state-grid"><div><span className="cm-field-hint">SKELETON</span><Card className="ds-skeleton-card"><Skeleton width={48} height={48} circle/><span><Skeleton width="80%"/><Skeleton width="58%"/></span></Card></div><div><span className="cm-field-hint">EMPTY STATE</span><EmptyState title="Chưa có khóa học" description="Khi bạn đăng ký lớp học, thông tin sẽ xuất hiện tại đây." action={<Button size="sm" variant="outline">Khám phá khóa học</Button>}/></div><div><span className="cm-field-hint">ERROR STATE</span><ErrorState title="Không tải được nội dung" description="Kiểm tra kết nối rồi thử lại."/></div></div></Card></section>

        <section className="ds-section"><div className="ds-section-heading"><div><span className="ds-kicker">08 · BUSINESS COMPONENTS</span><h2>Thành phần dành cho CoachMate</h2><p>Card khóa học, huấn luyện viên, giải đấu và giá sử dụng chung một hệ thống.</p></div></div><div className="ds-business-grid"><CourseCard title="Cầu lông cho người mới: nền tảng vững chắc" coach="Nguyễn Minh Khang" area="Quận 7" schedule="T3 · T5, 19:00" price={1200000} enrolled={5} capacity={8} minimum={4} image="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1000&q=80"/><CoachCard name="Trần Thu Hà" specialty="Footwork · Phòng thủ" area="Bình Thạnh" rating={4.8}/><TournamentCard name="CoachMate Mini Cup #1" date="06 Tháng 12, 2026" venue="Nhà thi đấu Quận 7" format="ĐƠN · PHONG TRÀO" registrations={18} capacity={32} fee={250000} prize="Cúp & 1.500.000đ"/></div><Card className="ds-price-example"><span>PRICE DISPLAY</span><PriceDisplay amount={99000} suffix="tháng"/><small>Giá gói Coach Pro mô phỏng</small></Card></section>

        <footer className="ds-footer"><span>CoachMate Design System <Badge tone="success">v0.1</Badge></span><span>Friendly Modern Sports SaaS · Frontend demo</span></footer>
      </main>
    </div>
    <Modal open={modalOpen} title="Ví dụ hộp thoại" onClose={() => setModalOpen(false)} footer={<><Button variant="outline" onClick={() => setModalOpen(false)}>Đóng</Button><Button onClick={() => {setModalOpen(false);toast('Đã xác nhận thao tác.');}}>Xác nhận</Button></>}><p className="cm-field-hint">Modal giữ nội dung dễ đọc, có thể đóng bằng phím Escape hoặc nút đóng.</p><div className="ds-modal-example"><CalendarDays size={18}/><span>Lớp tiếp theo<br/><strong>Thứ 3, 10 tháng 11 · 19:00</strong></span></div></Modal>
    <ConfirmDialog open={confirmOpen} title="Xác nhận thao tác" description="Bạn có chắc muốn tiếp tục? Đây chỉ là ví dụ tương tác trong showcase." onCancel={() => setConfirmOpen(false)} onConfirm={() => {setConfirmOpen(false);toast('Đã hoàn tất thao tác mẫu.');}}/>
    <Drawer open={drawerOpen} title="Bộ lọc khóa học" onClose={() => setDrawerOpen(false)}><div className="ds-drawer-body"><FormField label="Khu vực"><Select defaultValue="all"><option value="all">Tất cả khu vực</option><option>Quận 7</option><option>Bình Thạnh</option></Select></FormField><Checkbox label="Chỉ xem lớp còn chỗ"/><Button onClick={() => {setDrawerOpen(false);toast('Đã áp dụng bộ lọc.');}}>Áp dụng bộ lọc</Button></div></Drawer>
    <button className={`ds-fab ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Đã lưu thành phần' : 'Lưu thành phần'} onClick={() => {setSaved(!saved);toast(saved ? 'Đã bỏ lưu showcase.' : 'Đã lưu showcase vào mục yêu thích.');}}>{saved ? <Check size={18}/> : <Plus size={18}/>}</button>
  </div>;
}

export function DesignSystemShowcase() { return <ToastProvider><ShowcaseContent/></ToastProvider>; }
