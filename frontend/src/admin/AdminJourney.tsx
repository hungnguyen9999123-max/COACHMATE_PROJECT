import {
  Award, BarChart3, CircleDollarSign, DollarSign, Plus, Settings2, Trophy,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, Button, Card, FormField, Select, TextInput, useToast } from '../design-system/components';
import { createBrowserDemoRepository } from '../data/repository';
import {
  updateAssumptionStatusByAdmin, updateBusinessSettingsByAdmin,
} from '../domain/adminFlows';
import { BUSINESS_ASSUMPTIONS, VALIDATION_STATUSES } from '../domain/constants';
import { calculatePlatformTotals } from '../domain/finance';
import type { DemoState, ValidationStatus } from '../domain/types';
import './admin.css';

function loadState() {
  return createBrowserDemoRepository().load();
}

function saveState(state: DemoState) {
  createBrowserDemoRepository().save(state);
}

export function AdminDashboardPage() {
  const navigate = useNavigate();
  const data = loadState();
  const totals = useMemo(() => calculatePlatformTotals(data), [data]);

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <Badge tone="lime"><Trophy size={13}/> BAN TỔ CHỨC & QUẢN TRỊ NỀN TẢNG</Badge>
          <h2>Tổng quan hoạt động & Tài chính CoachMate</h2>
          <p>Báo cáo doanh thu nhận diện, dòng tiền tạm giữ và hoạt động các giải đấu.</p>
        </div>
        <Button onClick={() => navigate('/organizer/tournaments/new')}>
          <Plus size={16}/> Tạo giải đấu mới
        </Button>
      </header>

      <div className="admin-kpi-grid">
        <div className="admin-kpi-card highlight">
          <div className="admin-kpi-title">
            <span>Doanh thu nhận diện (Recognized Revenue)</span>
            <CircleDollarSign size={18} color="var(--color-primary)"/>
          </div>
          <div className="admin-kpi-amount" style={{ color: 'var(--color-primary)' }}>
            {totals.platformRevenue.toLocaleString('vi-VN')}đ
          </div>
          <div className="admin-kpi-sub">Hoa hồng khóa học + Coach Pro + Giải đã kết thúc</div>
        </div>

        <div className="admin-kpi-card warning">
          <div className="admin-kpi-title">
            <span>Dòng tiền tạm giữ (Held Funds)</span>
            <DollarSign size={18} color="#f59e0b"/>
          </div>
          <div className="admin-kpi-amount" style={{ color: '#d97706' }}>
            {totals.heldTournamentFees.toLocaleString('vi-VN')}đ
          </div>
          <div className="admin-kpi-sub">Lệ phí các giải đang mở đăng ký (chưa tổ chức)</div>
        </div>

        <div className="admin-kpi-card">
          <div className="admin-kpi-title">
            <span>Tổng chi phí nhận diện</span>
            <BarChart3 size={18}/>
          </div>
          <div className="admin-kpi-amount" style={{ color: '#dc2626' }}>
            -{totals.totalCosts.toLocaleString('vi-VN')}đ
          </div>
          <div className="admin-kpi-sub">Phí thanh toán + Vận hành sân & trọng tài</div>
        </div>

        <div className="admin-kpi-card highlight">
          <div className="admin-kpi-title">
            <span>Ước tính lợi nhuận ròng</span>
            <Award size={18} color="var(--color-primary)"/>
          </div>
          <div className="admin-kpi-amount" style={{ color: 'var(--color-primary)' }}>
            {totals.estimatedProfit.toLocaleString('vi-VN')}đ
          </div>
          <div className="admin-kpi-sub">Doanh thu nhận diện trừ chi phí</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <Button variant="secondary" onClick={() => navigate('/organizer/tournaments')}>
          <Trophy size={16}/> Quản lý giải đấu ({data.tournaments.length})
        </Button>
        <Button variant="secondary" onClick={() => navigate('/admin/reports')}>
          <BarChart3 size={16}/> Phễu chuyển đổi & Chi tiết tài chính
        </Button>
        <Button variant="outline" onClick={() => navigate('/admin/settings')}>
          <Settings2 size={16}/> Giả định kinh doanh & Cấu hình
        </Button>
      </div>

      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px' }}>Nhật ký hoạt động gần đây</h3>
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <table className="coach-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Người thực hiện</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {data.activityLogs.slice(0, 5).map((log) => (
                <tr key={log.id}>
                  <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)', width: '160px' }}>
                    {new Date(log.occurredAt).toLocaleString('vi-VN')}
                  </td>
                  <td><strong>{log.actorName}</strong></td>
                  <td>{log.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>
    </div>
  );
}

export function AdminFinancePage() {
  const data = loadState();
  const totals = useMemo(() => calculatePlatformTotals(data), [data]);
  const funnel = data.funnel;
  const conversionRate = (stage: number) => funnel.courseDetailViews > 0
    ? Math.round((stage / funnel.courseDetailViews) * 100)
    : 0;

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <Badge tone="success"><CircleDollarSign size={13}/> TÀI CHÍNH NỀN TẢNG</Badge>
          <h2>Báo cáo tài chính & Phễu chuyển đổi</h2>
          <p>Phân tích nguồn thu nhập và tỷ lệ chuyển đổi học viên.</p>
        </div>
      </header>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>
          Phễu chuyển đổi đăng ký (Funnel Conversion)
        </h3>
        <div className="funnel-container">
          <div className="funnel-step">
            <span style={{ width: '160px', fontSize: '13px', fontWeight: 600 }}>Lượt xem chi tiết khóa</span>
            <div className="funnel-bar-wrap">
              <div className="funnel-bar-fill" style={{ width: `${conversionRate(funnel.courseDetailViews)}%` }} />
              <span className="funnel-bar-text">{funnel.courseDetailViews} lượt xem ({conversionRate(funnel.courseDetailViews)}%)</span>
            </div>
          </div>

          <div className="funnel-step">
            <span style={{ width: '160px', fontSize: '13px', fontWeight: 600 }}>Bắt đầu Checkout</span>
            <div className="funnel-bar-wrap">
              <div className="funnel-bar-fill" style={{ width: `${Math.min(100, conversionRate(funnel.checkoutStarts))}%` }} />
              <span className="funnel-bar-text">
                {funnel.checkoutStarts} lượt ({conversionRate(funnel.checkoutStarts)}%)
              </span>
            </div>
          </div>

          <div className="funnel-step">
            <span style={{ width: '160px', fontSize: '13px', fontWeight: 600 }}>Thanh toán thành công</span>
            <div className="funnel-bar-wrap">
              <div className="funnel-bar-fill" style={{ width: `${Math.min(100, conversionRate(funnel.paymentsCompleted))}%` }} />
              <span className="funnel-bar-text">
                {funnel.paymentsCompleted} lượt ({conversionRate(funnel.paymentsCompleted)}%)
              </span>
            </div>
          </div>
        </div>
      </Card>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Bảng chi tiết doanh thu & chi phí</h3>
        <table className="coach-table">
          <thead>
            <tr>
              <th>Hạng mục tài chính</th>
              <th>Số tiền (VNĐ)</th>
              <th>Ghi chú</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>GMV Khóa học thu hộ</td>
              <td><strong>{totals.courseGmv.toLocaleString('vi-VN')}đ</strong></td>
              <td>Tổng tiền học phí từ học viên</td>
            </tr>
            <tr>
              <td>Hoa hồng khóa học ({data.settings.commissionPercent}%)</td>
              <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>+{totals.courseCommission.toLocaleString('vi-VN')}đ</td>
              <td>Doanh thu ghi nhận của nền tảng</td>
            </tr>
            <tr>
              <td>Doanh thu gói Coach Pro</td>
              <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>+{totals.subscriptionRevenue.toLocaleString('vi-VN')}đ</td>
              <td>Doanh thu nâng cấp tài khoản HLV</td>
            </tr>
            <tr>
              <td>Doanh thu giải đấu đã kết thúc</td>
              <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>+{totals.tournamentRevenue.toLocaleString('vi-VN')}đ</td>
              <td>Lệ phí các giải đã diễn ra xong</td>
            </tr>
            <tr style={{ background: '#fef3c7' }}>
              <td>Dòng tiền giải đấu tạm giữ (Held Funds)</td>
              <td style={{ color: '#d97706', fontWeight: 700 }}>{totals.heldTournamentFees.toLocaleString('vi-VN')}đ</td>
              <td>Chưa ghi nhận doanh thu (các giải đang mở)</td>
            </tr>
            <tr>
              <td>Phí thanh toán ({data.settings.paymentFeePercent}%)</td>
              <td style={{ color: '#dc2626' }}>-{totals.coursePaymentFees.toLocaleString('vi-VN')}đ</td>
              <td>Chi phí cổng thanh toán</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}







export function AdminAssumptionsPage() {
  const [data, setData] = useState(loadState);
  const toast = useToast();

  const [commissionPercent, setCommissionPercent] = useState(data.settings.commissionPercent);
  const [paymentFeePercent, setPaymentFeePercent] = useState(data.settings.paymentFeePercent);
  const [coachProMonthlyPrice, setCoachProMonthlyPrice] = useState(data.settings.coachProMonthlyPrice);

  const handleSaveSettings = (e: FormEvent) => {
    e.preventDefault();
    const updated = updateBusinessSettingsByAdmin(data, {
      commissionPercent,
      paymentFeePercent,
      coachProMonthlyPrice,
    });
    saveState(updated);
    setData(updated);
    toast('Đã lưu cấu hình cài đặt kinh doanh!', 'success');
  };

  const handleStatusChange = (assumptionText: string, status: ValidationStatus) => {
    const updated = updateAssumptionStatusByAdmin(data, assumptionText, status);
    saveState(updated);
    setData(updated);
    toast('Đã cập nhật trạng thái kiểm chứng!', 'info');
  };

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h2>Giả định Kinh doanh & Cấu hình Tham số</h2>
          <p>Quản lý các giả định mô hình kinh doanh và tham số hoa hồng hệ thống.</p>
        </div>
      </header>

      <Card style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>Cấu hình tham số tài chính hệ thống</h3>
        <form onSubmit={handleSaveSettings} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <FormField label="Tỷ lệ hoa hồng khóa học (%)">
            <TextInput type="number" value={commissionPercent} onChange={(e) => setCommissionPercent(Number(e.target.value))} />
          </FormField>
          <FormField label="Phí thanh toán (%)">
            <TextInput type="number" value={paymentFeePercent} onChange={(e) => setPaymentFeePercent(Number(e.target.value))} />
          </FormField>
          <FormField label="Giá gói Coach Pro (VNĐ/tháng)">
            <TextInput type="number" value={coachProMonthlyPrice} onChange={(e) => setCoachProMonthlyPrice(Number(e.target.value))} />
          </FormField>
          <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit">Lưu tham số</Button>
          </div>
        </form>
      </Card>

      <section>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Bảng kiểm chứng 9 Giả định Kinh doanh (Validation Board)</h3>
        <div className="assumptions-grid">
          {BUSINESS_ASSUMPTIONS.map((assumption, index) => {
            const currentStatus = data.assumptionStatuses[assumption] || 'Chưa kiểm chứng';

            return (
              <div key={index} className="assumption-card">
                <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                  {index + 1}. {assumption}
                </div>
                <div>
                  <Select
                    value={currentStatus}
                    onChange={(e) => handleStatusChange(assumption, e.target.value as ValidationStatus)}
                  >
                    {VALIDATION_STATUSES.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </Select>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export function AdminActivityLogPage() {
  const data = loadState();

  return (
    <div className="admin-page">
      <header className="admin-header">
        <div>
          <h2>Nhật ký hoạt động hệ thống (Activity Log)</h2>
          <p>Lịch sử thao tác ngược thời gian của toàn bộ người dùng và hệ thống.</p>
        </div>
      </header>

      <Card style={{ padding: '0', overflow: 'hidden' }}>
        <table className="coach-table">
          <thead>
            <tr>
              <th>Thời gian</th>
              <th>Người thực hiện</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {data.activityLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontSize: '12px', color: 'var(--color-text-secondary)', width: '180px' }}>
                  {new Date(log.occurredAt).toLocaleString('vi-VN')}
                </td>
                <td><strong>{log.actorName}</strong></td>
                <td>{log.action}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
