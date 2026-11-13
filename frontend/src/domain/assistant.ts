import { AREAS, LEVELS } from './constants';
import { getCoachOverview } from './coachFlows';
import { calculatePlatformTotals } from './finance';
import { forecastCoachCourses } from './forecast';
import { recommendCourses } from './recommendations';
import type { Course, DemoState, PlatformRole, SkillLevel } from './types';

export interface AssistantAction {
  label: string;
  to: string;
}

export interface AssistantAnswer {
  intent: string;
  text: string;
  actions: AssistantAction[];
  chips: string[];
}

const DEFAULT_COACH_ID = 'c1';

const SUGGESTIONS: Record<PlatformRole, string[]> = {
  student: [
    'Tìm lớp Quận 7 dưới 2 triệu',
    'Giải đấu nào sắp tới?',
    'Lịch học của tôi',
  ],
  coach: [
    'Lớp nào nguy cơ huỷ?',
    'Doanh thu của tôi',
    'Giải đấu sắp tới',
  ],
  organizer: [
    'Giải đấu sắp tới',
    'Lịch thi đấu hôm nay',
    'Ai vô địch?',
  ],
  admin: [
    'Doanh thu nền tảng',
    'Giải đấu sắp tới',
    'Tìm lớp Quận 7 dưới 2 triệu',
  ],
};

function normalize(text: string) {
  return text
    .toLocaleLowerCase('vi')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd');
}

function money(amount: number) {
  return `${amount.toLocaleString('vi-VN')}đ`;
}

function dateLabel(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('vi-VN');
}

function parseArea(question: string) {
  const normalized = normalize(question);
  return AREAS.find((area) => normalized.includes(normalize(area))) ?? null;
}

function parseLevel(question: string): SkillLevel | null {
  const normalized = normalize(question);
  const aliases: [string, SkillLevel][] = [
    ['moi bat dau', 'Mới bắt đầu'],
    ['nguoi moi', 'Mới bắt đầu'],
    ['co ban', 'Cơ bản'],
    ['trung cap', 'Trung cấp'],
    ['nang cao', 'Nâng cao'],
  ];
  const level = LEVELS.find((item) => normalized.includes(normalize(item)));
  if (level) return level;
  return aliases.find(([alias]) => normalized.includes(alias))?.[1] ?? null;
}

function parseBudget(question: string): number | null {
  const normalized = normalize(question);
  const withUnit = normalized.match(/(\d+(?:[.,]\d+)?)\s*(k|nghin|ngan|tr|trieu)\b/);
  if (withUnit) {
    const value = Number(withUnit[1].replace(',', '.'));
    const multiplier = ['k', 'nghin', 'ngan'].includes(withUnit[2]) ? 1_000 : 1_000_000;
    return Math.round(value * multiplier);
  }
  const plain = normalized.match(/(?:duoi|toi da|max|nho hon)\s*(\d{6,})/);
  return plain ? Number(plain[1]) : null;
}

function chips(role: PlatformRole) {
  return SUGGESTIONS[role].slice(0, 3);
}

function answer(intent: string, text: string, actions: AssistantAction[], role: PlatformRole): AssistantAnswer {
  return { intent, text, actions, chips: chips(role) };
}

function courseLine(course: Course, state: DemoState) {
  const coach = state.coaches.find((candidate) => candidate.id === course.coachId);
  return `${course.title} · ${course.level} · ${course.area} · ${money(course.price)} · ${coach?.name ?? 'HLV'}`;
}

function courseAnswer(question: string, state: DemoState, role: PlatformRole): AssistantAnswer {
  const area = parseArea(question);
  const level = parseLevel(question);
  const budget = parseBudget(question);

  if (role === 'student' && !area && !level && !budget) {
    const recommendations = recommendCourses(state, state.currentStudentId, 3);
    if (!recommendations.length) {
      return answer('goi-y-khoa-hoc', 'Hiện chưa có khóa học nào còn chỗ. Bạn thử xem lại toàn bộ chợ khóa học nhé.', [{ label: 'Mở chợ khóa học', to: '/courses' }], role);
    }
    return answer(
      'goi-y-khoa-hoc',
      `Dựa trên hồ sơ của bạn, tôi gợi ý ${recommendations.length} khóa phù hợp nhất:\n${recommendations
        .map((item) => `• ${courseLine(item.course, state)} — ${item.reasons[0]}`)
        .join('\n')}`,
      recommendations.map((item) => ({ label: item.course.title, to: `/courses/${item.course.id}` })),
      role,
    );
  }

  const matches = state.courses
    .filter((course) => course.status === 'published')
    .filter((course) => !area || course.area === area)
    .filter((course) => !level || course.level === level)
    .filter((course) => budget == null || course.price <= budget)
    .sort((left, right) => left.price - right.price || left.id.localeCompare(right.id))
    .slice(0, 3);

  const filters = [
    area ? `khu vực ${area}` : null,
    level ? `trình độ ${level}` : null,
    budget ? `học phí dưới ${money(budget)}` : null,
  ].filter(Boolean).join(' · ');

  if (!matches.length) {
    return answer(
      'tim-khoa-hoc',
      `Tôi chưa tìm thấy khóa học phù hợp${filters ? ` với ${filters}` : ''}. Bạn thử nới điều kiện hoặc xem toàn bộ chợ khóa học.`,
      [{ label: 'Mở chợ khóa học', to: '/courses' }],
      role,
    );
  }

  return answer(
    'tim-khoa-hoc',
    `Tôi tìm thấy ${matches.length} khóa phù hợp${filters ? ` với ${filters}` : ''}:\n${matches
      .map((course) => `• ${courseLine(course, state)}`)
      .join('\n')}`,
    matches.map((course) => ({ label: course.title, to: `/courses/${course.id}` })),
    role,
  );
}

function tournamentAnswer(state: DemoState, role: PlatformRole): AssistantAnswer {
  const upcoming = state.tournaments
    .filter((tournament) => tournament.status !== 'finished')
    .sort((left, right) => left.date.localeCompare(right.date))
    .slice(0, 3);

  if (!upcoming.length) {
    return answer('giai-dau', 'Hiện không có giải đấu nào đang mở hoặc sắp diễn ra.', [{ label: 'Danh sách giải đấu', to: '/tournaments' }], role);
  }

  return answer(
    'giai-dau',
    `Các giải đấu sắp tới:\n${upcoming
      .map((tournament) => `• ${tournament.name} · ${dateLabel(tournament.date)} · ${tournament.venue} · lệ phí ${money(tournament.fee)}`)
      .join('\n')}`,
    upcoming.map((tournament) => ({ label: tournament.name, to: `/tournaments/${tournament.id}` })),
    role,
  );
}

function studentScheduleAnswer(state: DemoState, role: PlatformRole): AssistantAnswer {
  const studentId = state.currentStudentId;
  const courseIds = new Set(
    state.enrollments.filter((enrollment) => enrollment.studentId === studentId).map((enrollment) => enrollment.courseId),
  );
  const enrolledCourses = state.courses.filter((course) => courseIds.has(course.id));
  const registrations = state.tournamentRegistrations.filter(
    (registration) => registration.studentId === studentId && registration.reviewStatus !== 'rejected',
  );
  const tournaments = state.tournaments.filter((tournament) =>
    registrations.some((registration) => registration.tournamentId === tournament.id),
  );

  const lines = [
    ...enrolledCourses.map((course) => `• Lớp ${course.title} · ${course.days} · ${course.time} · khai giảng ${dateLabel(course.startDate)}`),
    ...tournaments.map((tournament) => `• Giải ${tournament.name} · ${dateLabel(tournament.date)} · ${tournament.venue}`),
  ];

  if (!lines.length) {
    return answer('lich-cua-toi', 'Bạn chưa có lớp học hoặc giải đấu nào. Khám phá chợ khóa học để bắt đầu nhé.', [
      { label: 'Khám phá khóa học', to: '/courses' },
      { label: 'Xem giải đấu', to: '/tournaments' },
    ], role);
  }

  return answer('lich-cua-toi', `Lịch sắp tới của bạn:\n${lines.join('\n')}`, [
    { label: 'Khóa học của tôi', to: '/me/courses' },
    { label: 'Giải đấu của tôi', to: '/me/tournaments' },
  ], role);
}

function organizerScheduleAnswer(state: DemoState, role: PlatformRole): AssistantAnswer {
  const matches = state.matches
    .filter((match) => !match.isBye && match.scheduledTime)
    .sort((left, right) => (left.scheduledTime ?? '').localeCompare(right.scheduledTime ?? ''))
    .slice(0, 4);

  if (!matches.length) {
    return answer('lich-thi-dau', 'Chưa có lịch thi đấu. Hãy chốt đăng ký giải để AI xếp lịch.', [{ label: 'Quản lý giải đấu', to: '/organizer/tournaments' }], role);
  }

  const registrationById = new Map(state.tournamentRegistrations.map((registration) => [registration.id, registration]));
  const courtById = new Map(state.courts.map((court) => [court.id, court]));
  const tournamentById = new Map(state.tournaments.map((tournament) => [tournament.id, tournament]));
  const lines = matches.map((match) => {
    const nameA = registrationById.get(match.participantARegistrationId ?? '')?.participantName ?? 'TBD';
    const nameB = registrationById.get(match.participantBRegistrationId ?? '')?.participantName ?? 'TBD';
    const court = courtById.get(match.courtId ?? '')?.name ?? 'Chưa xếp sân';
    const tournament = tournamentById.get(match.tournamentId)?.name ?? 'Giải đấu';
    return `• ${match.scheduledTime} · ${court} · ${nameA} vs ${nameB} (${tournament})`;
  });

  return answer('lich-thi-dau', `Lịch thi đấu gần nhất:\n${lines.join('\n')}`, [{ label: 'Mở lịch thi đấu', to: '/organizer/schedule' }], role);
}

function financeAnswer(state: DemoState, role: PlatformRole): AssistantAnswer {
  if (role === 'coach') {
    const overview = getCoachOverview(state, DEFAULT_COACH_ID);
    return answer(
      'doanh-thu',
      `Doanh thu khóa học của bạn: ${money(overview.grossRevenue)} (GMV).\nThực nhận sau hoa hồng: ${money(overview.coachPayout)}.\nCoachMate giữ lại ${money(overview.platformCommission)} hoa hồng nền tảng.`,
      [{ label: 'Xem doanh thu chi tiết', to: '/coach/revenue' }],
      role,
    );
  }

  const totals = calculatePlatformTotals(state);
  if (role === 'organizer') {
    return answer(
      'doanh-thu',
      `Quỹ lệ phí giải đang giữ: ${money(totals.heldTournamentFees)}.\nDoanh thu giải đã chốt: ${money(totals.tournamentRevenue)} · chi phí vận hành: ${money(totals.tournamentOperatingCosts)}.`,
      [{ label: 'Tổng quan giải đấu', to: '/organizer/dashboard' }],
      role,
    );
  }

  return answer(
    'doanh-thu',
    `Doanh thu nền tảng: ${money(totals.platformRevenue)}.\nTrong đó hoa hồng khóa học ${money(totals.courseCommission)}, thuê bao Coach Pro ${money(totals.subscriptionRevenue)}, giải đấu ${money(totals.tournamentRevenue)}.\nChi phí ước tính ${money(totals.totalCosts)} → lợi nhuận ước tính ${money(totals.estimatedProfit)}.`,
    [{ label: 'Mở báo cáo', to: '/admin/reports' }],
    role,
  );
}

function forecastAnswer(state: DemoState, role: PlatformRole): AssistantAnswer {
  const forecasts = forecastCoachCourses(state, DEFAULT_COACH_ID).slice(0, 3);
  if (!forecasts.length) {
    return answer('du-bao-lop', 'Bạn chưa có khóa học nào để dự báo.', [{ label: 'Tạo khóa học', to: '/coach/courses/new' }], role);
  }

  return answer(
    'du-bao-lop',
    `Dự báo các lớp cần chú ý:\n${forecasts
      .map((item) => `• ${item.courseTitle}: ${item.label} (${Math.round(item.probability * 100)}%) · ${item.reason}`)
      .join('\n')}`,
    [{ label: 'Bảng điều hành HLV', to: '/coach/dashboard' }],
    role,
  );
}

function championAnswer(state: DemoState, role: PlatformRole): AssistantAnswer {
  const registrationById = new Map(state.tournamentRegistrations.map((registration) => [registration.id, registration]));
  const finished = state.tournaments.filter((tournament) => tournament.championRegistrationId);

  if (!finished.length) {
    return answer('nha-vo-dich', 'Chưa có giải đấu nào kết thúc nên chưa có nhà vô địch. Kết quả sẽ được cập nhật sau trận chung kết.', [{ label: 'Kết quả & nhánh đấu', to: '/organizer/results' }], role);
  }

  return answer(
    'nha-vo-dich',
    `Nhà vô địch các giải đã kết thúc:\n${finished
      .map((tournament) => `• ${tournament.name}: ${registrationById.get(tournament.championRegistrationId!)?.participantName ?? 'Đang cập nhật'}`)
      .join('\n')}`,
    finished.slice(0, 3).map((tournament) => ({ label: tournament.name, to: `/tournaments/${tournament.id}` })),
    role,
  );
}

function fallbackAnswer(role: PlatformRole): AssistantAnswer {
  return answer(
    'tro-giup',
    'Tôi có thể giúp bạn tìm khóa học, xem giải đấu, kiểm tra lịch học/thi đấu, dự báo lớp sắp mở và đọc số liệu doanh thu. Bạn thử một trong các câu hỏi gợi ý bên dưới nhé.',
    [{ label: 'Khám phá khóa học', to: role === 'coach' ? '/coach/dashboard' : role === 'organizer' ? '/organizer/dashboard' : role === 'admin' ? '/admin/dashboard' : '/courses' }],
    role,
  );
}

export function suggestQuestions(role: PlatformRole): string[] {
  return SUGGESTIONS[role];
}

/**
 * Trợ lý rule-based: phân tích ý định tiếng Việt bằng từ khóa + regex,
 * trả lời từ chính dữ liệu demo, không gọi mạng và không cần API key.
 */
export function askAssistant(
  question: string,
  state: DemoState,
  role: PlatformRole,
  _now = new Date(),
): AssistantAnswer {
  const normalized = normalize(question.trim());
  if (!normalized) return fallbackAnswer(role);

  if (/(doanh thu|loi nhuan|hoa hong|gmv|tai chinh|dong tien)/.test(normalized)) {
    return financeAnswer(state, role);
  }

  if (/(nguy co|huy lop|du bao|lop sap mo|sap du nguoi|can them hoc vien)/.test(normalized)) {
    return forecastAnswer(state, role);
  }

  if (/(vo dich|champion|nha vo dich)/.test(normalized)) {
    return championAnswer(state, role);
  }

  if (normalized.includes('lich')) {
    if (role === 'organizer') return organizerScheduleAnswer(state, role);
    if (role === 'student') return studentScheduleAnswer(state, role);
    return forecastAnswer(state, role);
  }

  if (/(giai dau|tournament|co giai|giai nao|mini cup)/.test(normalized)) {
    return tournamentAnswer(state, role);
  }

  if (/(khoa hoc|tim lop|hoc phi|lop hoc|hlv|coach|dang ky hoc|goi y|phu hop)/.test(normalized)) {
    return courseAnswer(question, state, role);
  }

  if (parseArea(normalized) || parseLevel(normalized) || parseBudget(normalized)) {
    return courseAnswer(question, state, role);
  }

  return fallbackAnswer(role);
}