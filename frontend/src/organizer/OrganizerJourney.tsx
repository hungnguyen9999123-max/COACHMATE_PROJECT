import {
  ArrowRight, BarChart3, CalendarDays, CheckCircle2, ClipboardList, Pencil, Plus,
  Trash2, Trophy, Users, X,
} from 'lucide-react';
import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Badge, Button, Card, ConfirmDialog, EmptyState, FormField, Select, TextInput, useToast } from '../design-system/components';
import { createBrowserDemoRepository } from '../data/repository';
import {
  addCourtByOrganizer, addRefereeByOrganizer, approveTournamentRegistrationByOrganizer, createTournamentByOrganizer,
  deleteCourtByOrganizer, deleteRefereeByOrganizer, generateBracketByOrganizer, rejectTournamentRegistrationByOrganizer,
  submitMatchScoreByOrganizer, updateCourtByOrganizer, updateRefereeByOrganizer,
} from '../domain/organizerFlows';
import { calculateTournamentEconomics } from '../domain/finance';
import { getRoundName, getTournamentStandings, isRegistrationApproved } from '../domain/tournaments';
import type { DemoState, Tournament } from '../domain/types';
import './organizer.css';
import '../admin/system-admin.css';

function loadState() { return createBrowserDemoRepository().load(); }
function saveState(state: DemoState) { createBrowserDemoRepository().save(state); }

function OrganizerMetricCard({ icon, label, value, note }: { icon: React.ReactNode; label: string; value: string; note: string }) {
  return <Card className="sys-admin-metric"><span className="sys-admin-metric-icon">{icon}</span><span className="sys-admin-metric-label">{label}</span><strong>{value}</strong><small>{note}</small></Card>;
}

function OrganizerPageHeader({ title, description, badge }: { title: string; description: string; badge?: string }) {
  return <header className="sys-admin-header">
    <div>{badge && <Badge tone="info">{badge}</Badge>}<h2>{title}</h2><p>{description}</p></div>
  </header>;
}

export function OrganizerDashboardPage() {
  const data = loadState();
  const openTournaments = data.tournaments.filter((tournament) => tournament.status === 'open').length;
  const completedMatches = data.matches.filter((match) => match.winnerRegistrationId !== null).length;
  const registrationCount = data.tournamentRegistrations.filter((registration) => registration.reviewStatus !== 'rejected').length;
  const shortcuts = [
    { to: '/organizer/tournaments', label: 'Quản lý giải đấu', icon: Trophy },
    { to: '/organizer/operations', label: 'Sân & trọng tài', icon: Users },
    { to: '/organizer/schedule', label: 'Lịch thi đấu', icon: ClipboardList },
  ];

  return <div className="sys-admin-page">
    <OrganizerPageHeader badge="BAN TỔ CHỨC" title="Vận hành giải đấu" description="Theo dõi đăng ký, lịch thi đấu, nhánh đấu và kết quả."/>
    <div className="sys-admin-metrics sys-admin-metrics--three">
      <OrganizerMetricCard icon={<Trophy size={18}/>} label="Tổng giải đấu" value={data.tournaments.length.toLocaleString('vi-VN')} note={`${openTournaments} giải đang mở đăng ký`}/>
      <OrganizerMetricCard icon={<Users size={18}/>} label="Lượt đăng ký" value={registrationCount.toLocaleString('vi-VN')} note="Đơn vị đăng ký theo cấu hình mỗi giải"/>
      <OrganizerMetricCard icon={<ClipboardList size={18}/>} label="Trận đã có kết quả" value={completedMatches.toLocaleString('vi-VN')} note={`${data.matches.length} trận trong nhánh hiện tại`}/>
    </div>
    <section className="sys-admin-shortcuts" aria-label="Tác vụ ban tổ chức">
      {shortcuts.map(({ to, label, icon: Icon }) => <Link className="sys-admin-shortcut" key={to} to={to}><span className="sys-admin-shortcut-icon"><Icon size={19}/></span><span><strong>{label}</strong><small>Mở công cụ vận hành giải đấu</small></span><ArrowRight size={17}/></Link>)}
      <Link className="sys-admin-shortcut" to="/organizer/tournaments/new"><span className="sys-admin-shortcut-icon"><Trophy size={19}/></span><span><strong>Tạo giải đấu mới</strong><small>Bắt đầu cấu hình giải</small></span><ArrowRight size={17}/></Link>
    </section>
    <Card className="sys-admin-recent">
      <div className="sys-admin-section-heading"><div><h3>Giải đấu hiện có</h3><p>Cập nhật mới nhất về trạng thái đăng ký.</p></div><Link to="/organizer/tournaments">Xem danh sách <ArrowRight size={15}/></Link></div>
      <ul>{data.tournaments.slice(0, 5).map((tournament) => <li key={tournament.id}><span><strong>{tournament.name}</strong><small>{tournament.venue}</small></span><Badge tone={tournament.status === 'open' ? 'success' : tournament.status === 'finished' ? 'neutral' : 'info'}>{tournament.status === 'open' ? 'Đang mở đăng ký' : tournament.status === 'closed' ? 'Đã chốt đăng ký' : 'Đã kết thúc'}</Badge></li>)}</ul>
    </Card>
  </div>;
}

export function OrganizerTournamentListPage() {
  const navigate = useNavigate();
  const data = loadState();

  return (
    <div className="organizer-page">
      <header className="organizer-header">
        <div>
          <h2>Quản lý giải đấu</h2>
          <p>Danh sách các giải đấu phong trào, tình trạng đăng ký và kinh tế giải.</p>
        </div>
        <Button onClick={() => navigate('/organizer/tournaments/new')}>
          <Plus size={16}/> Tạo giải đấu mới
        </Button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {data.tournaments.map((tournament) => {
          const regs = data.tournamentRegistrations.filter((r) => r.tournamentId === tournament.id && r.reviewStatus !== 'rejected');
          const econ = calculateTournamentEconomics(tournament, data.tournamentRegistrations, data.settings.paymentFeePercent);

          return (
            <Card key={tournament.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Badge tone={tournament.format === 'singles' ? 'lime' : 'neutral'}>
                  {tournament.format === 'singles' ? 'Đơn' : 'Đôi'}
                </Badge>
                <Badge tone={tournament.status === 'open' ? 'success' : tournament.status === 'closed' ? 'info' : 'neutral'}>
                  {tournament.status === 'open' ? 'Đang mở' : tournament.status === 'closed' ? 'Đã chốt' : 'Hoàn tất'}
                </Badge>
              </div>

              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{tournament.name}</h3>
              <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
                <CalendarDays size={14}/> {new Date(tournament.date).toLocaleDateString('vi-VN')} · {tournament.venue}
              </div>

              <div style={{ background: 'var(--color-bg)', padding: '10px', borderRadius: '8px', fontSize: '13px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                  <span>Số lượt đăng ký:</span>
                  <strong>{regs.length} / {tournament.maxRegistrations}</strong>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>
                  Điểm hòa vốn (Break-even): <strong>{econ.breakEvenRegistrations} lượt</strong>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--color-border)' }}>
                <div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Lệ phí:</div>
                  <strong style={{ color: 'var(--color-primary)', fontSize: '15px' }}>
                    {tournament.fee.toLocaleString('vi-VN')}đ / {tournament.format === 'doubles' ? 'cặp' : 'người'}
                  </strong>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigate(`/organizer/tournaments/${tournament.id}`)}>
                  Chi tiết & Nhánh đấu →
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function OrganizerCreateTournamentPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const data = loadState();

  const [name, setName] = useState('');
  const [format, setFormat] = useState<Tournament['format']>('singles');
  const [level, setLevel] = useState('Phong trào');
  const [date, setDate] = useState('2026-12-15');
  const [registrationDeadline, setRegistrationDeadline] = useState('2026-12-05');
  const [venue, setVenue] = useState('Nhà thi đấu Quận 7');
  const [fee, setFee] = useState(250000);
  const [minRegistrations, setMinRegistrations] = useState(16);
  const [maxRegistrations, setMaxRegistrations] = useState(32);
  const [courtCount, setCourtCount] = useState(4);
  const [prize, setPrize] = useState('Cúp, huy chương và 2.000.000đ tiền thưởng');
  const [rules, setRules] = useState('Thi đấu loại trực tiếp, 21 điểm, 3 set.');

  const [courtCost, setCourtCost] = useState(2000000);
  const [staffCost, setStaffCost] = useState(600000);
  const [prizeCost, setPrizeCost] = useState(1500000);
  const [miscCost, setMiscCost] = useState(300000);
  const [refereePerMatch, setRefereePerMatch] = useState(60000);
  const [error, setError] = useState('');

  const paymentFeePercent = data.settings.paymentFeePercent;
  const fixedCost = courtCost + staffCost + prizeCost + miscCost;
  const unitNet = fee * (1 - paymentFeePercent / 100) - refereePerMatch;
  const breakEven = unitNet > 0 ? Math.ceil(fixedCost / unitNet) : Number.POSITIVE_INFINITY;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setError('Vui lòng nhập tên giải đấu.'); return; }

    try {
      const result = createTournamentByOrganizer(data, {
        name, format, level, date, registrationDeadline, venue, fee,
        minRegistrations, maxRegistrations, courtCount, prize, rules,
        costPlan: {
          court: courtCost,
          staff: staffCost,
          prize: prizeCost,
          miscellaneous: miscCost,
          refereePerMatch,
        },
      });

      saveState(result.state);
      toast('Tạo giải đấu mới thành công!', 'success');
      navigate('/organizer/tournaments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo giải đấu.');
    }
  };

  return (
    <div className="organizer-page">
      <header className="organizer-header">
        <div>
          <Badge tone="lime"><Plus size={13}/> TẠO GIẢI ĐẤU MỚI</Badge>
          <h2>Cấu hình giải đấu & Kế hoạch chi phí</h2>
          <p>Thiết lập thông tin giải, chi phí vận hành và tự động tính điểm hòa vốn.</p>
        </div>
      </header>

      <Card style={{ padding: '24px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <FormField label="Tên giải đấu" required>
              <TextInput value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: CoachMate Winter Cup 2026" />
            </FormField>

            <FormField label="Thể thức thi đấu">
              <Select value={format} onChange={(e) => setFormat(e.target.value as Tournament['format'])}>
                <option value="singles">Đơn (1 người)</option>
                <option value="doubles">Đôi (2 người/cặp)</option>
              </Select>
            </FormField>

            <FormField label="Hạng / Trình độ">
              <TextInput value={level} onChange={(e) => setLevel(e.target.value)} placeholder="Phong trào, Bán chuyên..." />
            </FormField>

            <FormField label="Ngày thi đấu">
              <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </FormField>

            <FormField label="Hạn chót đăng ký">
              <TextInput type="date" value={registrationDeadline} onChange={(e) => setRegistrationDeadline(e.target.value)} />
            </FormField>

            <FormField label="Địa điểm / Nhà thi đấu">
              <TextInput value={venue} onChange={(e) => setVenue(e.target.value)} placeholder="Nhà thi đấu Quận 7" />
            </FormField>

            <FormField label="Số lượng sân phân bổ">
              <TextInput type="number" value={courtCount} onChange={(e) => setCourtCount(Number(e.target.value))} />
            </FormField>

            <FormField label="Lệ phí đăng ký (VNĐ)">
              <TextInput type="number" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
            </FormField>

            <FormField label="Số lượng tối thiểu">
              <TextInput type="number" value={minRegistrations} onChange={(e) => setMinRegistrations(Number(e.target.value))} />
            </FormField>

            <FormField label="Số lượng tối đa">
              <TextInput type="number" value={maxRegistrations} onChange={(e) => setMaxRegistrations(Number(e.target.value))} />
            </FormField>
          </div>

          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: '12px 0 0 0' }}>Cấu hình Kế hoạch Chi phí (Cost Plan)</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <FormField label="Tiền thuê sân (VNĐ)">
              <TextInput type="number" value={courtCost} onChange={(e) => setCourtCost(Number(e.target.value))} />
            </FormField>
            <FormField label="Chi phí nhân sự (VNĐ)">
              <TextInput type="number" value={staffCost} onChange={(e) => setStaffCost(Number(e.target.value))} />
            </FormField>
            <FormField label="Tổng giải thưởng (VNĐ)">
              <TextInput type="number" value={prizeCost} onChange={(e) => setPrizeCost(Number(e.target.value))} />
            </FormField>
            <FormField label="Chi phí khác (VNĐ)">
              <TextInput type="number" value={miscCost} onChange={(e) => setMiscCost(Number(e.target.value))} />
            </FormField>
            <FormField label="Phí trọng tài / trận (VNĐ)">
              <TextInput type="number" value={refereePerMatch} onChange={(e) => setRefereePerMatch(Number(e.target.value))} />
            </FormField>
          </div>

          {/* Realtime Break-Even Display */}
          <div className="price-preview-card" style={{ background: 'linear-gradient(135deg, #fef3c7 0%, #ffffff 100%)', borderColor: '#f59e0b' }}>
            <div style={{ fontWeight: 700, fontSize: '15px', color: '#b45309', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart3 size={16}/> Dự tính Điểm Hòa Vốn (Tournament Break-Even)
            </div>
            <div className="price-preview-grid">
              <div className="price-preview-item">
                <label>Tổng chi phí cố định</label>
                <strong>{fixedCost.toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="price-preview-item">
                <label>Thu phí net / lượt</label>
                <strong style={{ color: 'var(--color-primary)' }}>{Math.round(unitNet).toLocaleString('vi-VN')}đ</strong>
              </div>
              <div className="price-preview-item highlight">
                <label>Điểm hòa vốn (Break-even)</label>
                <strong style={{ color: '#d97706', fontSize: '18px' }}>{breakEven} lượt đăng ký</strong>
              </div>
            </div>
          </div>

          <FormField label="Phần thưởng">
            <TextInput value={prize} onChange={(e) => setPrize(e.target.value)} />
          </FormField>

          <FormField label="Điều lệ thi đấu">
            <textarea
              value={rules}
              onChange={(e) => setRules(e.target.value)}
              rows={3}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                border: '1px solid var(--color-border)', fontFamily: 'inherit', fontSize: '14px'
              }}
            />
          </FormField>

          {error && <p style={{ color: '#dc2626', fontSize: '14px', margin: 0 }}>{error}</p>}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
            <Button type="button" variant="secondary" onClick={() => navigate('/organizer/tournaments')}>Hủy bỏ</Button>
            <Button type="submit">Tạo giải đấu <ArrowRight size={16}/></Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

export function OrganizerTournamentDetailPage() {
  const { tournamentId = '' } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [data, setData] = useState(loadState);

  const tournament = data.tournaments.find((t) => t.id === tournamentId);
  const regs = useMemo(() => data.tournamentRegistrations.filter((r) => r.tournamentId === tournamentId), [data, tournamentId]);
  const pendingRegs = regs.filter((registration) => registration.reviewStatus === 'pending');
  const approvedRegs = regs.filter(isRegistrationApproved).length;
  const matches = useMemo(() => data.matches.filter((m) => m.tournamentId === tournamentId), [data, tournamentId]);
  const regMap = useMemo(() => new Map(data.tournamentRegistrations.map((r) => [r.id, r])), [data]);

  const [scoreMatchId, setScoreMatchId] = useState<string | null>(null);
  const [scoreA, setScoreA] = useState(21);
  const [scoreB, setScoreB] = useState(19);
  const [confirmBracket, setConfirmBracket] = useState(false);

  if (!tournament) {
    return <EmptyState title="Không tìm thấy giải đấu" description="Giải đấu này không tồn tại hoặc đã bị xóa." action={<Button onClick={() => navigate('/organizer/tournaments')}>Quay lại danh sách</Button>} />;
  }

  const handleGenerateBracket = () => {
    try {
      const updated = generateBracketByOrganizer(data, tournament.id);
      saveState(updated.state);
      setData(updated.state);
      toast('Đã chốt đăng ký và sinh sơ đồ nhánh đấu thành công!', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Không thể tạo nhánh đấu.', 'error');
    }
  };

  const handleApproveRegistration = (registrationId: string) => {
    try {
      const updated = approveTournamentRegistrationByOrganizer(data, tournament.id, registrationId);
      saveState(updated);
      setData(updated);
      toast('Đã duyệt đăng ký vận động viên.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Không thể duyệt đăng ký.', 'error');
    }
  };

  const handleRejectRegistration = (registrationId: string) => {
    try {
      const updated = rejectTournamentRegistrationByOrganizer(data, tournament.id, registrationId);
      saveState(updated);
      setData(updated);
      toast('Đã từ chối đăng ký và cập nhật trạng thái khoản phí.', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Không thể từ chối đăng ký.', 'error');
    }
  };

  const handleSaveScore = (e: FormEvent) => {
    e.preventDefault();
    if (!scoreMatchId) return;

    try {
      const updated = submitMatchScoreByOrganizer(data, tournament.id, scoreMatchId, scoreA, scoreB);
      saveState(updated);
      setData(updated);
      setScoreMatchId(null);
      toast('Đã cập nhật kết quả trận đấu!', 'success');
    } catch (err) {
      toast(err instanceof Error ? err.message : 'Không thể lưu kết quả.', 'error');
    }
  };

  const activeScoreMatch = matches.find((m) => m.id === scoreMatchId);
  const activeRegA = activeScoreMatch?.participantARegistrationId ? regMap.get(activeScoreMatch.participantARegistrationId) : null;
  const activeRegB = activeScoreMatch?.participantBRegistrationId ? regMap.get(activeScoreMatch.participantBRegistrationId) : null;

  return (
    <div className="organizer-page">
      <header className="organizer-header">
        <div>
          <button onClick={() => navigate('/organizer/tournaments')} style={{ border: 'none', background: 'none', color: 'var(--color-primary)', cursor: 'pointer', fontSize: '14px', padding: 0, marginBottom: '8px' }}>
            ← Tất cả giải đấu
          </button>
          <h2>{tournament.name}</h2>
          <p>{new Date(tournament.date).toLocaleDateString('vi-VN')} · {tournament.venue}</p>
        </div>

        {tournament.status === 'open' ? (
          <Button onClick={() => setConfirmBracket(true)} disabled={approvedRegs < 2 || pendingRegs.length > 0}>
            <Trophy size={16}/> Chốt đăng ký và tạo nhánh đấu
          </Button>
        ) : (
          <Badge tone={tournament.status === 'closed' ? 'info' : 'success'}>
            {tournament.status === 'closed' ? 'Đã chốt đăng ký & Đang thi đấu' : 'Giải đấu đã kết thúc'}
          </Badge>
        )}
      </header>

      <ConfirmDialog open={confirmBracket} title="Chốt đăng ký giải đấu?" description={`Bản demo sẽ đóng đăng ký và tạo nhánh đấu cho ${approvedRegs} lượt đã duyệt. Hãy kiểm tra danh sách trước khi tiếp tục.`} onCancel={() => setConfirmBracket(false)} onConfirm={() => { setConfirmBracket(false); handleGenerateBracket(); }}/>
      {/* Bracket Visualization */}
      {tournament.bracket && tournament.bracket.roundMatchIds.length > 0 ? (
        <Card style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Trophy size={18} color="var(--color-primary)"/> Sơ đồ nhánh đấu
          </h3>

          <div className="bracket-container">
            {tournament.bracket.roundMatchIds.map((roundIds, roundIndex) => (
              <div key={roundIndex} className="bracket-round">
                <div className="bracket-round-title">
                  {getRoundName(tournament.bracket!.roundMatchIds.length, roundIndex)}
                </div>

                {roundIds.map((matchId) => {
                  const match = matches.find((m) => m.id === matchId);
                  if (!match) return null;

                  const regA = match.participantARegistrationId ? regMap.get(match.participantARegistrationId) : null;
                  const regB = match.participantBRegistrationId ? regMap.get(match.participantBRegistrationId) : null;
                  const isFinished = match.winnerRegistrationId != null;

                  return (
                    <div key={match.id} className={`bracket-match-card ${isFinished ? 'is-finished' : ''}`}>
                      <div className={`bracket-participant ${match.winnerRegistrationId === match.participantARegistrationId ? 'is-winner' : ''}`}>
                        <span>{regA ? regA.participantName : match.isBye ? 'Suất đặc cách (Bye)' : 'TBD'}</span>
                        {match.scoreA != null && <span className="bracket-score">{match.scoreA}</span>}
                      </div>

                      <div className={`bracket-participant ${match.winnerRegistrationId === match.participantBRegistrationId ? 'is-winner' : ''}`}>
                        <span>{regB ? regB.participantName : match.isBye ? 'Suất đặc cách (Bye)' : 'TBD'}</span>
                        {match.scoreB != null && <span className="bracket-score">{match.scoreB}</span>}
                      </div>

                      {!match.isBye && (
                        <div className="bracket-match-meta">
                          <span>{match.scheduledTime || '08:00'}</span>
                          {regA && regB && tournament.status !== 'finished' && (
                            <button
                              onClick={() => { setScoreMatchId(match.id); setScoreA(match.scoreA ?? 21); setScoreB(match.scoreB ?? 19); }}
                              style={{ border: 'none', background: 'none', color: 'var(--color-primary)', fontWeight: 600, cursor: 'pointer' }}
                            >
                              {isFinished ? 'Sửa tỷ số' : 'Nhập tỷ số'}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card style={{ padding: '24px' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            Chưa sinh sơ đồ nhánh đấu. Đã duyệt {approvedRegs}/{regs.length} đăng ký.
            {pendingRegs.length > 0 ? ' Vui lòng duyệt các đăng ký đang chờ trước khi chốt giải.' : ' Chốt đăng ký khi đã sẵn sàng.'}
          </p>
        </Card>
      )}

      {/* Participant List */}
      <Card style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px' }}>Danh sách vận động viên ({regs.length} lượt)</h3>
        <table className="coach-table">
          <thead>
            <tr>
              <th>VĐV chính</th>
              <th>Đồng đội (Đôi)</th>
              <th>Lệ phí</th>
              <th>Ngày đăng ký</th>
              <th>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {regs.map((reg) => (
              <tr key={reg.id}>
                <td><strong>{reg.participantName}</strong></td>
                <td>{reg.partnerName || '—'}</td>
                <td>{reg.fee.toLocaleString('vi-VN')}đ</td>
                <td>{new Date(reg.createdAt).toLocaleDateString('vi-VN')}</td>
                <td>{reg.reviewStatus === 'rejected' ? <Badge tone="warning">Đã từ chối</Badge> : isRegistrationApproved(reg) ? <Badge tone="success">Đã duyệt</Badge> : (
                  tournament.status === 'open'
                    ? <div style={{ display: 'flex', gap: '8px' }}>
                        <Button variant="outline" onClick={() => handleApproveRegistration(reg.id)}><CheckCircle2 size={14}/> Duyệt</Button>
                        <Button variant="outline" onClick={() => handleRejectRegistration(reg.id)}><X size={14}/> Từ chối đăng ký</Button>
                      </div>
                    : <Badge tone="info">Chờ duyệt</Badge>
                )}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* Score Modal */}
      {scoreMatchId && activeScoreMatch && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <Card style={{ width: '400px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>Cập nhật tỷ số trận đấu</h3>
              <button onClick={() => setScoreMatchId(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={20}/></button>
            </div>

            <form onSubmit={handleSaveScore} className="score-form">
              <div className="score-inputs-row">
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{activeRegA?.participantName || 'VĐV 1'}</label>
                  <TextInput type="number" value={scoreA} onChange={(e) => setScoreA(Number(e.target.value))} />
                </div>
                <strong style={{ fontSize: '20px' }}>VS</strong>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>{activeRegB?.participantName || 'VĐV 2'}</label>
                  <TextInput type="number" value={scoreB} onChange={(e) => setScoreB(Number(e.target.value))} />
                </div>
              </div>

              <Button type="submit">Lưu kết quả & Đẩy người thắng vào vòng trong</Button>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}

export function OrganizerSchedulePage() {
  const data = loadState();

  return (
    <div className="organizer-page">
      <header className="organizer-header">
        <div>
          <h2>Lịch thi đấu các giải</h2>
          <p>Lịch thi đấu tổng hợp được phân ca, phân sân và trọng tài tự động.</p>
        </div>
      </header>

      {data.matches.length === 0 ? (
        <EmptyState title="Chưa có lịch thi đấu" description="Lịch sẽ tự động sinh sau khi chốt đăng ký giải đấu." />
      ) : (
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <table className="coach-table">
            <thead>
              <tr>
                <th>Giải đấu</th>
                <th>Giờ thi đấu</th>
                <th>Sân</th>
                <th>Trọng tài</th>
                <th>Trận đấu</th>
              </tr>
            </thead>
            <tbody>
              {data.matches.filter((m) => !m.isBye).map((match) => {
                const tour = data.tournaments.find((t) => t.id === match.tournamentId);
                const regMap = new Map(data.tournamentRegistrations.map((r) => [r.id, r]));
                const regA = match.participantARegistrationId ? regMap.get(match.participantARegistrationId) : null;
                const regB = match.participantBRegistrationId ? regMap.get(match.participantBRegistrationId) : null;
                const court = data.courts.find((c) => c.id === match.courtId);
                const referee = data.referees.find((r) => r.id === match.refereeId);

                return (
                  <tr key={match.id}>
                    <td><strong>{tour?.name}</strong></td>
                    <td>{match.scheduledTime || '08:00'}</td>
                    <td>{court?.name || 'Sân 1'}</td>
                    <td>{referee?.name || 'Trọng tài'}</td>
                    <td>{regA?.participantName || 'TBD'} vs {regB?.participantName || 'TBD'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

export function OrganizerResultsPage() {
  const data = loadState();
  const finishedMatches = data.matches.filter((m) => m.winnerRegistrationId != null && !m.isBye);
  const tournamentsWithStandings = data.tournaments.filter((tournament) => tournament.bracket);

  return (
    <div className="organizer-page">
      <header className="organizer-header">
        <div>
          <h2>Bảng kết quả thi đấu</h2>
          <p>Kết quả tỷ số chính thức của các trận đấu.</p>
        </div>
      </header>

      {finishedMatches.length === 0 ? (
        <EmptyState title="Chưa có kết quả" description="Các kết quả trận đấu sẽ xuất hiện sau khi trọng tài cập nhật." />
      ) : (
        <Card style={{ padding: '0', overflow: 'hidden' }}>
          <table className="coach-table">
            <thead>
              <tr>
                <th>Giải đấu</th>
                <th>Trận đấu</th>
                <th>Tỷ số</th>
                <th>Đội thắng</th>
              </tr>
            </thead>
            <tbody>
              {finishedMatches.map((match) => {
                const tour = data.tournaments.find((t) => t.id === match.tournamentId);
                const regMap = new Map(data.tournamentRegistrations.map((r) => [r.id, r]));
                const regA = match.participantARegistrationId ? regMap.get(match.participantARegistrationId) : null;
                const regB = match.participantBRegistrationId ? regMap.get(match.participantBRegistrationId) : null;
                const winner = regMap.get(match.winnerRegistrationId!);

                return (
                  <tr key={match.id}>
                    <td><strong>{tour?.name}</strong></td>
                    <td>{regA?.participantName} vs {regB?.participantName}</td>
                    <td><strong>{match.scoreA} - {match.scoreB}</strong></td>
                    <td style={{ color: 'var(--color-primary)', fontWeight: 700 }}>🏆 {winner?.participantName}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tournamentsWithStandings.map((tournament) => (
        <Card key={tournament.id} style={{ padding: '24px' }}>
          <h3 style={{ margin: '0 0 8px' }}>Thứ hạng · {tournament.name}</h3>
          <p style={{ margin: '0 0 16px', color: 'var(--color-text-secondary)' }}>
            Thứ hạng theo vòng bị loại; các vận động viên cùng vòng được xếp đồng hạng.
          </p>
          <table className="coach-table">
            <thead><tr><th>Thứ hạng</th><th>Vận động viên</th><th>Đồng đội</th><th>Trạng thái</th></tr></thead>
            <tbody>
              {getTournamentStandings(tournament, data.tournamentRegistrations, data.matches).map((standing) => (
                <tr key={standing.registrationId}>
                  <td><strong>{standing.rankLabel}</strong></td>
                  <td>{standing.participantName}</td>
                  <td>{standing.partnerName || '—'}</td>
                  <td>{standing.state === 'ranked' ? <Badge tone="success">Đã xếp hạng</Badge> : <Badge tone="info">{standing.state === 'in-progress' ? 'Đang thi đấu' : 'Chưa thi đấu'}</Badge>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      ))}
    </div>
  );
}

export function OrganizerOperationsPage() {
  const [data, setData] = useState(loadState);
  const toast = useToast();

  const [courtName, setCourtName] = useState('');
  const [courtVenue, setCourtVenue] = useState('Nhà thi đấu Quận 7');
  const [courtNumber, setCourtNumber] = useState(1);
  const [editingCourtId, setEditingCourtId] = useState<string | null>(null);

  const [refereeName, setRefereeName] = useState('');
  const [refereePhone, setRefereePhone] = useState('090 123 4567');
  const [refereeCert, setRefereeCert] = useState('Cấp thành phố');
  const [editingRefereeId, setEditingRefereeId] = useState<string | null>(null);

  const clearCourtForm = () => {
    setEditingCourtId(null);
    setCourtName('');
    setCourtVenue('Nhà thi đấu Quận 7');
    setCourtNumber(1);
  };

  const clearRefereeForm = () => {
    setEditingRefereeId(null);
    setRefereeName('');
    setRefereePhone('090 123 4567');
    setRefereeCert('Cấp thành phố');
  };

  const handleSaveCourt = (e: FormEvent) => {
    e.preventDefault();
    try {
      const input = { name: courtName, venue: courtVenue, courtNumber };
      const updated = editingCourtId
        ? updateCourtByOrganizer(data, editingCourtId, input)
        : addCourtByOrganizer(data, input);
      saveState(updated);
      setData(updated);
      clearCourtForm();
      toast(editingCourtId ? 'Đã cập nhật sân đấu.' : 'Đã thêm sân đấu thành công!', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Không thể lưu sân đấu.', 'error');
    }
  };

  const handleSaveReferee = (e: FormEvent) => {
    e.preventDefault();
    try {
      const input = { name: refereeName, phone: refereePhone, certification: refereeCert };
      const updated = editingRefereeId
        ? updateRefereeByOrganizer(data, editingRefereeId, input)
        : addRefereeByOrganizer(data, input);
      saveState(updated);
      setData(updated);
      clearRefereeForm();
      toast(editingRefereeId ? 'Đã cập nhật trọng tài.' : 'Đã thêm trọng tài thành công!', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Không thể lưu trọng tài.', 'error');
    }
  };

  const handleDeleteCourt = (courtId: string) => {
    try {
      const updated = deleteCourtByOrganizer(data, courtId);
      saveState(updated);
      setData(updated);
      if (editingCourtId === courtId) clearCourtForm();
      toast('Đã xóa sân đấu.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Không thể xóa sân đấu.', 'error');
    }
  };

  const handleDeleteReferee = (refereeId: string) => {
    try {
      const updated = deleteRefereeByOrganizer(data, refereeId);
      saveState(updated);
      setData(updated);
      if (editingRefereeId === refereeId) clearRefereeForm();
      toast('Đã xóa trọng tài.', 'success');
    } catch (error) {
      toast(error instanceof Error ? error.message : 'Không thể xóa trọng tài.', 'error');
    }
  };

  return (
    <div className="organizer-page">
      <header className="organizer-header">
        <div>
          <h2>Quản lý Sân đấu & Trọng tài</h2>
          <p>Danh sách cơ sở vật chất và lực lượng trọng tài vận hành giải.</p>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <Card style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>{editingCourtId ? 'Cập nhật sân đấu' : 'Thêm sân đấu mới'}</h3>
          <form onSubmit={handleSaveCourt} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FormField label="Tên sân"><TextInput value={courtName} onChange={(e) => setCourtName(e.target.value)} placeholder="Sân 5" /></FormField>
            <FormField label="Địa điểm / Sân"><TextInput value={courtVenue} onChange={(e) => setCourtVenue(e.target.value)} /></FormField>
            <FormField label="Số thứ tự sân"><TextInput type="number" value={courtNumber} onChange={(e) => setCourtNumber(Number(e.target.value))} /></FormField>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="submit">{editingCourtId ? 'Lưu sân' : 'Thêm sân'}</Button>
              {editingCourtId && <Button type="button" variant="outline" onClick={clearCourtForm}>Hủy sửa</Button>}
            </div>
          </form>
        </Card>

        <Card style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>{editingRefereeId ? 'Cập nhật trọng tài' : 'Thêm trọng tài mới'}</h3>
          <form onSubmit={handleSaveReferee} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <FormField label="Họ tên trọng tài"><TextInput value={refereeName} onChange={(e) => setRefereeName(e.target.value)} placeholder="Trọng tài Tuấn" /></FormField>
            <FormField label="Số điện thoại"><TextInput value={refereePhone} onChange={(e) => setRefereePhone(e.target.value)} /></FormField>
            <FormField label="Bằng cấp / Chứng chỉ"><TextInput value={refereeCert} onChange={(e) => setRefereeCert(e.target.value)} /></FormField>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="submit">{editingRefereeId ? 'Lưu trọng tài' : 'Thêm trọng tài'}</Button>
              {editingRefereeId && <Button type="button" variant="outline" onClick={clearRefereeForm}>Hủy sửa</Button>}
            </div>
          </form>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
        <Card style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Danh sách sân đấu hiện có ({data.courts.length})</h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {data.courts.map((court) => (
              <li key={court.id} style={{ marginBottom: '10px' }}>
                <strong>{court.name}</strong> — {court.venue}
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <Button variant="outline" onClick={() => { setEditingCourtId(court.id); setCourtName(court.name); setCourtVenue(court.venue); setCourtNumber(court.courtNumber); }}><Pencil size={14}/> Sửa</Button>
                  <Button variant="outline" onClick={() => handleDeleteCourt(court.id)}><Trash2 size={14}/> Xóa</Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card style={{ padding: '20px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>Danh sách trọng tài ({data.referees.length})</h3>
          <ul style={{ paddingLeft: '20px', margin: 0 }}>
            {data.referees.map((ref) => (
              <li key={ref.id} style={{ marginBottom: '10px' }}>
                <strong>{ref.name}</strong> — {ref.phone} ({ref.certification})
                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                  <Button variant="outline" onClick={() => { setEditingRefereeId(ref.id); setRefereeName(ref.name); setRefereePhone(ref.phone); setRefereeCert(ref.certification); }}><Pencil size={14}/> Sửa</Button>
                  <Button variant="outline" onClick={() => handleDeleteReferee(ref.id)}><Trash2 size={14}/> Xóa</Button>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
