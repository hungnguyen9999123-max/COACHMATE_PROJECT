import type {
  Coach,
  Course,
  DemoState,
  Enrollment,
  FinancialRecord,
  Payment,
  Student,
  TournamentRegistration,
} from '../domain/types';

const PARTICIPANT_NAMES = [
  'Phạm Gia Huy',
  'Võ Thanh Trúc',
  'Đặng Minh Quân',
  'Bùi Ngọc Anh',
  'Hoàng Đức Long',
  'Ngô Khánh Linh',
  'Lý Anh Tuấn',
  'Đỗ Hải Yến',
  'Trịnh Bảo Châu',
  'Vũ Quang Vinh',
  'Mai Phương Thảo',
  'Huỳnh Tấn Phát',
  'Phan Thu Trang',
  'Dương Quốc Khánh',
  'Lâm Gia Bảo',
  'Tạ Thùy Dương',
  'Cao Nhật Minh',
  'Đinh Hồng Nhung',
  'Châu Việt Hùng',
  'Kim Ngân',
  'Tô Hoài Nam',
  'Lương Bích Ngọc',
  'Ông Gia Khiêm',
  'Quách Mỹ Linh',
  'Thái Đình Phong',
  'Diệp Khánh Vy',
  'Hà Tuấn Kiệt',
  'Âu Thanh Hằng',
  'Từ Minh Triết',
  'La Bảo Anh',
] as const;

const CURRENT_STUDENT: Student = {
  id: 'student-demo',
  name: 'Nguyễn An Nhiên',
  phone: '090 328 1186',
  email: 'annhien@coachmate.demo',
  area: 'Quận 7',
  level: 'Cơ bản',
};

function createStudents(): Student[] {
  const levels: Student['level'][] = ['Mới bắt đầu', 'Cơ bản', 'Trung cấp', 'Nâng cao'];
  const areas = ['Quận 7', 'Bình Thạnh', 'Thủ Đức', 'Tân Bình', 'Quận 1'];

  return [
    CURRENT_STUDENT,
    ...PARTICIPANT_NAMES.map((name, index) => ({
      id: `student-${index + 1}`,
      name,
      phone: `09${String(10000000 + index * 1739).slice(-8)}`,
      email: `hocvien${String(index + 1).padStart(2, '0')}@coachmate.demo`,
      area: areas[index % areas.length],
      level: levels[index % levels.length],
    })),
  ];
}

const coaches: Coach[] = [
  {
    id: 'c1',
    name: 'Nguyễn Minh Khang',
    bio: 'HLV cấp 1, 8 năm dạy cầu lông phong trào và sinh viên.',
    area: 'Quận 7',
    ratingSum: 58,
    ratingCount: 12,
    specialties: ['Nền tảng', 'Chiến thuật thi đấu', 'Lớp nhóm'],
  },
  {
    id: 'c2',
    name: 'Trần Thu Hà',
    bio: '5 năm dạy lớp nhóm nhỏ, mạnh về di chuyển và phòng thủ.',
    area: 'Bình Thạnh',
    ratingSum: 37,
    ratingCount: 8,
    specialties: ['Footwork', 'Phòng thủ', 'Phản xạ'],
  },
  {
    id: 'c3',
    name: 'Lê Quốc Bảo',
    bio: 'Cựu vận động viên cấp thành phố, 10 năm huấn luyện.',
    area: 'Thủ Đức',
    ratingSum: 92,
    ratingCount: 19,
    specialties: ['Smash', 'Đánh đôi', 'Huấn luyện nâng cao'],
  },
];

const courses: Course[] = [
  {
    id: 'k1',
    coachId: 'c1',
    title: 'Cầu lông cho người mới: 8 buổi nền tảng',
    type: 'beginner',
    level: 'Mới bắt đầu',
    area: 'Quận 7',
    venue: 'Sân CL Phú Mỹ Hưng',
    startDate: '2026-11-10',
    sessions: 8,
    minutesPerSession: 90,
    days: 'Thứ 3 - Thứ 5',
    time: '19:00-20:30',
    scheduleType: 'Tối trong tuần',
    maxStudents: 8,
    minStudents: 4,
    price: 1_200_000,
    goal: 'Cầm vợt đúng, đánh được cầu cơ bản và hiểu luật chơi.',
    curriculum: ['Cách cầm vợt', 'Footwork cơ bản', 'Serve, clear, drop', 'Luật chơi cơ bản'],
    requirement: 'Không yêu cầu',
    status: 'published',
    coverImageUrl:
      'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'k2',
    coachId: 'c3',
    title: 'Smash Clinic: 4 buổi',
    type: 'clinic',
    level: 'Trung cấp',
    area: 'Thủ Đức',
    venue: 'CLB Cầu lông Linh Trung',
    startDate: '2026-11-14',
    sessions: 4,
    minutesPerSession: 90,
    days: 'Thứ 7',
    time: '08:00-09:30',
    scheduleType: 'Cuối tuần',
    maxStudents: 6,
    minStudents: 3,
    price: 800_000,
    goal: 'Tăng lực và độ chính xác của cú smash.',
    curriculum: ['Tư thế và phát lực', 'Smash thuận tay', 'Smash sau nhảy', 'Phối hợp smash và bồi cầu'],
    requirement: 'Đã đánh được clear hết sân',
    status: 'published',
    coverImageUrl:
      'https://images.unsplash.com/photo-1613918431703-aa50889e3be9?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'k3',
    coachId: 'c2',
    title: 'Footwork và phòng thủ nhóm nhỏ',
    type: 'group',
    level: 'Cơ bản',
    area: 'Bình Thạnh',
    venue: 'Sân CL Bạch Đằng',
    startDate: '2026-11-12',
    sessions: 10,
    minutesPerSession: 90,
    days: 'Thứ 2 - Thứ 4',
    time: '18:30-20:00',
    scheduleType: 'Tối trong tuần',
    maxStudents: 8,
    minStudents: 4,
    price: 1_500_000,
    goal: 'Di chuyển gọn hơn và đỡ được cầu khó.',
    curriculum: ['Bước chân 6 điểm', 'Đỡ cầu smash', 'Phòng thủ đôi', 'Bài tập phản xạ'],
    requirement: 'Biết luật và đánh được cầu cơ bản',
    status: 'published',
    coverImageUrl:
      'https://images.unsplash.com/photo-1599391398131-cd12dfc6c24b?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'k4',
    coachId: 'c3',
    title: 'Kèm 1-1 chiến thuật đánh đôi',
    type: 'individual',
    level: 'Trung cấp',
    area: 'Thủ Đức',
    venue: 'CLB Cầu lông Linh Trung',
    startDate: '2026-11-16',
    sessions: 6,
    minutesPerSession: 60,
    days: 'Linh hoạt',
    time: 'Theo lịch hẹn',
    scheduleType: 'Cuối tuần',
    maxStudents: 1,
    minStudents: 1,
    price: 3_000_000,
    goal: 'Xoay vòng vị trí và phối hợp với bạn đánh đôi.',
    curriculum: ['Xoay vòng công thủ', 'Giao tiếp với đồng đội', 'Phân tích video trận đấu'],
    requirement: 'Đã chơi đôi ít nhất 3 tháng',
    status: 'published',
    coverImageUrl:
      'https://images.unsplash.com/photo-1607962837359-5e7e89f86776?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'k5',
    coachId: 'c1',
    title: 'Luyện thi đấu nâng cao',
    type: 'advanced',
    level: 'Nâng cao',
    area: 'Quận 7',
    venue: 'Sân CL Phú Mỹ Hưng',
    startDate: '2026-11-18',
    sessions: 12,
    minutesPerSession: 120,
    days: 'Thứ 4 - Thứ 6',
    time: '19:00-21:00',
    scheduleType: 'Tối trong tuần',
    maxStudents: 8,
    minStudents: 5,
    price: 2_400_000,
    goal: 'Chuẩn bị thể lực và chiến thuật cho giải phong trào.',
    curriculum: ['Thể lực chuyên biệt', 'Chiến thuật đơn', 'Tập trận có điều kiện', 'Quản lý áp lực'],
    requirement: 'Đã tham gia ít nhất một giải phong trào',
    status: 'published',
    coverImageUrl:
      'https://images.unsplash.com/photo-1595435064212-4c308beb7ad7?auto=format&fit=crop&w=1200&q=85',
  },
];

function createEnrollments(students: Student[]): Enrollment[] {
  const seedCounts: Record<string, number> = { k1: 5, k2: 6, k3: 2, k4: 0, k5: 3 };
  const enrollments: Enrollment[] = [];
  let sequence = 0;

  courses.forEach((course) => {
    for (let index = 0; index < seedCounts[course.id]; index += 1) {
      sequence += 1;
      const name = PARTICIPANT_NAMES[(sequence * 3) % PARTICIPANT_NAMES.length];
      const student = students.find((candidate) => candidate.name === name)!;
      enrollments.push({
        id: `e${sequence}`,
        courseId: course.id,
        studentId: student.id,
        studentName: student.name,
        price: course.price,
        commission: Math.round(course.price * 0.1),
        paymentFee: Math.round(course.price * 0.02),
        isCurrentStudent: false,
        completed: false,
        reviewed: false,
        createdAt: `2026-10-${String(2 + sequence).padStart(2, '0')}T10:00:00+07:00`,
        paymentId: `pay-course-${sequence}`,
        isSeed: true,
      });
    }
  });

  return enrollments;
}

function createTournamentRegistrations(students: Student[]): TournamentRegistration[] {
  const registrations: TournamentRegistration[] = [];

  for (let index = 0; index < 9; index += 1) {
    const name = PARTICIPANT_NAMES[(index * 2 + 1) % PARTICIPANT_NAMES.length];
    registrations.push({
      id: `r${index + 1}`,
      tournamentId: 't1',
      studentId: students.find((student) => student.name === name)?.id,
      participantName: name,
      partnerName: '',
      isCurrentStudent: false,
      fee: 250_000,
      paymentFee: 5_000,
      createdAt: `2026-10-${String(11 + index).padStart(2, '0')}T14:00:00+07:00`,
      paymentId: `pay-tournament-${index + 1}`,
    });
  }

  for (let index = 0; index < 3; index += 1) {
    const name = PARTICIPANT_NAMES[index + 10];
    registrations.push({
      id: `r${index + 20}`,
      tournamentId: 't2',
      studentId: students.find((student) => student.name === name)?.id,
      participantName: name,
      partnerName: PARTICIPANT_NAMES[index + 16],
      isCurrentStudent: false,
      fee: 400_000,
      paymentFee: 8_000,
      createdAt: `2026-10-${String(20 + index).padStart(2, '0')}T16:30:00+07:00`,
      paymentId: `pay-tournament-${index + 20}`,
    });
  }

  return registrations;
}

function createPayments(
  enrollments: Enrollment[],
  registrations: TournamentRegistration[],
): Payment[] {
  return [
    ...enrollments.map<Payment>((enrollment) => ({
      id: enrollment.paymentId,
      kind: 'course',
      referenceId: enrollment.id,
      payerName: enrollment.studentName,
      amount: enrollment.price,
      paymentFee: enrollment.paymentFee,
      method: 'Ví MoMo',
      status: 'completed',
      simulated: true,
      createdAt: enrollment.createdAt,
    })),
    ...registrations.map<Payment>((registration) => ({
      id: registration.paymentId,
      kind: 'tournament',
      referenceId: registration.id,
      payerName: registration.participantName,
      amount: registration.fee,
      paymentFee: registration.paymentFee,
      method: 'Chuyển khoản ngân hàng',
      status: 'completed',
      simulated: true,
      createdAt: registration.createdAt,
    })),
    {
      id: 'pay-subscription-1',
      kind: 'subscription',
      referenceId: 's1',
      payerName: 'Nguyễn Minh Khang',
      amount: 99_000,
      paymentFee: 0,
      method: 'Thẻ ATM / Visa',
      status: 'completed',
      simulated: true,
      createdAt: '2026-10-01T09:00:00+07:00',
    },
  ];
}

function createFinancialRecords(
  enrollments: Enrollment[],
  registrations: TournamentRegistration[],
): FinancialRecord[] {
  const commissionRecords = enrollments.map<FinancialRecord>((enrollment) => ({
    id: `fin-commission-${enrollment.id}`,
    type: 'course_commission',
    referenceId: enrollment.id,
    amount: enrollment.commission,
    occurredAt: enrollment.createdAt,
    note: `Hoa hồng khóa học từ ${enrollment.studentName}`,
  }));
  const feeRecords = enrollments.map<FinancialRecord>((enrollment) => ({
    id: `fin-fee-${enrollment.id}`,
    type: 'payment_fee',
    referenceId: enrollment.id,
    amount: -enrollment.paymentFee,
    occurredAt: enrollment.createdAt,
    note: 'Phí thanh toán mô phỏng cho đăng ký khóa học',
  }));
  const tournamentHoldRecords = registrations.map<FinancialRecord>((registration) => ({
    id: `fin-hold-${registration.id}`,
    type: 'tournament_hold',
    referenceId: registration.id,
    amount: registration.fee,
    occurredAt: registration.createdAt,
    note: 'Lệ phí giải đang tạm giữ',
  }));

  return [
    ...commissionRecords,
    ...feeRecords,
    ...tournamentHoldRecords,
    {
      id: 'fin-subscription-s1',
      type: 'subscription_revenue',
      referenceId: 's1',
      amount: 99_000,
      occurredAt: '2026-10-01T09:00:00+07:00',
      note: 'Coach Pro tháng 10/2026',
    },
  ];
}

export function createSeedState(): DemoState {
  const students = createStudents();
  const enrollments = createEnrollments(students);
  const tournamentRegistrations = createTournamentRegistrations(students);

  return {
    version: 2,
    currentStudentId: CURRENT_STUDENT.id,
    settings: {
      commissionPercent: 10,
      paymentFeePercent: 2,
      coachProMonthlyPrice: 99_000,
    },
    students,
    coaches,
    courses,
    enrollments,
    tournaments: [
      {
        id: 't1',
        name: 'CoachMate Mini Cup #1',
        format: 'singles',
        level: 'Phong trào',
        date: '2026-12-06',
        venue: 'Nhà thi đấu Quận 7 (thuê theo sự kiện)',
        fee: 250_000,
        registrationDeadline: '2026-11-25',
        maxRegistrations: 32,
        minRegistrations: 20,
        courtCount: 4,
        prize: 'Cúp, huy chương và 1.500.000đ tiền thưởng',
        rules: 'Đơn nam/nữ phong trào, thi đấu loại trực tiếp, 21 điểm, 3 set.',
        costPlan: {
          court: 2_000_000,
          staff: 600_000,
          prize: 1_500_000,
          miscellaneous: 300_000,
          refereePerMatch: 60_000,
        },
        status: 'open',
        bracket: null,
        championRegistrationId: null,
      },
      {
        id: 't2',
        name: 'Đôi Nam Nữ Cuối Năm',
        format: 'doubles',
        level: 'Phong trào',
        date: '2026-12-20',
        venue: 'Nhà thi đấu Bình Thạnh (thuê theo sự kiện)',
        fee: 400_000,
        registrationDeadline: '2026-12-10',
        maxRegistrations: 16,
        minRegistrations: 10,
        courtCount: 3,
        prize: 'Cúp và 2.000.000đ tiền thưởng',
        rules: 'Đôi nam nữ phong trào, loại trực tiếp, 21 điểm, 3 set.',
        costPlan: {
          court: 1_800_000,
          staff: 500_000,
          prize: 2_000_000,
          miscellaneous: 300_000,
          refereePerMatch: 60_000,
        },
        status: 'open',
        bracket: null,
        championRegistrationId: null,
      },
    ],
    tournamentRegistrations,
    matches: [],
    courts: [
      ...Array.from({ length: 4 }, (_, index) => ({
        id: `court-q7-${index + 1}`,
        name: `Sân ${index + 1}`,
        venue: 'Nhà thi đấu Quận 7 (thuê theo sự kiện)',
        courtNumber: index + 1,
      })),
      ...Array.from({ length: 3 }, (_, index) => ({
        id: `court-bt-${index + 1}`,
        name: `Sân ${index + 1}`,
        venue: 'Nhà thi đấu Bình Thạnh (thuê theo sự kiện)',
        courtNumber: index + 1,
      })),
    ],
    referees: [
      { id: 'ref-1', name: 'Trọng tài Hải', phone: '090 411 2388', certification: 'Cấp thành phố' },
      { id: 'ref-2', name: 'Trọng tài Lan', phone: '093 662 7401', certification: 'Cấp thành phố' },
      { id: 'ref-3', name: 'Trọng tài Đạt', phone: '098 214 9057', certification: 'Cấp quận' },
    ],
    payments: createPayments(enrollments, tournamentRegistrations),
    subscriptions: [
      {
        id: 's1',
        coachId: 'c1',
        amount: 99_000,
        months: 1,
        startDate: '2026-10-01',
        active: true,
        paymentId: 'pay-subscription-1',
      },
    ],
    financialRecords: createFinancialRecords(enrollments, tournamentRegistrations),
    activityLogs: [
      {
        id: 'activity-1',
        occurredAt: '2026-10-22T16:30:00+07:00',
        actorName: 'Mai Phương Thảo',
        action: 'đăng ký giải Đôi Nam Nữ Cuối Năm (thanh toán mô phỏng)',
      },
      {
        id: 'activity-2',
        occurredAt: '2026-10-18T14:00:00+07:00',
        actorName: 'Đỗ Hải Yến',
        action: 'đăng ký CoachMate Mini Cup #1 (thanh toán mô phỏng)',
      },
      {
        id: 'activity-3',
        occurredAt: '2026-10-12T10:00:00+07:00',
        actorName: 'Trần Thu Hà',
        action: 'cập nhật kế hoạch khóa Footwork và phòng thủ nhóm nhỏ',
      },
    ],
    funnel: {
      courseDetailViews: 58,
      checkoutStarts: 24,
      paymentsCompleted: 16,
    },
    assumptionStatuses: {},
  };
}
